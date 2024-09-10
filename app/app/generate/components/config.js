"use client";
import { useContext } from "react";
import { ProjectContext } from "./project-context";

export default function Config() {
  const { config, setConfig } = useContext(ProjectContext);

  const setConfigGrid = (_dir, _val) => {
    const _config = JSON.parse(JSON.stringify(config));
    if (!isNaN(Number(_val))) {
      _config.gird.module[_dir] = Number(_val);
      setConfig(_config);
    }
  };

  const setUseSampling = (e) => {
    const _config = JSON.parse(JSON.stringify(config));
    if (e.target.checked) {
      _config.sampling.available = true;
    } else {
      _config.sampling.available = false;
    }
    setConfig(_config);
  };

  const setMaxSampling = (e) => {
    const _config = JSON.parse(JSON.stringify(config));
    if (!isNaN(Number(e.target.value))) {
      _config.sampling.MAX = Number(e.target.value);
      setConfig(_config);
    }
  };

  return (
    <div>
      <h1 className="font-bold border-b-[1px] border-black">Configuration</h1>
      <div className="p-2">
        <section className="mt-2">
          <h2 className="border-b-[0.5px] text-indigo-500 border-black/50">Grid</h2>
          <div className="flex gap-4 text-sm mt-2">
            <div className="flex gap-2">
              <label>Module Width</label>
              <input
                onChange={(e) => setConfigGrid("x", e.target.value)}
                value={config.gird.module.x}
                className="text-center px-2 leading-tight border-[1px] border-indigo-300 bg-indigo-50 rounded-md w-[50px]"
              />
            </div>
            <div className="flex gap-2">
              <label>Module Height</label>
              <input
                onChange={(e) => setConfigGrid("y", e.target.value)}
                value={config.gird.module.y}
                className="text-center px-2 leading-tight border-[1px] border-indigo-300 bg-indigo-50 rounded-md w-[50px]"
              />
            </div>
          </div>
        </section>
        <section className="mt-6">
          <h2 className="border-b-[0.5px] text-indigo-500 border-black/50">Sampling</h2>
          <div className="text-sm mt-2">
            <div className="flex gap-2">
              <label>Use sampling</label>
              <input
                type="checkbox"
                checked={config.sampling.available}
                onChange={setUseSampling}
                className="accent-indigo-600"
              />
            </div>
            <div className="flex gap-2 mt-1">
              <label>MAX sampling</label>
              <input
                onChange={setMaxSampling}
                value={config.sampling.MAX}
                className="text-center px-2 leading-tight border-[1px] border-indigo-300 bg-indigo-50 rounded-md w-[100px]"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
