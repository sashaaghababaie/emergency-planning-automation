import { colors } from "./colors";
/**
 *
 * @param {{createdSpaces: CSpace[], corridor?: {x:number, y:number, w:number, h:number}[], list1?: CSpace[], list2?:CSpace[]; usedCorridor?: 'vCor_1' | 'vCor_2' }} _createdZone
 */

export const zone = (p, _createdZone, type, scale, legend = "") => {
  if (_createdZone.hasOwnProperty("usedCorridor")) {
    p.push();
    {
      p.fill(200, 200, 200, 255);
      p.noStroke();
      const s = _createdZone[_createdZone.usedCorridor];
      p.rect(s.x, s.y, s.w, s.h);
    }
    p.pop();
  }
  if (_createdZone.hasOwnProperty("lightingZone")) {
    p.push();
    {
      p.fill(200, 200, 200, 255);
      p.noStroke();
      const s = _createdZone["lightingZone"];
      p.fill(255, 0, 0, 50);
      p.rect(s.x, s.y, s.w, s.h);
    }
    p.pop();
  }
  if (_createdZone.hasOwnProperty("available_for_adj")) {
    if (_createdZone.createdSpaces[0].space_id != 0) {
      p.push();
      {
        p.fill(200, 200, 200, 255);
        p.noStroke();
        const s = _createdZone["available_for_adj"];
        p.rect(s.x, s.y, s.w, s.h);
      }
      p.pop();
    }
  }
  p.push();
  {
    p.stroke(0);
    _createdZone.createdSpaces.forEach((s) => {
      p.push();
      p.fill(colors[s.zone_name]);

      p.rect(s.x, s.y, s.w, s.h);
      p.pop();
      const name = type === "name" ? getName(s, 7) : getSpaceId(s);
      p.textSize(
        type === "legend" ? (scale < 1 ? 1 : 1.5 / scale) : 0.5 / scale
      );
      p.push();
      if (legend === s.zone_name) {
        p.fill(255, 0, 0);
      } else {
        p.fill(0);
      }

      p.text(name, s.x + 0.2, s.y + 1.5);
      p.pop();
    });
  }
  p.pop();
};

/**
 *
 * @param {CSpace} _space
 * @param {number} _maxChar
 */
const getName = (_space, _maxChar) => {
  return _space.space_name.length > _maxChar
    ? _space.space_name.slice(0, _maxChar) + "..."
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
    p.stroke(256, 0, 0);
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
