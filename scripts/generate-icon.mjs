#!/usr/bin/env node
/**
 * Writes build/icon.png (512×512) for electron-builder and Steam store assets.
 * Pure Node — no native deps.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "build");
const size = 512;

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function makePng() {
  const rowSize = 1 + size * 4;
  const raw = Buffer.alloc(rowSize * size);

  for (let y = 0; y < size; y += 1) {
    const row = y * rowSize;
    raw[row] = 0;
    for (let x = 0; x < size; x += 1) {
      const i = row + 1 + x * 4;
      const cx = x - size / 2;
      const cy = y - size / 2;
      const dist = Math.hypot(cx, cy);
      const diamond = Math.abs(cx) + Math.abs(cy * 1.2);

      let r = 20;
      let g = 17;
      let b = 12;
      let a = 255;

      if (diamond < 180) {
        r = 34;
        g = 45;
        b = 24;
      }
      if (diamond < 120) {
        r = 58;
        g = 72;
        b = 38;
      }
      if (dist < 90 && dist > 70) {
        r = 224;
        g = 169;
        b = 58;
      }
      if (dist < 40) {
        r = 240;
        g = 220;
        b = 140;
      }
      if (y > size * 0.72 && Math.abs(cx) < 60) {
        r = 42;
        g = 32;
        b = 24;
      }

      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync(outDir, { recursive: true });
const pngPath = join(outDir, "icon.png");
writeFileSync(pngPath, makePng());
console.log(`Wrote ${pngPath}`);
