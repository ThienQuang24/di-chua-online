import * as THREE from 'three';
import {
  StagePoint,
  ActorSpec,
  DevoteeAssets,
  loadDevoteeAssets,
  makeNamePlate,
  HEIGHT,
  AISLE_X,
  AISLE_BOTTOM_Y,
  SPOT_ZOOM,
  OFFER_ROW_Y,
  OFFER_SPOTS_X,
} from './templeAssets';
import { Actor } from './templeActor';

export type { StagePoint, ActorSpec, DevoteeAssets };
export { loadDevoteeAssets };

export class TempleScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(32, 9 / 16, 0.1, 200);
  private floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private raycaster = new THREE.Raycaster();
  private actors = new Map<string, Actor>();
  private clock = new THREE.Clock();
  private frame = 0;

  private viewCam = new THREE.PerspectiveCamera();
  private zoom = 1;
  private cx = 0.5;
  private cy = 0.5;
  private spotKey: string | null = null;
  private spotReachedBurner = false;
  private spotStartedAt = 0;
  private zoomEls: HTMLElement[] = [];
  private selfEl?: HTMLElement;
  onSpotlightEnd: () => void = () => {};

  setZoomTargets(world: HTMLElement[], self: HTMLElement) {
    this.zoomEls = world;
    this.selfEl = self;
  }

  setSpotlight(key: string | null) {
    if (key === this.spotKey) return;
    this.spotKey = key;
    this.spotReachedBurner = false;
    this.spotStartedAt = performance.now();
  }

  private updateSpotlight(dt: number) {
    const actor = this.spotKey ? this.actors.get(this.spotKey) : undefined;
    let tz = 1;
    if (actor && actor.root.visible) {
      const atBurner = actor.isOfferingAtBurner();
      if (atBurner) this.spotReachedBurner = true;
      const secs = (performance.now() - this.spotStartedAt) / 1000;
      if ((this.spotReachedBurner && !atBurner) || (!actor.busy && secs > 4) || secs > 45) {
        this.spotKey = null;
        this.onSpotlightEnd();
      } else {
        tz = SPOT_ZOOM;
        const p = (actor.head ?? actor.root).getWorldPosition(new THREE.Vector3());
        p.y -= HEIGHT * 0.15;
        p.project(this.camera);
        const k = Math.min(1, dt * 2.2);
        this.cx += ((p.x + 1) / 2 - this.cx) * k;
        this.cy += ((1 - p.y) / 2 - this.cy) * k;
      }
    } else if (this.spotKey) {
      this.spotKey = null;
      this.onSpotlightEnd();
    }
    this.zoom += (tz - this.zoom) * Math.min(1, dt * 1.6);
    if (tz === 1 && this.zoom < 1.002) this.zoom = 1;
    const half = 0.5 / this.zoom;
    const x0 = Math.min(Math.max(this.cx - half, 0), 1 - 2 * half);
    const y0 = Math.min(Math.max(this.cy - half, 0), 1 - 2 * half);
    const world = this.zoom === 1 ? '' : `scale(${this.zoom}) translate(${-x0 * 100}%, ${-y0 * 100}%)`;
    for (const el of this.zoomEls) {
      el.style.transformOrigin = '0 0';
      el.style.transform = world;
    }
    if (this.selfEl) {
      this.selfEl.style.transformOrigin = '0 0';
      this.selfEl.style.transform = this.zoom === 1 ? '' : `translate(${x0 * 100}%, ${y0 * 100}%) scale(${1 / this.zoom})`;
    }
    if (this.zoom > 1) {
      const size = this.renderer.getSize(new THREE.Vector2());
      this.viewCam.copy(this.camera);
      this.viewCam.setViewOffset(size.x, size.y, x0 * size.x, y0 * size.y, size.x / this.zoom, size.y / this.zoom);
    }
  }

  constructor(
    private canvas: HTMLCanvasElement,
    private assets: DevoteeAssets,
    private onIncenseLit: () => void = () => {},
    private labelLayer?: HTMLElement,
    private onAway: (key: string, away: boolean) => void = () => {}
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.camera.position.set(0, 9, 13);
    this.camera.lookAt(0, 0, -6);
    this.scene.add(new THREE.HemisphereLight(0xfff0d6, 0x3a1f0b, 1.4));
    const key = new THREE.DirectionalLight(0xffd9a0, 1.6);
    key.position.set(2, 10, 6);
    this.scene.add(key);
    this.resize();
    let frames = 0;
    const loop = () => {
      this.frame = requestAnimationFrame(loop);
      if (frames++ % 30 === 0) this.resize();
      const dt = Math.min(this.clock.getDelta(), 0.1);
      for (const a of this.actors.values()) a.update(dt);
      this.updateSpotlight(dt);
      this.renderer.render(this.scene, this.zoom > 1.001 ? this.viewCam : this.camera);
      this.placePlates();
    };
    loop();
  }

  private resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    const zoom = this.canvas.getBoundingClientRect().width / w || 1;
    const ratio = Math.min(window.devicePixelRatio * zoom, 2, 1080 / w);
    if (this.renderer.getPixelRatio() !== ratio) this.renderer.setPixelRatio(ratio);
    const size = this.renderer.getSize(new THREE.Vector2());
    if (size.x !== w || size.y !== h) {
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
  }

  private toWorld(p: StagePoint) {
    this.raycaster.setFromCamera(new THREE.Vector2((p.x / 100) * 2 - 1, -((p.y / 100) * 2 - 1)), this.camera);
    const hit = new THREE.Vector3();
    return this.raycaster.ray.intersectPlane(this.floor, hit) ?? hit.set(0, 0, 0);
  }

  sync(specs: ActorSpec[]) {
    const wanted = new Set(specs.map((s) => s.key));
    for (const [key, actor] of this.actors) {
      if (!wanted.has(key)) {
        actor.plate?.remove();
        this.scene.remove(actor.root);
        actor.dispose();
        this.actors.delete(key);
      }
    }
    for (const spec of specs) {
      const target = this.toWorld(spec.at);
      let actor = this.actors.get(spec.key);
      if (!actor) {
        actor = new Actor(this.assets);
        actor.mode = spec.mode;
        actor.label = spec.label;
        actor.target.copy(target);
        this.actors.set(spec.key, actor);
        this.scene.add(actor.root);
        if (spec.offer) {
          actor.root.position.copy(this.toWorld({ x: AISLE_X, y: AISLE_BOTTOM_Y }));
          this.startOffer(actor, spec);
          continue;
        }
        if (spec.enter === 'walk') {
          actor.root.position.copy(this.toWorld({ x: AISLE_X, y: AISLE_BOTTOM_Y }));
          if (!spec.offer) actor.walk([this.toWorld({ x: AISLE_X, y: spec.at.y }), target]);
        } else {
          actor.root.position.copy(target);
          actor.kneelHere(false);
        }
        continue;
      }
      actor.mode = spec.mode;
      if (spec.label && (!actor.label || actor.label.name !== spec.label.name || actor.label.avatar !== spec.label.avatar)) {
        actor.label = spec.label;
        actor.plate?.remove();
        actor.plate = undefined;
      }
      if (actor.busy) continue;
      if (spec.offer && actor.lastOffer !== spec.offer) {
        this.startOffer(actor, spec);
        continue;
      }
      if (actor.target.distanceTo(target) > 0.05) {
        actor.target.copy(target);
        actor.walk([target]);
      }
    }
  }

  private placePlates() {
    if (!this.labelLayer) return;
    const p = new THREE.Vector3();
    for (const a of this.actors.values()) {
      const show = a.busy && a.root.visible && a.label && a.head;
      if (!show) {
        if (a.plate) a.plate.style.display = 'none';
        continue;
      }
      if (!a.plate) {
        a.plate = makeNamePlate(a.label!);
        this.labelLayer.appendChild(a.plate);
      }
      a.head!.getWorldPosition(p);
      p.y += HEIGHT * 0.12;
      p.project(this.zoom > 1.001 ? this.viewCam : this.camera);
      a.plate.style.display = '';
      a.plate.style.left = `${((p.x + 1) / 2) * 100}%`;
      a.plate.style.top = `${((1 - p.y) / 2) * 100}%`;
    }
  }

  private startOffer(actor: Actor, spec: ActorSpec) {
    actor.lastOffer = spec.offer;
    actor.onDone = () => this.onAway(spec.key, false);
    this.onAway(spec.key, true);
    const aisleAtSeat = this.toWorld({ x: AISLE_X, y: spec.at.y });
    const taken = new Set([...this.actors.values()].filter((a) => a !== actor && a.busy).map((a) => a.spotIndex));
    actor.spotIndex = OFFER_SPOTS_X.findIndex((_, i) => !taken.has(i));
    const spot = { x: AISLE_X + OFFER_SPOTS_X[Math.max(0, actor.spotIndex)], y: OFFER_ROW_Y };
    const aisleFront = this.toWorld({ x: AISLE_X, y: OFFER_ROW_Y + 2.5 });
    const toBurner = [aisleAtSeat, aisleFront, this.toWorld(spot)];
    const back = spec.leave
      ? [aisleFront, this.toWorld({ x: AISLE_X, y: AISLE_BOTTOM_Y })]
      : [aisleFront, aisleAtSeat, actor.target.clone()];
    actor.offerIncense(spec.leave ? toBurner.slice(1) : toBurner, back, this.onIncenseLit, Boolean(spec.leave));
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    for (const a of this.actors.values()) {
      a.plate?.remove();
      a.dispose();
    }
    this.actors.clear();
    this.renderer.dispose();
  }
}
