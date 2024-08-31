/**
 * Simple Shuffling an array
 * @param {any[]} arr
 * @returns
 */
export const shuffle = (arr) => {
  let i, j, x;

  for (i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = arr[i];
    arr[i] = arr[j];
    arr[j] = x;
  }

  return arr;
};

/**
 * Create two equal array
 * @param {any[]} list
 */
export const splitList = (list, offset = 0) => {
  const list2 = HELPERS.shuffle([...list]);
  const list1 = list2.splice(0, list.length >> 1);

  for (let i = 0; i < offset; i++) {
    const a = list2[0];
    list2.shift();
    list1.push(a);
  }

  return { list1, list2 };
};

/**
 *
 * @param {Number} _n
 * @returns {Number}
 */
export const rounded = (_n) => {
  return Math.ceil(_n * 100) / 100;
};

/**
 *
 * @param {string} _cammaSepStr
 * @returns {number[]}
 */
export const toArray = (_cammaSepStr) => {
  const arr = _cammaSepStr.split(",");
  return arr.map((s) => Number(s.trim()));
};

/**
 *
 * @param {any[]} _arr
 * @param {number[]} _indices
 * @returns
 */
export const removeByGivenIndices = (_arr, _indices) => {
  if (_arr.length < _indices.length)
    throw new Error("cannot remove from array");
  const remain = [];

  _arr.forEach((item, i) => {
    if (i > _arr.length - 1) throw new Error("out of range");
    if (!_indices.includes(i)) remain.push(item);
  });

  return remain;
};

/**
 *
 * @param {{x: number, y:number, w:number, h:number}} rect1
 * @param {{x: number, y:number, w:number, h:number}} rect2
 */
export const rectIntersect = (rect1, rect2) => {
  if (
    rect1.x + rect1.w > rect2.x &&
    rect1.x < rect2.x + rect2.w &&
    rect1.y + rect1.h > rect2.y &&
    rect1.y < rect2.y + rect2.h
  ) {
    return true;
  }
  return false;
};

/**
 *
 * @param {any[]} _arr
 * @param {number} _num
 * @returns
 */
export const sampling = (_type, _arr, _num) => {
  const samples = [];
  if (_type === "random") {
    for (let i = 0; i < _num; i++) {
      const rand = Math.floor(Math.random() * _arr.length);
      samples.push(_arr[rand]);
    }
  }
  return samples;
};
