import { colors } from "./colors";
/**
 *
 * @param {{createdSpaces: CSpace[], corridor?: {x:number, y:number, w:number, h:number}[], list1?: CSpace[], list2?:CSpace[]; usedCorridor?: 'vCor_1' | 'vCor_2' }} _createdZone
 */

export const zone = (p, _createdZone, type, scale, legend = "", showDoors) => {
  if (_createdZone.hasOwnProperty("usedCorridor")) {
    if (_createdZone.createdSpaces[0].zone_id != 1) {
      p.push();
      p.fill(200, 200, 200, 255);
      p.noStroke();
      const s = _createdZone[_createdZone.usedCorridor];
      p.rect(s.x, s.y, s.w, s.h);
      p.pop();
    }
  }
  ///
  if (_createdZone.hasOwnProperty("lightingZone")) {
    p.push();
    p.fill(200, 200, 200, 255);
    p.noStroke();
    const s = _createdZone["lightingZone"];
    p.fill(0, 150, 255, 30);
    p.rect(s.x, s.y, s.w, s.h);
    p.pop();
  }
  ///
  if (_createdZone.hasOwnProperty("available_for_adj")) {
    if (_createdZone.createdSpaces[0].space_id != 0) {
      p.push();
      p.fill(200, 200, 200, 255);
      p.noStroke();
      const s = _createdZone["available_for_adj"];
      p.rect(s.x, s.y, s.w, s.h);
      p.pop();
    }
  }
  ///
  const s = _createdZone.createdSpaces[0];

  const isCuring = s.space_id == 23 || s.space_id == 22;
  const isAlternativeDraw = _createdZone.createdSpaces.length == 2;
  // If is curing
  if (isCuring && isAlternativeDraw) {
    const name = type === "name" ? getName(s, 5) : getSpaceId(s);
    p.push();
    p.stroke(legend === s.zone_name || legend === "" ? 0 : 200);

    /// draw space
    p.fill(
      ...colors[s.zone_name],
      legend === s.zone_name || legend === "" ? 255 : 100
    );
    /// Horizontal
    if (_createdZone.zoneDir === "H") {
      const { x: xLeft, y, h } = _createdZone.createdSpaces[0];
      const { x: xRight } = _createdZone.createdSpaces[1];
      p.push();
      p.fill(200, 200, 200, 255);
      p.noStroke();
      p.rect(xLeft + 3, y, 3, h);
      p.pop();

      for (let i = 0; i < h; i += 2) {
        p.rect(xLeft, y + i, 3, 2);
        p.push();
        p.noStroke();
        p.textSize(
          type === "legend"
            ? scale < 1
              ? 1
              : 1.5 / scale
            : scale < 1
            ? 1
            : 1 / scale
        );

        if (legend === s.zone_name) p.fill(255, 0, 0);
        else p.fill(0);

        p.text(name, xLeft + 0.2, y + i + 2);
        p.pop();
        p.rect(xRight + 1.5, y + i, 3, 2);
        p.push();
        p.noStroke();
        p.textSize(
          type === "legend"
            ? scale < 1
              ? 1
              : 1.5 / scale
            : scale < 1
            ? 1
            : 1 / scale
        );

        if (legend === s.zone_name) p.fill(255, 0, 0);
        else p.fill(0);

        p.text(name, xRight + 1.5 + 0.2, y + i + 2);
        p.pop();
      }
    }

    /// Vertical
    if (_createdZone.zoneDir === "V") {
      const { x, y: yTop, w } = _createdZone.createdSpaces[0];
      const { y: YBottom } = _createdZone.createdSpaces[1];
      p.push();
      p.fill(200, 200, 200, 255);
      p.noStroke();
      p.rect(x, yTop + 3, w, 3);
      p.pop();
      for (let i = 0; i < w; i += 2) {
        p.rect(x + i, yTop, 2, 3);

        p.push();
        p.noStroke();
        p.textSize(
          type === "legend"
            ? scale < 1
              ? 1
              : 1.5 / scale
            : scale < 1
            ? 1
            : 1 / scale
        );

        if (legend === s.zone_name) p.fill(255, 0, 0);
        else p.fill(0);

        p.text(name, x + i + 0.2, yTop + 2);
        p.pop();
        p.rect(x + i, YBottom + 1.5, 2, 3);

        p.push();
        p.noStroke();
        p.textSize(
          type === "legend"
            ? scale < 1
              ? 1
              : 1.5 / scale
            : scale < 1
            ? 1
            : 1 / scale
        );

        if (legend === s.zone_name) p.fill(255, 0, 0);
        else p.fill(0);

        p.text(name, x + i + 0.2, YBottom + 1.5 + 2);
        p.pop();
      }
    }
    p.pop();
  }
  // Other
  else {
    const { zoneDir, usedCorridor } = _createdZone;

    _createdZone.createdSpaces.forEach((s) => {
      p.push();
      p.strokeWeight(0.12);
      p.stroke(legend === s.zone_name || legend === "" ? 0 : 200);

      /// draw space
      p.fill(
        ...colors[s.zone_name],
        legend === s.zone_name || legend === "" ? 255 : 100
      );
      p.rect(s.x, s.y, s.w, s.h);
      p.pop();
      p.push();

      p.strokeWeight(0.05);
      // draw doors
      if (showDoors && s.space_id != 22 && s.space_id != 23) {
        const doorPos = getDoorPosAndDir(zoneDir, usedCorridor);
        drawDoor(p, doorPos, s);
      }
      p.pop();

      /// space name or legend
      p.push();

      const name = type === "name" ? getName(s, 5) : getSpaceId(s);
      p.textSize(
        type === "legend"
          ? scale < 1
            ? 1
            : 1.5 / scale
          : scale < 1
          ? 1
          : 1 / scale
      );

      if (legend === s.zone_name) p.fill(255, 0, 0);
      else p.fill(0);

      p.text(name, s.x + 0.2, s.y + 2);
      p.pop();
    });
  }
};

