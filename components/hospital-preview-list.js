import { NextReactP5Wrapper } from "@p5-wrapper/next";
import * as DRAW from "@/scripts/draw";
import * as Boundry from "@/scripts/boundry";

export default function HospitalPreviewList({ data }) {
  return (
    <div id="canvas" className="p-2 bg-[rgb(250,250,250)] rounded-lg border">
      <NextReactP5Wrapper sketch={sketch} />
    </div>
  );

  function sketch(p) {
    const { boundry, design, showGrid, grid, scale } = data;
    p.setup = () => {
      const realHeight = boundry.height * 5 * scale + 40;
      const realWidth = boundry.width * 5 * scale + 40;
      p.noLoop();
      p.createCanvas(realWidth, realHeight);
      p.background(250);

      p.translate(20, 20);
      p.strokeWeight(0.1);
      p.scale(5 * scale);

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

      drawing.forEach((d) => DRAW.zone(p, d, "legend", scale, "", false));
      Boundry.draw(p, boundry);

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
