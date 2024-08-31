import * as HELPERS from "@/scripts/helpers";
// const csvtojsonV2 = require("csvtojson/v2");

/**
 * @param { Program } _program
 * @returns {{ min: number, max: number }}
 */
export function getProgramArea(_programObj) {
  let min = 0;
  let max = 0;

  for (let i in _programObj) {
    min = min + _programObj[i].area_min * _programObj[i].quantity;
    max = max + _programObj[i].area_max * _programObj[i].quantity;
  }

  min = Math.ceil(min * 100) / 100;
  max = Math.ceil(max * 100) / 100;

  return { min, max };
}

/**
 * @param {ZoneQuery} options
 * @returns {{ min: number, max: number }}
 */
export function getZoneArea(options) {
  let _query;
  const { program } = options;

  if (options.hasOwnProperty("zone_name")) _query = "zone_name";
  if (options.hasOwnProperty("zone_id")) _query = "zone_id";

  let min = 0;
  let max = 0;

  for (let i in program) {
    if (
      program[i][_query] === (options.zone_name || options.zone_id.toString())
    ) {
      min = min + _program[i]["area_min"];
      max = max + _program[i]["area_max"];
    }
    min = HELPERS.rounded(min);
    max = HELPERS.rounded(max);
  }

  return { min, max };
}

/**
 * @param {{key: string, value: string | Number, program: Program}} options
 * @returns {Space[]}
 */
export function querySpace(options) {
  /** @type Space[] */
  const spaces = [];

  for (let i in options.program) {
    if (options.program[i][key] == options.value) {
      spaces.push(options.program[i]);
    }
  }

  return spaces;
}

/**
 * @param {Program} _program
 * @param {(space: Space) => boolean } callback
 * @returns {Space[]}
 */
const filterSpace = (_program, callback) => {
  if (!callback || typeof callback !== "function") {
    throw new Error("callback is not a function");
  }

  /** @type {Space[]} */
  const spaces = [];
  for (let i in _program) {
    if (callback(_program[i])) {
      spaces.push(_program[i]);
    }
  }

  return spaces;
};

/**
 * @param {Program} _program
 * @param {Boundry} _boundry
 * @returns {Program}
 */
