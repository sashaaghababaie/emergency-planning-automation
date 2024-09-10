import { NextReactP5Wrapper } from "@p5-wrapper/next";
import * as DRAW from "@/scripts/draw";
import * as Boundry from "@/scripts/boundry";

export default function HospitalPreview({ data }) {
  return (
    <div id="canvas">
      <NextReactP5Wrapper sketch={sketch} />
    </div>
  );

  function sketch(p) {
    const { boundry, design, showGrid, grid, scale, name, legend } = data;
    p.setup = () => {
      p.noLoop();
      p.createCanvas(600 * scale, 600 * scale);
      p.background(250);

      p.translate(30 * scale, 30 * scale);
      p.strokeWeight(0.1);
      p.scale(10 * scale);

      Boundry.draw(p, boundry);

      const keys = Object.keys(design);
      // const drawing = keys.map((key) => design[key]);
      const drawing = (() => {
        const arr = [];
        keys.forEach((k) => {
          if (k != 0 && k != 14) {
            arr.push(design[k]);
          }
        });
        return arr;
      })();

      drawing.push(design["0"], design["14"]);

      drawing.forEach((d) => DRAW.zone(p, d, name, scale, legend));

      if (showGrid) drawGrid(boundry, grid);
    };
    p.draw = () => {};

    function drawGrid(boundry, grid) {
      for (let i = 0; i < boundry.width; i = i + grid.module.x) {
        for (let j = 0; j < boundry.height; j = j + grid.module.y) {
          p.push();
          p.noFill();
          p.strokeWeight(0.05);
          p.stroke(255, 0, 0, 50);
          p.rect(i, j, grid.module.x, grid.module.y);
          p.pop();
        }
      }
    }
  }
}
