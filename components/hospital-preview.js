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
    p.setup = () => {
      p.noLoop();
      p.createCanvas(800, 300);
      p.background(240);

      p.translate(50, 50);
      p.strokeWeight(0.1);
      p.scale(10);

      const { boundry, design } = data;
      Boundry.draw(p, boundry);

      const keys = Object.keys(design);
      const drawing = keys.map((key) => design[key]);
      drawing.forEach((d) => DRAW.zone(p, d));
    };
    p.draw = () => {};
  }
}
