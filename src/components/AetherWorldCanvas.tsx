import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  INTRO_CAMERA,
  ISLANDS,
  OVERVIEW_CAMERA,
  SKILLS_ORBIT,
  type IslandId,
} from '../data/portfolioData';
import {
  createCliffRockTexture,
  createGrassTexture,
  createIvoryStoneTexture,
  createOceanTexture,
  createPetalTexture,
  createRoofTileTexture,
  createSparkleTexture,
  createToonGradientMap,
  createWaterfallTexture,
} from '../three/proceduralTextures';
import { detectSoftwareGl, scheduleAfterDraw } from '../three/webglUtils';

interface AetherWorldCanvasProps {
  entered: boolean;
  activeIslandId: IslandId | null;
  onSelectIsland: (id: IslandId) => void;
  reducedMotion: boolean;
  onSceneReady: () => void;
  onHoverIsland: (id: IslandId | null) => void;
}

interface CameraAnim {
  endPos: THREE.Vector3;
  endLook: THREE.Vector3;
  active: boolean;
}

interface FloatingOrb {
  mesh: THREE.Object3D;
  baseY: number;
  speed: number;
  phase: number;
  orbitAngle?: number;
  orbitRadius?: number;
  parentGroup?: THREE.Group;
}

// Pre-allocated math helpers outside render loop
const _projVec = new THREE.Vector3();
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

