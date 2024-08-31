import * as Transform from "@/scripts/transform";
import * as ZONING from "@/scripts/zoning";
import * as HELPERS from "@/scripts/helpers";

/**
 * @param {{os_h: VirtualZone, os_v: VirtualZone}} _zones
 * @param {{x:number,y:number,w:number,h:number}} _adj
 * @param {Grid} _grid
 * @param {Boundry} _boundry
 * @param {Object<string, VirtualZone>} _other
 * @param {'best-fit' | 'all'} _strategy
 */
export const alignedPlacing = (
  _zones,
  _adj,
  _grid,
  _boundry,
  _other,
  _strategy,
  _ensureNaturalLight = false
) => {
  const options = [];
  const m_available_for_adj = ZONING.MODULIZE(_adj, _grid);
  // if adj dir is horizontal

  if (_adj.w >= _adj.h) {
    // for os_horizontal
    const usedZone_h = _zones.os_h;

    const h_vCore1 = usedZone_h.vCor_1;
    const module_len = h_vCore1.w / _grid.moduleX;

    const step = module_len + m_available_for_adj.length - 1;
    const { x, y } = m_available_for_adj[0];

    const startPos = x - (module_len - 1) * _grid.moduleX;

    for (let i = 0; i < step; i++) {
      const z1 = Transform.moveTo(usedZone_h, {
        x: startPos + i * _grid.moduleX,
        y: y + h_vCore1.h,
      });

      if (_ensureNaturalLight) {
        const ligthingZone = { ...z1.vCor_2 };
        // const dist = _boundry.height - ligthingZone.y;
        // ligthingZone.h = dist;
        z1.lightingZone = ligthingZone;
      }

      if (checker(z1, _other, z1.vCor_1, _boundry, _ensureNaturalLight)) {
        z1.used_adj = "aligned_1";
        z1.usedCorridor = "vCor_1";
        options.push(z1);
      }

      const z2 = Transform.moveTo(usedZone_h, {
        x: startPos + i * _grid.moduleX,
        y: y + h_vCore1.h + h_vCore1.h,
      });

      if (_ensureNaturalLight) {
        const ligthingZone = { ...z2.vCor_2 };
        // const dist = _boundry.height - ligthingZone.y;
        // ligthingZone.h = dist;
        z2.lightingZone = ligthingZone;
      }
      if (checker(z2, _other, z2.vCor_1, _boundry)) {
        z2.used_adj = "aligned_2";

        z2.usedCorridor = "vCor_1";
        options.push(z2);
      }
    }

    const h_vCore2 = usedZone_h.vCor_2;
    const dim = Transform.getZoneDimensions(usedZone_h);

    for (let i = 0; i < step; i++) {
      const z1 = Transform.moveTo(usedZone_h, {
        x: startPos + i * _grid.moduleX,
        y: y - dim.h,
      });

      if (_ensureNaturalLight) {
        const ligthingZone = { ...z1.vCor_1 };
        // const dist = _boundry.height - ligthingZone.y;
        // ligthingZone.h = dist;
        z1.lightingZone = ligthingZone;
      }

      if (checker(z1, _other, z1.vCor_2, _boundry)) {
        z1.used_adj = "aligned_3";
        z1.usedCorridor = "vCor_2";
        options.push(z1);
      }

      const z2 = Transform.moveTo(usedZone_h, {
        x: startPos + i * _grid.moduleX,
        y: y - dim.h - h_vCore2.h,
      });

      if (_ensureNaturalLight) {
        const ligthingZone = { ...z2.vCor_1 };
        // const dist = _boundry.height - ligthingZone.y;
        // ligthingZone.h = dist;
        z2.lightingZone = ligthingZone;
      }

      if (checker(z2, _other, z2.vCor_2, _boundry)) {
        z2.used_adj = "aligned_4";
        z2.usedCorridor = "vCor_2";
        options.push(z2);
      }
    }
  }
  // if adj dir is v
  if (_adj.h > _adj.w) {
    // const usedZone_v = ZONING.generateVirtualZone(_zones.os_v, 3);
    const usedZone_v = _zones.os_v;
    const v_vCore1 = usedZone_v.vCor_1;
    const module_len = v_vCore1.h / _grid.moduleY;

    const step = module_len + m_available_for_adj.length - 1;
    const { x, y } = m_available_for_adj[0];

    const startPos = y - (module_len - 1) * _grid.moduleY;
    for (let i = 0; i < step; i++) {
      const z = Transform.moveTo(usedZone_v, {
        x: x + v_vCore1.w,
        y: startPos + i * _grid.moduleY,
      });

      if (checker(z, _other, z.vCor_1, _boundry)) {
        z.used_adj = "aligned_5";
        z.usedCorridor = "vCor_1";
        options.push(z);
      }
    }

    const v_vCore2 = usedZone_v.vCor_2;
    for (let i = 0; i < step; i++) {
      const z = Transform.moveTo(usedZone_v, {
        x: x - v_vCore2.w,
        y: startPos + i * _grid.moduleY,
      });

      if (checker(z, _other, z.vCor_2, _boundry)) {
        z.used_adj = "aligned_6";
        z.usedCorridor = "vCor_2";
        options.push(z);
      }
    }
  }

  // return options;
  if (_strategy === "best-fit") {
    const leaderboard = [];

    for (let i = 0; i < options.length; i++) {
      let point = 0;
      //@ts-ignore
      const option = options[i];
      const c = option[option.usedCorridor];
      const cm = ZONING.MODULIZE(c, _grid);

      for (let m = 0; m < m_available_for_adj.length; m++) {
        for (let n = 0; n < cm.length; n++) {
          if (
            m_available_for_adj[m].x === cm[n].x &&
            m_available_for_adj[m].y === cm[n].y
          ) {
            point++;
          }
        }
      }

      leaderboard.push({ option: options[i], point });
    }

    leaderboard.sort((a, b) => b.point - a.point);
    const maxPoint = leaderboard[0].point;
    const filtered = leaderboard.filter((l) => l.point === maxPoint);
    return filtered.map((f) => f.option);
  }

  return options;
};

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
 * @param {{os_h: VirtualZone, os_v: VirtualZone}} _zones
 * @param {{x:number,y:number,w:number,h:number}} _adj
 * @param {Grid} _grid
 * @param {Boundry} _boundry
 * @param {Object<string, VirtualZone>} _other
 * @param {'best-fit' |'all'} _strategy
 */
