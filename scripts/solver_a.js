import * as PLACING from "@/scripts/placing";
import * as HELPERS from "@/scripts/helpers";

const defaultTypes = ["aligned", "aligned-edge", "crossed", "crossed-edge"];

// const steps = [1,2,3,4];
const zone_props = {
  1: { zone_adj: ["0"], ensureNaturalLight: false },
  2: { zone_adj: ["0"], ensureNaturalLight: false },
  3: { zone_adj: ["0", "2"], ensureNaturalLight: false },
  4: { zone_adj: ["0", "2", "3"], ensureNaturalLight: false },
  5: { zone_adj: ["4"], ensureNaturalLight: true },
  6: { zone_adj: ["14"], ensureNaturalLight: false },
  7: { zone_adj: ["14", "6"], ensureNaturalLight: false },
  8: { zone_adj: ["14", "6", "7"], ensureNaturalLight: false },
  9: { zone_adj: ["8"], ensureNaturalLight: false },
  10: { zone_adj: ["8", "9"], ensureNaturalLight: false },
  11: { zone_adj: ["8", "9", "10"], ensureNaturalLight: false },
  12: { zone_adj: ["14", "3", "4", "5", "6", "7"], ensureNaturalLight: false },
  13: { zone_adj: ["14", "3", "4", "5", "12"], ensureNaturalLight: false },
  15: {
    zone_adj: ["14", "3", "4", "5", "12", "13"],
    ensureNaturalLight: false,
  },
  16: {
    zone_adj: ["14", "3", "4", "5", "12", "13", "15"],
    ensureNaturalLight: false,
  },
};
/**
 *
 * @param {Object.<string, {os_h: VirtualZone, os_v: VirtualZone}>
 * |
 * Object.<string, {os_h: Array<VirtualZone>, os_v: Array<VirtualZone>}>} _availableArrangements
 * @param {Grid} _grid
 * @param {Boundry} _boundry
 */
export const solve_algorythm_a =  (
  _availableArrangements,
  _grid,
  _boundry,
  config,
  steps,
  _setter
) => {
  let placed = {};

  placed["0"] = placeInpEnt(_availableArrangements, _boundry, _grid);
  placed["14"] = placeOutpEnt(_availableArrangements, _boundry, _grid);

  let placed_arr = [];

  placed_arr.push(placed);

  for (let i = 0; i < steps.length; i++) {
    const availableArrangement = _availableArrangements[steps[i].toString()];
    if (_setter) {
      _setter(`current step: ${steps[i]}`);
    }
    console.log(`current step: ${steps[i]}`);

    if (steps[i] === 1) {
      let _placed_arr = [];

      placed_arr.forEach((_placed) => {
        const available_for_adj = getAvailableAdjByZoneIds(_placed, ["0"]);
        available_for_adj.forEach((_adj) => {
          const args = [
            availableArrangement,
            _adj,
            _grid,
            _boundry,
            _placed,
            "aligned",
            "best-fit",
          ];

          //@ts-ignore
          const options = PLACING.tryPlacing(...args);

          if (options.length) {
            options.forEach((o) => {
              if (o.hasOwnProperty("usedCorridor")) {
                const _new_placed = { ..._placed };
                _new_placed[steps[i].toString()] = o;
                _placed_arr.push(_new_placed);
              }
            });
          }
        });
      });

      if (_setter) {
        _setter(`options length at ${steps[i]}: ${_placed_arr.length}`);
      }

      console.log(`options length at ${steps[i]}: ${_placed_arr.length}`);
      placed_arr = _placed_arr;
    }

    if (steps[i] !== 0 && steps[i] !== 1 && steps[i] !== 14) {
      const _placed_arr = solveStep({
        step: steps[i],
        availableArrangement,
        placed_arr,
        defaultTypes,
        grid: _grid,
        boundry: _boundry,
        zone_props: zone_props[steps[i]],
        config,
        _setter
      });

      if (_placed_arr.length === 0) return placed_arr;

      placed_arr = _placed_arr;
    }
  }

  return placed_arr;
};

