/**
 *
 * @param {{width:number,
 * height:number,
 * inp_ent: Point,
 * outp_ent: Point,
 * natural_light:{top:boolean, right: boolean, left: boolean, bottom:boolean}}
 * } param0
 * @returns
 */
export const createBoundry = ({
  width,
  height,
  inp_ent,
  outp_ent,
  natural_light,
}) => {
  if (inp_ent.x > width || inp_ent.y > height)
    throw new Error("inp entrance is out of bound");

  if (outp_ent.x > width || outp_ent.y > height)
    throw new Error("outp entrance is out of bound");

  const /** @type {Boundry} */ _boundry = {
      width,
      height,
      natural_light,
      inp_ent,
      outp_ent,
      area: width * height,
    };

  return _boundry;
};

/**
 *
 * @param {Boundry} _boundry
 * @param {Function?} _boundryStyle
 * @param {Function?} _entStyle
 */
export const draw = (p, _boundry, _boundryStyle = null, _entStyle = null) => {
  _boundryStyle ??= () => {
    p.noFill();
    p.stroke(0);
    p.strokeWeight(0.1);
  };

  _entStyle ??= () => {
    p.noFill();
    p.stroke([255, 0, 0]);
    p.strokeWeight(1);
  };

  p.push();
  {
    _boundryStyle();
    p.rect(0, 0, _boundry.width, _boundry.height);

    _entStyle();
    p.point(_boundry.inp_ent.x, _boundry.inp_ent.y);
    p.point(_boundry.outp_ent.x, _boundry.outp_ent.y);
  }
  p.pop()
};
