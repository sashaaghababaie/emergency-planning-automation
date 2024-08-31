
import * as CB from '@/scripts/cb-one-side'
/**
 *
 * @param {Zone} zone
 */
export const getAvailableZones = (zone) => {
  const { createdSpaces: os_h } = CB.linearPlacementOneSide(
    { x: 0, y: 0, w: 100, h: 100 },
    zone,
    0,
    {
      forceDirection: "horizontal",
      len_fill: "min",
      width_fill: "min",
      net: true,
    }
  );

  const { createdSpaces: os_v } = CB.linearPlacementOneSide(
    { x: 0, y: 0, w: 100, h: 100 },
    zone,
    0,
    {
      forceDirection: "vertical",
      len_fill: "min",
      width_fill: "min",
      net: true,
    }
  );

  return { os_h, os_v };
};

/**
 *
 * @param {Zone} zone
 */
const clinic = (zone) => {
  const injection = zone.find((s) => Number(s.space_id) === 11);
  let _clinic = [];

  if (injection.quantity > 1) {
    // pack injections by 3
    const q = Math.ceil(injection.quantity / 3);

    const newInjection = {
      ...injection,
      quantity: q,
      x_min: 3,
      x_max: 3,
      y_min: 6,
      y_max: 6,
      area_min: 18,
      area_max: 18,
    };

    _clinic = zone.filter((s) => Number(s.space_id) !== 11);
    _clinic.push(newInjection);
  } else {
    _clinic = zone;
  }

  return getAvailableZones(_clinic);
};

/**
 *
 * @param {Zone} zone
 */
const operation = (zone) => {
  const steril = zone.find((s) => Number(s.space_id) === 17);

  const combined = {
    ...steril,
    space_name: "steril&scrub",
    x_min: 2,
    x_max: 3,
    y_min: 6,
    y_max: 6,
    area_min: 12,
    area_max: 18,
  };

  const _operation = zone.filter(
    (s) => Number(s.space_id) !== 18 && Number(s.space_id) !== 17
  );

  _operation.push(combined);

  return getAvailableZones(_operation);
};

/**
 *
 * @param {Zone} zone
 */
const curing = (zone) => {
  const curing = zone.find(
    (s) => Number(s.space_id) === 23 || Number(s.space_id) === 22
  );

  if (curing.quantity === 1) {
    const { os_h, os_v } = getAvailableZones(zone);
    return { os_h: [os_h], os_v: [os_v] };
  }

  if (curing.quantity > 1) {
    const _curing_one_side = {
      ...curing,
      quantity: curing.quantity,
      x_min: 2,
      x_max: 2,
      y_min: 3,
      y_max: 3,
      area_min: 6,
      area_max: 6,
    };

    const { os_h: os_h_one_side, os_v: os_v_one_side } = getAvailableZones([
      _curing_one_side,
    ]);

    let _quantity;
    if (curing.quantity % 2 == 0) {
      _quantity = curing.quantity;
    } else {
      _quantity = curing.quantity + 1;
    }
    // 10,treatment,2,11.52,11.52,3.1,4.8,3.1,4.8,8,outpatient,,5,KPU,10,5
    // 11,injection,3,11.52,11.52,2.4,4.8,2.4,4.8,8,outpatient,,5,KPU,10,5
    // 12,ECG,1,11.52,11.52,2.4,2.4,4.8,4.8,8,outpatient,,5,KPU,9,5

    const _curing_two_side_1 = {
      ...curing,
      quantity: 1,
      x_min: 3.1,
      x_max: _quantity - 1,
      y_min: 3.1,
      y_max: _quantity - 1,
      area_min: 180,
      area_max: 180,
    };
    const _curing_two_side_2 = {
      ...curing,
      quantity: 1,
      x_min: 3,
      x_max: _quantity - 1,
      y_min: 3,
      y_max: _quantity - 1,
      area_min: 60,
      area_max: 60,
    };
    const _curing_two_side_3 = {
      ...curing,
      quantity: 1,
      x_min: 2.1,
      x_max: _quantity - 1,
      y_min: 2.1,
      y_max: _quantity - 1,
      area_min: 2.1 * _quantity,
      area_max: 2.1 * _quantity,
    };
    const { os_h: os_h_two_side, os_v: os_v_two_side } = getAvailableZones([
      _curing_two_side_1,
      _curing_two_side_2,
      // _curing_two_side_3,
    ]);
    return {
      os_h: [os_h_one_side, os_h_two_side],
      os_v: [os_v_one_side, os_v_two_side],
      // os_h: [os_h_two_side],
      // os_v: [os_v_two_side],
    };
  }
};

/**
 *
 * @param {Zone[]} zones
 */
export const all = (zones) => {
  const availableArrangements = {};

  zones.forEach((zone) => {
    availableArrangements[zone[0].zone_id] = {};

    const { os_h, os_v } = (() => {
      if (Number(zone[0].zone_id) === 5) {
        return clinic(zone);
      } else if (Number(zone[0].zone_id) === 7) {
        return operation(zone);
      } else if (Number(zone[0].zone_id) === 10) {
        return curing(zone);
      } else if (Number(zone[0].zone_id) === 11) {
        return curing(zone);
      } else {
        return getAvailableZones(zone);
      }
    })();
    availableArrangements[zone[0].zone_id]["os_h"] = os_h;
    availableArrangements[zone[0].zone_id]["os_v"] = os_v;
  });

  return availableArrangements;
};