export const alignedPlacingEdge = (
  _zones,
  _adj,
  _grid,
  _boundry,
  _other,
  _strategy,
  _ensureNaturalLight = false
) => {
  const options = [];
  const m_available_for_adj = ZONING.MODULIZE(_adj, _grid);
  // if adj dir is horizontal
  if (_adj.w >= _adj.h) {
    // const usedZone_h = ZONING.generateVirtualZone(_zones.os_h, 3);
    const usedZone_h = _zones.os_h;
    const h_vCore1 = usedZone_h.vCor_1;
    // const h_vCore2 = usedZone_h.vCor_2;

    const { y } = m_available_for_adj[0];

    // right of adj
    const dim = Transform.getZoneDimensions(usedZone_h);
    const option_1 = Transform.moveTo(usedZone_h, {
      x: _adj.x + _adj.w,
      y: y + h_vCore1.h,
    });

    if (_ensureNaturalLight) {
      const ligthingZone = { ...option_1.vCor_2 };
      // const dist = _boundry.height - ligthingZone.y;
      // ligthingZone.h = dist;
      option_1.lightingZone = ligthingZone;
    }
    if (checker(option_1, _other, option_1.vCor_1, _boundry)) {
      option_1.used_adj = "alignedEdge_1";
      option_1.usedCorridor = "vCor_1";
      options.push(option_1);
    }

    const option_2 = Transform.moveTo(usedZone_h, {
      x: _adj.x + _adj.w,
      y: y - dim.h,
    });
    if (_ensureNaturalLight) {
      const ligthingZone = { ...option_2.vCor_1 };
      // const dist = _boundry.height - ligthingZone.y;
      // ligthingZone.h = dist;
      option_2.lightingZone = ligthingZone;
    }
    if (checker(option_2, _other, option_2.vCor_2, _boundry)) {
      option_2.used_adj = "alignedEdge_2";
      option_2.usedCorridor = "vCor_2";
      options.push(option_2);
    }

    // left of adj

    const option_3 = Transform.moveTo(usedZone_h, {
      x: _adj.x - dim.w,
      y: y + h_vCore1.h,
    });
    if (_ensureNaturalLight) {
      const ligthingZone = { ...option_3.vCor_2 };
      // const dist = _boundry.height - ligthingZone.y;
      // ligthingZone.h = dist;
      option_3.lightingZone = ligthingZone;
    }
    if (checker(option_3, _other, option_3.vCor_1, _boundry)) {
      option_3.used_adj = "alignedEdge_3";
      option_3.usedCorridor = "vCor_1";
      options.push(option_3);
    }

    const option_4 = Transform.moveTo(usedZone_h, {
      x: _adj.x - dim.w,
      y: y - dim.h,
    });
    if (_ensureNaturalLight) {
      const ligthingZone = { ...option_4.vCor_1 };
      // const dist = _boundry.height - ligthingZone.y;
      // ligthingZone.h = dist;
      option_4.lightingZone = ligthingZone;
    }
    if (checker(option_4, _other, option_4.vCor_2, _boundry)) {
      option_4.used_adj = "alignedEdge_4";
      option_4.usedCorridor = "vCor_2";
      options.push(option_4);
    }
  }
  // if adj dir is vertical
  if (_adj.w < _adj.h) {
    // const usedZone_v = ZONING.generateVirtualZone(_zones.os_v, 3);
    const usedZone_v = _zones.os_v;
    const v_vCore1 = usedZone_v.vCor_1;
    // const v_vCore2 = usedZone_v.vCor_2;

    const { x } = m_available_for_adj[0];

    // right of adj
    const dim = Transform.getZoneDimensions(usedZone_v);
    const option_1 = Transform.moveTo(usedZone_v, {
      x: x + v_vCore1.w,
      y: _adj.y + _adj.h,
    });
    if (_ensureNaturalLight) {
      const ligthingZone = { ...option_1.vCor_2 };
      // const dist = _boundry.height - ligthingZone.y;
      // ligthingZone.h = dist;
      option_1.lightingZone = ligthingZone;
    }
    if (checker(option_1, _other, option_1.vCor_1, _boundry)) {
      if (_zones.os_h.createdSpaces[0].zone_id == 10) {
        option_1.used_adj = "alignedEdge_5";
      }
      option_1.usedCorridor = "vCor_1";
      options.push(option_1);
    }

    const option_2 = Transform.moveTo(usedZone_v, {
      x: x - dim.w,
      y: _adj.y + _adj.h,
    });
    if (_ensureNaturalLight) {
      const ligthingZone = { ...option_2.vCor_1 };
      // const dist = _boundry.height - ligthingZone.y;
      // ligthingZone.h = dist;
      option_2.lightingZone = ligthingZone;
    }
    if (checker(option_2, _other, option_2.vCor_2, _boundry)) {
      option_2.used_adj = "alignedEdge_6";
      option_2.usedCorridor = "vCor_2";
      options.push(option_2);
    }

    // left of adj
    const option_3 = Transform.moveTo(usedZone_v, {
      x: x + v_vCore1.w,
      y: _adj.y - dim.y,
    });
    if (_ensureNaturalLight) {
      const ligthingZone = { ...option_3.vCor_2 };
      // const dist = _boundry.height - ligthingZone.y;
      // ligthingZone.h = dist;
      option_3.lightingZone = ligthingZone;
    }
    if (checker(option_3, _other, option_3.vCor_1, _boundry)) {
      option_3.used_adj = "alignedEdge_7";
      option_3.usedCorridor = "vCor_1";
      options.push(option_3);
    }

    const option_4 = Transform.moveTo(usedZone_v, {
      x: x - dim.w,
      y: _adj.y - dim.y,
    });
    if (_ensureNaturalLight) {
      const ligthingZone = { ...option_4.vCor_1 };
      // const dist = _boundry.height - ligthingZone.y;
      // ligthingZone.h = dist;
      option_4.lightingZone = ligthingZone;
    }
    if (checker(option_4, _other, option_4.vCor_2, _boundry)) {
      option_4.used_adj = "alignedEdge_8";
      option_4.usedCorridor = "vCor_2";
      options.push(option_4);
    }
  }

  return options;
};

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
 * @param {{os_h: VirtualZone, os_v: VirtualZone}} _zones
 * @param {{x:number,y:number,w:number,h:number}} _adj
 * @param {Grid} _grid
 * @param {Boundry} _boundry
 * @param {Object<string, VirtualZone>} _other
 * @param {'best-fit' | 'all'} _strategy
 */
