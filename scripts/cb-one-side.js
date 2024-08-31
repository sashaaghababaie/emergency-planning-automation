import * as program from "@/scripts/program";
/**
 *
 * @param {Space[]} _spaces
 * @param {number} _corridor_width
 * @param {{x:number, y:number, w:number,h:number}} _subBundry
 * @param {{len_fill?: "min" | "program_max" | "boundry_max",
 * net?: boolean, width_fill: "program_max" | "boundry_max" | "min",
 * neg_threshold?: number,
 * pos_threshold?: number
 * forceDirection?: "horizontal" | "vertical"}} option
 */
export const linearPlacementOneSide = (
  _subBundry,
  _spaces,
  _corridor_width = 0,
  option = {
    len_fill: "boundry_max",
    net: true,
    width_fill: "boundry_max",
    neg_threshold: 0.05,
    pos_threshold: 0.1,
  }
) => {
  const area = program.getAreaSumOfSpacesArray(_spaces);

  if (_subBundry.w * _subBundry.h < area.min) {
    throw new Error(
      "linear_placement::oneSide::global::cannot fit: larger than provided area/boundry"
    );
  }

  const minReqWidth = Math.max(
    ..._spaces.map((space) =>
      space.x_min != space.x_max
        ? space.x_min - space.x_min * option.neg_threshold
        : Math.min(space.x_min, space.y_min) -
          Math.min(space.x_min, space.y_min) * option.neg_threshold
    ),
    ..._spaces.map((space) =>
      space.y_min != space.y_max
        ? space.y_min - space.y_min * option.neg_threshold
        : Math.min(space.x_min, space.y_min) -
          Math.min(space.x_min, space.y_min) * option.neg_threshold
    )
  );

  if (
    minReqWidth + _corridor_width > _subBundry.w &&
    minReqWidth + _corridor_width > _subBundry.h
  ) {
    throw new Error(
      "linear_placement::oneSide::global::cannot fit: not enough width"
    );
  }

  // configuration
  let usedMinimized = false;
  const config = getConfig(option, _subBundry);

  const createdSpaces = getAllSpaceByQuantity(_spaces);

  // Standard minimum
  let min_len = 0;

  createdSpaces.forEach((space) => {
    const ref = _spaces.find((s) => s.space_id === space.space_id);
    min_len = min_len + (ref.x_min <= ref.y_min ? ref.x_min : ref.y_min);
  });

  // If standard not applicable
  // recalculate with negative threshold
  if (min_len > config.len) {
    let min_min_len = 0;

    createdSpaces.forEach((space) => {
      const ref = _spaces.find((s) => s.space_id === space.space_id);
      min_min_len =
        min_min_len +
        (ref.x_min - ref.x_min * option.neg_threshold <=
        ref.y_min - ref.y_min * option.neg_threshold
          ? ref.x_min - ref.x_min * option.neg_threshold
          : ref.y_min - ref.y_min * option.neg_threshold);
    });

    if (min_min_len > config.len) {
      // cannot fit even with threshold
      throw new Error(
        "linear_placement::oneSide::global::cannot fit: not enough len"
      );
    }

    usedMinimized = true;
    min_len = min_min_len;
  }

  let thr;

  if (option.len_fill === "min") thr = 1;
  if (option.len_fill === "boundry_max") thr = config.len / min_len;

  if (
    option.width_fill === "boundry_max" ||
    (option.width_fill === "program_max" && option.net === false)
  ) {
    for (let i = 0; i < createdSpaces.length; i++) {
      const space = createdSpaces[i];
      const remainWidth = config.width - _corridor_width;
      const ref = _spaces.find((s) => s.space_id === space.space_id);

      space[config.side_a] =
        Math.min(
          usedMinimized
            ? ref.x_min - ref.x_min * (option.neg_threshold || 0)
            : ref.x_min,
          usedMinimized
            ? ref.y_min - ref.y_min * (option.neg_threshold || 0)
            : ref.y_min
        ) * thr;

      const minApplicableWidth =
        (ref.area_min - ref.area_min * (option.neg_threshold || 0)) /
        space[config.side_a];

      const maxApplicableWidth =
        (ref.area_max + ref.area_max * (option.neg_threshold || 0)) /
        space[config.side_a];

      if (remainWidth < minApplicableWidth) {
        space[config.side_a] = ref.area_min / remainWidth;
        space[config.side_b] = remainWidth;
      }
      // just for cleaning
      else if (remainWidth > maxApplicableWidth) {
        if (option.net) space[config.side_b] = remainWidth;
        else space[config.side_b] = maxApplicableWidth;
      }
      // just for cleaning
      else {
        space[config.side_b] = remainWidth;
      }
    }
  }

  if (
    option.width_fill === "min" &&
    option.len_fill === "min" &&
    _corridor_width === 0
  ) {
    for (let i = 0; i < createdSpaces.length; i++) {
      const space = createdSpaces[i];
      const ref = _spaces.find((s) => s.space_id === space.space_id);

      space[config.side_a] =
        Math.min(
          usedMinimized
            ? ref.x_min - ref.x_min * (option.neg_threshold || 0)
            : ref.x_min,
          usedMinimized
            ? ref.y_min - ref.y_min * (option.neg_threshold || 0)
            : ref.y_min
        ) * thr;

      const minApplicableWidth =
        (ref.area_min - ref.area_min * (option.neg_threshold || 0)) /
        space[config.side_a];

      space[config.side_b] = minApplicableWidth;
    }

    if (option.net === true) {
      const allWidth = [];

      for (let i = 0; i < createdSpaces.length; i++) {
        allWidth.push(createdSpaces[i].w);
      }

      const maxWidth = Math.max(...allWidth);

      for (let i = 0; i < createdSpaces.length; i++) {
        createdSpaces[i][config.side_b] = maxWidth;
      }
    }
  }

  // first width and then get len

  let lastUsedUnit = _subBundry[config.lenUnit];
  let corridor = [];

  for (let i = 0; i < createdSpaces.length; i++) {
    if (_corridor_width > 0) {
      const corridorSeg = {
        [config.lenUnit]: lastUsedUnit,
        [config.secondaryUnit]:
          _subBundry[config.secondaryUnit] + createdSpaces[i][config.side_b],
        [config.side_a]: createdSpaces[i][config.side_a],
        [config.side_b]: _corridor_width,
      };

      corridor.push(corridorSeg);
    }
    createdSpaces[i][config.secondaryUnit] = _subBundry[config.secondaryUnit];

    createdSpaces[i][config.lenUnit] = lastUsedUnit;
    lastUsedUnit = Number(
      (lastUsedUnit + createdSpaces[i][config.side_a]).toString().slice(0, 5)
    );
  }

  return {
    createdSpaces,
    corridor,
    forceDir:
      option.forceDirection === "horizontal"
        ? "H"
        : option.forceDirection === "vertical"
        ? "V"
        : "N",
  };
};

