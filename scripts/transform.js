/**
 *
 * @param {{createdSpaces: CSpace[],
 * corridor?: {x:number, y:number, w:number, h:number}[],
 * list1?: CSpace[],
 * list2?:CSpace[],
 * vCor_1?: {x:number, y:number, w:number, h:number}
 * vCor_2?: {x:number, y:number, w:number, h:number} }} _createdZone
 * @param {Point} _v
 */
export const move = (_createdZone, _v) => {
  const { zoneDir } = _createdZone;
  const createdSpaces = _createdZone.createdSpaces.map((s) => ({
    ...s,
    x: s.x + _v.x,
    y: s.y + _v.y,
  }));

  let corridor = [];
  if (_createdZone.corridor || _createdZone.corridor.length) {
    corridor = _createdZone.corridor.map((c) => ({
      ...c,
      x: c.x + _v.x,
      y: c.y + _v.y,
    }));
  }
  if (_createdZone.vCor_1) {
    const v_Cor1 = {
      ..._createdZone.vCor_1,
      x: _createdZone.vCor_1.x + _v.x,
      y: _createdZone.vCor_1.y - _v.y,
    };
    const v_Cor2 = {
      ..._createdZone.vCor_2,
      x: _createdZone.vCor_2.x + _v.x,
      y: _createdZone.vCor_2.y + _v.y,
    };
    return { createdSpaces, corridor, v_Cor1, v_Cor2, zoneDir };
  }

  return { createdSpaces, corridor, zoneDir };
};

/**
 * @param {{createdSpaces: CSpace[],
 * corridor?: {x:number, y:number, w:number, h:number}[],
 * list1?: CSpace[],
 * list2?:CSpace[],
 * vCor_1?: {x:number, y:number, w:number, h:number}
 * vCor_2?: {x:number, y:number, w:number, h:number} }} _createdZone
 * @param {Point} _point
 */
export const moveTo = (_createdZone, _point) => {
  const { zoneDir } = _createdZone;
  let anchor = getZoneAnchor(_createdZone);

  const createdSpaces = _createdZone.createdSpaces.map((s) => ({
    ...s,
    x: s.x - anchor.x + _point.x,
    y: s.y - anchor.y + _point.y,
  }));

  let corridor = [];
  if (_createdZone.corridor || _createdZone.corridor.length) {
    corridor = _createdZone.corridor.map((c) => ({
      ...c,
      x: c.x - anchor.x + _point.x,
      y: c.y - anchor.y + _point.y,
    }));
  }
  if (_createdZone.vCor_1) {
    const vCor_1 = {
      ..._createdZone.vCor_1,
      x: _createdZone.vCor_1.x - anchor.x + _point.x,
      y: _createdZone.vCor_1.y - anchor.y + _point.y,
    };
    const vCor_2 = {
      ..._createdZone.vCor_2,
      x: _createdZone.vCor_2.x - anchor.x + _point.x,
      y: _createdZone.vCor_2.y - anchor.y + _point.y,
    };
    return { createdSpaces, corridor, vCor_1, vCor_2, zoneDir };
  }
  return { createdSpaces, corridor, zoneDir };
};

/**
 *
 * @param {{createdSpaces: CSpace[], corridor?: {x:number, y:number, w:number, h:number}[], list1?: CSpace[], list2?:CSpace[] }} _createdZone
 * @param {Point} _primaryGrid
 * @param {Point} _secondaryGrid
 */
export const adjustToGrid = (_createdZone, _primaryGrid, _secondaryGrid) => {
  const zoneDim = getZoneDimensions(_createdZone);

  const gridXToOccupy = Math.ceil(zoneDim.w / _primaryGrid.x);

  const lenXtoAdjust = gridXToOccupy * _primaryGrid.x;
  const ratioX = lenXtoAdjust / zoneDim.w;
  const gridYToOccupy = Math.ceil(zoneDim.h / _primaryGrid.y);
  const lenYtoAdjust = gridYToOccupy * _primaryGrid.y;
  const ratioY = lenYtoAdjust / zoneDim.h;

  const debased = moveTo(_createdZone, { x: 0, y: 0 });
  const adjustedSpaces = debased.createdSpaces.map((s) => ({
    ...s,
    x: s.x * ratioX,
    y: s.y * ratioY,
    w: s.w * ratioX,
    h: s.h * ratioY,
  }));

  const rebasedCreatedSpace = {
    createdSpaces: adjustedSpaces,
    corridor: _createdZone.corridor,
  };

  const anchor = { x: zoneDim.x, y: zoneDim.y };

  return move(rebasedCreatedSpace, anchor);
};

/**
 *
 * @param {{createdSpaces: CSpace[],
 * corridor?: {x:number, y:number, w:number, h:number}[],
 * list1?: CSpace[],
 * list2?:CSpace[],
 * vCor1?: {x:number, y:number, w:number, h:number}
 * vCor2?: {x:number, y:number, w:number, h:number} }} _createdZone
 */
export const getZoneDir = (_createdZone) => {
  const { createdSpaces } = _createdZone;

  if (createdSpaces.length > 1) {
    if (createdSpaces[1].x > createdSpaces[0].x) return "H";
    return "V";
  }

  if (createdSpaces[0].w > createdSpaces[0].h) return "H";
  else if (createdSpaces[0].w < createdSpaces[0].h) return "V";
  return "N";
};

/**
 *
 * @param {VirtualZone} _createdZone
 */
export const getZoneDimensions = (_createdZone) => {
  let anchor = getZoneAnchor(_createdZone);

  const zone = _createdZone.createdSpaces;

  const w = Math.max(...zone.map((s) => s.x + s.w)) - anchor.x;
  const h = Math.max(...zone.map((s) => s.y + s.h)) - anchor.y;

  return { x: anchor.x, y: anchor.y, w, h };
};

/**
 *
 * @param {{createdSpaces: CSpace[], corridor?: {x:number, y:number, w:number, h:number}[]}} _createdZone
 */
export const getZoneAnchor = (_createdZone) => {
  let anchor = {
    x: _createdZone.createdSpaces[0].x,
    y: _createdZone.createdSpaces[0].y,
  };

  _createdZone.createdSpaces.forEach((s) => {
    if (s.x <= anchor.x && s.y <= anchor.y) {
      anchor.x = s.x;
      anchor.y = s.y;
    }
  });

  return anchor;
};
