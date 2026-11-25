import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function detectSoftwareGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function attachStudioEnvironment(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene
): THREE.Texture | null {
  try {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const env = new RoomEnvironment();
    const renderTarget = pmremGenerator.fromScene(env, 0.04);
    scene.environment = renderTarget.texture;
    env.dispose();
    pmremGenerator.dispose();
    return renderTarget.texture;
  } catch {
    return null;
  }
}

export function scheduleAfterDraw(
  renderer: THREE.WebGLRenderer,
  onDone: () => void,
  registerTimer: (id: number) => void
): void {
  try {
    const gl = renderer.getContext() as WebGL2RenderingContext;
    if (typeof gl.fenceSync === 'function') {
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (state === gl.UNSIGNALED) {
          registerTimer(window.setTimeout(poll, 5));
        } else {
          if (sync) gl.deleteSync(sync);
          registerTimer(window.setTimeout(onDone, 80));
        }
      };
      registerTimer(window.setTimeout(poll, 5));
      return;
    }
  } catch {
    // Fallback if WebGL1 context without fenceSync
  }
  registerTimer(window.setTimeout(onDone, 80));
}
