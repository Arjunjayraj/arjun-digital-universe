import * as THREE from 'three';

function makeCanvas(size = 256): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function finalizeColorTexture(
  canvas: HTMLCanvasElement,
  anisotropy: number,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Crisp stepped DataTexture for MeshToonMaterial anime cel-shading bands.
 * NearestFilter ensures razor-sharp anime shadow edges instead of smooth 3D gradients.
 */
export function createToonGradientMap(steps: number[] = [72, 168, 255]): THREE.DataTexture {
  const data = new Uint8Array(steps.length * 4);
  for (let i = 0; i < steps.length; i++) {
    const v = steps[i];
    data[i * 4] = v;
    data[i * 4 + 1] = v;
    data[i * 4 + 2] = v;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, steps.length, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

export function createGrassTexture(anisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256);
  // Hand-painted Studio Ghibli lush meadow base
  ctx.fillStyle = '#5CB84B';
  ctx.fillRect(0, 0, 256, 256);

  // Painterly cel-shaded grass patches
  for (let i = 0; i < 65; i++) {
    const x = ((i * 53) % 256);
    const y = ((i * 97) % 256);
    const r = 14 + (i % 4) * 8;
    ctx.fillStyle =
      i % 3 === 0
        ? '#7CD45B'
        : i % 3 === 1
        ? '#459B42'
        : '#9BE46E';
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.3, r * 0.75, (i % 5) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Crisp anime grass tuft strokes
  ctx.lineWidth = 2;
  for (let i = 0; i < 110; i++) {
    const x = (i * 37) % 256;
    const y = (i * 71) % 256;
    ctx.strokeStyle = i % 2 === 0 ? '#387E37' : '#B7F07A';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 3, y - 8);
    ctx.moveTo(x, y);
    ctx.lineTo(x + 3, y - 7);
    ctx.stroke();
  }

  // Wildflower dots
  const flowerColors = ['#FF80C0', '#FFE066', '#FFFFFF', '#FF8F70'];
  for (let i = 0; i < 45; i++) {
    ctx.fillStyle = flowerColors[i % flowerColors.length];
    ctx.beginPath();
    ctx.arc((i * 83) % 256, (i * 47) % 256, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  return finalizeColorTexture(canvas, anisotropy, 2, 2);
}

export function createCliffRockTexture(anisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256);
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#5FA04B');
  grad.addColorStop(0.14, '#9B7555');
  grad.addColorStop(0.58, '#805E46');
  grad.addColorStop(1, '#583F33');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Hand-drawn anime cliff facets & ink crack lines
  for (let i = 0; i < 42; i++) {
    const x = (i * 61) % 240;
    const y = 26 + ((i * 43) % 210);
    const w = 24 + (i % 3) * 16;
    const h = 10 + (i % 4) * 8;
    ctx.fillStyle = i % 2 === 0 ? '#B58963' : '#654939';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(42, 26, 28, 0.52)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w * 0.65, y + h - 3);
    ctx.lineTo(x + w, y + h + 4);
    ctx.stroke();
  }

  // Hanging moss drapes along cliff rim
  for (let i = 0; i < 28; i++) {
    const x = (i * 23) % 256;
    const len = 18 + (i % 5) * 11;
    ctx.fillStyle = i % 2 === 0 ? '#5BB34B' : '#408A3C';
    ctx.beginPath();
    ctx.roundRect(x, 0, 7 + (i % 3) * 3, len, 4);
    ctx.fill();
  }

  return finalizeColorTexture(canvas, anisotropy, 2, 1);
}

export function createIvoryStoneTexture(anisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256);
  ctx.fillStyle = '#FFF7EA';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle hand-inked anime masonry lines
  ctx.strokeStyle = 'rgba(138, 112, 92, 0.36)';
  ctx.lineWidth = 2;
  const rows = 8;
  const rowH = 256 / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    ctx.fillStyle = r % 2 === 0 ? 'rgba(245, 226, 198, 0.35)' : 'rgba(255, 252, 245, 0.35)';
    ctx.fillRect(0, y, 256, rowH);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();

    const cols = 4;
    const colW = 256 / cols;
    const offset = (r % 2) * (colW * 0.5);
    for (let c = 0; c <= cols; c++) {
      const x = (c * colW + offset) % 256;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + rowH);
      ctx.stroke();
    }
  }

  return finalizeColorTexture(canvas, anisotropy, 2, 2);
}

