"use server";
import * as HELPERS from "@/scripts/helpers";
import csv from "csvtojson/v2";
import path from "path";

const PROGRAM_PATH = "db/program.csv";

function getProgramPath() {
  return path.resolve(".", PROGRAM_PATH);
}

async function readRefProgram() {
  const program_path = getProgramPath();
  return await csv().fromFile(program_path);
}

async function readRefProgramAsObject() {
  const program = await readRefProgram();
  const programObj = {};
  program.forEach((p, i) => (programObj[`${i}`] = p));
  return programObj;
}

function cleanProgram(_programObj) {
  const programObj = JSON.parse(JSON.stringify(_programObj));

  for (let key in _programObj) {
    programObj[key].quantity = Number(programObj[key].quantity);
    programObj[key].area_min = Number(programObj[key].area_min);
    programObj[key].area_max = Number(programObj[key].area_max);
    programObj[key].x_min = Number(programObj[key].x_min);
    programObj[key].x_max = Number(programObj[key].x_max);
    programObj[key].y_min = Number(programObj[key].y_min);
    programObj[key].y_max = Number(programObj[key].y_max);
    programObj[key].zone_adj = HELPERS.toArray(programObj[key].zone_adj);
    programObj[key].space_adj = HELPERS.toArray(programObj[key].space_adj);
  }

  return programObj;
}

export async function initUserProgram(_program) {}

export async function initBaseProgram() {
  const program = await readRefProgramAsObject();
  return cleanProgram(program);
}
