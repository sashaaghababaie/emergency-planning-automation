import { NextReactP5Wrapper } from "@p5-wrapper/next";
import * as DRAW from "@/scripts/draw";
import * as Boundry from "@/scripts/boundry";

export default function HospitalPreview({ data }) {
  return (
    <div id="canvas" className="p-2 bg-[rgb(250,250,250)] rounded-lg border">
      <NextReactP5Wrapper sketch={sketch} />
    </div>
  );

  function sketch(p) {
    const {
      boundry,
      design,
      showGrid,
      grid,
      scale,
      name,
      legend,
      saving,
      index,
    } = data;

    p.setup = () => {
      const realHeight = boundry.height * 10 * scale + 40;
      const cW = 600 * scale;

      const offset = (cW - boundry.width * 10 * scale) / 2;

      p.noLoop();
      p.createCanvas(cW, realHeight);
      p.background(250);

      p.translate(offset, 20);
      p.strokeWeight(0.1);
      p.scale(10 * scale);

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

      drawing.forEach((d) => DRAW.zone(p, d, name, scale, legend, true));

      if (showGrid) drawGrid(boundry, grid);
      Boundry.draw(p, boundry);

      if (saving) {
        const filename = getFileName();
        p.saveCanvas(filename);
      }
    };
    p.draw = () => {};

    function getFileName() {
      const date = new Date();

      const fileName = `${date.getFullYear()}-${
        date.getMonth() < 10 ? "0" : ""
      }${date.getMonth() + 1}-${
        date.getDate() < 10 ? "0" : ""
      }${date.getDate()} @ ${
        date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
      }.${
        date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
      }.${
        date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()
      } No. ${index}.jpg`;

      return fileName;
    }

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
