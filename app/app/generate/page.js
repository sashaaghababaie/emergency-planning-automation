"use client";

import { useState } from "react";
import ProjectProvider from "./components/project-context";
import Config from "./components/config";
import Program from "./components/program";
import Boundry from "./components/boundry";
import Generator from "./components/generator.js";
import { StageWrapper } from "./components/stage-warapper";

export default function Generate() {
  const [page, setPage] = useState("config");

  return (
    <ProjectProvider>
      <div className="flex mb-2 gap-2 w-full">
        <button
          className={`rounded-lg p-2 basis-1/4 ${
            page === "config"
              ? "bg-emerald-300 text-white"
              : "duration-200 transition bg-white text-black hover:bg-zinc-300"
          }`}
          onClick={() => setPage("config")}
        >
          Configuration
        </button>
        <button
          className={`rounded-lg p-2 basis-1/4 ${
            page === "program"
              ? "bg-emerald-300 text-white"
              : "duration-200 transition bg-white text-black hover:bg-zinc-300"
          }`}
          onClick={() => setPage("program")}
        >
          Program
        </button>
        <button
          className={`rounded-lg p-2 basis-1/4 ${
            page === "boundry"
              ? "bg-emerald-300 text-white"
              : "duration-200 transition bg-white text-black hover:bg-zinc-300"
          }`}
          onClick={() => setPage("boundry")}
        >
          Boundry
        </button>
        <button
          className={`rounded-lg p-2 basis-1/4 ${
            page === "generate"
              ? "bg-emerald-300 text-white"
              : "duration-200 transition bg-white text-black hover:bg-zinc-300"
          }`}
          onClick={() => setPage("generate")}
        >
          Generate
        </button>
      </div>
      <div className="w-full">
        {page === "config" && (
          <StageWrapper setNextPage={() => setPage("program")}>
            <Config />
          </StageWrapper>
        )}
        {page === "program" && (
          <StageWrapper
            setNextPage={() => setPage("boundry")}
            setPrevPage={() => setPage("config")}
          >
            <Program />
          </StageWrapper>
        )}{" "}
        {page === "boundry" && (
          <StageWrapper
            setNextPage={() => setPage("generate")}
            setPrevPage={() => setPage("program")}
          >
            <Boundry />
          </StageWrapper>
        )}
        {page === "generate" && <Generator />}
      </div>
    </ProjectProvider>
  );
}
