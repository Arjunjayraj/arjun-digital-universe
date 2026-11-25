import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  attachStudioEnvironment,
  detectSoftwareGl,
  scheduleAfterDraw,
} from '../three/webglUtils';

export function PortalCanvas() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const isSoftwareGl = detectSoftwareGl();
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let envTex: THREE.Texture | null = null;
    let frameId = 0;
    let timerId = 0;
    let disposed = false;

    const disposables: Array<{ dispose: () => void }> = [];

    try {
      const w = el.clientWidth || 380;
      const h = el.clientHeight || 208;

      scene = new THREE.Scene();
      scene.background = new THREE.Color('#EEF2F5');

      camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 60);
      camera.position.set(0, 2.4, 7.2);
      camera.lookAt(0, 1.5, 0);

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

      scene.add(new THREE.HemisphereLight('#F8F5EF', '#EED8D0', 1.25));
      const sun = new THREE.DirectionalLight('#FFF5E4', 1.3);
      sun.position.set(5, 8, 6);
      scene.add(sun);

      const matIvory = new THREE.MeshStandardMaterial({
        color: '#F8F5EF',
        roughness: 0.55,
        metalness: 0.05,
      });
      const matGold = new THREE.MeshStandardMaterial({
        color: '#B99A65',
        roughness: 0.25,
        metalness: 0.85,
      });
      const matGlass = new THREE.MeshPhysicalMaterial({
        color: '#DCE8F0',
        roughness: 0.08,
        transparent: true,
        opacity: 0.58,
        clearcoat: 1.0,
      });
      disposables.push(matIvory, matGold, matGlass);

      const portal = new THREE.Group();

      const baseGeo = new THREE.CylinderGeometry(2.6, 2.2, 0.45, 24);
      const archGeo = new THREE.TorusGeometry(1.5, 0.18, 14, 40, Math.PI);
      const colGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.3, 12);
      const capGeo = new THREE.CylinderGeometry(0.28, 0.22, 0.16, 12);
      const veilGeo = new THREE.CircleGeometry(1.32, 32);
      const orbGeo = new THREE.OctahedronGeometry(0.32, 0);
      disposables.push(baseGeo, archGeo, colGeo, capGeo, veilGeo, orbGeo);

      const base = new THREE.Mesh(baseGeo, matIvory);
      portal.add(base);

      const arch = new THREE.Mesh(archGeo, matGold);
      arch.position.y = 1.5;
      portal.add(arch);

      [-1.5, 1.5].forEach((px) => {
        const col = new THREE.Mesh(colGeo, matIvory);
        col.position.set(px, 0.85, 0);
        const cap = new THREE.Mesh(capGeo, matGold);
        cap.position.set(px, 1.52, 0);
        portal.add(col, cap);
      });

      const veil = new THREE.Mesh(veilGeo, matGlass);
      veil.position.y = 1.5;
      portal.add(veil);

      const orb = new THREE.Mesh(orbGeo, matGold);
      orb.position.set(0, 1.5, 0.2);
      portal.add(orb);

      scene.add(portal);

      const onLost = (e: Event) => {
        e.preventDefault();
        setFallback(true);
      };
      const onRestored = () => setFallback(false);
      renderer.domElement.addEventListener('webglcontextlost', onLost);
      renderer.domElement.addEventListener('webglcontextrestored', onRestored);

      const onResize = () => {
        if (!el || disposed) return;
        const nw = el.clientWidth || 380;
        const nh = el.clientHeight || 208;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener('resize', onResize);

      const clock = new THREE.Clock();
      const animate = () => {
        if (disposed) return;
        const t = clock.getElapsedTime();
        portal.rotation.y = Math.sin(t * 0.35) * 0.35;
        orb.rotation.y += 0.02;
        orb.position.y = 1.5 + Math.sin(t * 1.8) * 0.12;
        renderer.render(scene, camera);

        if (isSoftwareGl) {
          scheduleAfterDraw(renderer, animate, (id) => {
            timerId = id;
          });
        } else {
          frameId = requestAnimationFrame(animate);
        }
      };
      animate();

      return () => {
        disposed = true;
        cancelAnimationFrame(frameId);
        window.clearTimeout(timerId);
        window.removeEventListener('resize', onResize);
        renderer.domElement.removeEventListener('webglcontextlost', onLost);
        renderer.domElement.removeEventListener('webglcontextrestored', onRestored);
        disposables.forEach((d) => d.dispose());
        if (envTex) envTex.dispose();
        renderer.dispose();
      };
    } catch {
      setFallback(true);
      return undefined;
    }
  }, []);

  if (fallback) {
    return (
      <div className="w-full h-52 rounded-md overflow-hidden border border-champagne-gold/40 sky-backdrop-warm flex flex-col items-center justify-center gap-2 p-4 text-center">
        <span className="material-symbols-outlined text-primary text-3xl" aria-hidden="true">
          auto_awesome
        </span>
        <span className="font-headline text-base font-semibold text-on-surface">
          The Contact Portal
        </span>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-52 rounded-md overflow-hidden border border-champagne-gold/40"
      aria-label="3D Glowing Contact Portal"
    />
  );
}