/**
 *
 * @param {CSpace} _space
 * @param {number} _maxChar
 */
const getName = (_space, _maxChar) => {
  return _space.space_name.length > _maxChar
    ? _space.space_name.slice(0, _maxChar) + "."
    : _space.space_name;
};

const getSpaceId = (_space) => {
  return _space.space_id;
};

/**
 *
 * @param {{createdSpaces: CSpace[],
 * corridor?: {x:number, y:number, w:number, h:number}[],
 * list1?: CSpace[],
 * list2?:CSpace[],
 * vCor_1: {x:number, y:number, h:number, w:number},
 * vCor_2: {x:number, y:number, h:number, w:number} }} _virtualZone
 */
export const vCors = (_virtualZone) => {
  const { vCor_1, vCor_2 } = _virtualZone;
  p.push();
  {
    p.stroke(255, 0, 0);
    p.noFill();
    {
      const { x, y, w, h } = vCor_1;
      p.rect(x, y, w, h);
    }
    {
      const { x, y, w, h } = vCor_2;
      p.rect(x, y, w, h);
    }
  }
  p.pop();
};

const getDoorPosAndDir = (_zoneDir, _usedCorridor) => {
  if (_zoneDir === "H" && _usedCorridor === "vCor_1") {
    return "top";
  }
  if (_zoneDir === "H" && _usedCorridor === "vCor_2") {
    return "bottom";
  }
  if (_zoneDir === "V" && _usedCorridor === "vCor_1") {
    return "left";
  }
  if (_zoneDir === "V" && _usedCorridor === "vCor_2") {
    return "right";
  }
};
const drawDoor = (p, _edge, _space, _doubleDoor = false) => {
  // console.log(_edge,_space)
  if (_edge === "top") {
    p.line(_space.x + 0.2, _space.y, _space.x + 0.2, _space.y + 0.9);
    p.line(_space.x + 0.2, _space.y + 0.9, _space.x + 1, _space.y);
  }
  if (_edge === "bottom") {
    p.line(
      _space.x + 0.2,
      _space.y + _space.h,
      _space.x + 0.2,
      _space.y + _space.h - 0.9
    );
    p.line(
      _space.x + 0.2,
      _space.y + _space.h - 0.9,
      _space.x + 1,
      _space.y + _space.h
    );
  }
  if (_edge === "left") {
    p.line(_space.x, _space.y + 0.2, _space.x + 0.9, _space.y + 0.2);
    p.line(_space.x + 0.9, _space.y + 0.2, _space.x, _space.y + 1);
  }
  if (_edge === "right") {
    p.line(
      _space.x + _space.w,
      _space.y + 0.2,
      _space.x + _space.w - 0.9,
      _space.y + 0.2
    );
    p.line(
      _space.x + _space.w - 0.9,
      _space.y + 0.2,
      _space.x + _space.w,
      _space.y + 1
    );
  }
};
