import { NextReactP5Wrapper } from "@p5-wrapper/next";
import * as DRAW from "@/scripts/draw";
import * as Boundry from "@/scripts/boundry";

export default function HospitalPreviewList({ data }) {
  return (
    <div id="canvas">
      <NextReactP5Wrapper sketch={sketch} />
    </div>
  );

  function sketch(p) {
    const { boundry, design, showGrid, grid,scale } = data;
    p.setup = () => {
      p.noLoop();
      p.createCanvas(300 * scale, 300 * scale);
      p.background(250);

      p.translate(50, 50);
      p.strokeWeight(0.1);
      p.scale(5 * scale);



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
      console.log(drawing);
      drawing.forEach((d) => DRAW.zone(p, d));

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
