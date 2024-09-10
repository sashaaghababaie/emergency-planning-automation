"use client";
import { createContext, useEffect, useState } from "react";
import * as Program from "@/api/program-server";

export const ProjectContext = createContext();

export default function ProjectProvider({ children }) {
  const [config, setConfig] = useState({
    gird: {
      module: {
        x: 3,
        y: 3,
      },
    },
    sampling: {
      available: true,
      MAX: 10_000,
    },
  });

  const [result, setResult] = useState(null);
  const [refProgram, setRefProgram] = useState();
  const [program, setProgram] = useState();

  const [p5Props, setP5Props] = useState({
    stage: 0,
    pos0: { x: -1, y: -1 },
    pos1: { x: -1, y: -1 },
    inp_ent_pos: { x: -1, y: -1 },
    outp_ent_pos: { x: -1, y: -1 },
  });

  const [boundry, setBoundry] = useState({
    width: 0,
    height: 0,
    natural_light: { top: true, right: true, bottom: true, left: false },
    inp_ent: { x: 0, y: 0 },
    outp_ent: { x: 0, y: 0 },
  });

  useEffect(() => {
    (async () => {
      const p = await Program.initBaseProgram();
      setProgram(p);
      setRefProgram(p);
    })();
  }, []);
  return (
    <>
      {program && (
        <ProjectContext.Provider
          value={{
            boundry,
            setBoundry,
            config,
            setConfig,
            p5Props,
            setP5Props,
            program,
            setProgram,
            refProgram,
            result,
            setResult,
          }}
        >
          {children}
        </ProjectContext.Provider>
      )}
    </>
  );
}
