import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { ProjectItem } from '../data/portfolioData';
import {
  attachStudioEnvironment,
  detectSoftwareGl,
  scheduleAfterDraw,
} from '../three/webglUtils';

interface ProjectModelViewerProps {
  project: ProjectItem;
  reducedMotion?: boolean;
  heightClass?: string;
}

export function ProjectModelViewer({
  project,
  reducedMotion = false,
  heightClass = 'h-56',
}: ProjectModelViewerProps) {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const [wireframe, setWireframe] = useState(false);
  const [autoSpin, setAutoSpin] = useState(!reducedMotion);
  const [contextLost, setContextLost] = useState(false);
  const stateRef = useRef({ wireframe: false, autoSpin: !reducedMotion });

  stateRef.current.wireframe = wireframe;
  stateRef.current.autoSpin = autoSpin;

  useEffect(() => {
    setAutoSpin(!reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    const isSoftwareGl = detectSoftwareGl();
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let controls: OrbitControls;
    let envTex: THREE.Texture | null = null;
    let frameId = 0;
    let timerId = 0;
    let disposed = false;

    const disposables: Array<{ dispose: () => void }> = [];

    try {
      const w = el.clientWidth || 420;
      const h = el.clientHeight || 224;

      scene = new THREE.Scene();
      scene.background = new THREE.Color('#EEF3F7');

      camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 50);
      camera.position.set(0, 1.4, 4.2);

      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.setSize(w, h);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));

      el.innerHTML = '';
      el.appendChild(renderer.domElement);

      envTex = attachStudioEnvironment(renderer, scene);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = !isSoftwareGl;
      controls.dampingFactor = 0.08;
      controls.minDistance = 2.4;
      controls.maxDistance = 6.5;

      const hemi = new THREE.HemisphereLight('#F8F5EF', '#DCD2E8', 1.2);
      scene.add(hemi);
      const key = new THREE.DirectionalLight('#FFF5E4', 1.35);
      key.position.set(4, 6, 4);
      scene.add(key);
      const rim = new THREE.DirectionalLight('#DCE8F0', 0.65);
      rim.position.set(-4, 3, -4);
      scene.add(rim);

      const mainGroup = new THREE.Group();
      const matGold = new THREE.MeshStandardMaterial({
        color: '#B99A65',
        roughness: 0.24,
        metalness: 0.85,
      });
      const matGlass = new THREE.MeshPhysicalMaterial({
        color: '#DCE8F0',
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.62,
        clearcoat: 1.0,
      });
      const matSage = new THREE.MeshStandardMaterial({
        color: '#C7D9CF',
        roughness: 0.52,
        metalness: 0.15,
      });
      const matLav = new THREE.MeshStandardMaterial({
        color: '#DCD2E8',
        roughness: 0.45,
        metalness: 0.2,
      });
      const matIvory = new THREE.MeshStandardMaterial({
        color: '#F8F5EF',
        roughness: 0.55,
        metalness: 0.06,
      });
      disposables.push(matGold, matGlass, matSage, matLav, matIvory);

      if (project.id === 'careerpilot') {
        const coreGeo = new THREE.IcosahedronGeometry(0.85, 1);
        const r1Geo = new THREE.TorusGeometry(1.25, 0.04, 12, 48);
        const r2Geo = new THREE.TorusGeometry(1.45, 0.03, 12, 48);
        const innerGeo = new THREE.OctahedronGeometry(0.42, 0);
        disposables.push(coreGeo, r1Geo, r2Geo, innerGeo);

        const core = new THREE.Mesh(coreGeo, matGlass);
        const ring1 = new THREE.Mesh(r1Geo, matGold);
        const ring2 = new THREE.Mesh(r2Geo, matLav);
        const inner = new THREE.Mesh(innerGeo, matGold);
        ring2.rotation.x = Math.PI / 3;
        mainGroup.add(core, ring1, ring2, inner);
      } else if (project.id === 'findcart') {
        const boxGeo = new THREE.BoxGeometry(1.15, 1.15, 1.15);
        const frameGeo = new THREE.TorusGeometry(1.15, 0.05, 10, 4);
        const orbGeo = new THREE.OctahedronGeometry(0.45, 0);
        const baseGeo = new THREE.CylinderGeometry(0.9, 1.05, 0.14, 16);
        disposables.push(boxGeo, frameGeo, orbGeo, baseGeo);

        const box = new THREE.Mesh(boxGeo, matGlass);
        const frame = new THREE.Mesh(frameGeo, matGold);
        frame.rotation.z = Math.PI / 4;
        const orb = new THREE.Mesh(orbGeo, matGold);
        const base = new THREE.Mesh(baseGeo, matIvory);
        base.position.y = -0.82;
        mainGroup.add(box, frame, orb, base);
      } else if (project.id === 'cloud-migration') {
        for (let i = 0; i < 3; i++) {
          const layerGeo = new THREE.CylinderGeometry(1.0 - i * 0.2, 1.1 - i * 0.2, 0.28, 6);
          disposables.push(layerGeo);
          const layer = new THREE.Mesh(layerGeo, i === 1 ? matGold : matSage);
          layer.position.y = (i - 1) * 0.52;
          mainGroup.add(layer);
        }
        const pillarGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.25, 8);
        disposables.push(pillarGeo);
        for (let p = 0; p < 3; p++) {
          const ang = (p / 3) * Math.PI * 2;
          const pillar = new THREE.Mesh(pillarGeo, matIvory);
          pillar.position.set(Math.cos(ang) * 0.68, 0, Math.sin(ang) * 0.68);
          mainGroup.add(pillar);
        }
      } else {
        const prismGeo = new THREE.OctahedronGeometry(0.95, 0);
        const haloGeo = new THREE.TorusGeometry(1.2, 0.04, 10, 36);
        const pedGeo = new THREE.CylinderGeometry(0.65, 0.8, 0.2, 12);
        disposables.push(prismGeo, haloGeo, pedGeo);

        const prism = new THREE.Mesh(prismGeo, matGlass);
        const halo = new THREE.Mesh(haloGeo, matGold);
        halo.rotation.x = Math.PI / 2.4;
        const ped = new THREE.Mesh(pedGeo, matIvory);
        ped.position.y = -1.05;
        mainGroup.add(prism, halo, ped);
      }

      scene.add(mainGroup);

      const handleLost = (e: Event) => {
        e.preventDefault();
        setContextLost(true);
      };
      const handleRestored = () => {
        setContextLost(false);
      };
      renderer.domElement.addEventListener('webglcontextlost', handleLost);
      renderer.domElement.addEventListener('webglcontextrestored', handleRestored);

      const onResize = () => {
        if (!el || disposed) return;
        const nw = el.clientWidth || 420;
        const nh = el.clientHeight || 224;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener('resize', onResize);

      const clock = new THREE.Clock();
      const tick = () => {
        if (disposed) return;
        const dt = Math.min(clock.getDelta(), 0.05);
        mainGroup.traverse((obj) => {
          if (obj instanceof THREE.Mesh && obj.material && 'wireframe' in obj.material) {
            (obj.material as THREE.MeshStandardMaterial).wireframe = stateRef.current.wireframe;
          }
        });
        if (stateRef.current.autoSpin) {
          mainGroup.rotation.y += dt * 0.55;
        }
        controls.update();
        renderer.render(scene, camera);

        if (isSoftwareGl) {
          scheduleAfterDraw(renderer, tick, (id) => {
            timerId = id;
          });
        } else {
          frameId = requestAnimationFrame(tick);
        }
      };

      tick();

      return () => {
        disposed = true;
        cancelAnimationFrame(frameId);
        window.clearTimeout(timerId);
        window.removeEventListener('resize', onResize);
        renderer.domElement.removeEventListener('webglcontextlost', handleLost);
        renderer.domElement.removeEventListener('webglcontextrestored', handleRestored);
        controls.dispose();
        disposables.forEach((d) => d.dispose());
        if (envTex) envTex.dispose();
        renderer.dispose();
      };
    } catch {
      setContextLost(true);
      return undefined;
    }
  }, [project.id]);

  return (
    <div className="rounded-md overflow-hidden border border-champagne-gold/45 bg-powder-blue/40 flex flex-col">
      {contextLost ? (
        <div
          className={`w-full ${heightClass} sky-backdrop flex flex-col items-center justify-center gap-2 p-4 text-center`}
        >
          <span className="material-symbols-outlined text-primary text-3xl" aria-hidden="true">
            deployed_code
          </span>
          <span className="font-headline text-base font-semibold text-on-surface">
            {project.title}
          </span>
          <span className="font-label text-xs text-on-surface-variant">
            {project.category}
          </span>
        </div>
      ) : (
        <div
          ref={viewerRef}
          className={`w-full ${heightClass} cursor-grab active:cursor-grabbing`}
          aria-label={`Interactive 3D model for ${project.title}`}
        />
      )}
      <div className="px-4 py-2 bg-surface-container-low/90 border-t border-outline-variant/40 flex items-center justify-between gap-2">
        <span className="font-label text-xs text-on-surface-variant">
          Drag to rotate · Scroll to zoom
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setWireframe((v) => !v)}
            aria-pressed={wireframe}
            className={`px-3 py-1 rounded-full font-label text-xs border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              wireframe
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface-container border-outline-variant/60 text-on-surface hover:bg-primary-container'
            }`}
          >
            Wireframe
          </button>
          <button
            type="button"
            onClick={() => setAutoSpin((v) => !v)}
            aria-pressed={autoSpin}
            className={`px-3 py-1 rounded-full font-label text-xs border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              autoSpin
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface-container border-outline-variant/60 text-on-surface hover:bg-primary-container'
            }`}
          >
            {autoSpin ? 'Spin' : 'Paused'}
          </button>
        </div>
      </div>
    </div>
  );
}
