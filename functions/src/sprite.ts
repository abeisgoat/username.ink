import { createCanvas } from "canvas";
import {createHash} from "crypto";

function draw(seed: number, scale: number, ctx: any, offset: {x: number, y: number}, alpha: number) {
  // Tiny Sprite Sheet Generator - Frank Force 2020 - MIT License
  let R: () => number;
  let i: number;
  let j: number;
  let pass: number;
  let s: number;
  let X: number;
  let Y: number;

  ctx.lineWidth = 2 * scale; // set 2 pixel wide line width to make the black outline
  R = () => ((Math.sin(++s + i * i) + 1) * 1e9) % 256 | 0; // get a seeded random integer between 0-256

  for (i = 1; i--; )
    for (
        pass = 4;
        pass--; // 4 passes, outline left/right and fill left/right

    )
      for (
          s = seed, j = (R() / 5 + 50) | 0;
          j--; // set seed, randomize max sprite pixels, 50-101

      )
        (X = j & 7),
            (Y = j >> 3), // X & Y pixel index in sprite
            R() < 19 // small chance of new color
                ? (ctx.fillStyle = `rgba(${R()},${R()},${R()},${alpha})`) // randomize color
                : R() ** 2 / 2e3 > X * X + (Y - 5) ** 2 && // distance from center vs random number
                ctx[pass & 2 ? "strokeRect" : "fillRect"](
                    // stroke first for outline then fill with color
                    (offset.x + (i - (pass % 2) * 2 * X + X)) * scale, // x pos, flipped if pass is even
                    (offset.y + (i >> 5) + Y) * scale, // y pos
                    scale,
                    scale
                ); // 1 pixel size
}

export function generate(username: string) {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext("2d");

  const seed = createHash("md5")
    .update(username)
    .digest()
    .reduce((sum, uint) => sum + uint, 0);

  ctx.fillStyle = "rgba(255, 255, 255, 1)";
  ctx.fillRect(0, 0, 200, 200);

  // draw(seed, 40, ctx, {x: 2, y: -1}, 0.4);
  draw(seed, 10, ctx, {x: 9.5, y:4.5}, 1);
  return canvas;
}