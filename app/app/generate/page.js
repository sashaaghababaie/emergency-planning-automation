"use client";

import { useState } from "react";
import ProjectProvider from "./components/project-context";
import Config from "./components/config";
import Program from "./components/program";
import Boundry from "./components/boundry";
import Generator from "./components/generator";
import Explore from "./components/explorer";
import { StageWrapper } from "./components/stage-warapper";

export default function Generate() {
  const [page, setPage] = useState("config");

  return (
    <ProjectProvider>
      <div className="flex mb-2 gap-2 w-full">
        <button
          className={`rounded-lg p-2 basis-1/5 ${
            page === "config"
              ? "bg-indigo-500 text-white"
              : "duration-200 transition bg-white text-black hover:bg-indigo-200"
          }`}
          onClick={() => setPage("config")}
        >
          Configuration
        </button>
        <button
          className={`rounded-lg p-2 basis-1/5 ${
            page === "program"
              ? "bg-indigo-500 text-white"
              : "duration-200 transition bg-white text-black hover:bg-indigo-200"
          }`}
          onClick={() => setPage("program")}
        >
          Program
        </button>
        <button
          className={`rounded-lg p-2 basis-1/5 ${
            page === "boundry"
              ? "bg-indigo-500 text-white"
              : "duration-200 transition bg-white text-black hover:bg-indigo-200"
          }`}
          onClick={() => setPage("boundry")}
        >
          Boundry
        </button>
        <button
          className={`rounded-lg p-2 basis-1/5 ${
            page === "generate"
              ? "bg-indigo-500 text-white"
              : "duration-200 transition bg-white text-black hover:bg-indigo-200"
          }`}
          onClick={() => setPage("generate")}
        >
          Generate
        </button>
        <button
          className={`rounded-lg p-2 basis-1/5 ${
            page === "explore"
              ? "bg-indigo-500 text-white"
              : "duration-200 transition bg-white text-black hover:bg-indigo-200"
          }`}
          onClick={() => setPage("explore")}
        >
          Explore
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
        {page === "generate" && (
          <StageWrapper
            setNextPage={() => setPage("explore")}
            setPrevPage={() => setPage("generate")}
          >
            <Generator />
          </StageWrapper>
        )}
        {page === "explore" && <Explore />}
      </div>
    </ProjectProvider>
  );
}
