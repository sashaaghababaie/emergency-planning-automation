"use server";
import * as PLACING from "@/scripts/placing";
import * as HELPERS from "@/scripts/helpers";
import { Grid } from "@/scripts/grid";

const defaultTypes = ["aligned", "aligned-edge", "crossed", "crossed-edge"];

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
 * @param {Array<any>} _placed_arr
 */
export const async_solve_algorythm_a = async (
  _availableArrangements,
  _boundry,
  config,
  _step,
  _placed_arr,
  _isEnd = false
) => {
  const _grid = new Grid(_boundry, config.gird.module.x, config.gird.module.y);
  // return new Promise((resolve, reject) => {
  let placed_arr = !_placed_arr || _step === 0 ? [] : _placed_arr;
  let log = [];
  if (_step == 0) {
    let placed = {};

    placed["0"] = placeInpEnt(_availableArrangements, _boundry, _grid);
    placed["14"] = placeOutpEnt(_availableArrangements, _boundry, _grid);

    placed_arr.push(placed);

    log = [
      { message: `current step: ${_step}`, type: "info" },
      { message: "Entrances placed succesfully", type: "success" },
    ];
    log.forEach((l) => console.log(l.message));
    return { placed_arr, log };
  } else if (_step == 1) {
    const availableArrangement = _availableArrangements[_step.toString()];
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
              _new_placed[_step.toString()] = o;
              _placed_arr.push(_new_placed);
            }
          });
        }
      });
    });

    log = [
      {
        message: `options length at ${_step}: ${_placed_arr.length}`,
        type: "info",
      },
    ];
    log.forEach((l) => console.log(l.message));
    placed_arr = _placed_arr;
  } else if (_step > 1 && _step != 14) {
    const availableArrangement = _availableArrangements[_step.toString()];

    const { _placed_arr, log: _log } = solveStep({
      step: _step,
      availableArrangement,
      placed_arr,
      defaultTypes,
      grid: _grid,
      boundry: _boundry,
      zone_props: zone_props[_step],
      config,
      _isEnd,
    });

    if (_placed_arr.length === 0) return { placed_arr: [], log };
    log = _log;
    placed_arr = _placed_arr;
  }

  return { placed_arr, log };
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
  _isEnd = false,
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
  const log = [];

  log.push({
    message: `options length at ${step}: ${_placed_arr.length}`,
    type: "info",
  });

  if (_placed_arr.length === 0) return { _placed_arr: [], log };

  if (
    config.sampling.available &&
    _placed_arr.length > config.sampling.MAX &&
    !_isEnd
  ) {
    _placed_arr = HELPERS.sampling("random", _placed_arr, config.sampling.MAX);

    log.push({
      message: `options length after sampling at ${step}: ${_placed_arr.length}`,
      type: "info",
    });

    log.forEach((l) => console.log(l.message));
  }

  return { _placed_arr: _placed_arr, log };
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
  const availableArrangement = _availableArrangements["14"];
  const { placed: _placed, available_for_adj } = PLACING.entrance(
    availableArrangement,
    _boundry,
    _grid,
    "outp_ent"
  );

  return { ..._placed, available_for_adj };
};
