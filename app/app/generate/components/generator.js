"use client";

import { useState, useContext, useEffect, useMemo, useRef } from "react";
import { ProjectContext } from "./project-context";
import { asyncResolveHospital } from "@/api/create";
import { async_solve_algorythm_a } from "@/scripts/async-solver_a";

import MoonLoader from "react-spinners/MoonLoader";

export default function Generator() {
  // Context
  const { config, boundry, program, setResult, result } =
    useContext(ProjectContext);

  // Refs
  const time = useRef("");

  // States
  const [log, setLog] = useState([]);
  const [error, setError] = useState(false);
  const [start, setStartSolver] = useState(false);
  const [finished, setFinished] = useState(false);
  const [showLog, setShowLog] = useState(true);
  const [resBoundry, setBoundry] = useState();
  const [args, setArgs] = useState([]);
  const [semiFinished, setSemiFinished] = useState(false);
  const [currentState, setCurrentState] = useState({
    step: -1,
    placed_arr: [],
  });

  const keys = Object.keys(program);

  const steps = useMemo(() => {
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
  }, []);

  const resetSolver = () => {
    setSemiFinished(false);
    setFinished(false);
    setError(false);
    setResult(null);
    setCurrentState({ step: -1, placed_arr: [] });
  };

  const logSetter = (msgs) => setLog((prev) => [...prev, ...msgs]);

  async function handleResolveHospital() {
    const date = new Date().getTime();
    time.current = date;

    try {
      setStartSolver(true);
      const res = asyncResolveHospital(config, boundry, logSetter, program);
      setBoundry(res.boundry);
      setArgs(res.args);
    } catch (err) {
      setStartSolver(false);
      setError(true);
      logSetter([{ message: err.message, type: "error" }]);
      logSetter([{ message: "Stop solver...", type: "error" }]);
    }
  }

  useEffect(() => {
    if (args.length === 0) return;
    setTimeout(
      () =>
        (async () => {
          try {
            const { placed_arr, log: _log } = await async_solve_algorythm_a(
              ...args,
              0,
              currentState.placed_arr
            );
            setCurrentState((prev) => ({
              step: prev.step + 1,
              placed_arr,
            }));

            logSetter(_log);
          } catch (err) {
            setError(true);
            setStartSolver(false);
            logSetter([{ message: err.message, type: "error" }]);
            logSetter([{ message: "Stop solver...", type: "error" }]);
          }
        })(),
      5
    );
  }, [args]);

  useEffect(() => {
    if (currentState.step === -1) return;

    if (currentState.step === steps.length) {
      const endedTime = new Date();
      let difference = endedTime.getTime() - time.current;

      const hoursDifference = Math.floor(difference / 1000 / 60 / 60);
      difference -= hoursDifference * 1000 * 60 * 60;

      const minutesDifference = Math.floor(difference / 1000 / 60);
      difference -= minutesDifference * 1000 * 60;

      let secondsDifference = Math.floor(difference / 1000);

      const differeneString = difference.toString();
      const msDifference =
        differeneString.length <= 3
          ? differeneString
          : differeneString.slice(
              differeneString.length - 4,
              differeneString.length - 1
            );

      const resolvedTime = `${hoursDifference}h : ${minutesDifference}m : ${secondsDifference}s : ${msDifference}ms`;
      time.current = resolvedTime;

      logSetter([{ message: `Finished in ${resolvedTime}`, type: "action" }]);
      setStartSolver(false);
      setResult({ boundry: resBoundry, result: currentState.placed_arr });
      setFinished(true);
      return;
    }

    setTimeout(
      () =>
        (async () => {
          try {
            const isEnd = currentState.step === steps.length - 1 ? true : false;

            const { placed_arr, log: _log } = await async_solve_algorythm_a(
              ...args,
              steps[currentState.step],
              currentState.placed_arr,
              isEnd
            );

            if (placed_arr.length === 0) {
              setResult({
                boundry: resBoundry,
                result: currentState.placed_arr,
              });
              const endedTime = new Date();
              let difference = endedTime.getTime() - time.current;

              const hoursDifference = Math.floor(difference / 1000 / 60 / 60);
              difference -= hoursDifference * 1000 * 60 * 60;

              const minutesDifference = Math.floor(difference / 1000 / 60);
              difference -= minutesDifference * 1000 * 60;

              let secondsDifference = Math.floor(difference / 1000);

              const differeneString = difference.toString();
              const msDifference =
                differeneString.length <= 3
                  ? differeneString
                  : differeneString.slice(
                      differeneString.length - 4,
                      differeneString.length - 1
                    );

              const resolvedTime = `${hoursDifference}h : ${minutesDifference}m : ${secondsDifference}s : ${msDifference}ms`;
              time.current = resolvedTime;

              setSemiFinished(true);
              setStartSolver(false);
              logSetter([
                { message: `Finished in ${resolvedTime}`, type: "action" },
                { message: `Some Zones are not resolved`, type: "action" },
              ]);
              return;
            }

            setCurrentState((prev) => ({
              step: prev.step + 1,
              placed_arr,
            }));

            logSetter(_log);
          } catch (err) {
            setError(true);
            setStartSolver(false);
            logSetter([{ message: err.message, type: "error" }]);
            logSetter([{ message: "Stop solver...", type: "error" }]);
          }
        })(),
      5
    );
  }, [currentState]);

  return (
    <div>
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

          {showLog && <Logger log={log} />}
          <div className="flex justify-center">
            {((result && result?.result?.length) || error) > 0 && (
              <button
                disabled={start}
                className="disabled:bg-zinc-300 w-[400px] justify-center items-center p-2 text-lg bg-blue-700 text-white rounded-lg my-4 flex gap-2 transition duration-200 hover:bg-blue-600"
                onClick={resetSolver}
              >
                <p>Clear and Regenerate</p>{" "}
              </button>
            )}
            {!result && !error && (
              <button
                disabled={start}
                className="disabled:bg-zinc-300 w-[400px] justify-center items-center p-2 text-lg bg-blue-700 text-white rounded-lg my-4 flex gap-2 transition duration-200 hover:bg-blue-600"
                onClick={() => handleResolveHospital()}
              >
                <p>Generate </p>{" "}
                <MoonLoader color={"#fff"} loading={start} size={20} />
              </button>
            )}
          </div>
          {start && (
            <p className="text-sm text-blue-700 text-center">
              Please do not change the tabs or close the window
            </p>
          )}
          {semiFinished && (
            <p className="text-blue-500 text-center">
              {currentState.placed_arr.length} solutions resolved in{" "}
              {time.current}, Some zones remain unresolved.
            </p>
          )}
          {finished && (
            <p className="text-emerald-500 text-center">
              {currentState.placed_arr.length} solutions successfully resolved
              in {time.current}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const Logger = ({ log }) => {
  return (
    <div className="overflow-y-auto p-2 border rounded-lg h-48">
      {log.length > 0 &&
        log.map((l, i) => (
          <p
            className={`${
              l.type === "error"
                ? "text-rose-500"
                : l.type === "success"
                ? "text-emerald-500"
                : l.type === "action"
                ? "text-blue-600"
                : "text-black"
            } text-xs`}
            key={`log_${i}`}
          >
            {l.message}
          </p>
        ))}
    </div>
  );
};
