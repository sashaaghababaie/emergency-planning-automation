class Cell {
  /**
   *
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @param {boolean} used
   * @param {"zone" | "ent_inp" | "ent_out" | "corrridor" | "notUsed" } typeOfUsed
   * @param {number | "none"} usedByZone
   */
  constructor(
    x,
    y,
    w,
    h,
    used = false,
    typeOfUsed = "notUsed",
    usedByZone = "none"
  ) {
    this.x = x;
    this.y = y;
    this.h = h;
    this.w = w;
    this.used = used;
    this.typeOfUsed = typeOfUsed;
    this.usedByZone = usedByZone;
  }

  show(p) {
    p.pop();

    p.noFill();
    p.strokeWeight(0.1);
    p.stroke(256, 0, 0);
    p.rect(this.x, this.y, this.w, this.h);

    p.push();
  }
}

export class Grid {
  /**
   *
   * @param {Boundry} _boundry
   * @param {number} _moduleX
   * @param {number} _moduleY
   */
  constructor(_boundry, _moduleX, _moduleY) {
    /** @type {Cell[][]} */
    this.grid = [];
    this.moduleX = _moduleX;
    this.moduleY = _moduleY;
    this.create(_boundry, _moduleX, _moduleY);
    this.occupied = [];
  }

  /**
   *
   * @param {Boundry} _boundry
   * @param {number} _moduleX
   * @param {number} _moduleY
   */
  create(_boundry, _moduleX, _moduleY) {
    /** @type {Cell[][]} */
    let grid = [];

    for (let i = 0; i < _boundry.width / _moduleX; i++) {
      /** @type {Cell[]} */
      let col = [];

      for (let j = 0; j < _boundry.height / _moduleY; j++) {
        const x = i * _moduleX;
        const y = j * _moduleY;
        col.push(new Cell(x, y, _moduleX, _moduleY));
      }

      grid.push(col);
    }

    this.grid = grid;
    return this;
  }

  show() {
    this.grid.forEach((row) => row.forEach((cell) => cell.show()));

    return this;
  }

  /**
   *
   * @param {{
   * x: number,
   * y:number, w:number,
   * h:number,
   * zoneId: number,
   * type: "zone" | "ent_inp" | "ent_out" | "corrridor" | "notUsed"
   * }} param
   */
  occupyByArea({ x, y, w, h, ...params }) {
    const i = Math.floor(x / this.moduleX);
    const j = Math.floor(y / this.moduleY);

    const occupiedFromStartModuleX = this.moduleX - (x % this.moduleX);
    const realLengthX = occupiedFromStartModuleX + w;
    const xModuleOccpied = Math.ceil(realLengthX / this.moduleX);

    const occupiedFromStartModuleY = this.moduleY - (y % this.moduleY);
    const realLengthY = occupiedFromStartModuleY + h;
    const yModuleOccpied = Math.ceil(realLengthY / this.moduleY);

    for (let _x = 0; _x < xModuleOccpied; _x++) {
      for (let _y = 0; _y < yModuleOccpied; _y++) {
        const cell = this.get(i + _x, j + _y);
        cell.used = true;

        cell.usedByZone = params.zoneId;

        cell.typeOfUsed = params.type;
        this.occupied.push(cell);
      }
    }
  }

  /**
   *
   * @param {number} i
   * @param {number} j
   */
  get(i, j) {
    return this.grid[i][j];
  }
}