/**
 *
 * @param {*} _placed
 * @param {string[]} _zoneIds
 * @returns
 */
function getAvailableAdjByZoneIds(_placed, _zoneIds) {
  const available_for_adj = [];

  _zoneIds.forEach((zid) => {
    if (zid === "14" || zid === "0") {
      available_for_adj.push(_placed[zid].available_for_adj);
    } else {
      available_for_adj.push(_placed[zid][_placed[zid].usedCorridor]);
    }
  });

  return available_for_adj;
}

function solveStep({
  step,
  availableArrangement,
  placed_arr,
  defaultTypes,
  grid,
  boundry,
  zone_props,
  config,
  _setter
}) {
  let _placed_arr = [];
  let edited_availableArrangement = [];

  if (
    Array.isArray(availableArrangement.os_h) ||
    Array.isArray(availableArrangement.os_v)
  ) {
    //@ts-ignore
    availableArrangement.os_h.forEach((_, i) => {
      const a = {
        os_h: availableArrangement.os_h[i],
        os_v: availableArrangement.os_v[i],
      };
      edited_availableArrangement.push(a);
    });
  } else {
    edited_availableArrangement.push(availableArrangement);
  }

  edited_availableArrangement.forEach((arng) => {
    placed_arr.forEach((_placed, j) => {
      if (j % 10000 == 0) {
        console.log(`iteration: ${j}`);

        if (_setter) {
          _setter(`iteration: ${j}`);
        }
      }
      const available_for_adj = getAvailableAdjByZoneIds(
        _placed,
        zone_props.zone_adj
      );
      available_for_adj.forEach((adj) => {
        defaultTypes.forEach((type) => {
          const args = [
            arng,
            adj,
            grid,
            boundry,
            _placed,
            type,
            "all",
            zone_props.ensureNaturalLight,
          ];

          //@ts-ignore
          const options = PLACING.tryPlacing(...args);

          if (options.length) {
            options.forEach((o) => {
              if (o.hasOwnProperty("usedCorridor")) {
                const _new_placed = { ..._placed };
                _new_placed[step.toString()] = o;
                _placed_arr.push(_new_placed);
              }
            });
          }
        });
      });
    });
  });

  if (_setter) {
    _setter(`options length at ${step}: ${_placed_arr.length}`);
  }
  console.log(`options length at ${step}: ${_placed_arr.length}`);

  if (_placed_arr.length === 0) return [];

  if (
    config.sampling.available &&
    _placed_arr.length > config.sampling.MAX &&
    step !== 16
  ) {
    _placed_arr = HELPERS.sampling("random", _placed_arr, config.sampling.MAX);

    if (_setter) {
      _setter(
        `options length after sampling at ${step}: ${_placed_arr.length}`
      );
    }

    console.log(
      `options length after sampling at ${step}: ${_placed_arr.length}`
    );
  }

  return _placed_arr;
}

/**
 *
 * @param {*} _availableArrangements
 * @param {*} _boundry
 * @param {*} _grid
 * @returns
 */
const placeInpEnt = (_availableArrangements, _boundry, _grid) => {
  const availableArrangement = _availableArrangements["0"];
  const _placed = PLACING.entrance(
    availableArrangement,
    _boundry,
    _grid,
    "inp_ent"
  );

  const { x, y, w, h } = _placed.createdSpaces[0];
  const available_for_adj = { x, y, h, w };

  return { ..._placed, available_for_adj };
};

/**
 *
 * @param {*} _availableArrangements
 * @param {*} _boundry
 * @param {*} _grid
 * @returns
 */
const placeOutpEnt = (_availableArrangements, _boundry, _grid) => {
  const availableArrangement = _availableArrangements["0"];
  const { placed: _placed, available_for_adj } = PLACING.entrance(
    availableArrangement,
    _boundry,
    _grid,
    "outp_ent"
  );

  return { ..._placed, available_for_adj };
};