/**
 *
 * @param {Space[]} _spaces
 * @returns
 */
const getAllSpaceByQuantity = (_spaces) => {
  let arr = [];

  for (let i = 0; i < _spaces.length; i++) {
    for (let j = 0; j < _spaces[i].quantity; j++) {
      /** @type {CSpace} */
      const space = {
        space_name: _spaces[i].space_name,
        space_local_id: `${i}_${j}`,
        space_id: _spaces[i].space_id,
        space_adj: _spaces[i].space_adj,
        zone_id: _spaces[i].zone_id,
        zone_name: _spaces[i].zone_name,
        zone_adj: _spaces[i].zone_adj,
        x: 0,
        y: 0,
        w: 0,
        h: 0,
      };

      arr.push(space);
    }
  }

  return arr;
};

const findMaxWidthOfTwoParts = (list1, list2, _spaces) => {
  let lastSearched1 = list1[0];

  list1.forEach((/**@type {CSpace} */ s, /**@type {number} */ i) => {
    const ref = _spaces.find((_s) => _s.space_id === s.space_id);
    const minWidth = ref.area_min / s[config.side_a];

    const lastSearchedRef = _spaces.find(
      (s) => s.space_id === lastSearched1.space_id
    );

    const lastSearchedminWidth =
      lastSearchedRef.area_min / lastSearchedRef[config.side_a];

    if (minWidth > lastSearchedminWidth) {
      lastSearched1 = list1[i];
    }
  });

  let lastSearched2 = list1[0];

  list2.forEach((/**@type {CSpace} */ s, /**@type {number} */ i) => {
    const ref = _spaces.find((_s) => _s.space_id === s.space_id);
    const minWidth = ref.area_min / s[config.side_a];

    const lastSearchedRef = _spaces.find(
      (s) => s.space_id === lastSearched2.space_id
    );

    const lastSearchedminWidth =
      lastSearchedRef.area_min / lastSearchedRef[config.side_a];

    if (minWidth > lastSearchedminWidth) {
      lastSearched2 = list2[i];
    }
  });

  return { lastSearched1, lastSearched2 };
};

/**
 *
 * @param {{x:number, y:number, w:number,h:number}} _subBundry
 * @param {{len_fill?: "min" | "program_max" | "boundry_max",
 * net?: boolean, width_fill: "program_max" | "boundry_max" | "min",
 * neg_threshold?: number,
 * pos_threshold?: number
 * forceDirection?: "horizontal" | "vertical"}} _option
 * @returns
 */
const getConfig = (_option, _subBundry) => {
  // side a: align with corridor
  // side b: prependicular to corridor
  const config = {};
  if (!_option.forceDirection) {
    if (_subBundry.w >= _subBundry.h) {
      config.arrangement = "H";
      config.side_a = "w";
      config.side_b = "h";
      config.len = _subBundry.w;
      config.width = _subBundry.h;
      config.lenUnit = "x";
      config.secondaryUnit = "y";
    } else {
      config.arrangement = "V";
      config.side_a = "h";
      config.side_b = "w";
      config.len = _subBundry.h;
      config.width = _subBundry.w;
      config.lenUnit = "y";
      config.secondaryUnit = "x";
    }
  }

  if (_option.forceDirection === "horizontal") {
    config.arrangement = "H";
    config.side_a = "w";
    config.side_b = "h";
    config.len = _subBundry.w;
    config.width = _subBundry.h;
    config.lenUnit = "x";
    config.secondaryUnit = "y";
  }

  if (_option.forceDirection === "vertical") {
    config.arrangement = "V";
    config.side_a = "h";
    config.side_b = "w";
    config.len = _subBundry.h;
    config.width = _subBundry.w;
    config.lenUnit = "y";
    config.secondaryUnit = "x";
  }

  return config;
};