export const crossedPlacing = (
  _zones,
  _adj,
  _grid,
  _boundry,
  _other,
  _strategy,
  _ensureNaturalLight = false
) => {
  const options = [];

  // if adj dir is horizontal
  if (_adj.w >= _adj.h) {
    //vertical zone in left
    const usedZone_v = _zones.os_v;

    const dim = Transform.getZoneDimensions(usedZone_v);

    const z1 = Transform.moveTo(usedZone_v, {
      x: _adj.x - dim.w,
      y: _adj.y - dim.h + _grid.moduleY,
    });
    if (_ensureNaturalLight) {
      const ligthingZone = { ...z1.vCor_1 };
      // const dist = _boundry.height - ligthingZone.y;
      // ligthingZone.h = dist;
      z1.lightingZone = ligthingZone;
    }
    if (checker(z1, _other, z1.vCor_2, _boundry)) {
      z1.used_adj = "crossed_1";
      z1.usedCorridor = "vCor_2";
      options.push(z1);
    }

    const z2 = Transform.moveTo(usedZone_v, {
      x: _adj.x - dim.w,
      y: _adj.y,
    });
    if (_ensureNaturalLight) {
      const ligthingZone = { ...z2.vCor_1 };
      // const dist = _boundry.height - ligthingZone.y;
      // ligthingZone.h = dist;
      z2.lightingZone = ligthingZone;
    }
    if (checker(z2, _other, z2.vCor_2, _boundry)) {
      z2.used_adj = "crossed_2";
      z2.usedCorridor = "vCor_2";
      options.push(z2);
    }

    //vertical zone in right
    const z3 = Transform.moveTo(usedZone_v, {
      x: _adj.x + _adj.w + usedZone_v.vCor_1.w,
      y: _adj.y - dim.h + _grid.moduleY,
    });
    if (_ensureNaturalLight) {
      const ligthingZone = { ...z3.vCor_2 };
      // const dist = _boundry.height - ligthingZone.y;
      // ligthingZone.h = dist;
      z3.lightingZone = ligthingZone;
    }
    if (checker(z3, _other, z3.vCor_1, _boundry)) {
      z3.used_adj = "crossed_3";
      z3.usedCorridor = "vCor_1";
      options.push(z3);
    }

    const z4 = Transform.moveTo(usedZone_v, {
      x: _adj.x + _adj.w + usedZone_v.vCor_1.w,
      y: _adj.y,
    });
    if (_ensureNaturalLight) {
      const ligthingZone = { ...z4.vCor_2 };
      // const dist = _boundry.height - ligthingZone.y;
      // ligthingZone.h = dist;
      z4.lightingZone = ligthingZone;
    }
    if (checker(z4, _other, z4.vCor_1, _boundry)) {
      z4.used_adj = "crossed_4";
      z4.usedCorridor = "vCor_1";
      options.push(z4);
    }
  }

  // if adj dir is verical
  if (_adj.w < _adj.h) {
    //horizontal zone in top
    const usedZone_h = _zones.os_h;

    const dim = Transform.getZoneDimensions(usedZone_h);

    const z1 = Transform.moveTo(usedZone_h, {
      x: _adj.x,
      y: _adj.y - dim.h,
    });
    if (_ensureNaturalLight) {
      const ligthingZone = { ...z1.vCor_1 };
      // const dist = _boundry.height - ligthingZone.y;
      // ligthingZone.h = dist;
      z1.lightingZone = ligthingZone;
    }
    if (checker(z1, _other, z1.vCor_2, _boundry)) {
      z1.used_adj = "crossed_5";
      z1.usedCorridor = "vCor_2";
      options.push(z1);
    }

    const z2 = Transform.moveTo(usedZone_h, {
      x: _adj.x - dim.w + _grid.moduleX,
      y: _adj.y - dim.h,
    });
    if (_ensureNaturalLight) {
      const ligthingZone = { ...z2.vCor_1 };
      // const dist = _boundry.height - ligthingZone.y;
      // ligthingZone.h = dist;
      z2.lightingZone = ligthingZone;
    }
    if (checker(z2, _other, z2.vCor_2, _boundry)) {
      z2.used_adj = "crossed_6";
      z2.usedCorridor = "vCor_2";
      options.push(z2);
    }
    //horizontal zone in bottom
    const z3 = Transform.moveTo(usedZone_h, {
      x: _adj.x - dim.w + _grid.moduleX,
      y: _adj.y + _adj.h,
    });
    if (_ensureNaturalLight) {
      const ligthingZone = { ...z3.vCor_2 };
      // const dist = _boundry.height - ligthingZone.y;
      // ligthingZone.h = dist;
      z3.lightingZone = ligthingZone;
    }
    if (checker(z3, _other, z3.vCor_1, _boundry)) {
      z3.used_adj = "crossed_7";
      z3.usedCorridor = "vCor_1";
      options.push(z3);
    }

    const z4 = Transform.moveTo(usedZone_h, {
      x: _adj.x,
      y: _adj.y + _adj.h,
    });
    if (_ensureNaturalLight) {
      const ligthingZone = { ...z4.vCor_2 };
      // const dist = _boundry.height - ligthingZone.y;
      // ligthingZone.h = dist;
      z4.lightingZone = ligthingZone;
    }
    if (checker(z4, _other, z4.vCor_1, _boundry)) {
      z4.used_adj = "crossed_5";
      z4.usedCorridor = "vCor_1";
      options.push(z4);
    }
  }
  return options;

  // return [];
};

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
 * @param {{os_h: VirtualZone, os_v: VirtualZone}} _zones
 * @param {{x:number,y:number,w:number,h:number}} _adj
 * @param {Grid} _grid
 * @param {Boundry} _boundry
 * @param {Object<string, VirtualZone>} _other
 * @param {'best-fit' |'all'} _strategy
 */

