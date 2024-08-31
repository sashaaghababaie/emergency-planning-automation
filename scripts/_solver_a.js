import * as placing from "@/scripts/placing";

const SOLVER = () => ({});

// console.log(Array.from({ length: maxDepth }).shift());
SOLVER.routes = [];
SOLVER.model = [1, 2, 3, 4, 5];
SOLVER.checkpoint_log = {};
SOLVER.checkpoint_placed = {};

/**
 *
 * @param {Object.<string, {os_h: VirtualZone, os_v: VirtualZone}>} _availableArrangements
 * @param {Grid} _grid
 * @param {Boundry} _boundry
 * @param {number | null} _start_zone_id
 * @param {any} _log
 */
const defaultTypes = ["aligned", "aligned-edge", "crossed", "crossed-edge"];

export async function solve_algorythm_a(
  _availableArrangements,
  _grid,
  _boundry,
  _placed = null,
  _start_zone_id = 1,
  _log = {}
) {
  let success = true;
  const log = _log;
  let placed = {};
  if (_placed) placed = _placed;

  // place entrances
  if (!placed.hasOwnProperty("0")) {
    placed["0"] = placeInpEnt(_availableArrangements, _boundry, _grid);
  }
  if (!placed.hasOwnProperty("14")) {
    placed["14"] = placeOutpEnt(_availableArrangements, _boundry, _grid);
  }

  // placing others
  for (let zoneId in _availableArrangements) {
    if (Number(zoneId) == 0 || Number(zoneId) == 14) continue;
    const availableArrangement = _availableArrangements[zoneId];
    /**
     *
     *
     *
     *
     *
     *
     *
     *
     */
    if (Number(zoneId) == 1) {
      if (!success) continue;
      if (_start_zone_id > 1) continue;

      if (placed.hasOwnProperty("1")) {
        cleanLog(zoneId, log, placed);

        if (log["1"].selected + 1 > log["1"].options.length - 1) {
          success = false;
          break;
        } else {
          log["1"].selected++;
          placed["1"] = log["1"].options[log["1"].selected];
        }
      } else {
        const available_for_adj = placed[0].available_for_adj;

        const args = [
          availableArrangement,
          available_for_adj,
          _grid,
          _boundry,
          placed,
          "aligned",
          "best-fit",
        ];

        //@ts-ignore
        const options = placing.tryPlacing(...args);

        if (options.length === 0) {
          success = false;
          break;
        }
        const selected = 0;

        placed["1"] = { ...options[selected], available_for_adj: {} };
        log["1"] = { options, selected: selected };
      }
    }
    /**
     *
     *
     *
     *
     *
     *
     *
     *
     */
    if (Number(zoneId) == 2) {
      if (!success) continue;
      if (_start_zone_id > 2) continue;

      const available_for_adj = [placed[0].available_for_adj];

      solveZoneByZone({
        zoneId,
        availableArrangements: _availableArrangements,
        availableArrangement,
        available_for_adj,
        types: defaultTypes,
        boundry: _boundry,
        log,
        placed,
        grid: _grid,
        strategy: "all",
      });
    }
    /**
     *
     *
     *
     *
     *
     *
     *
     *
     */
    if (Number(zoneId) === 3) {
      if (!success) continue;
      if (_start_zone_id > 3) continue;

      const available_for_adj = [
        placed[0].available_for_adj,
        placed[2][placed[2].usedCorridor],
      ];

      solveZoneByZone({
        zoneId,
        availableArrangements: _availableArrangements,
        availableArrangement,
        available_for_adj,
        types: defaultTypes,
        boundry: _boundry,
        log,
        placed,
        grid: _grid,
        strategy: "all",
      });
    }
    /**
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     */
    if (Number(zoneId) === 4) {
      if (!success) continue;
      if (_start_zone_id > 4) continue;

      const available_for_adj = [
        placed[0].available_for_adj,
        placed[3][placed[3].usedCorridor],
        placed[2][placed[2].usedCorridor],
      ];

      solveZoneByZone({
        zoneId,
        availableArrangements: _availableArrangements,
        availableArrangement,
        available_for_adj,
        types: defaultTypes,
        boundry: _boundry,
        log,
        placed,
        grid: _grid,
        strategy: "all",
      });
    }
    /**
     *
     *
     *
     *
     *
     *
     *
     *
     */
    if (Number(zoneId) === 5) {
      if (!success) continue;
      if (_start_zone_id > 5) continue;

      const available_for_adj = [placed[4][placed[4].usedCorridor]];

      solveZoneByZone({
        zoneId,
        availableArrangements: _availableArrangements,
        availableArrangement,
        available_for_adj,
        types: defaultTypes,
        boundry: _boundry,
        log,
        placed,
        grid: _grid,
        strategy: "all",
      });
    }
    /**
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     */
    if (Number(zoneId) === 6) {
      if (!success) continue;
      if (_start_zone_id > 6) continue;

      const available_for_adj = [placed[14].available_for_adj];

      solveZoneByZone({
        zoneId,
        availableArrangements: _availableArrangements,
        availableArrangement,
        available_for_adj,
        types: defaultTypes,
        boundry: _boundry,
        log,
        placed,
        grid: _grid,
        strategy: "all",
      });
    }
    /**
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     */
    // if (Number(zoneId) === 7) {
    //   if (!success) continue;
    //   if (_start_zone_id > 6) continue;

    //   const available_for_adj = [placed[14].available_for_adj];

    //   solveZoneByZone({
    //     zoneId,
    //     availableArrangements: _availableArrangements,
    //     availableArrangement,
    //     available_for_adj,
    //     types: defaultTypes,
    //     boundry: _boundry,
    //     log,
    //     placed,
    //     grid: _grid,
    //     strategy: "all",
    //   });
    // }
  }

  /**
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   */
  if (success === true) {
    SOLVER.routes.push(log);
    const keys = Object.keys(log);

    const last = log[keys[keys.length - 1]];

    for (let i = 1; i < last.options.length; i++) {
      const copyLog = JSON.parse(JSON.stringify(log));
      copyLog[keys[keys.length - 1]].selected = i;
      SOLVER.routes.push(copyLog);
    }

    SOLVER.checkpoint_log = log;
    SOLVER.checkpoint_placed = placed;

    const model = (() => {
      const arr = [];
      for (let i = SOLVER.model.length - 2; i >= 0; i--) {
        arr.push(SOLVER.model[i].toString());
      }
      return arr;
    })();

    for (let i = 0; i < model.length; i++) {
      if (
        SOLVER.checkpoint_log[model[i]].selected <
        SOLVER.checkpoint_log[model[i]].options.length - 1
      ) {
        let _log = JSON.parse(JSON.stringify(SOLVER.checkpoint_log));
        let _placed = JSON.parse(JSON.stringify(SOLVER.checkpoint_placed));
        return solve_algorythm_a(
          _availableArrangements,
          _grid,
          _boundry,
          _placed,
          Number(model[i]),
          _log
        );
      }
    }
  }

  return { placed, log };
}

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
/**
 *
 * @param {*} _availableArrangements
 * @param {*} _boundry
 * @param {*} _grid
 * @returns
 */
