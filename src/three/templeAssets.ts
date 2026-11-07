import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { retargetClip, usesMixamoRig } from './retarget';

export type StagePoint = { x: number; y: number }; // % of stage width / height; y is the feet line
export type ActorSpec = {
  key: string;
  at: StagePoint;
  mode: 'pray' | 'bow'; // bow = keeps doing lạy
  enter: 'walk' | 'place'; // walk in from the bottom of the aisle, or appear already kneeling
  offer?: string; // a gift id: go up and offer incense once for it, then come back to `at`
  leave?: boolean; // after offering, walk out down the aisle instead of kneeling at `at` (not a top-10 donor)
  label?: { name: string; avatar?: string }; // name plate that follows them while they go up to offer incense
};

export type Clips = {
  walk: THREE.AnimationClip;
  kneel: THREE.AnimationClip;
  kneelDown?: THREE.AnimationClip;
  incense?: THREE.AnimationClip;
};
export type DevoteeAssets = { model: THREE.Group; clips: Clips };

const BASE = '/assets/3d/';
export const HEIGHT = 0.46; // world units a standing person is scaled to (sized against the hall painting)
export const WALK_SPEED = 1.3; // world units per second
export const AISLE_X = 50;
export const AISLE_BOTTOM_Y = 106;
export const SPOT_ZOOM = 3.6;
export const OFFER_ROW_Y = 66.5;
export const OFFER_SPOTS_X = [0, -8, 8, -16, 16];

// Bronze name plate (same look as the 2D ones) built with DOM APIs; the name is viewer text, so textContent only
export function makeNamePlate(label: { name: string; avatar?: string }) {
  const el = document.createElement('div');
  el.className =
    'absolute -translate-x-1/2 -translate-y-full flex items-center gap-1 w-max max-w-[120px] pl-0.5 pr-1.5 rounded-full border border-[#d9a55a] bg-linear-to-b from-[#5a3413] to-[#2a1608] shadow-[0_0_8px_rgba(217,165,90,0.45)] text-[9px] font-temple pointer-events-none';
  if (label.avatar) {
    const img = document.createElement('img');
    img.src = label.avatar;
    img.referrerPolicy = 'no-referrer';
    img.className = 'shrink-0 w-4 h-4 rounded-full object-cover';
    el.appendChild(img);
  } else {
    const initial = document.createElement('span');
    initial.className = 'shrink-0 w-4 h-4 rounded-full bg-[#b07a3a] text-[#fff7e0] text-[8px] font-bold flex items-center justify-center';
    initial.textContent = label.name.slice(0, 1).toUpperCase();
    el.appendChild(initial);
  }
  const name = document.createElement('span');
  name.className = 'truncate font-semibold text-[#fbe7b8] leading-[14px]';
  name.textContent = label.name;
  el.appendChild(name);
  return el;
}

export async function loadDevoteeAssets(): Promise<DevoteeAssets> {
  const loader = new FBXLoader();
  const groups: Record<string, THREE.Group> = {};
  const clip = async (file: string, required: boolean) => {
    try {
      const g = await loader.loadAsync(BASE + file);
      groups[file] = g;
      return g.animations[0];
    } catch (err) {
      if (required) throw err;
      return undefined;
    }
  };
  const [walk, kneel, kneelDown, incense] = await Promise.all([
    clip('di.fbx', true),
    clip('khan.fbx', true),
    clip('quy.fbx', false),
    clip('thaphuong.fbx', false),
  ]);
  if (!walk || !kneel) throw new Error('missing di.fbx or khan.fbx');
  const own = await loader
    .loadAsync(BASE + 'nhanvat.fbx')
    .catch(() => loader.loadAsync(BASE + 'nguoi.fbx'))
    .catch(() => null);
  const model: THREE.Group = own ?? groups['khan.fbx'];
  model.animations = [];
  let clips: Clips = { walk, kneel, kneelDown, incense };
  if (own && !usesMixamoRig(own)) {
    const source = groups['khan.fbx'];
    const r = (c?: THREE.AnimationClip) => (c ? retargetClip(own, source, c) : undefined);
    clips = { walk: r(walk)!, kneel: r(kneel)!, kneelDown: r(kneelDown), incense: r(incense) };
  }
  for (const t of clips.walk.tracks) {
    if (!/Hips\.position$/.test(t.name)) continue;
    const v = t.values;
    for (let i = 3; i < v.length; i += 3) {
      v[i] = v[0];
      v[i + 2] = v[2];
    }
  }

  const box = new THREE.Box3().setFromObject(model);
  model.scale.multiplyScalar(HEIGHT / (box.max.y - box.min.y || 1));
  model.traverse((o) => {
    const mesh = o as THREE.SkinnedMesh;
    if (!mesh.isMesh) return;
    mesh.frustumCulled = false;
    if (own) return;
    const tint = () => new THREE.MeshStandardMaterial({ color: 0x6d7896, roughness: 0.75, metalness: 0.05 });
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(tint) : tint();
  });
  return { model, clips };
}

export const blobTexture = (() => {
  let tex: THREE.Texture | null = null;
  return () => {
    if (tex) return tex;
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0,0,0,0.55)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    tex = new THREE.CanvasTexture(c);
    return tex;
  };
})();

export function makeIncenseStick() {
  const g = new THREE.Group();
  const stickMat = new THREE.MeshBasicMaterial({ color: 0xa8321a });
  const tipMat = new THREE.MeshBasicMaterial({ color: 0xffb347 });
  for (const dx of [-0.018, 0, 0.018]) {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.8, 6), stickMat);
    stick.position.set(dx, 0.3, 0);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), tipMat);
    tip.position.set(dx, 0.71, 0);
    g.add(stick, tip);
  }
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.35, depthWrite: false })
  );
  glow.position.y = 0.71;
  g.add(glow);
  return g;
}