export const crossedPlacingEdge = (
  _zones,
  _adj,
  _grid,
  _boundry,
  _other,
  _strategy,
  _ensureNaturalLight = false
) => {
  const options = [];

  // if adj dir is horizontal
  if (_adj.w >= _adj.h) {
    // for os_vertical
    // const usedZone_v = ZONING.generateVirtualZone(_zones.os_v, 3);
    const usedZone_v = _zones.os_v;
    const v_vCore2 = usedZone_v.vCor_2;
    const module_len = v_vCore2.h / _grid.moduleY;

    // type A
    //
    //   |===|
    //    adj
    // left of adj
    // vCore1
    const dim = Transform.getZoneDimensions(usedZone_v);

    for (let i = 0; i < module_len; i++) {
      const option = Transform.moveTo(usedZone_v, {
        x: _adj.x - v_vCore2.w - dim.w,
        y: _adj.y - i * _grid.moduleY,
      });
      if (_ensureNaturalLight) {
        const ligthingZone = { ...option.vCor_1 };
        // const dist = _boundry.height - ligthingZone.y;
        // ligthingZone.h = dist;
        option.lightingZone = ligthingZone;
      }
      if (checker(option, _other, option.vCor_2, _boundry)) {
        option.used_adj = "corssed_a1";
        option.usedCorridor = "vCor_2";
        options.push(option);
      }
    }

    // type A
    //
    //   |===|
    //    adj
    // right of adj
    const v_vCore1 = usedZone_v.vCor_1;

    for (let j = 0; j < module_len; j++) {
      const option = Transform.moveTo(usedZone_v, {
        x: _adj.x + _adj.w + v_vCore1.w,
        y: _adj.y - j * _grid.moduleY,
      });
      if (_ensureNaturalLight) {
        const ligthingZone = { ...option.vCor_2 };
        // const dist = _boundry.height - ligthingZone.y;
        // ligthingZone.h = dist;
        option.lightingZone = ligthingZone;
      }
      if (checker(option, _other, option.vCor_1, _boundry)) {
        option.used_adj = "corssed_a2";
        option.usedCorridor = "vCor_1";
        options.push(option);
      }
    }

    // type B
    //
    //   |
    //  ===
    //  adj

    const adj_module_len = _adj.w / _grid.moduleX;

    // v_cor1 top and bottom of adj
    for (let i = 0; i < adj_module_len; i++) {
      // options on top
      const option_top = Transform.moveTo(usedZone_v, {
        x: _adj.x + i * _grid.moduleX + v_vCore1.w,
        y: _adj.y - v_vCore1.h,
      });
      if (_ensureNaturalLight) {
        const ligthingZone = { ...option_top.vCor_2 };
        // const dist = _boundry.height - ligthingZone.y;
        // ligthingZone.h = dist;
        option_top.lightingZone = ligthingZone;
      }
      if (checker(option_top, _other, option_top.vCor_1, _boundry)) {
        option_top.used_adj = "corssed_a3";
        option_top.usedCorridor = "vCor_1";
        options.push(option_top);
      }

      const option_bottom = Transform.moveTo(usedZone_v, {
        x: _adj.x + i * _grid.moduleX + v_vCore1.w,
        y: _adj.y + _adj.h,
      });
      if (_ensureNaturalLight) {
        const ligthingZone = { ...option_bottom.vCor_2 };
        // const dist = _boundry.height - ligthingZone.y;
        // ligthingZone.h = dist;
        option_bottom.lightingZone = ligthingZone;
      }
      if (checker(option_bottom, _other, option_bottom.vCor_1, _boundry)) {
        option_bottom.used_adj = "corssed_a4";
        option_bottom.usedCorridor = "vCor_1";
        options.push(option_bottom);
      }
    }

    // v_cor2 top and bottom of adj
    for (let i = 0; i < adj_module_len; i++) {
      // options on top
      const option_top = Transform.moveTo(usedZone_v, {
        x: _adj.x + i * _grid.moduleX - v_vCore2.w,
        y: _adj.y - v_vCore2.h,
      });

      if (_ensureNaturalLight) {
        const ligthingZone = { ...option_top.vCor_1 };
        // const dist = _boundry.height - ligthingZone.y;
        // ligthingZone.h = dist;
        option_top.lightingZone = ligthingZone;
      }
      if (checker(option_top, _other, option_top.vCor_2, _boundry)) {
        option_top.used_adj = "corssed_a5";
        option_top.usedCorridor = "vCor_2";
        options.push(option_top);
      }

      const option_bottom = Transform.moveTo(usedZone_v, {
        x: _adj.x + i * _grid.moduleX - v_vCore2.w,
        y: _adj.y + _adj.h,
      });
      if (_ensureNaturalLight) {
        const ligthingZone = { ...option_bottom.vCor_1 };
        // const dist = _boundry.height - ligthingZone.y;
        // ligthingZone.h = dist;
        option_bottom.lightingZone = ligthingZone;
      }
      if (checker(option_bottom, _other, option_bottom.vCor_2, _boundry)) {
        option_bottom.used_adj = "corssed_a6";

        option_bottom.usedCorridor = "vCor_2";
        options.push(option_bottom);
      }
    }
  }

  // if adj dir is vertiacal
  if (_adj.w < _adj.h) {
    // for os_horizontal
    // const usedZone_h = ZONING.generateVirtualZone(_zones.os_h, 3);
    const usedZone_h = _zones.os_h;
    const h_vCore2 = usedZone_h.vCor_2;
    const module_len = h_vCore2.w / _grid.moduleX;
    const dim = Transform.getZoneDimensions(usedZone_h);

    // top of adj
    // vCore1
    for (let i = 0; i < module_len; i++) {
      const option = Transform.moveTo(usedZone_h, {
        x: _adj.x - i * _grid.moduleX,
        y: _adj.y - h_vCore2.h - dim.h,
      });
      if (_ensureNaturalLight) {
        const ligthingZone = { ...option.vCor_1 };
        // const dist = _boundry.height - ligthingZone.y;
        // ligthingZone.h = dist;
        option.lightingZone = ligthingZone;
      }
      if (checker(option, _other, option.vCor_2, _boundry)) {
        option.used_adj = "corssed_a7";
        option.usedCorridor = "vCor_2";
        options.push(option);
      }
    }

    // bottom of adj
    const h_vCore1 = usedZone_h.vCor_1;
    for (let i = 0; i < module_len; i++) {
      const option = Transform.moveTo(usedZone_h, {
        x: _adj.x - i * _grid.moduleX,
        y: _adj.y + _adj.h + h_vCore1.h,
      });
      if (_ensureNaturalLight) {
        const ligthingZone = { ...option.vCor_2 };
        // const dist = _boundry.height - ligthingZone.y;
        // ligthingZone.h = dist;
        option.lightingZone = ligthingZone;
      }
      if (checker(option, _other, option.vCor_1, _boundry)) {
        option.used_adj = "corssed_a8";
        option.usedCorridor = "vCor_1";
        options.push(option);
      }
    }

    // type B
    //
    //   |
    //  ===
    //  adj

    const adj_module_len = _adj.h / _grid.moduleY;

    // v_cor1 left and right of adj
    for (let i = 0; i < adj_module_len; i++) {
      // options on left
      const option_left = Transform.moveTo(usedZone_h, {
        x: _adj.x - h_vCore1.w,
        y: _adj.y + h_vCore1.h + i * _grid.moduleY,
      });
      if (_ensureNaturalLight) {
        const ligthingZone = { ...option_left.vCor_2 };
        // const dist = _boundry.height - ligthingZone.y;
        // ligthingZone.h = dist;
        option_left.lightingZone = ligthingZone;
      }
      if (checker(option_left, _other, option_left.vCor_1, _boundry)) {
        option_left.used_adj = "corssed_a9";
        option_left.usedCorridor = "vCor_1";
        options.push(option_left);
      }

      // options on right
      const option_right = Transform.moveTo(usedZone_h, {
        x: _adj.x - _adj.w,
        y: _adj.y + h_vCore1.h + i * _grid.moduleY,
      });
      if (_ensureNaturalLight) {
        const ligthingZone = { ...option_right.vCor_2 };
        // const dist = _boundry.height - ligthingZone.y;
        // ligthingZone.h = dist;
        option_right.lightingZone = ligthingZone;
      }
      if (checker(option_right, _other, option_right.vCor_1, _boundry)) {
        option_right.used_adj = "corssed_a10";
        option_right.usedCorridor = "vCor_1";
        options.push(option_right);
      }
    }

    // v_cor2 left and right of adj
    for (let i = 0; i < adj_module_len; i++) {
      // options on left
      const option_left = Transform.moveTo(usedZone_h, {
        x: _adj.x - h_vCore2.w,
        y: _adj.y - dim.h + i * _grid.moduleY,
      });
      if (_ensureNaturalLight) {
        const ligthingZone = { ...option_left.vCor_1 };
        // const dist = _boundry.height - ligthingZone.y;
        // ligthingZone.h = dist;
        option_left.lightingZone = ligthingZone;
      }
      if (checker(option_left, _other, option_left.vCor_2, _boundry)) {
        option_left.used_adj = "corssed_a11";
        option_left.usedCorridor = "vCor_2";
        options.push(option_left);
      }

      // options on right
      const option_right = Transform.moveTo(usedZone_h, {
        x: _adj.x - _adj.w,
        y: _adj.y - dim.h + i * _grid.moduleY,
      });
      if (_ensureNaturalLight) {
        const ligthingZone = { ...option_right.vCor_1 };
        // const dist = _boundry.height - ligthingZone.y;
        // ligthingZone.h = dist;
        option_right.lightingZone = ligthingZone;
      }
      if (checker(option_right, _other, option_right.vCor_2, _boundry)) {
        option_right.used_adj = "corssed_a12";
        option_right.usedCorridor = "vCor_2";
        options.push(option_right);
      }
    }
  }

  return options;
};

