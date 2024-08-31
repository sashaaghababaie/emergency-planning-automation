"use client";

import { useState, useContext } from "react";
import { ProjectContext } from "./project-context";
import { resolveHospital } from "@/api/create";
import PreviewManager from "@/components/preview-wrapper";

export default function Generator() {
  const { config, boundry, program } = useContext(ProjectContext);
  
  const [log, setLog] = useState([]);
  const [showLog, setShowLog] = useState(true);
  const [result, setResult] = useState();

  const keys = Object.keys(program);

  const steps = (() => {
    let arr = [];

    keys.forEach((key) => {
      if (
        program[key].zone_id != 0 &&
        program[key].zone_id != 14 &&
        program[key].zone_id != 100
      ) {
        arr.push(Number(program[key].zone_id));
      }
    });

    return Array.from(new Set(arr))
      .sort((a, b) => a - b)
      .map((i) => i.toString());
  })();

  const logSetter = (msg) => setLog((prev) => [...prev, msg]);

  function handleResolveHospital() {
    logSetter(Math.random());
    try {
      const res = resolveHospital(config, boundry, steps, logSetter, program);
      setResult(res);
    } catch (err) {
      logSetter(err.message);
      logSetter("stop solver...");
    }
  }

  return (
    <div className="bg-white p-2 rounded-lg min-h-[500px] flex flex-col">
      <h1 className="font-bold border-b-[1px] border-black">Generate</h1>
      {boundry.width === 0 && (
        <p className="rounded-lg border border-rose-500 p-2 text-rose-500 text-sm mt-2">
          Please set the boundry before start generating.
        </p>
      )}
      {Object.keys(program).length === 0 && (
        <p className="rounded-lg border border-rose-500 p-2 text-rose-500 text-sm mt-2">
          Cannot generate with empty program.
        </p>
      )}
      {Object.keys(program).length > 0 && boundry.width > 0 && (
        <div className="p-2">
          <h2 className="border-b-[0.5px] text-sm">
            Log{" "}
            <span
              className="text-xs text-blue-400 hover:text-blue-200 cursor-pointer"
              onClick={() => setShowLog(!showLog)}
            >
              {showLog ? "Hide" : "Show"}
            </span>
          </h2>
          {showLog && (
            <div className="overflow-y-auto p-2 border rounded-lg h-48">
              {log.length > 0 &&
                log.map((l, i) => (
                  <p className="text-xs" key={`log_${i}`}>
                    {l}
                  </p>
                ))}
            </div>
          )}
          <button onClick={() => handleResolveHospital()}>Generate</button>
          {result && <PreviewManager data={result} />}
        </div>
      )}
    </div>
  );
}
