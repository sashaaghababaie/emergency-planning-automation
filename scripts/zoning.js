import * as Transform from "@/scripts/transform";
/**
 *
 * @param {VirtualZone} _createdZone
 * @param {number} _corridor_width
 */
export const generateVirtualZone = (
  _createdZone,
  _corridor_width = 3,
  zoneDir
) => {
  // console.log(_createdZone.forceDir)
  //   const zoneDir =
  //     //@ts-ignore
  //     _createdZone.forceDir === "N" || !_createdZone.hasOwnProperty("forceDir")
  //       ? Transform.getZoneDir(_createdZone)
  //       : //@ts-ignore
  //         _createdZone.forceDir;

  // console.log(_createdZone, zoneDir);
  const anchor = Transform.getZoneAnchor(_createdZone);

  if (zoneDir === "H") {
    const vCor_1 = {
      x: anchor.x,
      y: anchor.y - _corridor_width,
      h: _corridor_width,
      w: Transform.getZoneDimensions(_createdZone).w,
    };

    const vCor_2 = {
      x: anchor.x,
      y: anchor.y + Transform.getZoneDimensions(_createdZone).h,
      h: _corridor_width,
      w: Transform.getZoneDimensions(_createdZone).w,
    };

    return { ..._createdZone, vCor_1, vCor_2 };
  }

  if (zoneDir === "V") {
    const vCor_1 = {
      x: anchor.x - _corridor_width,
      y: anchor.y,
      w: _corridor_width,
      h: Transform.getZoneDimensions(_createdZone).h,
    };

    const vCor_2 = {
      x: anchor.x + Transform.getZoneDimensions(_createdZone).w,
      y: anchor.y,
      h: Transform.getZoneDimensions(_createdZone).h,
      w: _corridor_width,
    };

    return { ..._createdZone, vCor_1, vCor_2 };
  }
};

/**
 * @param {Object.<string, {os_h: VirtualZone, os_v: VirtualZone}>} _availableArrangements
 * @param {Boundry} _boundry
 */
export const selectArrangement = (_availableArrangements, _boundry) => {
  const arrangement = {};

  for (let zoneId in _availableArrangements) {
    const seleected = ZONING.selectItem(
      _availableArrangements[zoneId],
      _boundry
    );
    arrangement[zoneId] = seleected;
  }

  return arrangement;
};

/**
 * @param {{os_h: VirtualZone, os_v: VirtualZone}} _availableVirtualZone
 * @param {Boundry} _boundry
 * @param {null | ((virtualZones: VirtualZone[]) => VirtualZone)} _callback
 */
export const selectItem = (
  _availableVirtualZone,
  _boundry,
  _callback = null
) => {
  const legalOptions = [];

  const { createdSpaces: os_h } = _availableVirtualZone["os_h"];
  if (
    Transform.getZoneDimensions({ createdSpaces: os_h }).h <= _boundry.height
  ) {
    legalOptions.push(_availableVirtualZone["os_h"]);
  }

  const { createdSpaces: os_v } = _availableVirtualZone["os_v"];
  if (
    Transform.getZoneDimensions({ createdSpaces: os_v }).w <= _boundry.width
  ) {
    legalOptions.push(_availableVirtualZone["os_v"]);
  }

  if (_callback) {
    if (typeof _callback !== "function")
      throw new Error("callback is not a function");

    return _callback(legalOptions);
  }

  if (legalOptions.length === 0) {
    throw new Error("One or more zones cannot fit");
  }
  if (legalOptions.length === 1) {
    return legalOptions[0];
  }
  if (legalOptions.length === 2) {
    return legalOptions[Math.floor(Math.random() * 2)];
  }
};

// /**
//  *
//  * @param {Object<string, VirtualZone>} _virtualZones
//  * @param {Grid} _grid
//  * @param {Boundry} _boundry
//  */
// ZONING.solve = (_virtualZones, _grid, _boundry) => {
//   const placed = {};

//   for (let zoneId in _virtualZones) {
//     const zone = _virtualZones[zoneId];
//     // Placing inpatient entrance

//     if (Number(zoneId) == 0) {
//       const inp_ent = ZONING.PLACE.entrance(zone, _boundry, _grid, "inp_ent");
//       // do occupy in grid
//       const dim = Transfrom.getZoneDimensions(inp_ent);
//       placed[zoneId] = { vZone: inp_ent, areaToReplace: [dim] };
//     }

//     if (Number(zoneId) == 1) {
//       placed[zoneId] = zone;
//     }
//   }

//   return placed;
// };

/**
 *
 * @param {{x: number, y:number, w:number, h:number}} area
 * @param {*} _grid
 * @returns
 */
export const MODULIZE = (area, _grid) => {
  const _i = area.w / _grid.moduleX;
  const _j = area.h / _grid.moduleY;

  const modules = [];

  for (let i = 0; i < _i; i++) {
    for (let j = 0; j < _j; j++) {
      const rect = {
        x: i * _grid.moduleX + area.x,
        y: j * _grid.moduleY + area.y,
        w: _grid.moduleX,
        h: _grid.moduleY,
      };

      modules.push(rect);
    }
  }

  return modules;
};