/**
 *
 *
 *
 *
 *
 * HELPERS
 *
 *
 *
 *
 */

/**
 *
 * @param {*} _zone
 * @param {{x:number,y:number,w:number,h:number}} _lightingBlock
 */
const isLightingBlockedBySpace = (_zone, _lightingBlock) => {
  const rect1 = Transform.getZoneDimensions(_zone);
  return HELPERS.rectIntersect(rect1, _lightingBlock);
};

/**
 *
 * @param {*} _corridor
 * @param {{x:number,y:number,w:number,h:number}} _lightingBlock
 */
const isLightingBlockedByCorridors = (_corridor, _lightingBlock) => {
  return HELPERS.rectIntersect(_corridor, _lightingBlock);
};

/**
 *
 * @param {VirtualZone} _zone
 * @param {Boundry} _boundry
 */
const isInBoundry = (_zone, _boundry, _vCore) => {
  const rect = Transform.getZoneDimensions(_zone);
  if (
    rect.x >= 0 &&
    rect.y >= 0 &&
    rect.x + rect.w <= _boundry.width &&
    rect.y + rect.h <= _boundry.height &&
    _vCore.x >= 0 &&
    _vCore.y >= 0 &&
    _vCore.x + _vCore.w <= _boundry.width &&
    _vCore.y + _vCore.h <= _boundry.height
  ) {
    return true;
  }
  return false;
};

