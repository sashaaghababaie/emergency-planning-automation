/**
 *
 * @param {{createdSpaces: CSpace[], corridor?: {x:number, y:number, w:number, h:number}[], list1?: CSpace[], list2?:CSpace[]; usedCorridor?: 'vCor_1' | 'vCor_2' }} _createdZone
 */

const colors = {
  entrance: [231, 255, 199],
  reception: [199, 250, 255],
  common: [255, 243, 199],
  outpatient: [255, 222, 199],
  emergency_ent: [255, 199, 205],
  operation: [239, 225, 255],
  emergency: [225, 230, 255],
  curing: [219, 233, 224],
  service: [255, 255, 255],
};

export const zone = (p, _createdZone) => {
  p.push();
  {
    p.stroke(0);
    _createdZone.createdSpaces.forEach((s) => {
      p.fill(colors[s.zone_name]);
      p.rect(s.x, s.y, s.w, s.h);
      // const name = getName(s, 7);
      const name = getSpaceId(s);
      p.textSize(1.5);
      p.text(name, s.x + 0.2, s.y + 1.5);
    });
  }
  p.pop();

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
    if (_createdZone.createdSpaces[0].space_id == 0) {
      return;
    }
    p.push();
    {
      p.fill(200, 200, 200, 255);
      p.noStroke();
      const s = _createdZone["available_for_adj"];
      p.rect(s.x, s.y, s.w, s.h);
    }
    p.pop();
  }
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
