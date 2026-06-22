import Phaser from "phaser";
import { AQUILLA_ART } from "../art/aquillaArt";
import { hexToNumber } from "../art/pixelRenderer";

export interface ParticleBurst {
  color: number;
  createdAtMs: number;
  durationMs: number;
  particles: Array<{ dx: number; dy: number; size: number; vx: number; vy: number }>;
  x: number;
  y: number;
}

export function createRestoreBurst(x: number, y: number): ParticleBurst {
  const particles = Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * Math.PI * 2;
    return {
      dx: 0,
      dy: 0,
      size: 3 + (index % 3),
      vx: Math.cos(angle) * (1.2 + (index % 4) * 0.3),
      vy: Math.sin(angle) * (1.2 + (index % 4) * 0.3),
    };
  });

  return {
    color: hexToNumber(AQUILLA_ART.palette.trueLight),
    createdAtMs: Date.now(),
    durationMs: 520,
    particles,
    x,
    y,
  };
}

export function drawParticleBursts(
  graphics: Phaser.GameObjects.Graphics,
  bursts: readonly ParticleBurst[],
  nowMs: number,
): void {
  bursts.forEach((burst) => {
    const progress = (nowMs - burst.createdAtMs) / burst.durationMs;
    if (progress >= 1) return;

    const alpha = 1 - progress;

    burst.particles.forEach((particle) => {
      const px = burst.x + particle.vx * progress * 18;
      const py = burst.y + particle.vy * progress * 18 - progress * 6;
      graphics.fillStyle(burst.color, alpha * 0.85);
      graphics.fillRect(px, py, particle.size, particle.size);
    });
  });
}

export function pruneParticleBursts(bursts: ParticleBurst[], nowMs: number): ParticleBurst[] {
  return bursts.filter((burst) => nowMs - burst.createdAtMs < burst.durationMs);
}
