import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { Clips, DevoteeAssets, HEIGHT, WALK_SPEED, blobTexture, makeIncenseStick } from './templeAssets';

const IDENTITY = new THREE.Quaternion();
const TMP_Q = new THREE.Quaternion();

export class Actor {
  root = new THREE.Group();
  private mixer: THREE.AnimationMixer;
  private actions: Partial<Record<keyof Clips, THREE.AnimationAction>> = {};
  private current?: THREE.AnimationAction;
  private path: THREE.Vector3[] = [];
  private state: 'walking' | 'incense' | 'kneeling' = 'kneeling';
  private hand?: THREE.Object3D;
  head?: THREE.Object3D;
  label?: { name: string; avatar?: string };
  plate?: HTMLElement;
  private stick?: THREE.Group;
  private bowBones: Array<[THREE.Object3D, number]> = [];
  private legParts = new Map<string, THREE.Object3D>();
  private bowT = -1;
  private nextBowIn = 0;
  private onArrive?: () => void;
  private bowsAtBurner = 0;
  private afterBurner?: () => void;
  mode: 'pray' | 'bow' = 'pray';
  target = new THREE.Vector3();
  lastOffer?: string;
  busy = false;
  spotIndex = -1;
  onDone?: () => void;
  private skipped = 0;
  private tick = Math.floor(Math.random() * 3);
  private robeFollow?: Array<[THREE.Object3D, THREE.Object3D, number]>;

  constructor(assets: DevoteeAssets) {
    const body = cloneSkinned(assets.model);
    this.root.add(body);
    const bend: Record<string, number> = { Spine: 0.7, Spine1: 0.6, Spine2: 0.45, Chest: 0.6, Neck: 0.25, Head: 0.2 };
    body.traverse((o) => {
      if (!this.hand && /(RightHand|HandR)$/.test(o.name)) this.hand = o;
      if (!this.head && /(^|:)Head$/.test(o.name)) this.head = o;
      if (/^(Robe(Upper|Lower)(Front|Back)[LR]|Thigh[LR]|Shin[LR])$/.test(o.name)) this.legParts.set(o.name, o);
      const part = o.name.replace(/^mixamorig:?/, '');
      if (part in bend) this.bowBones.push([o, bend[part]]);
    });
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(HEIGHT * 0.3, 24),
      new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    this.root.add(shadow);

    this.mixer = new THREE.AnimationMixer(body);
    for (const [name, clip] of Object.entries(assets.clips)) {
      if (!clip) continue;
      const action = this.mixer.clipAction(clip);
      if (name === 'kneelDown' || name === 'incense') {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      }
      this.actions[name as keyof Clips] = action;
    }
    this.mixer.addEventListener('finished', (e) => {
      if (e.action === this.actions.incense) {
        this.setStick(false);
        this.state = 'kneeling';
        this.bowsAtBurner = 3;
        this.nextBowIn = 0.4;
        this.play('kneel', 0.4);
      } else if (e.action === this.actions.kneelDown) {
        this.play('kneel', 0.4, true);
      }
    });
  }

  private play(name: keyof Clips, fade = 0.3, randomStart = false) {
    const next = this.actions[name];
    if (!next || next === this.current) return;
    next.reset();
    if (randomStart) next.time = Math.random() * next.getClip().duration;
    next.play();
    if (this.current) this.current.crossFadeTo(next, fade, false);
    this.current = next;
  }

  private setStick(on: boolean) {
    if (!this.hand) return;
    if (on && !this.stick) {
      this.stick = makeIncenseStick();
      this.stick.scale.setScalar(1 / this.root.children[0].scale.x);
      this.hand.add(this.stick);
    } else if (!on && this.stick) {
      this.hand.remove(this.stick);
      this.stick = undefined;
    }
  }

  kneelHere(withKneelDown: boolean) {
    this.root.rotation.y = Math.PI;
    this.state = 'kneeling';
    this.nextBowIn = Math.random() * 4;
    if (withKneelDown && this.actions.kneelDown) this.play('kneelDown', 0.3);
    else this.play('kneel', 0.3, true);
  }

  walk(points: THREE.Vector3[], onArrive?: () => void) {
    this.path = points.map((p) => p.clone());
    this.onArrive = onArrive;
    this.state = 'walking';
    this.bowsAtBurner = 0;
    this.play('walk', 0.3);
  }

