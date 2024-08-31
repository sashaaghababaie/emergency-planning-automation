"use client";

import { useState, useContext } from "react";
import { ProjectContext } from "./project-context";

export default function Program() {
  const { program, refProgram, setProgram } = useContext(ProjectContext);

  const setQuantity = (key, e) => {
    const _program = { ...refProgram };

    if (!isNaN(Number(e.target.value))) {
      _program[key].quantity = Number(e.target.value);
      setProgram(_program);
    }
  };

  const [checkeds, setCheckeds] = useState([...Object.keys(program)]);

  const handleCheck = (e) => {
    let updatedList = [...checkeds];
    if (e.target.checked) {
      updatedList = [...checkeds, e.target.value];
    } else {
      updatedList = checkeds.filter((c) => c !== e.target.value);
    }
    setCheckeds(updatedList);
    const newProgram = {};

    updatedList.forEach((k) => {
      if (program.hasOwnProperty(k)) {
        newProgram[k] = program[k];
      } else {
        newProgram[k] = refProgram[k];
      }
    });
    setProgram(newProgram);
  };

  const checkAll = () => {
    const updatedList = [...Object.keys(refProgram)];
    setCheckeds(updatedList);
    const newProgram = {};

    updatedList.forEach((k) => {
      if (program.hasOwnProperty(k)) newProgram[k] = program[k];
      else newProgram[k] = refProgram[k];
    });

    setProgram(newProgram);
  };

  const uncheckAll = () => {
    setCheckeds([]);
    setProgram({});
  };

  return (
    <div>
      <h1 className="font-bold border-b-[1px] border-black">Program</h1>
      <div className="p-2 text-sm">
        <div className="flex gap-2">
          <button
            className="bg-black text-white text-xs p-2 rounded-lg hover:bg-zinc-700"
            onClick={checkAll}
          >
            Check all
          </button>
          <button
            className="bg-black text-white text-xs p-2 rounded-lg hover:bg-zinc-700"
            onClick={uncheckAll}
          >
            Uncheck All
          </button>
        </div>
        <div className="flex border-b-[0.5px] border-black mb-2">
          <h2 className="basis-1/3">Space name</h2>
          <h2 className="basis-1/2">Quantity</h2>
        </div>
        {Object.keys(refProgram).map((k, i) => (
          <div key={"program_" + i}>
            <ListItem
              k={k}
              data={refProgram[k]}
              setter={setQuantity}
              handleCheck={handleCheck}
              checked={checkeds.includes(k)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
const ListItem = ({ data, setter, k, checked, handleCheck }) => {
  return (
    <div className="flex my-1">
      <div className="basis-1/3">
        <input
          value={k}
          type="checkbox"
          checked={checked}
          className="mr-2 accent-black"
          onChange={handleCheck}
        />
        {data.space_name}
      </div>
      <div className="basis-1/2">
        <input
          disabled={!checked}
          className="w-12 border text-center rounded-lg disabled:bg-zinc-200 disabled:text-zinc-400"
          value={data.quantity}
          onChange={(e) => setter(k, e)}
        />
      </div>
    </div>
  );
};
