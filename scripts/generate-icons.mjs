import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const teal = [15, 118, 110, 255];
const cream = [243, 248, 239, 255];
const leaf = [183, 223, 192, 255];
const gold = [248, 200, 102, 255];

function makeIcon(size) {
  const pixels = new Uint8Array(size * size * 4);
  fill(pixels, size, teal);
  roundMask(pixels, size, Math.round(size * 0.21));
  fillPolygon(pixels, size, [
    [0.25, 0.66],
    [0.36, 0.47],
    [0.54, 0.35],
    [0.75, 0.34],
    [0.65, 0.48],
    [0.59, 0.68],
    [0.42, 0.62]
  ], cream);
  fillPolygon(pixels, size, [
    [0.37, 0.57],
    [0.47, 0.43],
    [0.62, 0.39],
    [0.56, 0.49],
    [0.52, 0.62],
    [0.43, 0.58]
  ], leaf);
  fillCircle(pixels, size, 0.73, 0.29, 0.05, gold);
  drawRoundLine(pixels, size, 0.29, 0.71, 0.72, 0.71, 0.06, gold);
  return encodePng(pixels, size, size);
}

function fill(pixels, size, color) {
  for (let index = 0; index < size * size; index += 1) {
    pixels.set(color, index * 4);
  }
}

function roundMask(pixels, size, radius) {
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x < radius ? radius - x : x >= size - radius ? x - (size - radius - 1) : 0;
      const dy = y < radius ? radius - y : y >= size - radius ? y - (size - radius - 1) : 0;
      if (dx * dx + dy * dy > radius * radius) {
        pixels[y * size * 4 + x * 4 + 3] = 0;
      }
    }
  }
}

function fillCircle(pixels, size, cx, cy, radius, color) {
  const centerX = cx * size;
  const centerY = cy * size;
  const pixelRadius = radius * size;
  const radiusSquared = pixelRadius * pixelRadius;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x - centerX;
      const dy = y - centerY;
      if (dx * dx + dy * dy <= radiusSquared) {
        setPixel(pixels, size, x, y, color);
      }
    }
  }
}

function drawRoundLine(pixels, size, x1, y1, x2, y2, width, color) {
  const ax = x1 * size;
  const ay = y1 * size;
  const bx = x2 * size;
  const by = y2 * size;
  const lineWidth = width * size;
  const lengthSquared = (bx - ax) ** 2 + (by - ay) ** 2;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / lengthSquared));
      const px = ax + t * (bx - ax);
      const py = ay + t * (by - ay);
      const distanceSquared = (x - px) ** 2 + (y - py) ** 2;

      if (distanceSquared <= (lineWidth / 2) ** 2) {
        setPixel(pixels, size, x, y, color);
      }
    }
  }
}

function fillPolygon(pixels, size, normalizedPoints, color) {
  const points = normalizedPoints.map(([x, y]) => [x * size, y * size]);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (pointInPolygon(x, y, points)) {
        setPixel(pixels, size, x, y, color);
      }
    }
  }
}

function pointInPolygon(x, y, points) {
  let inside = false;

  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function setPixel(pixels, size, x, y, color) {
  pixels.set(color, (Math.round(y) * size + Math.round(x)) * 4);
}

function encodePng(pixels, width, height) {
  const rowSize = width * 4 + 1;
  const raw = new Uint8Array(rowSize * height);

  for (let y = 0; y < height; y += 1) {
    raw[y * rowSize] = 0;
    raw.set(pixels.slice(y * width * 4, (y + 1) * width * 4), y * rowSize + 1);
  }

  const signature = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = chunk('IHDR', concat([
    uint32(width),
    uint32(height),
    Uint8Array.from([8, 6, 0, 0, 0])
  ]));
  const idat = chunk('IDAT', deflateSync(raw));
  const iend = chunk('IEND', new Uint8Array());

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type);
  const body = Buffer.concat([typeBytes, data]);
  return Buffer.concat([uint32(data.length), body, uint32(crc32(body))]);
}

function uint32(value) {
  const bytes = Buffer.alloc(4);
  bytes.writeUInt32BE(value >>> 0);
  return bytes;
}

function concat(parts) {
  return Buffer.concat(parts);
}

function crc32(bytes) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

for (const size of [180, 192, 512]) {
  writeFileSync(new URL(`../public/icon-${size}.png`, import.meta.url), makeIcon(size));
}
