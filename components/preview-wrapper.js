"use client";

import { useState, useEffect } from "react";
import HospitalPreview from "@/components/hospital-preview";
import HospitalPreviewList from "./hospital-preview-list";
import { colors } from "@/scripts/colors";
import DrawerRight from "./drawer";
import { LuFilter } from "react-icons/lu";

const scales = [0.5, 0.75, 1, 1.25, 1.5, 2];
const colorKeys = Object.keys(colors);
// const hexColors = Object.values(colors).map(
//   (c) => `#${c.map((cc) => cc.toString(16)).join("")}`
// );

const filters = [
  "Corridor validation",
  "Entrance validation",
  "Cor. Length validation (soon)",
  "Sort by Corridor Area (soon)",
  "Reset",
];

export default function PreviewManager({ data }) {
  const [filterd, setFiltered] = useState(data.result);
  const [showDrawer, setShowDrawer] = useState(false);
  const [index, setIndex] = useState(0);
  const [showGrid, setShowGird] = useState(false);
  // const [showCoriddor, setShowCorridor] = useState(false);
  const [mode, setMode] = useState("iterate");
  const [input, setInput] = useState(0);
  const [list, setList] = useState([]);
  const [scale, setScale] = useState(1);
  const [spaceNames, setSpaceName] = useState("legend");
  const [legend, setLegend] = useState("");
  const [selectedFilter, setSelectedFilter] = useState();

  const [save, setSave] = useState(false);

  const removeFromList = (_i) => {
    const newList = [...list].filter((l, i) => i !== _i);
    setList(newList);
  };

  const runFilter = () => {
    if (selectedFilter === "Reset") {
      setIndex(0);
      setFiltered(data.result);
    }
    if (selectedFilter === "Corridor validation") {
      // mock
      const res = [...data.result];
      const _filtered = res.slice(1, Math.floor(data.result.length / 2));
      setIndex(0);
      setFiltered(_filtered);
    }
    if (selectedFilter === "Entrance validation") {
      const { boundry } = data;
      const { inp_ent: a, outp_ent: b } = boundry;
      const dist = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

      if (dist < 10 || dist > 15) {
        // need to implement real function for each option
        setIndex(0);
        setFiltered([]);
      }
    }
    setShowDrawer(false);
  };

  useEffect(() => {
    if (!save) return;
    setSave(false);
  }, [save]);

  const setInputVal = (e) => {
    if (!isNaN(Number(e.target.value))) {
      setInput(Number(e.target.value));
    }
  };

  const addToList = () => {
    if (filterd.length === 0) return;
    const _list = [...list, { index, design: filterd[index] }];
    setList(_list);
  };

  const clearList = () => setList([]);

  const goTo = () => {
    if (input < filterd.length) setIndex(input);
  };

  const nextIndex = () => {
    if (index + 1 > filterd.length - 1) setIndex(0);
    else setIndex(index + 1);
  };

  const prevIndex = () => {
    if (index - 1 >= 0) setIndex(index - 1);
    else setIndex(filterd.length - 1);
  };

  const getRandom = () => {
    if (filterd.length > 0) {
      setIndex(Math.floor(Math.random() * filterd.length));
    }
  };

  return (
    <>
      <DrawerRight show={showDrawer} setter={setShowDrawer}>
        <div className="p-2">
          {filters.map((f, i) => (
            <button
              key={`key_${i}`}
              onClick={() => setSelectedFilter(f)}
              className={`my-2 w-full rounded-md text-white text-xs py-1 ${
                f === selectedFilter
                  ? "bg-indigo-700"
                  : "bg-black hover:bg-zinc-700"
              } `}
            >
              {f}
            </button>
          ))}
          <button
            onClick={runFilter}
            className="mt-12 w-full rounded-md text-xs py-1 bg-blue-700 hover:bg-blue-500 text-white"
          >
            {"Run >"}
          </button>
        </div>
      </DrawerRight>
      <div>
        <h2 className="mt-4 border-b-[0.5px] text-indigo-500 border-black/50">
          Preview setting
        </h2>
        <div className="flex gap-4 mt-2 text-xs">
          <button
            className="py-1 w-40 shrink-0 px-2 rounded-md bg-black hover:bg-zinc-700 text-white"
            onClick={() => setShowGird(!showGrid)}
          >
            Show/hide grid
          </button>
          <div className="flex justify-center items-center gap-[2px] flex-wrap">
            <p>Scale: </p>
            {scales.map((s, i) => (
              <div key={`scale-${i}`}>
                <button
                  className={`py-1 w-12 px-2 rounded-md text-white ${
                    scale === s ? "bg-indigo-600" : "bg-black hover:bg-zinc-700"
                  }`}
                  onClick={() => setScale(s)}
                >
                  x{s}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-4 mt-2 text-xs">
          <button
            className="py-1 w-40 px-2 rounded-md bg-black hover:bg-zinc-700 text-white"
            onClick={() =>
              setSpaceName(spaceNames === "name" ? "legend" : "name")
            }
          >
            Show/hide Space Names
          </button>
        </div>
      </div>

      <h2 className="mt-6 border-b-[0.5px] text-indigo-500 border-black/50">
        Explore
      </h2>
      <div className="flex mt-4">
        <div className="h-12">
          <button
            className={`border-b border-black px-4 ${
              mode === "iterate"
                ? "border-b-4 text-indigo-600 border-indigo-600"
                : "hover:text-zinc-500 border-zinc-500"
            }`}
            onClick={() => setMode("iterate")}
          >
            Iterate
          </button>
        </div>
        <div className="h-12">
          <button
            className={`border-b border-black px-4 ${
              mode === "comparison"
                ? "border-b-4 text-indigo-600 border-indigo-600"
                : "hover:text-zinc-500 border-zinc-500"
            }`}
            onClick={() => setMode("comparison")}
          >
            Comparison
          </button>
        </div>
      </div>
      {mode === "iterate" && (
        <>
          <div className="flex items-center gap-2 text-xs mt-2">
            <button
              className="p-1 w-6 rounded-md bg-black hover:bg-zinc-700 text-white"
              onClick={prevIndex}
            >
              {"<"}
            </button>
            <p className="text-xs w-32 text-center">
              Option no.:{" "}
              {filterd.length === 0 ? 0 : `${index}/${filterd.length - 1}`}
            </p>

            <button
              className="p-1 w-6 rounded-md bg-black hover:bg-zinc-700 text-white"
              onClick={nextIndex}
            >
              {">"}
            </button>

            <button
              className="py-1 w-16 px-2 rounded-md bg-black hover:bg-zinc-700 text-white"
              onClick={getRandom}
            >
              Random
            </button>
            <button
              className="flex items-center gap-2 py-1 w-20 px-2 rounded-md bg-indigo-700 hover:bg-indigo-500 text-white"
              onClick={() => setShowDrawer(true)}
            >
              <LuFilter />
              Filter
            </button>
            <button
              className="py-1 w-20 px-2 rounded-md bg-emerald-500 hover:bg-emerald-300 text-white"
              onClick={() => setSave(true)}
            >
              Save JPG
            </button>
          </div>
          <div className="flex gap-2 text-xs items-center h-12 py-2">
            <input
              value={input}
              onChange={setInputVal}
              className="h-6 rounded-md my-2 text-center border-[1px] border-indigo-200 bg-indigo-50 w-48"
            />
            <button
              className="py-1 w-16 px-2 rounded-md bg-black hover:bg-zinc-700 text-white"
              onClick={goTo}
            >
              Show
            </button>
            <button
              className="py-1 w-20 rounded-md bg-indigo-700 px-2 hover:bg-indigo-500 text-white"
              onClick={addToList}
            >
              + Add to list
            </button>
            <button
              className="hover:text-rose-300 text-rose-500"
              onClick={clearList}
            >
              Clear list
            </button>
            {list.length > 0 && (
              <p className="text-blue-700">
                {list.length} items added to the list
              </p>
            )}
          </div>
          <h2 className="text-sm mb-2">Legends</h2>
          <div className="flex gap-1 flex-wrap text-xs mb-2">
            {Object.values(colors).map((c, i) => (
              <div
                key={`leg_${i}`}
                onClick={() =>
                  setLegend(legend === colorKeys[i] ? "" : colorKeys[i])
                }
                className={`flex gap-1 w-28 p-1 rounded-lg cursor-pointer ${
                  legend === colorKeys[i]
                    ? "bg-indigo-200"
                    : "hover:bg-indigo-50 bg-transparent"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-md ${
                    c[0] === 255 && c[1] === 255 && "border"
                  }`}
                  style={{ background: `rgb(${c[0]},${c[1]},${c[2]})` }}
                ></div>
                <p>{colorKeys[i]}</p>
              </div>
            ))}
          </div>
          {filterd.length === 0 && (
            <p className="text-sm text-blue-700">
              No solutions found in current filter
            </p>
          )}
          {filterd.length > 0 && (
            <div className="flex justify-center">
              <HospitalPreview
                data={{
                  index,
                  saving: save,
                  grid: data.grid,
                  showGrid,
                  boundry: data.boundry,
                  result: filterd,
                  scale,
                  legend,
                  name: spaceNames,
                  design: filterd[index],
                }}
              />
            </div>
          )}
        </>
      )}
      {mode === "comparison" && (
        <div className="flex flex-wrap justify-center gap-2 min-h-64 items-center">
          {list.length === 0 && (
            <p className="text-sm text-blue-600">List is empty</p>
          )}
          {list.length > 0 &&
            list.map((l, i) => (
              <div key={`alt-${i}`}>
                <p className="text-xs flex gap-2">
                  <span
                    className="text-rose-500 hover:text-rose-300 text-xs cursor-pointer"
                    onClick={() => removeFromList(i)}
                  >
                    Remove
                  </span>
                  No. {l.index}
                </p>
                <HospitalPreviewList
                  data={{
                    showGrid,
                    ...data,
                    scale,
                    design: l.design,
                  }}
                />
              </div>
            ))}
        </div>
      )}
    </>
  );
}