const placeInpEnt = (_availableArrangements, _boundry, _grid) => {
  const availableArrangement = _availableArrangements["0"];
  const _placed = placing.entrance(
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
  const { placed: _placed, available_for_adj } = placing.entrance(
    availableArrangement,
    _boundry,
    _grid,
    "outp_ent"
  );

  return { ..._placed, available_for_adj };
};

/**
 *
 * @param {number | string} _step
 */
const cleanLog = (_step, _log, _placed) => {
  const ind = SOLVER.model.indexOf(Number(_step));

  if (ind === SOLVER.model.length - 1) return;

  for (let i = ind + 1; i < SOLVER.model.length; i++) {
    delete _log[SOLVER.model[i].toString()];
    delete _placed[SOLVER.model[i].toString()];
  }
};

/**
 *
 * @param {*} param0
 * @returns
 */
const solveZoneByZone = ({
  zoneId,
  availableArrangement,
  availableArrangements,
  available_for_adj,
  types,
  boundry,
  grid,
  strategy,
  placed,
  log,
}) => {
  const zoneIdString = zoneId.toString();
  const zoneIdNumber = Number(zoneId);
  if (placed.hasOwnProperty(zoneIdString)) {
    cleanLog(zoneId, log, placed);

    if (log[zoneIdString].selected + 1 > log[zoneIdString].options.length - 1) {
      return solve_algorythm_a(
        availableArrangements,
        grid,
        boundry,
        placed,
        zoneIdNumber - 1,
        log
      );
    } else {
      log[zoneIdString].selected++;
      placed[zoneIdString] =
        log[zoneIdString].options[log[zoneIdString].selected];
    }
  } else {
    const options = [];

    available_for_adj.forEach((a) => {
      types.forEach((type) => {
        const _options = placing.tryPlacing(
          availableArrangement,
          a,
          grid,
          boundry,
          placed,
          type,
          strategy
        );

        options.push(..._options);
      });
    });

    if (options.length === 0) {
      return solve_algorythm_a(
        availableArrangements,
        grid,
        boundry,
        placed,
        zoneIdNumber - 1,
        log
      );
    }

    const selected = 0;
    placed[zoneIdString] = { ...options[selected], available_for_adj: {} };
    log[zoneIdString] = { options, selected: selected };
  }
};