/**
 *
 * @param {VirtualZone} _zone1
 * @param {VirtualZone} _zone2
 */
const hasOverlap = (_zone1, _zone2) => {
  const rect1 = Transform.getZoneDimensions(_zone1);
  const rect2 = Transform.getZoneDimensions(_zone2);
  return HELPERS.rectIntersect(rect1, rect2);
};

/**
 *
 * @param {{x:number, y:number, w:number, h:number}} _z1_vCore
 * @param {VirtualZone} _zone2
 */
const isBlocked = (_z1_vCore, _zone2) => {
  const rect1 = _z1_vCore;
  const rect2 = Transform.getZoneDimensions(_zone2);
  return HELPERS.rectIntersect(rect1, rect2);
};

/**
 *
 * @param {VirtualZone} _zone1
 * @param {{x:number, y:number, w:number, h:number}} _otherCorridor
 */
const isBlocking = (_zone1, _otherCorridor) => {
  const rect1 = _otherCorridor;
  const rect2 = Transform.getZoneDimensions(_zone1);
  return HELPERS.rectIntersect(rect1, rect2);
};

/**
 *
 * @param {VirtualZone} _zone1
 * @param {VirtualZone} _otherZone
 */
const isBlockingOtherLightingBySpace = (_zone1, _otherZone) => {
  // @ts-ignore
  const rect1 = _otherZone.lightingZone;
  const rect2 = Transform.getZoneDimensions(_zone1);
  return HELPERS.rectIntersect(rect1, rect2);
};
/**
 *
 * @param {{x:number, y:number, w:number, h:number}} _z1_vCore
 * @param {VirtualZone} _otherZone
 */