  isOfferingAtBurner() {
    return this.busy && this.state !== 'walking';
  }

  offerIncense(toBurner: THREE.Vector3[], back: THREE.Vector3[], onLit: () => void, leave: boolean) {
    this.busy = true;
    this.bowT = -1;
    this.walk(toBurner, () => {
      this.root.rotation.y = Math.PI;
      this.afterBurner = () =>
        this.walk(back, () => {
          this.busy = false;
          this.onDone?.();
          if (leave) this.root.visible = false;
          else this.kneelHere(true);
        });
      onLit();
      if (!this.actions.incense) {
        this.kneelHere(true);
        this.bowsAtBurner = 3;
        return;
      }
      this.state = 'incense';
      this.setStick(true);
      this.play('incense', 0.3);
    });
  }

  update(dt: number) {
    if (this.state === 'kneeling' && this.bowT < 0 && !this.busy && !this.stick) {
      this.skipped += dt;
      if (++this.tick % 3) return;
      dt = this.skipped;
    }
    this.skipped = 0;
    this.mixer.update(dt);
    if (this.state === 'walking') {
      let step = WALK_SPEED * dt;
      while (step > 0 && this.path.length) {
        const to = this.path[0];
        const d = to.clone().sub(this.root.position);
        d.y = 0;
        const len = d.length();
        if (len > 0.001) this.root.rotation.y = Math.atan2(d.x, d.z);
        if (len <= step) {
          this.root.position.copy(to);
          this.path.shift();
          step -= len;
        } else {
          this.root.position.add(d.multiplyScalar(step / len));
          step = 0;
        }
      }
      if (!this.path.length) {
        const arrive = this.onArrive ?? (() => this.kneelHere(true));
        this.onArrive = undefined;
        arrive();
      }
    } else if (this.state === 'kneeling' && this.current === this.actions.kneel) {
      this.nextBowIn -= dt;
      if (this.nextBowIn <= 0 && this.bowT < 0) {
        this.bowT = 0;
        this.nextBowIn = this.bowsAtBurner > 0 ? 0.4 : 0.5 + Math.random();
      }
    }
    this.applyBow(dt);
    this.followRobe();
    this.keepStickUpright();
  }

  private keepStickUpright() {
    if (!this.stick || !this.hand) return;
    this.hand.updateWorldMatrix(true, false);
    this.stick.quaternion.copy(this.hand.getWorldQuaternion(TMP_Q).invert());
  }

  private followRobe() {
    if (!this.robeFollow) {
      this.robeFollow = [];
      for (const side of ['L', 'R']) {
        const thigh = this.legParts.get('Thigh' + side);
        const shin = this.legParts.get('Shin' + side);
        if (!thigh || !shin) continue;
        const follow: Array<[string, THREE.Object3D, number]> = [
          ['RobeUpperFront' + side, thigh, 0.9],
          ['RobeUpperBack' + side, thigh, 0.45],
          ['RobeLowerFront' + side, shin, 0.6],
          ['RobeLowerBack' + side, shin, 0.3],
        ];
        for (const [name, leg, amount] of follow) {
          const panel = this.legParts.get(name);
          if (panel) this.robeFollow.push([panel, leg, amount]);
        }
      }
    }
    for (const [panel, leg, amount] of this.robeFollow) panel.quaternion.slerpQuaternions(IDENTITY, leg.quaternion, amount);
  }

  private applyBow(dt: number) {
    if (this.bowT < 0) return;
    const DOWN = 0.9, HOLD = 0.7, UP = 1.0;
    this.bowT += dt;
    const t = this.bowT;
    let w: number;
    if (t < DOWN) w = 0.5 - 0.5 * Math.cos((Math.PI * t) / DOWN);
    else if (t < DOWN + HOLD) w = 1;
    else if (t < DOWN + HOLD + UP) w = 0.5 + 0.5 * Math.cos((Math.PI * (t - DOWN - HOLD)) / UP);
    else {
      this.bowT = -1;
      if (this.bowsAtBurner > 0 && --this.bowsAtBurner === 0) {
        this.afterBurner?.();
        this.afterBurner = undefined;
      }
      return;
    }
    for (const [bone, angle] of this.bowBones) bone.rotation.x += angle * w;
  }

  dispose() {
    this.setStick(false);
    this.mixer.stopAllAction();
  }
}