export function createNewProgramBasedOnBoundry(_program, _boundry) {
  console.log(_program)
  let refProgramArea = getProgramArea(_program);
  const pureArea = _boundry.area * 0.75;

  if (pureArea < refProgramArea.min) {
    throw new Error("Boundry area cannot be smaller than min program area");
  }

  /** @type {Program} */
  const userProgram = {};

  /** @type {Program} */
  const _refProgram = JSON.parse(JSON.stringify(_program));

  let userAreaConsumed = 0;
  let refAreaConsumed = 0;

  // add fixed size to new program
  const fixedSpaces = filterSpace(
    _refProgram,
    (space) => space.area_max === space.area_min
  );

  for (let i = 0; i < fixedSpaces.length; i++) {
    userProgram[fixedSpaces[i].space_id] = fixedSpaces[i];
    userAreaConsumed = HELPERS.rounded(
      userAreaConsumed + fixedSpaces[i].area_max * fixedSpaces[i].quantity
    );

    delete _refProgram[fixedSpaces[i].space_id];
  }

  refAreaConsumed = refAreaConsumed + getAreaSumOfSpacesArray(fixedSpaces).max;

  // minimums
  const refAreaLeft = refProgramArea.max - refAreaConsumed;
  const userAreaLeft = pureArea - userAreaConsumed;
  const thr = 1 - userAreaLeft / refAreaLeft;

  const minSpaces = filterSpace(
    _refProgram,
    (space) =>
      returnMaxApplicableArea({ threshold: thr, space }) >
      HELPERS.rounded((1 - thr) * space.area_max)
  );

  for (let i = 0; i < minSpaces.length; i++) {
    /** @type {Space} */
    const minSpace = {
      ...minSpaces[i],
      area_max: minSpaces[i].area_min,
    };

    userProgram[minSpace.space_id] = minSpace;
    userAreaConsumed = HELPERS.rounded(
      userAreaConsumed + minSpace.area_max * minSpace.quantity
    );

    delete _refProgram[minSpaces[i].space_id];
  }

  refAreaConsumed = refAreaConsumed + getAreaSumOfSpacesArray(minSpaces).max;

  // Run for all spaces based on priority
  for (let i = 10; i >= 0; i--) {
    const spaces = filterSpace(
      _refProgram,
      (space) => space.changing_priority == i
    );

    // minimums
    let placableRefProgramArea = refProgramArea.max - refAreaConsumed;
    let placableBoundryArea = pureArea - userAreaConsumed;
    let thr = 1 - placableBoundryArea / placableRefProgramArea;

    const minSizedSpaces = spaces.filter(
      (space) =>
        returnMaxApplicableArea({ threshold: thr, space }) >
        HELPERS.rounded((1 - thr) * space.area_max)
    );

    for (let i = 0; i < minSizedSpaces.length; i++) {
      /** @type {Space} */
      const minimizedSpace = {
        ...minSizedSpaces[i],
        area_max: minSizedSpaces[i].area_min,
      };

      userProgram[minimizedSpace.space_id] = minimizedSpace;
      userAreaConsumed = HELPERS.rounded(
        userAreaConsumed + minimizedSpace.area_max * minimizedSpace.quantity
      );

      delete _refProgram[minSizedSpaces[i].space_id];
    }

    refAreaConsumed =
      refAreaConsumed + getAreaSumOfSpacesArray(minSizedSpaces).max;

    placableRefProgramArea = refProgramArea.max - refAreaConsumed;
    placableBoundryArea = pureArea - userAreaConsumed;
    thr = 1 - placableBoundryArea / placableRefProgramArea;

    // other spaces
    const other = spaces.filter(
      (space) =>
        returnMaxApplicableArea({ threshold: thr, space }) <=
        HELPERS.rounded((1 - thr) * space.area_max)
    );

    for (let i = 0; i < other.length; i++) {
      const area = returnMaxApplicableArea({
        threshold: thr,
        space: other[i],
      });

      userAreaConsumed = HELPERS.rounded(
        userAreaConsumed + area * other[i].quantity
      );

      if (HELPERS.rounded(userAreaConsumed) > pureArea + 0.05) {
        throw new Error("cannot fit");
      }

      /** @type {Space} */
      const newSpace = {
        ...other[i],
        area_max: Math.ceil(area * 100) / 100,
      };

      userProgram[other[i].space_id] = newSpace;
    }

    refAreaConsumed = refAreaConsumed + getAreaSumOfSpacesArray(other).max;
  }
  return userProgram;
}

/**
 *
 * @param  {Space[]} spaces
 * @param {boolean} useQuantity
 */
export function getAreaSumOfSpacesArray(spaces, useQuantity = true) {
  let min = 0;
  let max = 0;

  for (let i = 0; i < spaces.length; i++) {
    min = min + spaces[i].area_min * (useQuantity ? spaces[i].quantity : 1);
    max = max + spaces[i].area_max * (useQuantity ? spaces[i].quantity : 1);
  }

  min = HELPERS.rounded(min);
  max = HELPERS.rounded(max);

  return { min, max };
}

/**
 *
 * @param {Program} _program
 * @returns {number[]}
 */
function getProgramZoneIds(_program) {
  /** @type {number[]} */
  const zoneIds = [];

  for (let i in _program) {
    const id = Number(_program[i].zone_id);
    if (!zoneIds.includes(id)) zoneIds.push(id);
  }

  return zoneIds.sort((a, b) => a - b);
}

/**
 *
 * @param {Program} _program
 * @returns {Zone[]}
 */
export function getZones(_program) {
  const zoneIds = getProgramZoneIds(_program);

  /** @type {Zone[]} */
  const zones = [];

  for (let i = 0; i < zoneIds.length; i++) {
    /** @type {Zone} */
    const zone = [];

    for (let j in _program) {
      if (_program[j].zone_id == zoneIds[i]) zone.push(_program[j]);
    }

    zones.push(zone);
  }

  return zones;
}

/**
 *
 * @param {Zone} _zone
 */
function getZoneAdj(_zone) {
  const adjs = _zone.reduce((acc, val) =>
    acc.space_id < val.space_id ? acc : val
  );

  return adjs.zone_adj;
}

/**
 *
 * @param {{threshold: Number, space: Space}} options
 * @returns {Number}
 */
function returnMaxApplicableArea(options) {
  if (!options.space) throw new Error("no space provided by user");

  if (
    1 - options.space.area_min / options.space.area_max <=
    options.threshold
  ) {
    return options.space.area_min;
  } else {
    return HELPERS.rounded(options.space.area_max * (1 - options.threshold));
  }
}
