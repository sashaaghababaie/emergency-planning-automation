"use client";

import { useState, useContext } from "react";
import { ProjectContext } from "./project-context";
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import { createNewProgramBasedOnBoundry } from "@/scripts/program";
import { createBoundry } from "@/scripts/boundry";

export default function Boundry() {
  const { config, program, boundry, setBoundry, p5Props, setP5Props } =
    useContext(ProjectContext);

  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorrMsg] = useState("");

  const storeBoundty = (width, height, inp_ent, outp_ent) => {
    const _boundry = { ...boundry };

    _boundry.width = width;
    _boundry.height = height;
    _boundry.inp_ent = inp_ent;
    _boundry.outp_ent = outp_ent;

    setBoundry(_boundry);
  };

  const checkBoundry = () => {
    setError(false);
    setSuccess(false);
    setErrorrMsg("");
    try {
      if (Object.keys(program).length === 0) {
        throw new Error("Cannot check with empty program");
      }
      const _boundry = createBoundry(boundry);
      createNewProgramBasedOnBoundry(program, _boundry);

      setSuccess(true);
    } catch (err) {
      setError(true);
      setErrorrMsg(err.message);
    }
  };
  return (
    <div>
      <h1 className="font-bold border-b-[1px] border-black">Create Boundary</h1>
      <p className="mt-2 text-sm">
        Follow the instructions, Press 'z' to undo.
      </p>
      <div className="p-2 flex justify-center items-center">
        {p5Props && (
          <div id="canvas" className="rounded-xl bg-white p-2">
            <NextReactP5Wrapper sketch={sketch} />
          </div>
        )}
      </div>
      <div className="flex justify-center">
        <button
          disabled={boundry.width === 0}
          className="text-md p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-400 duration-200 transition disabled:bg-zinc-400"
          onClick={checkBoundry}
        >
          Check boundary
        </button>
      </div>
      <div className="h-12 text-xs mt-4">
        {error && (
          <p className="text-rose-500 border border-rose-500 p-2 rounded-lg">
            {errorMsg}
          </p>
        )}
        {success && (
          <p className="text-center text-emerald-500 border border-emerald-500 p-2 rounded-lg">
            Boundary is OK
          </p>
        )}
      </div>
    </div>
  );

  function sketch(p) {
    const _p5Props = { ...p5Props };

    let { stage, pos0, pos1, inp_ent_pos, outp_ent_pos } = _p5Props;
    let gridAspectRatio;
    let marginX, marginY;

    const scaleFactor = 24;

    p.setup = () => {
      p.cursor(p.CROSS);
      p.createCanvas(419, 453);
      p.textSize(12);
      gridAspectRatio = config.gird.module.x / config.gird.module.y;

      marginX = (p.width % (scaleFactor * gridAspectRatio)) / 2;
      marginY = (p.height % scaleFactor) / 2;
    };
    p.draw = () => {
      p.background(255);
      p.strokeWeight(2);

      const { w, h } = getBoundry();
      const { x, y } = getMousePos();

      p.text(`Width: ${w}m Height: ${h}m`, marginX, p.height - 30);

      for (let i = 0; i < p.width; i = i + scaleFactor * gridAspectRatio) {
        for (let j = 0; j < p.height - 50; j = j + scaleFactor) {
          p.point(i + marginX, j + marginY);
        }
      }

      if (stage === 0) {
        p.push();
        p.fill(0, 0, 255);
        p.text(
          "Please select the first corner of the boundary",
          marginX,
          p.height - 8
        );
        p.pop();
      }
      // if boundry not selected yet
      if (stage === 1) {
        drawBoundry(pos0, { x, y });
        p.push();
        p.fill(0, 0, 255);
        p.text(
          "Please select the opposite corner of the boundary",
          marginX,
          p.height - 8
        );
        p.pop();
      }

      // boundry selected
      if (stage > 1) {
        drawBoundry(pos0, pos1);
      }

      if (stage === 2) {
        p.push();
        p.fill(0, 0, 255);
        p.text("Please choose the Main entrance", marginX, p.height - 8);
        p.pop();
        getEntCursur(x, y);
      }
      if (stage === 3) {
        p.push();
        p.fill(0, 0, 255);
        p.text("Please choose the inpatient entrance", marginX, p.height - 8);
        p.pop();
        getEntCursur(inp_ent_pos.x, inp_ent_pos.y, false);
        getEntCursur(x, y);
      }
      if (stage === 4) {
        p.text("Click to Save", marginX, p.height - 8);
        getEntCursur(inp_ent_pos.x, inp_ent_pos.y, false);
        getEntCursur(outp_ent_pos.x, outp_ent_pos.y, false);
      }
      drawCursor(x, y);
    };

    function getEntCursur(x, y, doCalculate = true) {
      const origin = getOrigin();
      const boundry = getBoundry();
      let entCursorX, entCursorY;
      let direction;
      const boundryMaxX =
        (boundry.w / config.gird.module.x) * scaleFactor * gridAspectRatio +
        origin.x;

      const boundryMaxY =
        (boundry.h / config.gird.module.y) * scaleFactor + origin.y;
      if (doCalculate) {
        if (y <= origin.y) {
          entCursorY = origin.y;
        }

        if (y >= boundryMaxY) {
          entCursorY = boundryMaxY;
        }

        if (
          y > origin.y &&
          y < boundryMaxY &&
          (x <= origin.x || x >= boundryMaxX)
        ) {
          entCursorY = y;
        }
        if (
          x > origin.x &&
          x < boundryMaxX &&
          (y <= origin.y || y >= boundryMaxY)
        ) {
          entCursorX = x;
        }

        if (x <= origin.x) {
          entCursorX = origin.x;
        }

        if (x >= boundryMaxX) {
          entCursorX = boundryMaxX;
        }
        if (
          (entCursorX === origin.x && entCursorY === origin.y) ||
          (entCursorX === origin.x && entCursorY === boundryMaxY) ||
          (entCursorY === origin.y && entCursorX === boundryMaxX) ||
          (entCursorX === boundryMaxX && entCursorY === boundryMaxY)
        ) {
          return { x: -100, y: -100 };
        }

        if (
          (entCursorX === boundryMaxX &&
            entCursorY === boundryMaxY - scaleFactor) ||
          (entCursorX === origin.x &&
            entCursorY === boundryMaxY - scaleFactor) ||
          (entCursorY === origin.y &&
            entCursorX === boundryMaxX - scaleFactor * gridAspectRatio) ||
          (entCursorX === boundryMaxX - scaleFactor * gridAspectRatio &&
            entCursorY === boundryMaxY)
        ) {
          return { x: -100, y: -100 };
        }
      }
      if (y <= origin.y) {
        direction = "td";
      }

      if (y >= boundryMaxY) {
        direction = "dt";
      }

      if (
        y > origin.y &&
        y < boundryMaxY &&
        (x <= origin.x || x >= boundryMaxX)
      ) {
        if (x <= origin.y) {
          direction = "lr";
        } else {
          direction = "rl";
        }
      }
      if (
        x > origin.x &&
        x < boundryMaxX &&
        (y <= origin.y || y >= boundryMaxY)
      ) {
        if (y <= origin.y) {
          direction = "td";
        } else {
          direction = "dt";
        }
      }
      if (x <= origin.x) {
        direction = "lr";
      }

      if (x >= boundryMaxX) {
        direction = "rl";
      }
      p.push();
      p.strokeWeight(1);

      if (!doCalculate) {
        entCursorX = x;
        entCursorY = y;
      }

      if (direction === "td" || direction === "dt") {
        const dx = entCursorX + (scaleFactor * gridAspectRatio) / 2;
        p.line(
          dx,
          entCursorY - scaleFactor / 2,
          dx,
          entCursorY + scaleFactor / 2
        );
      }

      if (direction === "lr" || direction === "rl") {
        const dy = entCursorY + scaleFactor / 2;
        p.line(
          entCursorX - scaleFactor / 2,
          dy,
          entCursorX + scaleFactor / 2,
          dy
        );
      }

      p.pop();
      return { x: entCursorX, y: entCursorY };
    }

    function drawBoundry(p1, p2) {
      p.push();
      p.noFill();
      p.rect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      p.pop();
    }

    function drawCursor(x, y) {
      p.push();
      p.stroke(0, 0, 220);
      p.strokeWeight(4);
      p.point(x, y);
      p.pop();
    }
    p.keyReleased = () => {
      if (p.key === "z" || p.key === "Z") {
        const reset = { x: -1, y: -1 };

        if (stage === 0) {
          return;
        }

        if (stage === 1) {
          pos0 = reset;
        }

        if (stage === 2) {
          pos1 = reset;
        }

        if (stage === 3) {
          inp_ent_pos = reset;
        }

        if (stage === 4) {
          outp_ent_pos = reset;
        }

        stage--;

        setP5Props({ stage, pos0, pos1, inp_ent_pos, outp_ent_pos });
      }
    };

    p.mouseClicked = () => {
      if (
        p.mouseX > 0 &&
        p.mouseX < p.width &&
        p.mouseY > 0 &&
        p.mouseY < p.height
      ) {
        const mousePos = getMousePos();

        if (stage === 0) {
          pos0 = mousePos;
          stage++;
          return;
        }

        if (stage === 1) {
          if (mousePos.x === pos0.x || mousePos.y === pos0.y) return;
          pos1 = mousePos;
          stage++;
          setP5Props({ stage, pos0, pos1, inp_ent_pos, outp_ent_pos });
          return;
        }

        if (stage === 2) {
          const _pos = getEntCursur(mousePos.x, mousePos.y);
          if (_pos.x === -100) return;

          inp_ent_pos = getEntCursur(mousePos.x, mousePos.y);
          stage++;
          setP5Props({ stage, pos0, pos1, inp_ent_pos, outp_ent_pos });
          return;
        }

        if (stage === 3) {
          const _pos = getEntCursur(mousePos.x, mousePos.y);
          if (_pos.x === -100) return;

          outp_ent_pos = getEntCursur(mousePos.x, mousePos.y);
          stage++;
          setP5Props({ stage, pos0, pos1, inp_ent_pos, outp_ent_pos });
        }

        if (stage === 4) {
          const { w, h } = getBoundry();
          const inp_ent_f = getEntrance(inp_ent_pos);
          const outp_ent_f = getEntrance(outp_ent_pos);
          storeBoundty(w, h, inp_ent_f, outp_ent_f);
          return;
        }
      }
    };

    function getEntrance(_point) {
      const origin = getOrigin();
      const entX =
        ((_point.x - origin.x) / (scaleFactor * gridAspectRatio)) *
        config.gird.module.x;

      const entY = ((_point.y - origin.y) / scaleFactor) * config.gird.module.y;

      return { x: entX, y: entY };
    }
    function getMousePos() {
      return {
        x:
          Math.floor(p.mouseX / (scaleFactor * gridAspectRatio)) *
            scaleFactor *
            gridAspectRatio +
          marginX,
        y: Math.floor(p.mouseY / scaleFactor) * scaleFactor + marginY,
      };
    }

    function getBoundry() {
      let w, h;

      if (stage === 0) {
        w = 0;
        h = 0;
      }

      if (stage === 1) {
        const { x, y } = getMousePos();
        w = Math.abs(pos0.x - x) * config.gird.module.x;
        h = Math.abs(pos0.y - y) * config.gird.module.y;
      }

      if (stage > 1) {
        w = Math.abs(pos1.x - pos0.x) * config.gird.module.x;
        h = Math.abs(pos1.y - pos0.y) * config.gird.module.y;
      }
      return {
        w: Math.round(w / (scaleFactor * gridAspectRatio)),
        h: h / scaleFactor,
      };
    }

    function getOrigin() {
      if (pos0.x === 0 && (pos0.y === 0) & (pos1.x === 0) && pos1.y === 0) {
        return { x: 0, y: 0 };
      }
      if (pos0.x < pos1.x && pos0.y < pos1.y) {
        return pos0;
      }
      if (pos0.x < pos0.x && pos0.y > pos1.y) {
        return { x: pos0 / x, y: pos1.y };
      }
      if (pos0.x > pos1.x && pos0.y < pos1.y) {
        return { x: pos1.x, y: pos0.y };
      }
      if (pos1.x < pos0.x && pos1.y < pos0.y) {
        return pos1;
      }
    }
  }
}
