"use client";

import { useState } from "react";
import HospitalPreview from "@/components/hospital-preview";
import HospitalPreviewList from "./hospital-preview-list";

const scales = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function PreviewManager({ data }) {
  const [index, setIndex] = useState(0);
  const [showGrid, setShowGird] = useState(false);
  const [showCoriddor, setShowCorridor] = useState(false);
  const [mode, setMode] = useState("iterate");
  const [input, setInput] = useState(0);
  const [list, setList] = useState([]);
  const [scale, setScale] = useState(1);

  const setInputVal = (e) => {
    if (!isNaN(Number(e.target.value))) {
      setInput(Number(e.target.value));
    }
  };

  const addToList = () => {
    const _list = [...list, index];
    setList(_list);
  };
  const clearList = () => setList([]);

  const goTo = () => {
    if (input < data.result.length) setIndex(input);
  };

  const nextIndex = () => {
    if (index + 1 > data.result.length - 1) {
      setIndex(0);
    } else {
      setIndex(index + 1);
    }
  };

  const prevIndex = () => {
    if (index - 1 >= 0) {
      setIndex(index - 1);
    } else {
      setIndex(data.result.length - 1);
    }
  };

  const getRandom = () => {
    if (data.result.length > 0) {
      setIndex(Math.floor(Math.random() * data.result.length));
    }
  };

  return (
    <>
      <div>
        <h2 className="mt-4 border-b-[0.5px] text-indigo-500 border-black/50">
          Preview setting
        </h2>
        <div className="flex gap-4 mt-2 text-xs">
          <button
            className="py-1 px-2 rounded-md bg-black hover:bg-zinc-700 text-white"
            onClick={() => setShowGird(!showGrid)}
          >
            Show/hide grid
          </button>
          <div className="flex justify-center items-center gap-2">
            <p>Scale: </p>
            {scales.map((s, i) => (
              <div key={`scale-${i}`}>
                <button
                  className="py-1 px-2 rounded-md bg-black hover:bg-zinc-700 text-white"
                  onClick={() => setScale(s)}
                >
                  x{s}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="mt-10 border-b-[0.5px] text-indigo-500 border-black/50">
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
            <p className="text-xs">
              Option no.: {index}/{data.result.length - 1}
            </p>

            <button
              className="p-1 w-6 rounded-md bg-black hover:bg-zinc-700 text-white"
              onClick={nextIndex}
            >
              {">"}
            </button>

            <button
              className="py-1 px-2 rounded-md bg-black hover:bg-zinc-700 text-white"
              onClick={getRandom}
            >
              Random
            </button>
          </div>
          <div className="flex gap-2 text-xs items-center h-12 py-2">
            <input
              value={input}
              onChange={setInputVal}
              className="h-6 rounded-md my-2 text-center border-[1px] border-indigo-200 bg-indigo-50 w-48"
            />
            <button
              className="py-1 px-2 rounded-md bg-black hover:bg-zinc-700 text-white"
              onClick={goTo}
            >
              Show
            </button>
            <button
              className="py-1 rounded-md bg-indigo-700 px-2 hover:bg-indigo-500 text-white"
              onClick={addToList}
            >
              + Add to list
            </button>
            <button
              className=" hover:text-rose-300 text-rose-500"
              onClick={clearList}
            >
              Clear list
            </button>
          </div>

          <HospitalPreview
            data={{
              showGrid,
              ...data,
              scale,
              design: data.result[index],
            }}
          />
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
                <p className="text-xs">No. {l}</p>
                <HospitalPreviewList
                  data={{
                    showGrid,
                    ...data,
                    scale,
                    design: data.result[l],
                  }}
                />
              </div>
            ))}
        </div>
      )}
    </>
  );
}
