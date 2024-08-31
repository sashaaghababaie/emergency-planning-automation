/**
 * @typedef {{x:number, y:number}} Point
 *
 * @typedef {{
 * space_name: string,
 * space_id: number
 * space_adj: string,
 * quantity: number,
 * area_max: number,
 * area_min: number,
 * x_min: number,
 * x_max: number,
 * y_min: number,
 * y_max: number,
 * zone_name: string,
 * zone_id: number,
 * zone_adj:  number[],
 * program_type: string
 * placement_priority: string
 * changing_priority: number
 * }}
 * Space
 *
 * @typedef {{
 * space_name: string,
 * space_id: number
 * space_adj: string,
 * zone_name: string,
 * zone_id: number,
 * zone_adj:  number[],
 * space_local_id: string
 * x:number,
 * y:number,
 * w:number,
 * h:number
 * }} CSpace
 *
 * @typedef {Object.<string, Space>} Program
 *
 * @typedef {{area: number, width: number, height: number,
 * natural_light:{top: boolean, right: boolean, left: boolean, bottom: boolean},
 * inp_ent: Point,
 * outp_ent: Point}} Boundry
 *
 * @typedef {Space[]} Zone
 *
 * @typedef {{ program: Program ,zone_id?: number | string, zone_name?: string}}  ZoneQuery
 *
 * @typedef {{p1: Point, p2: Point}} Line
 *
 * @typedef {{
 * createdSpaces: CSpace[],
 * corridor?: {x:number, y:number, w:number, h:number}[],
 * list1?: CSpace[],
 * list2?:CSpace[],
 * vCor_1?: {x:number, y:number, h:number, w:number},
 * vCor_2?: {x:number, y:number, h:number, w:number}
 * }} VirtualZone
 *
 * */