const isBlockingOtherLightingByCorridor = (_z1_vCore, _otherZone) => {
  // @ts-ignore
  const rect2 = _otherZone.lightingZone;
  return HELPERS.rectIntersect(_z1_vCore, rect2);
};
/**
 *
 * @param {*} _zone
 * @param {*} _other
 * @param {*} _z1_vCore
 * @param {Boundry} _boundry
 * @param {boolean} _ensureNaturalLight
 * @returns A Boolean representing success state of placing the space;
 * returns true if not overlapped && notBlocked && notBlocking && isInBoundry
 * returns false if each one of mentioned is false.
 */
const checker = (
  _zone,
  _other,
  _z1_vCore,
  _boundry,
  _ensureNaturalLight = false
) => {
  if (!isInBoundry(_zone, _boundry, _z1_vCore)) return false;

  for (let zoneId in _other) {
    if (hasOverlap(_zone, _other[zoneId])) return false;

    if (zoneId === "0") continue;
    if (isBlocked(_z1_vCore, _other[zoneId])) return false;

    let other, corridor, usedCorridor;
    if (zoneId === "14") {
      corridor = _other[zoneId].available_for_adj;
    } else {
      other = _other[zoneId];
      usedCorridor = other.usedCorridor;
      corridor = other[usedCorridor];
    }

    if (isBlocking(_zone, corridor)) {
      return false;
    }

    if (_other[zoneId].hasOwnProperty("lightingZone")) {
      if (isBlockingOtherLightingBySpace(_zone, _other[zoneId])) return false;
      if (isBlockingOtherLightingByCorridor(_z1_vCore, _other[zoneId]))
        return false;
    }

    if (_ensureNaturalLight) {
      if (isLightingBlockedBySpace(_other[zoneId], _zone.lightingZone)) {
        return false;
      }
      if (isLightingBlockedByCorridors(corridor, _zone.lightingZone)) {
        return false;
      }
    }
  }

  return true;
};

