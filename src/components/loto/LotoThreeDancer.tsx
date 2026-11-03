import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface LotoThreeDancerProps {
  modelUrl: string;
  animationName?: string;
  fallbackImage: string;
  className?: string;
  scale?: number;
  yOffset?: number;
}

export const LotoThreeDancer: React.FC<LotoThreeDancerProps> = ({
  modelUrl,
  animationName = 'Dance',
  fallbackImage,
  className = '',
  scale = 1.0,
  yOffset = -0.8,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isDisposed = false;
    let mixer: THREE.AnimationMixer | null = null;
    let animationFrameId: number;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 360;

    // 1. Scene, Camera, Renderer (Transparent Background)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.2);
    camera.lookAt(0, 0.6, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Stage Lighting (Bright Festival Stage Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 2.5);
    dirLight.position.set(1.5, 4, 3);
    scene.add(dirLight);

    const cyanRimLight = new THREE.PointLight(0x38bdf8, 2.0, 8);
    cyanRimLight.position.set(-2, 2.5, -1);
    scene.add(cyanRimLight);

    const warmFillLight = new THREE.PointLight(0xf59e0b, 1.8, 8);
    warmFillLight.position.set(2, 1, 1);
    scene.add(warmFillLight);

    // 3. Load GLTF/GLB Model
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        if (isDisposed) return;

        const model = gltf.scene;

        // Auto-center and normalize model scale using Box3
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const autoScale = (1.6 / maxDim) * scale;
        model.scale.set(autoScale, autoScale, autoScale);

        // Center on X and Z, set bottom feet to stage floor
        model.position.x = -center.x * autoScale;
        model.position.y = -box.min.y * autoScale + yOffset;
        model.position.z = -center.z * autoScale;

        scene.add(model);

        // Setup Animations
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);

          // Find requested animation or fallback to Dance, Wave, or first animation
          let clip = gltf.animations.find(
            (a) => a.name.toLowerCase() === animationName.toLowerCase()
          );
          if (!clip) {
            clip = gltf.animations.find((a) =>
              a.name.toLowerCase().includes('dance')
            );
          }
          if (!clip) {
            clip = gltf.animations.find((a) =>
              a.name.toLowerCase().includes('wave') ||
              a.name.toLowerCase().includes('interact') ||
              a.name.toLowerCase().includes('walk')
            );
          }
          if (!clip) clip = gltf.animations[0];

          if (clip) {
            const action = mixer.clipAction(clip);
            action.play();
          }
        }

        setLoading(false);
      },
      undefined,
      (error) => {
        console.warn('[LotoThreeDancer] Failed to load 3D model:', error);
        if (!isDisposed) {
          setLoadError(true);
          setLoading(false);
        }
      }
    );

    // 4. Render Loop
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);
      renderer.render(scene, camera);
    };
    animate();

    // 5. Resize observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || width;
      const h = container.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl, animationName, scale, yOffset]);

  if (loadError) {
    return (
      <img
        src={fallbackImage}
        alt="Vũ công 3D"
        className={`w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)] ${className}`}
      />
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {loading && (
        <img
          src={fallbackImage}
          alt="Đang nạp vũ công 3D"
          className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)] animate-pulse"
        />
      )}
      <div ref={mountRef} className="w-full h-full flex items-center justify-center" />
    </div>
  );
};