export function createRoofTileTexture(
  anisotropy: number,
  baseColor: string,
  highlightColor: string
): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256);
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 256, 256);

  const rows = 8;
  const rowH = 256 / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    ctx.fillStyle = r % 2 === 0 ? highlightColor : baseColor;
    ctx.fillRect(0, y, 256, rowH * 0.55);
    ctx.strokeStyle = 'rgba(18, 24, 48, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  return finalizeColorTexture(canvas, anisotropy, 2, 2);
}

export function createWaterfallTexture(anisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256);
  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
  grad.addColorStop(0.18, 'rgba(72, 214, 242, 0.95)');
  grad.addColorStop(0.5, 'rgba(176, 244, 255, 0.98)');
  grad.addColorStop(0.82, 'rgba(64, 204, 238, 0.95)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.92)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Crisp anime cel-shaded water streaks
  for (let i = 0; i < 42; i++) {
    const x = (i * 29) % 248;
    const y = (i * 67) % 256;
    const h = 36 + (i % 4) * 24;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.78)' : 'rgba(28, 148, 198, 0.48)';
    ctx.beginPath();
    ctx.roundRect(x, y, 5 + (i % 3) * 3, h, 4);
    ctx.fill();
  }

  return finalizeColorTexture(canvas, anisotropy, 1, 2);
}

export function createOceanTexture(anisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256);
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 150);
  grad.addColorStop(0, '#44CCE8');
  grad.addColorStop(0.55, '#259AC8');
  grad.addColorStop(1, '#1B739E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Stylized Makoto Shinkai sparkling water ripples
  for (let i = 0; i < 64; i++) {
    const x = (i * 47) % 240;
    const y = (i * 73) % 240;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(255, 255, 255, 0.55)' : 'rgba(164, 244, 255, 0.35)';
    ctx.beginPath();
    ctx.roundRect(x, y, 16 + (i % 3) * 10, 3, 2);
    ctx.fill();
  }

  return finalizeColorTexture(canvas, anisotropy, 5, 5);
}

/**
 * 4-pointed anime star sparkle sprite texture for glowing magic motes.
 */
export function createSparkleTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(64);
  ctx.clearRect(0, 0, 64, 64);

  const glow = ctx.createRadialGradient(32, 32, 2, 32, 32, 28);
  glow.addColorStop(0, 'rgba(255, 250, 210, 1)');
  glow.addColorStop(0.35, 'rgba(255, 224, 120, 0.7)');
  glow.addColorStop(1, 'rgba(255, 224, 120, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 64, 64);

  // Crisp 4-point star
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(32, 4);
  ctx.quadraticCurveTo(34, 30, 60, 32);
  ctx.quadraticCurveTo(34, 34, 32, 60);
  ctx.quadraticCurveTo(30, 34, 4, 32);
  ctx.quadraticCurveTo(30, 30, 32, 4);
  ctx.closePath();
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Stylized sakura blossom petal sprite texture.
 */
export function createPetalTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(64);
  ctx.clearRect(0, 0, 64, 64);

  const grad = ctx.createLinearGradient(14, 10, 50, 54);
  grad.addColorStop(0, '#FFD4EC');
  grad.addColorStop(0.55, '#FF8AC6');
  grad.addColorStop(1, '#F25EA8');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(32, 12);
  ctx.bezierCurveTo(54, 14, 54, 44, 32, 56);
  ctx.bezierCurveTo(10, 44, 10, 14, 32, 12);
  ctx.fill();

  ctx.strokeStyle = 'rgba(180, 40, 100, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