/**
 *
 * @param {{os_h: VirtualZone, os_v: VirtualZone}} _zones
 * @param {{x:number,y:number,w:number,h:number}} _adj
 * @param {Grid} _grid
 * @param {Boundry} _boundry
 * @param {Object<string, VirtualZone>} _other
 * @param {'aligned' | 'crossed' | 'aligned-edge' | 'crossed-edge'} _type
 * @param {'best-fit' | 'all'} _strategy
 */
export const tryPlacing = (
  _zones,
  _adj,
  _grid,
  _boundry,
  _other,
  _type,
  _strategy,
  _ensureNaturalLight = false
) => {
  if (_type === "aligned") {
    return alignedPlacing(
      _zones,
      _adj,
      _grid,
      _boundry,
      _other,
      _strategy,
      _ensureNaturalLight
    );
  }
  if (_type === "aligned-edge") {
    return alignedPlacingEdge(
      _zones,
      _adj,
      _grid,
      _boundry,
      _other,
      _strategy,
      _ensureNaturalLight
    );
  }

  if (_type === "crossed") {
    return crossedPlacing(
      _zones,
      _adj,
      _grid,
      _boundry,
      _other,
      _strategy,
      _ensureNaturalLight
    );
  }

  if (_type === "crossed-edge") {
    return crossedPlacingEdge(
      _zones,
      _adj,
      _grid,
      _boundry,
      _other,
      _strategy,
      _ensureNaturalLight
    );
  }
};

/**
 *
 * @param {{os_h: VirtualZone, os_v: VirtualZone}} _zones
 * @param {Grid} _grid
 * @param {Boundry} _boundry
 * @param {"inp_ent" | "outp_ent"} _type
 */
export const entrance = (_zones, _boundry, _grid, _type) => {
  let ent_pos;
  let placed;
  let zone;

  if (_type === "inp_ent") ent_pos = _boundry.inp_ent;
  if (_type === "outp_ent") ent_pos = _boundry.outp_ent;

  if (ent_pos.x === 0 || ent_pos.x == _boundry.width) {
    zone = _zones.os_h;
    zone.createdSpaces[0].w = 6;
    zone.createdSpaces[0].h = 3;
  }
  if (ent_pos.y === 0 || ent_pos.y == _boundry.height) {
    zone = _zones.os_v;
    zone.createdSpaces[0].w = 3;
    zone.createdSpaces[0].h = 6;
  }

  const { width, height } = _boundry;

  const zoneDim = Transform.getZoneDimensions(zone);

  /*    ______________
   *    |XXXXXXXXXX| |
   *    |XXXXXXXXXX| |
   *    |____________|
   */
  if (ent_pos.x <= width - zoneDim.w && ent_pos.y <= height - zoneDim.h) {
    placed = Transform.moveTo(zone, { x: ent_pos.x, y: ent_pos.y });
  }

  /*    ______________
   *    |          |X|
   *    |__________|X|
   *    |____________|
   */

  if (ent_pos.x > width - zoneDim.w && ent_pos.y <= height - zoneDim.h) {
    placed = Transform.moveTo(zone, { x: ent_pos.x - zoneDim.w, y: ent_pos.y });
  }

  /*    ______________
   *    |          | |
   *    |__________| |
   *    |XXXXXXXXXXX_|
   */

  if (ent_pos.x <= width && ent_pos.y > height - zoneDim.h) {
    placed = Transform.moveTo(zone, { x: ent_pos.x, y: ent_pos.y - zoneDim.h });
  }

  /*    ______________
   *    |          | |
   *    |__________| |
   *    |___________X|
   */

  if (ent_pos.x > width - zoneDim.w && ent_pos.y > height - zoneDim.h) {
    placed = Transform.moveTo(zone, {
      x: ent_pos.x - zoneDim.w,
      y: ent_pos.y - zoneDim.h,
    });
  }

  let available_for_adj;

  if (_type === "outp_ent") {
    const size = { w: 3, h: 3 };
    const { x, y } = Transform.getZoneAnchor(placed);

    if (ent_pos.x === 0) {
      available_for_adj = { x: x + 6, y, ...size };
    }
    if (ent_pos.x == _boundry.width) {
      available_for_adj = { x: x - 3, y, ...size };
    }
    if (ent_pos.y === 0) {
      available_for_adj = { x, y: y + 6, ...size };
    }
    if (ent_pos.y == _boundry.height) {
      available_for_adj = { x, y: y - 3, ...size };
    }

    return { placed, available_for_adj };
  }

  return placed;
};
