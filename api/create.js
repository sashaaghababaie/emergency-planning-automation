import * as Boundry from "@/scripts/boundry";
import * as Program from "@/scripts/program";
import * as Generate from "@/scripts/generate";
import * as Transform from "@/scripts/transform";
import * as ZONING from "@/scripts/zoning";
import { Grid } from "@/scripts/grid";
import { solve_algorythm_a } from "@/scripts/solver_a";
//import { async_solve_algorythm_a } from "@/scripts/async-solver_a";

export function asyncResolveHospital(
  _config,
  _boundry,
  _setter = false,
  _program = false
) {
  const boundry = Boundry.createBoundry(_boundry);

  // let program = _program ? _program : await ProgramServer.initBaseProgram();
  let program = _program ? _program : false;

  const userProgram = Program.createNewProgramBasedOnBoundry(program, boundry);

  const zones = Program.getZones(userProgram);

  const availableArrangements = Generate.all(zones);
  if (_setter) {
    _setter([{ message: "All zones generated successfully", type: "success" }]);
  }

  const adjustedAvailableArrangemanet = adjustAllToGrid(
    availableArrangements,
    _config
  );

  const adjustedVirtualAvailableArrangemanet = createAdjustedVirtualZone(
    adjustedAvailableArrangemanet
  );

  if (_setter) _setter([{ message: "Starting solver...", type: "action" }]);

  const args = [adjustedVirtualAvailableArrangemanet, boundry, _config];
  // const asyncSolver = async (_step, _placed_arr) =>
  //   await async_solve_algorythm_a(
  //     adjustedVirtualAvailableArrangemanet,
  //     grid,
  //     boundry,
  //     _config,
  //     _step,
  //     _setter,
  //     _placed_arr
  //   );

  return { boundry, args };
}

export function resolveHospital(
  _config,
  _boundry,
  _steps,
  _setter = false,
  _program = false
) {
  const boundry = Boundry.createBoundry(_boundry);
  const grid = new Grid(boundry, _config.gird.module.x, _config.gird.module.y);
  // let program = _program ? _program : await ProgramServer.initBaseProgram();
  let program = _program ? _program : false;

  const userProgram = Program.createNewProgramBasedOnBoundry(program, boundry);

  const zones = Program.getZones(userProgram);

  const availableArrangements = Generate.all(zones);
  if (_setter) {
    _setter(["All zones generated successfully"]);
  }

  const adjustedAvailableArrangemanet = adjustAllToGrid(
    availableArrangements,
    _config
  );

  const adjustedVirtualAvailableArrangemanet = createAdjustedVirtualZone(
    adjustedAvailableArrangemanet
  );

  if (_setter) _setter(["Start solver..."]);

  const result = solve_algorythm_a(
    adjustedVirtualAvailableArrangemanet,
    grid,
    boundry,
    _config,
    _steps,
    _setter
  );

  return { boundry, result };
}

/**
 *
 * @param {*} availableArrangements
 * @returns
 */
const adjustAllToGrid = (availableArrangements, config) => {
  const module = config.gird.module;
  const adjustedAvailableArrangemanet = {};

  for (let zoneId in availableArrangements) {
    adjustedAvailableArrangemanet[zoneId] = {};

    if (
      Array.isArray(availableArrangements[zoneId]["os_h"][0]) ||
      Array.isArray(availableArrangements[zoneId]["os_v"][0])
    ) {
      let adjusted_os_h_arr = [];
      let adjusted_os_v_arr = [];
      // @ts-ignore

      availableArrangements[zoneId]["os_h"].forEach((_, i) => {
        const a = {
          os_h: availableArrangements[zoneId]["os_h"][i],
          os_v: availableArrangements[zoneId]["os_v"][i],
        };

        const adjusted_os_h = Transform.adjustToGrid(
          {
            createdSpaces: a["os_h"],
            corridor: [],
          },
          module,
          module
        );

        const adjusted_os_v = Transform.adjustToGrid(
          {
            createdSpaces: a["os_v"],
            corridor: [],
          },
          module,
          module
        );

        adjusted_os_h_arr.push(adjusted_os_h);
        adjusted_os_v_arr.push(adjusted_os_v);
      });

      adjustedAvailableArrangemanet[zoneId]["os_h"] = adjusted_os_h_arr;
      adjustedAvailableArrangemanet[zoneId]["os_v"] = adjusted_os_v_arr;
    } else {
      const adjusted_os_h = Transform.adjustToGrid(
        { createdSpaces: availableArrangements[zoneId]["os_h"], corridor: [] },
        module,
        module
      );

      const adjusted_os_v = Transform.adjustToGrid(
        { createdSpaces: availableArrangements[zoneId]["os_v"], corridor: [] },
        module,
        module
      );

      adjustedAvailableArrangemanet[zoneId]["os_h"] = adjusted_os_h;
      adjustedAvailableArrangemanet[zoneId]["os_v"] = adjusted_os_v;
    }
  }

  return adjustedAvailableArrangemanet;
};

function createAdjustedVirtualZone(adjustedAvailableArrangemanet) {
  /** @type {Object.<string, {os_h: VirtualZone, os_v: VirtualZone} >} */
  const adjustedVirtualAvailableArrangemanet = {};

  for (let zoneId in adjustedAvailableArrangemanet) {
    // @ts-ignore
    adjustedVirtualAvailableArrangemanet[zoneId] = {};

    if (
      Array.isArray(adjustedAvailableArrangemanet[zoneId]["os_h"]) ||
      Array.isArray(adjustedAvailableArrangemanet[zoneId]["os_v"])
    ) {
      let adjustedAvailable_os_h_arr = [];
      let adjustedAvailable_os_v_arr = [];
      // @ts-ignore

      adjustedAvailableArrangemanet[zoneId]["os_h"].forEach((_, i) => {
        const a = {
          os_h: adjustedAvailableArrangemanet[zoneId]["os_h"][i],
          os_v: adjustedAvailableArrangemanet[zoneId]["os_v"][i],
        };

        const virtual_adjusted_os_h = ZONING.generateVirtualZone(
          a["os_h"],
          3,
          "H"
        );
        const virtual_adjusted_os_v = ZONING.generateVirtualZone(
          a["os_v"],
          3,
          "V"
        );

        adjustedAvailable_os_h_arr.push(virtual_adjusted_os_h);
        adjustedAvailable_os_v_arr.push(virtual_adjusted_os_v);
      });
      //@ts-ignore
      adjustedVirtualAvailableArrangemanet[zoneId]["os_h"] =
        adjustedAvailable_os_h_arr;
      //@ts-ignore
      adjustedVirtualAvailableArrangemanet[zoneId]["os_v"] =
        adjustedAvailable_os_v_arr;
    } else {
      const virtual_adjusted_os_h = ZONING.generateVirtualZone(
        adjustedAvailableArrangemanet[zoneId]["os_h"],
        3,
        "H"
      );
      const virtual_adjusted_os_v = ZONING.generateVirtualZone(
        adjustedAvailableArrangemanet[zoneId]["os_v"],
        3,
        "V"
      );

      adjustedVirtualAvailableArrangemanet[zoneId]["os_h"] =
        virtual_adjusted_os_h;
      adjustedVirtualAvailableArrangemanet[zoneId]["os_v"] =
        virtual_adjusted_os_v;
    }
  }
  return adjustedVirtualAvailableArrangemanet;
}