function seededNoise(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

// Displace top plateau perimeter organically so islands never look like geometric discs
function sculptOrganicIslandTop(
  geo: THREE.CylinderGeometry,
  seedOffset: number,
  radius: number
): THREE.CylinderGeometry {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r > radius * 0.35) {
      const ang = Math.atan2(z, x);
      const lobe =
        Math.sin(ang * 4 + seedOffset) * 0.11 +
        Math.cos(ang * 7 - seedOffset * 1.4) * 0.07;
      const factor = 1 + lobe;
      pos.setX(i, x * factor);
      pos.setZ(i, z * factor);
      if (y > 0) {
        pos.setY(i, y + Math.sin(ang * 3 + seedOffset) * 0.06);
      }
    }
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

// Displace a segmented inverted rock cone into layered jagged anime mountain cliffs
function sculptCraggyConeGeometry(
  geo: THREE.ConeGeometry,
  seedOffset: number,
  radius: number
): THREE.ConeGeometry {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r > 0.05) {
      const angle = Math.atan2(z, x);
      const ridge =
        Math.sin(angle * 5 + seedOffset) * 0.18 +
        Math.cos(angle * 9 - seedOffset * 1.7 + y * 0.65) * 0.11 +
        Math.sin(y * 1.4 + seedOffset * 0.5) * 0.09;
      const scale = 1 + ridge * Math.min(1, r / (radius * 0.42));
      pos.setX(i, x * scale);
      pos.setZ(i, z * scale);
    }
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export function AetherWorldCanvas({
  entered,
  activeIslandId,
  onSelectIsland,
  reducedMotion,
  onSceneReady,
  onHoverIsland,
}: AetherWorldCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const labelLayerRef = useRef<HTMLDivElement | null>(null);
  const [webglFallback, setWebglFallback] = useState(false);

  const callbacksRef = useRef({
    onSelectIsland,
    onSceneReady,
    onHoverIsland,
  });
  callbacksRef.current = { onSelectIsland, onSceneReady, onHoverIsland };

  const stateRef = useRef<{
    entered: boolean;
    activeIslandId: IslandId | null;
    reducedMotion: boolean;
    camera: THREE.PerspectiveCamera | null;
    controls: OrbitControls | null;
    cameraAnim: CameraAnim | null;
    hoveredId: IslandId | null;
    islandGroups: Partial<Record<IslandId, THREE.Group>>;
  }>({
    entered,
    activeIslandId,
    reducedMotion,
    camera: null,
    controls: null,
    cameraAnim: null,
    hoveredId: null,
    islandGroups: {},
  });

  stateRef.current.entered = entered;
  stateRef.current.activeIslandId = activeIslandId;
  stateRef.current.reducedMotion = reducedMotion;

  // Trigger smooth camera flight when activeIslandId or entered changes
  useEffect(() => {
    const st = stateRef.current;
    if (!st.camera || !st.controls) return;

    let targetPos: [number, number, number];
    let targetLook: [number, number, number];

    if (!entered) {
      targetPos = INTRO_CAMERA.pos;
      targetLook = INTRO_CAMERA.target;
    } else if (activeIslandId) {
      const isl = ISLANDS.find((i) => i.id === activeIslandId);
      if (!isl) return;
      targetPos = isl.cameraPos;
      targetLook = isl.cameraTarget;
    } else {
      targetPos = OVERVIEW_CAMERA.pos;
      targetLook = OVERVIEW_CAMERA.target;
    }

    if (reducedMotion) {
      st.camera.position.set(targetPos[0], targetPos[1], targetPos[2]);
      st.controls.target.set(targetLook[0], targetLook[1], targetLook[2]);
      st.controls.update();
      st.cameraAnim = null;
    } else {
      st.cameraAnim = {
        endPos: new THREE.Vector3(targetPos[0], targetPos[1], targetPos[2]),
        endLook: new THREE.Vector3(targetLook[0], targetLook[1], targetLook[2]),
        active: true,
      };
    }
  }, [entered, activeIslandId, reducedMotion]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) {
      callbacksRef.current.onSceneReady();
      return;
    }

    const isSoftwareGl = detectSoftwareGl();
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let controls: OrbitControls;
    let frameId = 0;
    let timerId = 0;
    let disposed = false;

    const disposables: Array<{ dispose: () => void }> = [];
    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      disposables.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T): T => {
      disposables.push(m);
      return m;
    };
    const trackTex = <T extends THREE.Texture>(t: T): T => {
      disposables.push(t);
      return t;
    };

    try {
      scene = new THREE.Scene();
      scene.background = new THREE.Color('#73B1E8');
      scene.fog = new THREE.FogExp2('#F6DADC', 0.0042);

      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 340);
      const startIsl = stateRef.current.activeIslandId
        ? ISLANDS.find((i) => i.id === stateRef.current.activeIslandId)
        : null;
      if (stateRef.current.entered && startIsl) {
        camera.position.set(...startIsl.cameraPos);
      } else if (stateRef.current.entered) {
        camera.position.set(
          INTRO_CAMERA.pos[0],
          INTRO_CAMERA.pos[1] + 2,
          INTRO_CAMERA.pos[2] + 2
        );
      } else {
        camera.position.set(...INTRO_CAMERA.pos);
      }

      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.setSize(width, height);
      renderer.setPixelRatio(
        isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
      );
      renderer.shadowMap.enabled = !isSoftwareGl;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const maxAnisotropy = Math.min(
        4,
        renderer.capabilities.getMaxAnisotropy() || 1
      );

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = !isSoftwareGl;
      controls.dampingFactor = 0.055;
      controls.maxPolarAngle = Math.PI * 0.49;
      controls.minPolarAngle = 0.16;
      controls.minDistance = 6;
      controls.maxDistance = 76;
      if (stateRef.current.entered && startIsl) {
        controls.target.set(...startIsl.cameraTarget);
      } else if (stateRef.current.entered) {
        controls.target.set(...OVERVIEW_CAMERA.target);
        if (stateRef.current.reducedMotion) {
          camera.position.set(...OVERVIEW_CAMERA.pos);
        } else {
          stateRef.current.cameraAnim = {
            endPos: new THREE.Vector3(...OVERVIEW_CAMERA.pos),
            endLook: new THREE.Vector3(...OVERVIEW_CAMERA.target),
            active: true,
          };
        }
      } else {
        controls.target.set(...INTRO_CAMERA.target);
      }
      controls.update();

      const onControlsStart = () => {
        if (stateRef.current.cameraAnim) {
          stateRef.current.cameraAnim.active = false;
        }
      };
      controls.addEventListener('start', onControlsStart);

      stateRef.current.camera = camera;
      stateRef.current.controls = controls;

      // -----------------------------------------------------------------------
      // MAKOTO SHINKAI ANIME SKY DOME SHADER
      // -----------------------------------------------------------------------
      const skyGeo = trackGeo(new THREE.SphereGeometry(190, 36, 24));
      const skyMat = trackMat(
        new THREE.ShaderMaterial({
          side: THREE.BackSide,
          depthWrite: false,
          uniforms: {
            uTop: { value: new THREE.Color('#2E67B8') },
            uMid: { value: new THREE.Color('#6DB6ED') },
            uRose: { value: new THREE.Color('#F9BAC7') },
            uHorizon: { value: new THREE.Color('#FFEAC6') },
            uSunDir: {
              value: new THREE.Vector3(-0.78, 0.14, -0.61).normalize(),
            },
          },
          vertexShader: `
            varying vec3 vWorldPos;
            void main() {
              vec4 wp = modelMatrix * vec4(position, 1.0);
              vWorldPos = wp.xyz;
              gl_Position = projectionMatrix * viewMatrix * wp;
            }
          `,
          fragmentShader: `
            uniform vec3 uTop;
            uniform vec3 uMid;
            uniform vec3 uRose;
            uniform vec3 uHorizon;
            uniform vec3 uSunDir;
            varying vec3 vWorldPos;

            float hash21(vec2 p) {
              p = fract(p * vec2(123.34, 456.21));
              p += dot(p, p + 45.32);
              return fract(p.x * p.y);
            }

            float noise2D(vec2 p) {
              vec2 i = floor(p);
              vec2 f = fract(p);
              f = f * f * (3.0 - 2.0 * f);
              float a = hash21(i);
              float b = hash21(i + vec2(1.0, 0.0));
              float c = hash21(i + vec2(0.0, 1.0));
              float d = hash21(i + vec2(1.0, 1.0));
              return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            void main() {
              vec3 dir = normalize(vWorldPos);
              float h = clamp(dir.y, -0.05, 1.0);
              vec3 col = mix(uHorizon, uRose, smoothstep(-0.02, 0.14, h));
              col = mix(col, uMid, smoothstep(0.11, 0.40, h));
              col = mix(col, uTop, smoothstep(0.38, 0.88, h));

              vec2 skyUv = vec2(atan(dir.z, dir.x) * 2.8, dir.y * 9.5);
              float n1 = noise2D(skyUv * 1.4);
              float n2 = noise2D(skyUv * 3.1 + 4.2);
              float cloudShape = smoothstep(0.55, 0.72, n1 * 0.65 + n2 * 0.35);
              float cloudBand = smoothstep(0.05, 0.18, h) * (1.0 - smoothstep(0.48, 0.8, h));
              vec3 cloudCol = mix(vec3(1.0, 0.89, 0.90), vec3(1.0, 0.98, 0.95), smoothstep(0.15, 0.45, h));
              col = mix(col, cloudCol, cloudShape * cloudBand * 0.72);

              float sunAmt = max(dot(dir, uSunDir), 0.0);
              col += vec3(1.0, 0.85, 0.48) * pow(sunAmt, 6.0) * 0.48;
              col = mix(col, vec3(1.0, 0.98, 0.88), smoothstep(0.994, 0.9985, sunAmt));
              gl_FragColor = vec4(col, 1.0);
            }
          `,
        })
      );
      scene.add(new THREE.Mesh(skyGeo, skyMat));

      // Diagonal anime golden sunbeams
      const rayMat = trackMat(
        new THREE.MeshBasicMaterial({
          color: '#FFE8A3',
          transparent: true,
          opacity: 0.12,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      );
      for (let r = 0; r < 4; r++) {
        const beam = new THREE.Mesh(
          trackGeo(new THREE.PlaneGeometry(15 + r * 4, 115)),
          rayMat
        );
        beam.position.set(-50 + r * 14, 18 - r * 3, -60 + r * 6);
        beam.rotation.z = -0.68 - r * 0.06;
        beam.rotation.y = 0.35;
        scene.add(beam);
      }

      // -----------------------------------------------------------------------
      // ANIME CEL LIGHTING RIG
      // -----------------------------------------------------------------------
      const hemiLight = new THREE.HemisphereLight('#D8EEFF', '#F3B4BC', 1.1);
      hemiLight.position.set(0, 50, 0);
      scene.add(hemiLight);

      const sunLight = new THREE.DirectionalLight('#FFF3D1', 1.45);
      sunLight.position.set(-34, 36, 26);
      sunLight.castShadow = !isSoftwareGl;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 5;
      sunLight.shadow.camera.far = 130;
      const d = 40;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.normalBias = 0.02;
      scene.add(sunLight);

      const fillLight = new THREE.DirectionalLight('#8FC6F7', 0.55);
      fillLight.position.set(28, 22, -24);
      scene.add(fillLight);

      // -----------------------------------------------------------------------
      // CEL-SHADED MATERIALS & FINE ANIME INK OUTLINES
      // -----------------------------------------------------------------------
      const toon3 = trackTex(createToonGradientMap([102, 188, 255]));
      const toon4 = trackTex(createToonGradientMap([84, 152, 214, 255]));

      const grassTex = trackTex(createGrassTexture(maxAnisotropy));
      const cliffTex = trackTex(createCliffRockTexture(maxAnisotropy));
      const ivoryTex = trackTex(createIvoryStoneTexture(maxAnisotropy));
      const cobaltRoofTex = trackTex(
        createRoofTileTexture(maxAnisotropy, '#295FBD', '#5493EE')
      );
      const coralRoofTex = trackTex(
        createRoofTileTexture(maxAnisotropy, '#E56D64', '#F89D91')
      );
      const waterfallTex = trackTex(createWaterfallTexture(maxAnisotropy));
      const oceanTex = trackTex(createOceanTexture(maxAnisotropy));
      const sparkleTex = trackTex(createSparkleTexture());
      const petalTex = trackTex(createPetalTexture());

      const matInkOutline = trackMat(
        new THREE.MeshBasicMaterial({
          color: '#462D3B',
          side: THREE.BackSide,
        })
      );

      const addOutline = (mesh: THREE.Mesh, scale = 1.028): THREE.Mesh => {
        const outline = new THREE.Mesh(mesh.geometry, matInkOutline);
        outline.scale.setScalar(scale);
        mesh.add(outline);
        return outline;
      };

      const matGrass = trackMat(
        new THREE.MeshToonMaterial({
          map: grassTex,
          color: '#FFFFFF',
          gradientMap: toon3,
        })
      );
      const matGrassLush = trackMat(
        new THREE.MeshToonMaterial({
          map: grassTex,
          color: '#E2FAD4',
          gradientMap: toon3,
        })
      );
      const matCliffRock = trackMat(
        new THREE.MeshToonMaterial({
          map: cliffTex,
          color: '#FFFFFF',
          gradientMap: toon4,
        })
      );
      const matDarkRock = trackMat(
        new THREE.MeshToonMaterial({
          color: '#6B4C3C',
          gradientMap: toon3,
        })
      );
      const matIvory = trackMat(
        new THREE.MeshToonMaterial({
          map: ivoryTex,
          color: '#FFFDF7',
          gradientMap: toon3,
        })
      );
      const matWarmStone = trackMat(
        new THREE.MeshToonMaterial({
          map: ivoryTex,
          color: '#F5E4CA',
          gradientMap: toon3,
        })
      );
      const matCobaltRoof = trackMat(
        new THREE.MeshToonMaterial({
          map: cobaltRoofTex,
          color: '#FFFFFF',
          gradientMap: toon3,
        })
      );
      const matCoralRoof = trackMat(
        new THREE.MeshToonMaterial({
          map: coralRoofTex,
          color: '#FFFFFF',
          gradientMap: toon3,
        })
      );
      const matEmeraldFoliage = trackMat(
        new THREE.MeshToonMaterial({
          color: '#46A84A',
          gradientMap: toon3,
        })
      );
      const matSpringFoliage = trackMat(
        new THREE.MeshToonMaterial({
          color: '#6CC95D',
          gradientMap: toon3,
        })
      );
      const matSakura = trackMat(
        new THREE.MeshToonMaterial({
          color: '#FF94CC',
          gradientMap: toon3,
        })
      );
      const matSakuraDeep = trackMat(
        new THREE.MeshToonMaterial({
          color: '#F264AD',
          gradientMap: toon3,
        })
      );
      const matTreeTrunk = trackMat(
        new THREE.MeshToonMaterial({
          color: '#734E38',
          gradientMap: toon3,
        })
      );
      const matGold = trackMat(
        new THREE.MeshToonMaterial({
          color: '#F5C95D',
          emissive: '#8A5E14',
          emissiveIntensity: 0.16,
          gradientMap: toon4,
        })
      );
      const matGlow = trackMat(
        new THREE.MeshBasicMaterial({
          color: '#FFE98E',
        })
      );
      const matGlass = trackMat(
        new THREE.MeshToonMaterial({
          color: '#B8ECFF',
          gradientMap: toon3,
          transparent: true,
          opacity: 0.56,
        })
      );
      const matWaterfall = trackMat(
        new THREE.MeshBasicMaterial({
          map: waterfallTex,
          color: '#FFFFFF',
          transparent: true,
          opacity: 0.94,
          side: THREE.DoubleSide,
        })
      );
      const matWaterPool = trackMat(
        new THREE.MeshToonMaterial({
          color: '#40CBE8',
          emissive: '#147A9E',
          emissiveIntensity: 0.24,
          gradientMap: toon3,
        })
      );
      const matCloud = trackMat(
        new THREE.MeshToonMaterial({
          color: '#FFF7F4',
          emissive: '#F7C6C8',
          emissiveIntensity: 0.24,
          gradientMap: toon3,
          transparent: true,
          opacity: 0.94,
        })
      );
      const matMist = trackMat(
        new THREE.MeshBasicMaterial({
          color: '#F5FCFF',
          transparent: true,
          opacity: 0.8,
        })
      );
      const matBannerCrimson = trackMat(
        new THREE.MeshToonMaterial({
          color: '#EB4D72',
          gradientMap: toon3,
          side: THREE.DoubleSide,
        })
      );
      const matBannerCobalt = trackMat(
        new THREE.MeshToonMaterial({
          color: '#3472CF',
          gradientMap: toon3,
          side: THREE.DoubleSide,
        })
      );

      // Animated swirling magic portal shader
      const portalShaderMat = trackMat(
        new THREE.ShaderMaterial({
          transparent: true,
          side: THREE.DoubleSide,
          uniforms: {
            uTime: { value: 0 },
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform float uTime;
            varying vec2 vUv;
            void main() {
              vec2 p = vUv * 2.0 - 1.0;
              float r = length(p);
              float a = atan(p.y, p.x);
              float swirl = sin(r * 14.0 - uTime * 3.2 + a * 3.0) * 0.5 + 0.5;
              float ring = smoothstep(0.82, 0.94, r) * (1.0 - smoothstep(0.95, 1.0, r));
              vec3 coreCol = mix(vec3(0.32, 0.88, 1.0), vec3(1.0, 0.95, 0.72), swirl * 0.65);
              coreCol = mix(coreCol, vec3(1.0, 0.86, 0.45), ring);
              float alpha = (1.0 - smoothstep(0.88, 1.0, r)) * 0.94;
              gl_FragColor = vec4(coreCol, alpha);
            }
          `,
        })
      );

      // -----------------------------------------------------------------------
      // LOWER TURQUOISE SEA & DISTANT MISTY MOUNTAIN RING
      // -----------------------------------------------------------------------
      const oceanMat = trackMat(
        new THREE.MeshBasicMaterial({
          map: oceanTex,
          color: '#FFFFFF',
        })
      );
      const oceanDisc = new THREE.Mesh(
        trackGeo(new THREE.CircleGeometry(180, 48)),
        oceanMat
      );
      oceanDisc.rotation.x = -Math.PI / 2;
      oceanDisc.position.y = -21;
      scene.add(oceanDisc);

      const mountainMat = trackMat(
        new THREE.MeshToonMaterial({
          color: '#7B93BE',
          gradientMap: toon3,
        })
      );
      for (let m = 0; m < 20; m++) {
        const ang = (m / 20) * Math.PI * 2 + 0.12;
        const dist = 86 + (m % 3) * 14;
        const mh = 17 + (m % 4) * 7.5;
        const mr = 10.5 + (m % 3) * 4;
        const peak = new THREE.Mesh(
          trackGeo(new THREE.ConeGeometry(mr, mh, 7)),
          mountainMat
        );
        peak.position.set(
          Math.cos(ang) * dist,
          -20 + mh * 0.42,
          Math.sin(ang) * dist
        );
        peak.rotation.y = m * 0.8;
        scene.add(peak);
      }

      const clickableMeshes: THREE.Object3D[] = [];
      const islandGroups: Partial<Record<IslandId, THREE.Group>> = {};
      const floatingOrbs: FloatingOrb[] = [];
      const waterfallDrops: Array<{
        mesh: THREE.Mesh;
        startY: number;
        minY: number;
        speed: number;
      }> = [];
      const flags: Array<{ mesh: THREE.Mesh; phase: number }> = [];

      // Selection ring
      const ringGeo = trackGeo(new THREE.RingGeometry(6.2, 6.6, 56));
      const ringMat = trackMat(
        new THREE.MeshBasicMaterial({
          color: '#FFD86E',
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0,
        })
      );
      const selectionRing = new THREE.Mesh(ringGeo, ringMat);
      selectionRing.rotation.x = -Math.PI / 2;
      selectionRing.position.y = 0.6;
      scene.add(selectionRing);
      stateRef.current.islandGroups = islandGroups;

      // Helper: layered anime tree (emerald or sakura)
      const addTree = (
        parent: THREE.Group,
        x: number,
        y: number,
        z: number,
        scale: number,
        foliageMat: THREE.Material
      ) => {
        const tree = new THREE.Group();
        tree.position.set(x, y, z);
        const trunk = new THREE.Mesh(
          trackGeo(
            new THREE.CylinderGeometry(0.1 * scale, 0.19 * scale, 1.3 * scale, 7)
          ),
          matTreeTrunk
        );
        trunk.position.y = 0.65 * scale;
        trunk.castShadow = true;
        addOutline(trunk, 1.05);
        tree.add(trunk);

        const puffGeo = trackGeo(new THREE.IcosahedronGeometry(0.75 * scale, 1));
        const crown1 = new THREE.Mesh(puffGeo, foliageMat);
        crown1.position.y = 1.45 * scale;
        crown1.scale.set(1.18, 0.78, 1.18);
        crown1.castShadow = true;
        addOutline(crown1, 1.035);

        const crown2 = new THREE.Mesh(puffGeo, foliageMat);
        crown2.position.set(0.35 * scale, 1.72 * scale, 0.18 * scale);
        crown2.scale.set(0.82, 0.62, 0.82);
        crown2.castShadow = true;
        addOutline(crown2, 1.035);

        const crown3 = new THREE.Mesh(puffGeo, foliageMat);
        crown3.position.set(-0.32 * scale, 1.62 * scale, -0.18 * scale);
        crown3.scale.set(0.74, 0.56, 0.74);
        crown3.castShadow = true;
        addOutline(crown3, 1.035);

        tree.add(crown1, crown2, crown3);
        parent.add(tree);
      };

      // Helper: tall tapered fairy-tale anime spire roof with eaves, collar & pennant flag
      const addFairySpire = (
        parent: THREE.Group,
        x: number,
        y: number,
        z: number,
        radius: number,
        height: number,
        roofMat: THREE.Material,
        withFlag = true
      ) => {
        const collar = new THREE.Mesh(
          trackGeo(new THREE.TorusGeometry(radius * 1.05, radius * 0.11, 8, 16)),
          matGold
        );
        collar.rotation.x = Math.PI / 2;
        collar.position.set(x, y, z);

        const eaves = new THREE.Mesh(
          trackGeo(new THREE.ConeGeometry(radius * 1.24, height * 0.24, 10)),
          roofMat
        );
        eaves.position.set(x, y + height * 0.11, z);
        addOutline(eaves, 1.03);

        const cone = new THREE.Mesh(
          trackGeo(new THREE.ConeGeometry(radius * 0.92, height, 10)),
          roofMat
        );
        cone.position.set(x, y + height * 0.52, z);
        cone.castShadow = true;
        addOutline(cone, 1.03);

        const needle = new THREE.Mesh(
          trackGeo(new THREE.ConeGeometry(radius * 0.14, height * 0.35, 6)),
          matGold
        );
        needle.position.set(x, y + height * 1.12, z);

        parent.add(collar, eaves, cone, needle);

        if (withFlag) {
          const pennant = new THREE.Mesh(
            trackGeo(new THREE.PlaneGeometry(radius * 0.75, radius * 0.32)),
            matBannerCobalt
          );
          pennant.position.set(
            x + radius * 0.38,
            y + height * 1.18,
            z
          );
          parent.add(pennant);
          flags.push({ mesh: pennant, phase: x + z });
        }
      };

      // Helper: build glowing lantern post
      const addLantern = (
        parent: THREE.Group,
        x: number,
        y: number,
        z: number
      ) => {
        const post = new THREE.Mesh(
          trackGeo(new THREE.CylinderGeometry(0.05, 0.075, 0.92, 6)),
          matGold
        );
        post.position.set(x, y + 0.46, z);
        const bulb = new THREE.Mesh(
          trackGeo(new THREE.OctahedronGeometry(0.16, 0)),
          matGlow
        );
        bulb.position.set(x, y + 1.0, z);
        addOutline(bulb, 1.06);
        parent.add(post, bulb);
      };

      // Helper: vibrant animated anime waterfall cascade
      const addWaterfall = (
        parent: THREE.Group,
        x: number,
        y: number,
        z: number,
        wWidth: number,
        wHeight: number,
        rotY: number,
        dropCount = 8
      ) => {
        const wfGroup = new THREE.Group();
        wfGroup.position.set(x, y, z);
        wfGroup.rotation.y = rotY;

        const crest = new THREE.Mesh(
          trackGeo(
            new THREE.CylinderGeometry(wWidth * 0.55, wWidth * 0.65, 0.24, 10)
          ),
          matWaterPool
        );
        crest.position.set(0, 0.08, -0.15);
        wfGroup.add(crest);

        const ribbonGeo = trackGeo(new THREE.PlaneGeometry(wWidth, wHeight, 4, 8));
        const pos = ribbonGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const py = pos.getY(i);
          const topRatio = Math.max(0, (py + wHeight * 0.5) / wHeight);
          pos.setZ(i, Math.sin(topRatio * Math.PI * 0.5) * 0.28);
        }
        ribbonGeo.computeVertexNormals();

        const ribbon = new THREE.Mesh(ribbonGeo, matWaterfall);
        ribbon.position.set(0, -wHeight * 0.5 + 0.05, 0.05);
        wfGroup.add(ribbon);

        const dropGeo = trackGeo(new THREE.SphereGeometry(0.18, 7, 6));
        for (let dIdx = 0; dIdx < dropCount; dIdx++) {
          const drop = new THREE.Mesh(dropGeo, matMist);
          drop.scale.set(0.85, 1.45, 0.85);
          drop.position.set(
            (seededNoise(dIdx * 3.1 + x) - 0.5) * wWidth * 0.78,
            -(dIdx / dropCount) * wHeight,
            0.16
          );
          wfGroup.add(drop);
          waterfallDrops.push({
            mesh: drop,
            startY: 0,
            minY: -wHeight,
            speed: 2.9 + (dIdx % 3) * 0.65,
          });
        }

        for (let m = 0; m < 4; m++) {
          const mist = new THREE.Mesh(
            trackGeo(new THREE.SphereGeometry(0.62 + m * 0.14, 9, 7)),
            matMist
          );
          mist.scale.set(1.25, 0.65, 1.15);
          mist.position.set(
            (m - 1.5) * (wWidth * 0.35),
            -wHeight + 0.2,
            0.25 + (m % 2) * 0.3
          );
          wfGroup.add(mist);
        }

        parent.add(wfGroup);
      };

      // Helper: scatter colorful wildflower beds across an island's green lawn
      const flowerColors = [
        '#FF72BC',
        '#F03E8C',
        '#FFE066',
        '#FF8566',
        '#BC8EFF',
        '#FFFFFF',
      ];
      const flowerGeo = trackGeo(new THREE.DodecahedronGeometry(0.15, 0));
      const flowerMat = trackMat(
        new THREE.MeshToonMaterial({
          color: '#FFFFFF',
          gradientMap: toon3,
        })
      );
      const addFlowerBeds = (
        parent: THREE.Group,
        radius: number,
        minR: number,
        count: number,
        seedBase: number
      ) => {
        const inst = new THREE.InstancedMesh(flowerGeo, flowerMat, count);
        for (let i = 0; i < count; i++) {
          const ang = seededNoise(seedBase + i * 1.37) * Math.PI * 2;
          const dist =
            minR + seededNoise(seedBase + i * 2.91) * Math.max(0.4, radius - minR);
          const sc = 0.75 + seededNoise(seedBase + i * 4.13) * 0.9;
          _dummy.position.set(Math.cos(ang) * dist, 0.48, Math.sin(ang) * dist);
          _dummy.rotation.set(0, ang, 0);
          _dummy.scale.set(sc, sc * 0.85, sc);
          _dummy.updateMatrix();
          inst.setMatrixAt(i, _dummy.matrix);
          _color.set(flowerColors[i % flowerColors.length]);
          inst.setColorAt(i, _color);
        }
        inst.instanceMatrix.needsUpdate = true;
        if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
        inst.computeBoundingSphere();
        parent.add(inst);
      };

      // Helper: sculpted jagged floating mountain island base (organic perimeter, moss overhangs, deep cliffs)
      const createIslandBase = (
        id: IslandId,
        pos: [number, number, number],
        radius: number,
        topMat: THREE.Material,
        seed: number,
        cliffDepthMult = 1.7
      ) => {
        const group = new THREE.Group();
        group.position.set(pos[0], pos[1], pos[2]);
        group.userData = { islandId: id, baseY: pos[1] };

        const topGeo = sculptOrganicIslandTop(
          trackGeo(
            new THREE.CylinderGeometry(radius, radius * 0.94, 0.75, 24, 1)
          ),
          seed,
          radius
        );
        const topMesh = new THREE.Mesh(topGeo, topMat);
        topMesh.position.y = 0.1;
        topMesh.receiveShadow = true;
        topMesh.castShadow = true;
        topMesh.userData = { islandId: id };
        addOutline(topMesh, 1.018);
        group.add(topMesh);
        clickableMeshes.push(topMesh);

        // Overhanging emerald & sakura foliage clusters draping around cliff edge
        const mossCount = 22;
        const mossGeo = trackGeo(new THREE.IcosahedronGeometry(0.48, 0));
        for (let m = 0; m < mossCount; m++) {
          const ang =
            (m / mossCount) * Math.PI * 2 + seededNoise(seed + m) * 0.25;
          const moss = new THREE.Mesh(
            mossGeo,
            m % 5 === 0
              ? matSakura
              : m % 2 === 0
              ? matEmeraldFoliage
              : matSpringFoliage
          );
          const sc = 0.9 + seededNoise(seed + m * 3.1) * 0.85;
          moss.scale.set(sc * 1.2, sc * 1.3, sc * 0.95);
          moss.position.set(
            Math.cos(ang) * radius * 0.96,
            0.05 - (m % 3) * 0.16,
            Math.sin(ang) * radius * 0.96
          );
          group.add(moss);
        }

        const skirtMesh = new THREE.Mesh(
          sculptCraggyConeGeometry(
            trackGeo(
              new THREE.ConeGeometry(radius * 0.95, 1.1, 18, 2)
            ),
            seed + 1.5,
            radius
          ),
          matCliffRock
        );
        skirtMesh.rotation.x = Math.PI;
        skirtMesh.position.y = -0.68;
        skirtMesh.castShadow = true;
        skirtMesh.userData = { islandId: id };
        group.add(skirtMesh);
        clickableMeshes.push(skirtMesh);

        const cliffH = radius * cliffDepthMult;
        const rockGeo = sculptCraggyConeGeometry(
          trackGeo(new THREE.ConeGeometry(radius * 0.88, cliffH, 16, 6)),
          seed,
          radius
        );
        const rockMesh = new THREE.Mesh(rockGeo, matCliffRock);
        rockMesh.rotation.x = Math.PI;
        rockMesh.position.y = -(cliffH * 0.5 + 0.72);
        rockMesh.castShadow = true;
        rockMesh.userData = { islandId: id };
        addOutline(rockMesh, 1.024);
        group.add(rockMesh);
        clickableMeshes.push(rockMesh);

        // Secondary flanking cliff crags
        for (let s = 0; s < 6; s++) {
          const ang = (s / 6) * Math.PI * 2 + seed * 0.3;
          const subR = radius * (0.28 + (s % 2) * 0.11);
          const subH = cliffH * (0.52 + (s % 3) * 0.16);
          const spireGeo = sculptCraggyConeGeometry(
            trackGeo(new THREE.ConeGeometry(subR, subH, 8, 3)),
            seed + s * 4.2,
            subR
          );
          const spire = new THREE.Mesh(
            spireGeo,
            s % 2 === 0 ? matDarkRock : matCliffRock
          );
          spire.rotation.x = Math.PI;
          spire.position.set(
            Math.cos(ang) * radius * 0.48,
            -(subH * 0.5 + 0.62),
            Math.sin(ang) * radius * 0.48
          );
          addOutline(spire, 1.028);
          group.add(spire);
        }

        scene.add(group);
        islandGroups[id] = group;
        return group;
      };

      // Helper: ornate fairy-tale multi-spire castle builder
      const addCastleWing = (
        parent: THREE.Group,
        x: number,
        y: number,
        z: number,
        w: number,
        h: number,
        dLen: number,
        roofMat: THREE.Material,
        islandId: IslandId
      ) => {
        const wing = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(w, h, dLen)),
          matIvory
        );
        wing.position.set(x, y + h * 0.5, z);
        wing.castShadow = true;
        wing.receiveShadow = true;
        wing.userData = { islandId };
        addOutline(wing, 1.028);
        parent.add(wing);
        clickableMeshes.push(wing);

        // Pitched gable roof
        const roof = new THREE.Mesh(
          trackGeo(
            new THREE.ConeGeometry(Math.max(w, dLen) * 0.72, h * 0.75, 4)
          ),
          roofMat
        );
        roof.rotation.y = Math.PI / 4;
        roof.position.set(x, y + h + h * 0.35, z);
        roof.castShadow = true;
        addOutline(roof, 1.03);
        parent.add(roof);

        // Warm glowing front windows
        for (let wx = -1; wx <= 1; wx += 2) {
          const win = new THREE.Mesh(
            trackGeo(new THREE.BoxGeometry(0.24, 0.48, 0.08)),
            matGlow
          );
          win.position.set(x + wx * (w * 0.25), y + h * 0.55, z + dLen * 0.51);
          parent.add(win);
        }
      };

      const addCastleTower = (
        parent: THREE.Group,
        x: number,
        baseY: number,
        z: number,
        r: number,
        h: number,
        spireH: number,
        roofMat: THREE.Material,
        islandId: IslandId,
        withFlag = true
      ) => {
        const shaft = new THREE.Mesh(
          trackGeo(new THREE.CylinderGeometry(r * 0.9, r * 1.08, h, 10)),
          matIvory
        );
        shaft.position.set(x, baseY + h * 0.5, z);
        shaft.castShadow = true;
        shaft.userData = { islandId };
        addOutline(shaft, 1.035);
        parent.add(shaft);
        clickableMeshes.push(shaft);

        // Warm glowing tower window
        const win = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(r * 0.45, r * 0.85, 0.1)),
          matGlow
        );
        win.position.set(x, baseY + h * 0.65, z + r * 0.92);
        parent.add(win);

        addFairySpire(
          parent,
          x,
          baseY + h,
          z,
          r * 1.02,
          spireH,
          roofMat,
          withFlag
        );
      };

      // -----------------------------------------------------------------------
      // 1. THE HOME (GRAND FAIRY-TALE ANIME CASTLE CITADEL + COURTYARD + TWIN WATERFALLS)
      // -----------------------------------------------------------------------
      const homeGroup = createIslandBase(
        'home',
        [0, 2.6, -2.5],
        7.5,
        matGrass,
        1.1,
        1.65
      );

      // Stepped palace courtyard & terrace wall
      const homeTerrace = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(4.7, 5.2, 0.55, 16)),
        matWarmStone
      );
      homeTerrace.position.set(0, 0.65, -0.8);
      homeTerrace.receiveShadow = true;
      homeTerrace.userData = { islandId: 'home' };
      addOutline(homeTerrace, 1.018);
      homeGroup.add(homeTerrace);
      clickableMeshes.push(homeTerrace);

      // Left & Right Palace Chateau Wings
      addCastleWing(homeGroup, -2.15, 0.9, -1.1, 2.2, 2.1, 1.9, matCoralRoof, 'home');
      addCastleWing(homeGroup, 2.15, 0.9, -1.1, 2.2, 2.1, 1.9, matCobaltRoof, 'home');
      addCastleWing(homeGroup, 0, 0.9, -1.5, 2.8, 2.8, 2.4, matCobaltRoof, 'home');

      // Grand Central Soaring Keep & Needle Spire (reaches high into the sky!)
      addCastleTower(homeGroup, 0, 2.8, -1.8, 1.15, 3.2, 3.6, matCobaltRoof, 'home', true);

      // Cluster of 8 varied flanking castle turrets of different heights (fairy-tale silhouette!)
      addCastleTower(homeGroup, -1.55, 2.0, -2.1, 0.62, 2.6, 2.3, matCobaltRoof, 'home', true);
      addCastleTower(homeGroup, 1.55, 2.0, -2.1, 0.66, 2.8, 2.4, matCobaltRoof, 'home', true);
      addCastleTower(homeGroup, -3.1, 0.9, -0.5, 0.58, 2.7, 1.9, matCobaltRoof, 'home', true);
      addCastleTower(homeGroup, 3.1, 0.9, -0.5, 0.58, 2.9, 2.1, matCobaltRoof, 'home', true);
      addCastleTower(homeGroup, -2.55, 0.9, -2.7, 0.52, 2.4, 1.7, matCoralRoof, 'home', false);
      addCastleTower(homeGroup, 2.55, 0.9, -2.7, 0.52, 2.5, 1.8, matCobaltRoof, 'home', false);
      addCastleTower(homeGroup, -1.3, 0.9, 0.6, 0.44, 2.0, 1.35, matCobaltRoof, 'home', false);
      addCastleTower(homeGroup, 1.3, 0.9, 0.6, 0.44, 2.0, 1.35, matCoralRoof, 'home', false);

      // Front arched gatehouse portico & glowing golden doorway
      const entryArch = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(0.85, 0.16, 10, 24, Math.PI)),
        matGold
      );
      entryArch.position.set(0, 1.45, 0.95);
      addOutline(entryArch, 1.04);
      homeGroup.add(entryArch);
      const entryGlow = new THREE.Mesh(
        trackGeo(new THREE.CircleGeometry(0.76, 20)),
        matGlow
      );
      entryGlow.position.set(0, 1.4, 0.92);
      homeGroup.add(entryGlow);

      // Front sanctuary circular fountain plaza
      const poolRim = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(1.75, 0.14, 8, 28)),
        matIvory
      );
      poolRim.rotation.x = Math.PI / 2;
      poolRim.position.set(0, 0.52, 3.6);
      homeGroup.add(poolRim);

      const pool = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(1.68, 1.68, 0.14, 24)),
        matWaterPool
      );
      pool.position.set(0, 0.48, 3.6);
      homeGroup.add(pool);

      const fountainSpire = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.18, 0.34, 0.95, 8)),
        matGold
      );
      fountainSpire.position.set(0, 0.95, 3.6);
      homeGroup.add(fountainSpire);

      addTree(homeGroup, -4.8, 0.42, -1.2, 1.3, matEmeraldFoliage);
      addTree(homeGroup, 4.8, 0.42, -1.0, 1.25, matSakura);
      addTree(homeGroup, -4.3, 0.42, 2.4, 1.1, matSpringFoliage);
      addTree(homeGroup, 4.4, 0.42, 2.3, 1.05, matSakuraDeep);
      addTree(homeGroup, -2.4, 0.42, 4.6, 0.95, matSakura);
      addLantern(homeGroup, -1.9, 0.44, 5.2);
      addLantern(homeGroup, 1.9, 0.44, 5.2);
      addFlowerBeds(homeGroup, 6.8, 4.3, 56, 11);

      addWaterfall(homeGroup, 2.5, 0.4, 6.1, 1.55, 8.8, 0.3, 10);
      addWaterfall(homeGroup, -2.8, 0.4, 5.9, 1.35, 8.2, -0.35, 8);

      // -----------------------------------------------------------------------
      // 2. THE KNOWLEDGE GARDEN (Grand Circular Ribbed Glass Conservatory Dome + Waterfall)
      // -----------------------------------------------------------------------
      const gardenGroup = createIslandBase(
        'garden',
        [12.5, 1.4, -3.5],
        5.4,
        matGrassLush,
        2.3,
        1.65
      );

      const gardenTerrace = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(3.2, 3.6, 0.48, 18)),
        matIvory
      );
      gardenTerrace.position.set(0, 0.62, -0.3);
      gardenTerrace.receiveShadow = true;
      addOutline(gardenTerrace, 1.02);
      gardenGroup.add(gardenTerrace);

      // Large Glass Conservatory Rotunda
      const consBase = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(2.65, 2.8, 1.15, 16)),
        matGlass
      );
      consBase.position.set(0, 1.4, -0.3);
      consBase.userData = { islandId: 'garden' };
      addOutline(consBase, 1.02);
      gardenGroup.add(consBase);
      clickableMeshes.push(consBase);

      const consDome = new THREE.Mesh(
        trackGeo(
          new THREE.SphereGeometry(2.65, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2)
        ),
        matGlass
      );
      consDome.position.set(0, 1.95, -0.3);
      consDome.userData = { islandId: 'garden' };
      gardenGroup.add(consDome);
      clickableMeshes.push(consDome);

      // Gold structural ribs over conservatory
      const consRibGeo = trackGeo(
        new THREE.TorusGeometry(2.7, 0.08, 8, 36, Math.PI)
      );
      for (let a = 0; a < 4; a++) {
        const rib = new THREE.Mesh(consRibGeo, matGold);
        rib.position.set(0, 1.95, -0.3);
        rib.rotation.y = (a / 4) * Math.PI;
        gardenGroup.add(rib);
      }
      const consRing = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(2.72, 0.1, 8, 32)),
        matGold
      );
      consRing.rotation.x = Math.PI / 2;
      consRing.position.set(0, 1.95, -0.3);
      gardenGroup.add(consRing);

      addFairySpire(gardenGroup, 0, 4.45, -0.3, 0.52, 1.05, matCobaltRoof, true);

      // Lush indoor tree visible inside glass conservatory
      addTree(gardenGroup, 0, 0.85, -0.3, 1.1, matEmeraldFoliage);

      addTree(gardenGroup, -3.5, 0.45, -1.7, 1.25, matSakura);
      addTree(gardenGroup, 3.6, 0.45, -1.3, 1.2, matEmeraldFoliage);
      addTree(gardenGroup, -2.9, 0.45, 2.4, 1.05, matSakuraDeep);
      addTree(gardenGroup, 3.0, 0.45, 2.2, 1.05, matSpringFoliage);
      addLantern(gardenGroup, -1.3, 0.45, 3.3);
      addLantern(gardenGroup, 1.3, 0.45, 3.3);
      addFlowerBeds(gardenGroup, 4.9, 3.3, 46, 29);
      addWaterfall(gardenGroup, 1.6, 0.4, 4.7, 1.35, 7.6, 0.35, 9);

      // 8 Orbiting Jewel Mana Crystals
      const skillCrystalGeo = trackGeo(new THREE.OctahedronGeometry(0.36, 0));
      const skillRingGeo = trackGeo(new THREE.TorusGeometry(0.52, 0.04, 8, 24));
      const jewelColors = [
        '#2A62C4',
        '#2DC4D6',
        '#FF6FB5',
        '#FFD166',
        '#A87FFB',
        '#43B877',
        '#FF7A59',
        '#4CA6EB',
      ];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const r = 3.95;
        const crystalGroup = new THREE.Group();
        crystalGroup.position.set(
          Math.cos(angle) * r,
          2.65 + (i % 2) * 0.45,
          Math.sin(angle) * r
        );
        const jewelMat = trackMat(
          new THREE.MeshToonMaterial({
            color: jewelColors[i],
            emissive: jewelColors[i],
            emissiveIntensity: 0.35,
            gradientMap: toon3,
          })
        );
        const crystal = new THREE.Mesh(skillCrystalGeo, jewelMat);
        crystal.castShadow = true;
        crystal.userData = { islandId: 'garden' };
        addOutline(crystal, 1.06);
        const ring = new THREE.Mesh(skillRingGeo, matGold);
        ring.rotation.x = Math.PI / 3;
        crystalGroup.add(crystal, ring);
        gardenGroup.add(crystalGroup);
        clickableMeshes.push(crystal);

        floatingOrbs.push({
          mesh: crystalGroup,
          baseY: crystalGroup.position.y,
          speed: 1.6,
          phase: i * 0.8,
          orbitAngle: angle,
          orbitRadius: r,
          parentGroup: gardenGroup,
        });
      }

      // -----------------------------------------------------------------------
      // 3. THE PROJECT GALLERY (Crystal Cathedral Castle + Cobalt Spires + Waterfall)
      // -----------------------------------------------------------------------
      const galleryGroup = createIslandBase(
        'gallery',
        [-12.5, 2.2, -5.0],
        5.3,
        matGrass,
        3.7,
        1.65
      );

      const galPlinth = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(3.45, 3.8, 0.4, 16)),
        matIvory
      );
      galPlinth.position.set(0, 0.6, 0);
      addOutline(galPlinth, 1.02);
      galleryGroup.add(galPlinth);

      const glassCyl = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(2.55, 2.7, 1.85, 14)),
        matGlass
      );
      glassCyl.position.set(0, 1.7, 0);
      glassCyl.userData = { islandId: 'gallery' };
      addOutline(glassCyl, 1.02);
      galleryGroup.add(glassCyl);
      clickableMeshes.push(glassCyl);

      const glassDome = new THREE.Mesh(
        trackGeo(
          new THREE.SphereGeometry(2.55, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2)
        ),
        matGlass
      );
      glassDome.position.set(0, 2.6, 0);
      glassDome.userData = { islandId: 'gallery' };
      galleryGroup.add(glassDome);
      clickableMeshes.push(glassDome);

      const galArchGeo = trackGeo(
        new THREE.TorusGeometry(2.62, 0.09, 10, 40, Math.PI)
      );
      for (let a = 0; a < 4; a++) {
        const archRib = new THREE.Mesh(galArchGeo, matGold);
        archRib.position.set(0, 2.6, 0);
        archRib.rotation.y = (a / 4) * Math.PI;
        galleryGroup.add(archRib);
      }

      addFairySpire(galleryGroup, 0, 5.05, 0, 0.5, 1.35, matCobaltRoof, true);

      // 4 Tall Flanking Castle Turrets around Crystal Cathedral
      addCastleTower(galleryGroup, -2.6, 0.7, -2.1, 0.48, 2.4, 1.65, matCobaltRoof, 'gallery', true);
      addCastleTower(galleryGroup, 2.6, 0.7, -2.1, 0.48, 2.4, 1.65, matCobaltRoof, 'gallery', true);
      addCastleTower(galleryGroup, -2.6, 0.7, 2.1, 0.42, 2.0, 1.35, matCoralRoof, 'gallery', false);
      addCastleTower(galleryGroup, 2.6, 0.7, 2.1, 0.42, 2.0, 1.35, matCoralRoof, 'gallery', false);

      const centerPrism = new THREE.Mesh(
        trackGeo(new THREE.IcosahedronGeometry(0.75, 0)),
        portalShaderMat
      );
      centerPrism.position.set(0, 2.45, 0);
      galleryGroup.add(centerPrism);
      floatingOrbs.push({
        mesh: centerPrism,
        baseY: 2.45,
        speed: 1.4,
        phase: 0.2,
      });

      const holoGeo = trackGeo(new THREE.BoxGeometry(0.62, 0.92, 0.1));
      for (let p = 0; p < 4; p++) {
        const ang = (p / 4) * Math.PI * 2 + 0.4;
        const holo = new THREE.Mesh(
          holoGeo,
          p % 2 === 0 ? matGlow : matWaterPool
        );
        holo.position.set(Math.cos(ang) * 1.65, 1.82, Math.sin(ang) * 1.65);
        holo.lookAt(0, 1.82, 0);
        addOutline(holo, 1.04);
        galleryGroup.add(holo);
        floatingOrbs.push({
          mesh: holo,
          baseY: 1.82,
          speed: 1.3,
          phase: p * 1.4,
        });
      }
      addTree(galleryGroup, -4.0, 0.45, 0.5, 1.05, matEmeraldFoliage);
      addTree(galleryGroup, 4.0, 0.45, 0.5, 1.05, matSakura);
      addFlowerBeds(galleryGroup, 4.8, 3.4, 38, 43);
      addWaterfall(galleryGroup, -1.8, 0.4, 4.4, 1.25, 7.2, -0.35, 8);

      // -----------------------------------------------------------------------
      // 4. THE HALL OF ACHIEVEMENTS (Golden Temple Colonnade + Giant Trophy Cup + Waterfall)
      // -----------------------------------------------------------------------
      const achGroup = createIslandBase(
        'achievements',
        [8.8, -1.0, 9.5],
        5.0,
        matGrass,
        4.9,
        1.6
      );

      const achStep1 = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(3.25, 3.6, 0.3, 18)),
        matIvory
      );
      achStep1.position.set(0, 0.55, 0);
      addOutline(achStep1, 1.02);
      achGroup.add(achStep1);

      const achStep2 = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(2.85, 3.05, 0.28, 18)),
        matWarmStone
      );
      achStep2.position.set(0, 0.82, 0);
      achGroup.add(achStep2);

      const colGeo = trackGeo(new THREE.CylinderGeometry(0.22, 0.27, 2.6, 12));
      const capGeo = trackGeo(new THREE.CylinderGeometry(0.34, 0.24, 0.22, 12));
      const bannerGeo = trackGeo(new THREE.PlaneGeometry(0.45, 1.25));
      for (let c = 0; c < 8; c++) {
        const ang = (c / 8) * Math.PI * 2;
        const col = new THREE.Mesh(colGeo, matGold);
        col.position.set(Math.cos(ang) * 2.4, 2.2, Math.sin(ang) * 2.4);
        col.castShadow = true;
        addOutline(col, 1.04);
        achGroup.add(col);

        const cap = new THREE.Mesh(capGeo, matGold);
        cap.position.set(Math.cos(ang) * 2.4, 3.5, Math.sin(ang) * 2.4);
        achGroup.add(cap);

        if (c % 2 === 0) {
          const bAng = ang + Math.PI / 8;
          const banner = new THREE.Mesh(
            bannerGeo,
            c % 4 === 0 ? matBannerCrimson : matBannerCobalt
          );
          banner.position.set(
            Math.cos(bAng) * 2.38,
            2.7,
            Math.sin(bAng) * 2.38
          );
          banner.lookAt(0, 2.7, 0);
          achGroup.add(banner);
        }
      }

      const achEntablature = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(2.4, 0.25, 10, 32)),
        matGold
      );
      achEntablature.rotation.x = Math.PI / 2;
      achEntablature.position.set(0, 3.7, 0);
      achEntablature.userData = { islandId: 'achievements' };
      addOutline(achEntablature, 1.025);
      achGroup.add(achEntablature);
      clickableMeshes.push(achEntablature);

      addFairySpire(achGroup, 0, 3.8, -2.1, 0.55, 1.2, matGold, true);

      // Sculpted Giant Golden Trophy Chalice in center
      const achPedestal = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.55, 0.78, 0.85, 10)),
        matIvory
      );
      achPedestal.position.set(0, 1.32, 0);
      addOutline(achPedestal, 1.03);
      achGroup.add(achPedestal);

      const trophyGroup = new THREE.Group();
      trophyGroup.position.set(0, 2.3, 0);
      const cupStem = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.16, 0.32, 0.55, 10)),
        matGold
      );
      cupStem.position.y = -0.3;
      const cupBowl = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.7, 0.25, 0.85, 14)),
        matGold
      );
      cupBowl.position.y = 0.25;
      addOutline(cupBowl, 1.04);
      const handleGeo = trackGeo(
        new THREE.TorusGeometry(0.32, 0.06, 8, 16, Math.PI)
      );
      const hLeft = new THREE.Mesh(handleGeo, matGold);
      hLeft.rotation.z = Math.PI / 2;
      hLeft.position.set(-0.55, 0.35, 0);
      const hRight = new THREE.Mesh(handleGeo, matGold);
      hRight.rotation.z = -Math.PI / 2;
      hRight.position.set(0.55, 0.35, 0);
      const trophyStar = new THREE.Mesh(
        trackGeo(new THREE.OctahedronGeometry(0.28, 0)),
        matGlow
      );
      trophyStar.position.y = 0.95;
      trophyGroup.add(cupStem, cupBowl, hLeft, hRight, trophyStar);
      achGroup.add(trophyGroup);
      floatingOrbs.push({
        mesh: trophyGroup,
        baseY: 2.3,
        speed: 1.5,
        phase: 0.5,
      });

      addTree(achGroup, -3.7, 0.45, -1.6, 1.05, matEmeraldFoliage);
      addTree(achGroup, 3.7, 0.45, -1.4, 1.1, matSakura);
      addTree(achGroup, 3.5, 0.45, 2.1, 0.95, matSakuraDeep);
      addLantern(achGroup, -3.0, 0.45, 2.3);
      addLantern(achGroup, 3.0, 0.45, 2.3);
      addFlowerBeds(achGroup, 4.6, 3.1, 40, 57);
      addWaterfall(achGroup, -1.2, 0.4, 4.4, 1.3, 6.8, -0.25, 8);

      // -----------------------------------------------------------------------
      // 5. THE LIBRARY (Amber-Lit 2-Story Rotunda + Cobalt Observatory Dome + Waterfall)
      // -----------------------------------------------------------------------
      const libGroup = createIslandBase(
        'library',
        [-8.2, -1.2, 9.2],
        4.9,
        matGrassLush,
        6.1,
        1.6
      );

      const libPlinth = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(2.95, 3.25, 0.35, 16)),
        matWarmStone
      );
      libPlinth.position.set(0, 0.6, 0);
      addOutline(libPlinth, 1.02);
      libGroup.add(libPlinth);

      const libTier1 = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(2.35, 2.55, 1.55, 14)),
        matIvory
      );
      libTier1.position.set(0, 1.48, 0);
      libTier1.castShadow = true;
      libTier1.userData = { islandId: 'library' };
      addOutline(libTier1, 1.025);
      libGroup.add(libTier1);
      clickableMeshes.push(libTier1);

      for (let lw = 0; lw < 8; lw++) {
        const ang = (lw / 8) * Math.PI * 2;
        const win1 = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(0.32, 0.78, 0.14)),
          matGlow
        );
        win1.position.set(Math.cos(ang) * 2.42, 1.48, Math.sin(ang) * 2.42);
        win1.lookAt(0, 1.48, 0);
        libGroup.add(win1);

        const win2 = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(0.24, 0.56, 0.14)),
          matGlow
        );
        win2.position.set(Math.cos(ang) * 1.68, 2.85, Math.sin(ang) * 1.68);
        win2.lookAt(0, 2.85, 0);
        libGroup.add(win2);
      }

      const libBalcony = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(2.4, 0.11, 8, 28)),
        matGold
      );
      libBalcony.rotation.x = Math.PI / 2;
      libBalcony.position.set(0, 2.28, 0);
      libGroup.add(libBalcony);

      const libTier2 = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(1.58, 1.8, 1.38, 14)),
        matWarmStone
      );
      libTier2.position.set(0, 2.9, 0);
      libTier2.castShadow = true;
      libTier2.userData = { islandId: 'library' };
      addOutline(libTier2, 1.03);
      libGroup.add(libTier2);
      clickableMeshes.push(libTier2);

      const libDome = new THREE.Mesh(
        trackGeo(
          new THREE.SphereGeometry(1.6, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2)
        ),
        matCobaltRoof
      );
      libDome.position.set(0, 3.55, 0);
      addOutline(libDome, 1.03);
      libGroup.add(libDome);

      addFairySpire(libGroup, 0, 4.95, 0, 0.42, 1.25, matGold, true);

      for (let ln = 0; ln < 6; ln++) {
        const ang = (ln / 6) * Math.PI * 2;
        const lantern = new THREE.Mesh(
          trackGeo(new THREE.OctahedronGeometry(0.22, 0)),
          matGlow
        );
        lantern.position.set(
          Math.cos(ang) * 3.15,
          2.65 + (ln % 2) * 0.5,
          Math.sin(ang) * 3.15
        );
        addOutline(lantern, 1.07);
        libGroup.add(lantern);
        floatingOrbs.push({
          mesh: lantern,
          baseY: lantern.position.y,
          speed: 1.7,
          phase: ln * 1.1,
        });
      }
      addTree(libGroup, -3.5, 0.45, -1.8, 1.1, matSakura);
      addTree(libGroup, 3.5, 0.45, -1.6, 1.05, matEmeraldFoliage);
      addFlowerBeds(libGroup, 4.5, 3.0, 36, 71);
      addWaterfall(libGroup, 1.1, 0.4, 4.2, 1.3, 6.8, 0.25, 8);

      // -----------------------------------------------------------------------
      // 6. THE CONTACT PORTAL (Twin-Tower Temple + Swirling Turquoise Portal + Waterfall)
      // -----------------------------------------------------------------------
      const portalGroup = createIslandBase(
        'contact',
        [-14.2, 0.4, 2.8],
        5.0,
        matGrass,
        7.7,
        1.7
      );

      const portalDais1 = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(3.2, 3.55, 0.34, 20)),
        matWarmStone
      );
      portalDais1.position.set(0, 0.55, 0);
      addOutline(portalDais1, 1.02);
      portalGroup.add(portalDais1);

      const portalDais2 = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(2.6, 2.85, 0.28, 20)),
        matIvory
      );
      portalDais2.position.set(0, 0.84, 0);
      portalGroup.add(portalDais2);

      const arch = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(2.05, 0.24, 14, 40, Math.PI)),
        matGold
      );
      arch.position.set(0, 2.18, 0);
      arch.castShadow = true;
      arch.userData = { islandId: 'contact' };
      addOutline(arch, 1.035);
      portalGroup.add(arch);
      clickableMeshes.push(arch);

      const innerArch = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(1.72, 0.09, 10, 36, Math.PI)),
        matGlow
      );
      innerArch.position.set(0, 2.18, 0);
      portalGroup.add(innerArch);

      // Flanking Twin Cobalt-Domed Temple Towers
      addCastleTower(portalGroup, -2.25, 0.9, 0, 0.56, 2.0, 1.45, matCobaltRoof, 'contact', true);
      addCastleTower(portalGroup, 2.25, 0.9, 0, 0.56, 2.0, 1.45, matCobaltRoof, 'contact', true);

      const portalCrown = new THREE.Mesh(
        trackGeo(new THREE.OctahedronGeometry(0.36, 0)),
        matGlow
      );
      portalCrown.position.set(0, 4.6, 0);
      addOutline(portalCrown, 1.06);
      portalGroup.add(portalCrown);

      const portalVeil = new THREE.Mesh(
        trackGeo(new THREE.CircleGeometry(1.72, 32)),
        portalShaderMat
      );
      portalVeil.position.set(0, 2.18, 0);
      portalVeil.userData = { islandId: 'contact' };
      portalGroup.add(portalVeil);
      clickableMeshes.push(portalVeil);

      addTree(portalGroup, -3.7, 0.45, -1.4, 1.1, matSakura);
      addTree(portalGroup, 3.7, 0.45, -1.4, 1.1, matEmeraldFoliage);
      addLantern(portalGroup, -3.0, 0.45, 1.9);
      addLantern(portalGroup, 3.0, 0.45, 1.9);
      addFlowerBeds(portalGroup, 4.6, 3.0, 36, 89);
      addWaterfall(portalGroup, 0.0, 0.4, 4.4, 1.4, 7.6, 0, 9);

      // -----------------------------------------------------------------------
      // ORNATE ARCHED STONE VIADUCT BRIDGES WITH SUPPORTING ARCHES & RAILS
      // -----------------------------------------------------------------------
      const createViaductBridge = (
        p1: [number, number, number],
        p2: [number, number, number]
      ) => {
        const v1 = new THREE.Vector3(p1[0], p1[1] + 0.45, p1[2]);
        const v2 = new THREE.Vector3(p2[0], p2[1] + 0.45, p2[2]);
        const dir = v2.clone().sub(v1).normalize();
        const perp = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(0.38);

        const mid = v1.clone().add(v2).multiplyScalar(0.5);
        mid.y += 1.5;
        const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);

        const deck = new THREE.Mesh(
          trackGeo(new THREE.TubeGeometry(curve, 24, 0.42, 8, false)),
          matIvory
        );
        deck.scale.set(1, 0.34, 1);
        deck.castShadow = true;
        deck.receiveShadow = true;
        addOutline(deck, 1.028);
        scene.add(deck);

        // Supporting underside masonry arch rib
        const underMid = mid.clone();
        underMid.y += 0.95;
        const underCurve = new THREE.QuadraticBezierCurve3(
          v1.clone().add(new THREE.Vector3(0, -1.2, 0)),
          underMid,
          v2.clone().add(new THREE.Vector3(0, -1.2, 0))
        );
        const archSupport = new THREE.Mesh(
          trackGeo(new THREE.TubeGeometry(underCurve, 20, 0.22, 6, false)),
          matWarmStone
        );
        addOutline(archSupport, 1.03);
        scene.add(archSupport);

        [-1, 1].forEach((side) => {
          const offset = perp.clone().multiplyScalar(side);
          const railCurve = new THREE.QuadraticBezierCurve3(
            v1.clone().add(offset).add(new THREE.Vector3(0, 0.28, 0)),
            mid.clone().add(offset).add(new THREE.Vector3(0, 0.28, 0)),
            v2.clone().add(offset).add(new THREE.Vector3(0, 0.28, 0))
          );
          const rail = new THREE.Mesh(
            trackGeo(new THREE.TubeGeometry(railCurve, 24, 0.06, 6, false)),
            matGold
          );
          scene.add(rail);
        });
      };

      createViaductBridge([0, 2.6, -2.5], [12.5, 1.4, -3.5]);
      createViaductBridge([0, 2.6, -2.5], [-12.5, 2.2, -5.0]);
      createViaductBridge([0, 2.6, -2.5], [8.8, -1.0, 9.5]);
      createViaductBridge([0, 2.6, -2.5], [-8.2, -1.2, 9.2]);
      createViaductBridge([-8.2, -1.2, 9.2], [-14.2, 0.4, 2.8]);
      createViaductBridge([-12.5, 2.2, -5.0], [-14.2, 0.4, 2.8]);

      // -----------------------------------------------------------------------
      // DISTANT ANIME FLOATING CASTLE ISLANDS (Rich Layered Depth)
      // -----------------------------------------------------------------------
      [
        { pos: [-38, 6, -34], r: 4.5, h: 7.2, wf: true },
        { pos: [36, 7, -30], r: 5.2, h: 8.2, wf: true },
        { pos: [26, 4, 4], r: 4.0, h: 6.2, wf: true },
        { pos: [-44, 1, 15], r: 3.8, h: 5.5, wf: false },
        { pos: [42, 1, 18], r: 4.2, h: 6.0, wf: true },
        { pos: [4, 8, -50], r: 5.8, h: 9.0, wf: true },
        { pos: [-24, 9, -46], r: 3.4, h: 5.2, wf: false },
        { pos: [25, 8, -46], r: 3.6, h: 5.6, wf: false },
      ].forEach((dIsl, idx) => {
        const dg = new THREE.Group();
        dg.position.set(dIsl.pos[0], dIsl.pos[1], dIsl.pos[2]);
        const dTop = new THREE.Mesh(
          sculptOrganicIslandTop(
            trackGeo(
              new THREE.CylinderGeometry(dIsl.r, dIsl.r * 0.88, 0.8, 14, 1)
            ),
            idx * 2.1,
            dIsl.r
          ),
          matGrass
        );
        addOutline(dTop, 1.02);
        const dRock = new THREE.Mesh(
          sculptCraggyConeGeometry(
            trackGeo(new THREE.ConeGeometry(dIsl.r * 0.88, dIsl.h, 10, 3)),
            idx * 3.7,
            dIsl.r
          ),
          matCliffRock
        );
        dRock.rotation.x = Math.PI;
        dRock.position.y = -(dIsl.h * 0.5 + 0.35);
        addOutline(dRock, 1.024);
        const dTower = new THREE.Mesh(
          trackGeo(new THREE.CylinderGeometry(0.7, 1.0, 2.9, 8)),
          matIvory
        );
        dTower.position.y = 1.65;
        addOutline(dTower, 1.035);
        dg.add(dTop, dRock, dTower);
        addFairySpire(
          dg,
          0,
          3.05,
          0,
          0.95,
          1.9,
          idx % 2 === 0 ? matCobaltRoof : matCoralRoof,
          false
        );
        if (dIsl.wf) {
          addWaterfall(dg, 0, 0.3, dIsl.r * 0.82, 1.15, 6.8, 0, 0);
        }
        scene.add(dg);
      });

      // -----------------------------------------------------------------------
      // BILLOWING ANIME PEACH-CREAM CLOUDS SEA
      // -----------------------------------------------------------------------
      const clouds: Array<{ group: THREE.Group; speed: number }> = [];
      const puffGeo = trackGeo(new THREE.SphereGeometry(2.6, 12, 10));
      for (let i = 0; i < 40; i++) {
        const cloudCluster = new THREE.Group();
        const puffs = 3 + (i % 3);
        for (let k = 0; k < puffs; k++) {
          const puff = new THREE.Mesh(puffGeo, matCloud);
          const sc = 0.85 + seededNoise(i * 5 + k) * 0.95;
          puff.scale.set(sc, sc * 0.52, sc);
          puff.position.set(
            (k - 1) * 2.2,
            (seededNoise(i * 7 + k) - 0.5) * 0.7,
            (seededNoise(i * 9 + k) - 0.5) * 1.4
          );
          cloudCluster.add(puff);
        }
        const angle = seededNoise(i * 11.3) * Math.PI * 2;
        const dist = 12 + seededNoise(i * 13.7) * 58;
        cloudCluster.position.set(
          Math.cos(angle) * dist,
          -11.5 + seededNoise(i * 17.1) * 5.6,
          Math.sin(angle) * dist
        );
        scene.add(cloudCluster);
        clouds.push({
          group: cloudCluster,
          speed: 0.14 + seededNoise(i * 19.3) * 0.22,
        });
      }

      // -----------------------------------------------------------------------
      // ANIME 4-POINT STAR SPARKLES, SAKURA PETALS & WHITE SKY BIRDS
      // -----------------------------------------------------------------------
      const sparkleCount = 170;
      const sparkleGeo = trackGeo(new THREE.BufferGeometry());
      const sparklePos = new Float32Array(sparkleCount * 3);
      for (let i = 0; i < sparkleCount; i++) {
        sparklePos[i * 3] = (seededNoise(i * 1.1) - 0.5) * 68;
        sparklePos[i * 3 + 1] = -3 + seededNoise(i * 2.2) * 22;
        sparklePos[i * 3 + 2] = (seededNoise(i * 3.3) - 0.5) * 68;
      }
      sparkleGeo.setAttribute(
        'position',
        new THREE.BufferAttribute(sparklePos, 3)
      );
      const sparkleMat = trackMat(
        new THREE.PointsMaterial({
          map: sparkleTex,
          color: '#FFF4C2',
          size: 0.74,
          transparent: true,
          opacity: 0.9,
          alphaTest: 0.05,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      const particles = new THREE.Points(sparkleGeo, sparkleMat);
      scene.add(particles);

      const petalCount = 140;
      const petalGeo = trackGeo(new THREE.BufferGeometry());
      const petalPos = new Float32Array(petalCount * 3);
      for (let i = 0; i < petalCount; i++) {
        petalPos[i * 3] = (seededNoise(i * 4.7) - 0.5) * 64;
        petalPos[i * 3 + 1] = -2 + seededNoise(i * 5.9) * 20;
        petalPos[i * 3 + 2] = (seededNoise(i * 6.3) - 0.5) * 64;
      }
      petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPos, 3));
      const petalMat = trackMat(
        new THREE.PointsMaterial({
          map: petalTex,
          color: '#FFFFFF',
          size: 0.66,
          transparent: true,
          opacity: 0.94,
          alphaTest: 0.08,
          depthWrite: false,
        })
      );
      const petals = new THREE.Points(petalGeo, petalMat);
      scene.add(petals);

      const birds: Array<{
        group: THREE.Group;
        leftWing: THREE.Mesh;
        rightWing: THREE.Mesh;
        radius: number;
        angle: number;
        speed: number;
        yBase: number;
      }> = [];
      const wingGeo = trackGeo(new THREE.BoxGeometry(0.62, 0.04, 0.16));
      for (let b = 0; b < 11; b++) {
        const bird = new THREE.Group();
        const leftWing = new THREE.Mesh(wingGeo, matIvory);
        leftWing.position.x = -0.31;
        addOutline(leftWing, 1.08);
        const rightWing = new THREE.Mesh(wingGeo, matIvory);
        rightWing.position.x = 0.31;
        addOutline(rightWing, 1.08);
        bird.add(leftWing, rightWing);
        const r = 10 + b * 2.9;
        const a = b * 0.85;
        bird.position.set(
          Math.cos(a) * r,
          7.4 + (b % 3) * 1.7,
          Math.sin(a) * r
        );
        scene.add(bird);
        birds.push({
          group: bird,
          leftWing,
          rightWing,
          radius: r,
          angle: a,
          speed: 0.16 + (b % 3) * 0.04,
          yBase: bird.position.y,
        });
      }

      // -----------------------------------------------------------------------
      // RAYCASTING FOR CLICK & HOVER
      // -----------------------------------------------------------------------
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let downPos = { x: 0, y: 0 };
      let lastHoverCheck = 0;

      const getPointerIntersection = (
        clientX: number,
        clientY: number
      ): IslandId | null => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(clickableMeshes, false);
        if (hits.length > 0 && hits[0].object.userData?.islandId) {
          return hits[0].object.userData.islandId as IslandId;
        }
        return null;
      };

      const onPointerDown = (ev: PointerEvent) => {
        downPos = { x: ev.clientX, y: ev.clientY };
      };

      const onPointerMove = (ev: PointerEvent) => {
        if (!stateRef.current.entered) return;
        const now = performance.now();
        if (now - lastHoverCheck < 40) return;
        lastHoverCheck = now;

        const hitId = getPointerIntersection(ev.clientX, ev.clientY);
        renderer.domElement.style.cursor = hitId ? 'pointer' : 'grab';
        if (stateRef.current.hoveredId !== hitId) {
          stateRef.current.hoveredId = hitId;
          callbacksRef.current.onHoverIsland(hitId);
        }
      };

      const onPointerUp = (ev: PointerEvent) => {
        if (!stateRef.current.entered) return;
        const dx = ev.clientX - downPos.x;
        const dy = ev.clientY - downPos.y;
        if (Math.hypot(dx, dy) < 6) {
          const hitId = getPointerIntersection(ev.clientX, ev.clientY);
          if (hitId) {
            callbacksRef.current.onSelectIsland(hitId);
          }
        }
      };

      const onContextLost = (e: Event) => {
        e.preventDefault();
        setWebglFallback(true);
      };
      const onContextRestored = () => setWebglFallback(false);

      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('pointerup', onPointerUp);
      renderer.domElement.addEventListener('webglcontextlost', onContextLost);
      renderer.domElement.addEventListener(
        'webglcontextrestored',
        onContextRestored
      );

      const onResize = () => {
        if (!container || disposed) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }

      callbacksRef.current.onSceneReady();

      const clock = new THREE.Clock();

      const animate = () => {
        if (disposed) return;

        const dt = Math.min(clock.getDelta(), 0.05);
        const elapsed = clock.getElapsedTime();
        const rm = stateRef.current.reducedMotion;

        portalShaderMat.uniforms.uTime.value = elapsed;

        const anim = stateRef.current.cameraAnim;
        if (anim && anim.active) {
          const alpha = 1 - Math.exp(-3.4 * dt);
          camera.position.lerp(anim.endPos, alpha);
          controls.target.lerp(anim.endLook, alpha);
          if (
            camera.position.distanceTo(anim.endPos) < 0.06 &&
            controls.target.distanceTo(anim.endLook) < 0.06
          ) {
            camera.position.copy(anim.endPos);
            controls.target.copy(anim.endLook);
            anim.active = false;
          }
        } else if (!stateRef.current.entered && !rm) {
          camera.position.x = Math.sin(elapsed * 0.14) * 3.5;
          camera.position.z =
            INTRO_CAMERA.pos[2] + Math.cos(elapsed * 0.14) * 1.8;
        }

        if (!rm) {
          ISLANDS.forEach((isl, idx) => {
            const grp = islandGroups[isl.id];
            if (grp) {
              grp.position.y =
                isl.position[1] + Math.sin(elapsed * 0.7 + idx * 1.1) * 0.22;
            }
          });

          floatingOrbs.forEach((orb) => {
            orb.mesh.rotation.y += dt * 0.85;
            orb.mesh.position.y =
              orb.baseY + Math.sin(elapsed * orb.speed + orb.phase) * 0.18;
            if (orb.orbitRadius && orb.orbitAngle !== undefined) {
              orb.orbitAngle += dt * 0.22;
              orb.mesh.position.x = Math.cos(orb.orbitAngle) * orb.orbitRadius;
              orb.mesh.position.z = Math.sin(orb.orbitAngle) * orb.orbitRadius;
            }
          });

          flags.forEach((f) => {
            f.mesh.rotation.y = Math.sin(elapsed * 4.5 + f.phase) * 0.28;
          });

          waterfallTex.offset.y += dt * 0.94;
          oceanTex.offset.x += dt * 0.012;

          waterfallDrops.forEach((drop) => {
            drop.mesh.position.y -= dt * drop.speed;
            if (drop.mesh.position.y < drop.minY) {
              drop.mesh.position.y = drop.startY;
            }
          });

          clouds.forEach((c) => {
            c.group.position.x += dt * c.speed;
            if (c.group.position.x > 66) c.group.position.x = -66;
          });

          birds.forEach((b) => {
            b.angle += dt * b.speed;
            b.group.position.x = Math.cos(b.angle) * b.radius;
            b.group.position.z = Math.sin(b.angle) * b.radius;
            b.group.position.y =
              b.yBase + Math.sin(elapsed * 1.8 + b.angle) * 0.35;
            b.group.rotation.y = -b.angle;
            const flap = Math.sin(elapsed * 7 + b.angle) * 0.35;
            b.leftWing.rotation.z = flap;
            b.rightWing.rotation.z = -flap;
          });

          particles.rotation.y = elapsed * 0.022;
          petals.rotation.y = -elapsed * 0.032;
        }

        // Selection ring
        const targetRingId =
          stateRef.current.activeIslandId || stateRef.current.hoveredId;
        if (targetRingId && islandGroups[targetRingId]) {
          const grp = islandGroups[targetRingId]!;
          selectionRing.position.set(
            grp.position.x,
            grp.position.y + 0.52,
            grp.position.z
          );
          const scalePulse = rm ? 1 : 1 + Math.sin(elapsed * 2.4) * 0.035;
          const scaleBase = targetRingId === 'home' ? 1.18 : 0.88;
          selectionRing.scale.setScalar(scaleBase * scalePulse);
          ringMat.opacity = stateRef.current.activeIslandId ? 0.65 : 0.4;
        } else {
          ringMat.opacity = 0;
        }

        controls.update();
        renderer.render(scene, camera);

        // Update 2D projected beacons
        const labelLayer = labelLayerRef.current;
        if (labelLayer) {
          const cw = container.clientWidth || window.innerWidth;
          const ch = container.clientHeight || window.innerHeight;
          const showIslands =
            stateRef.current.entered && !stateRef.current.activeIslandId;
          const showSkills =
            stateRef.current.entered &&
            stateRef.current.activeIslandId === 'garden';

          ISLANDS.forEach((isl) => {
            const el = labelLayer.querySelector<HTMLElement>(
              `[data-beacon="${isl.id}"]`
            );
            if (!el) return;
            if (!showIslands) {
              el.style.opacity = '0';
              el.style.pointerEvents = 'none';
              return;
            }
            const grp = islandGroups[isl.id];
            const yHeight = isl.id === 'home' ? 9.8 : 5.4;
            _projVec.set(
              isl.position[0],
              (grp ? grp.position.y : isl.position[1]) + yHeight,
              isl.position[2]
            );
            _projVec.project(camera);
            if (_projVec.z > 1) {
              el.style.opacity = '0';
              el.style.pointerEvents = 'none';
            } else {
              const sx = (_projVec.x * 0.5 + 0.5) * cw;
              const sy = (-_projVec.y * 0.5 + 0.5) * ch;
              el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(
                1
              )}px, 0) translate(-50%, -50%)`;
              el.style.opacity = '1';
              el.style.pointerEvents = 'auto';
            }
          });

          SKILLS_ORBIT.forEach((_, idx) => {
            const el = labelLayer.querySelector<HTMLElement>(
              `[data-skill-beacon="${idx}"]`
            );
            if (!el) return;
            if (!showSkills) {
              el.style.opacity = '0';
              return;
            }
            const orb = floatingOrbs.find(
              (o) => o.parentGroup === gardenGroup && o.phase === idx * 0.8
            );
            if (!orb) return;
            orb.mesh.getWorldPosition(_projVec);
            _projVec.y += 0.82;
            _projVec.project(camera);
            if (_projVec.z > 1) {
              el.style.opacity = '0';
            } else {
              const sx = (_projVec.x * 0.5 + 0.5) * cw;
              const sy = (-_projVec.y * 0.5 + 0.5) * ch;
              el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(
                1
              )}px, 0) translate(-50%, -50%)`;
              el.style.opacity = '1';
            }
          });
        }

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
        controls.removeEventListener('start', onControlsStart);
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        renderer.domElement.removeEventListener('pointerup', onPointerUp);
        renderer.domElement.removeEventListener(
          'webglcontextlost',
          onContextLost
        );
        renderer.domElement.removeEventListener(
          'webglcontextrestored',
          onContextRestored
        );
        controls.dispose();
        disposables.forEach((item) => item.dispose());
        renderer.dispose();
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    } catch {
      setWebglFallback(true);
      callbacksRef.current.onSceneReady();
      return undefined;
    }
  }, []);

  if (webglFallback) {
    return (
      <div className="fixed inset-0 z-0 w-full h-full sky-backdrop flex items-center justify-center p-8 text-center">
        <div className="max-w-md aether-hud-surface rounded-lg border border-champagne-gold/40 p-6">
          <span
            className="material-symbols-outlined text-primary text-3xl mb-2"
            aria-hidden="true"
          >
            public
          </span>
          <h2 className="font-headline text-2xl text-on-surface mb-2">
            Aether Archipelago
          </h2>
          <p className="font-body text-sm text-on-surface-variant">
            Use the island navigation bar below to explore all six floating islands.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={mountRef}
        className="fixed inset-0 z-0 w-full h-full"
        aria-label="Interactive Anime Floating Archipelago of Arjun Jayraj"
      />
      <div
        ref={labelLayerRef}
        className="fixed inset-0 z-10 pointer-events-none overflow-hidden"
      >
        {ISLANDS.map((isl) => (
          <button
            key={isl.id}
            data-beacon={isl.id}
            type="button"
            onClick={() => onSelectIsland(isl.id)}
            style={{
              opacity: 0,
              pointerEvents: 'none',
              transition: 'opacity 250ms ease',
            }}
            className="hidden sm:inline-flex absolute top-0 left-0 aether-hud-surface items-center gap-1.5 px-3 py-1 rounded-full border border-champagne-gold/50 hover:border-primary hover:bg-primary-container text-on-surface shadow-sm cursor-pointer whitespace-nowrap"
          >
            <span className="font-label text-xs font-medium text-primary tabular-nums">
              {isl.number}
            </span>
            <span className="font-headline text-sm font-semibold text-on-surface whitespace-nowrap">
              {isl.name}
            </span>
          </button>
        ))}
        {SKILLS_ORBIT.map((sk, idx) => (
          <div
            key={sk.name}
            data-skill-beacon={idx}
            style={{ opacity: 0, transition: 'opacity 250ms ease' }}
            className="hidden sm:inline-flex absolute top-0 left-0 aether-hud-surface items-center px-2.5 py-1 rounded-full border border-sage-green text-on-secondary-container pointer-events-none"
          >
            <span className="font-label text-xs font-bold whitespace-nowrap">
              {sk.name}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
