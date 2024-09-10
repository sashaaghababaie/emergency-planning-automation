import PreviewManager from "@/components/preview-wrapper";
import { ProjectContext } from "./project-context";
import { useContext } from "react";

export default function Explore() {
  const { result, config } = useContext(ProjectContext);

  return (
    <div className="bg-white p-2 rounded-lg min-h-[500px] flex flex-col">
      <h1 className="font-bold border-b-[1px] border-black">Explore</h1>
      {!result && (
        <p className="border border-rose-500 mt-2 rounded-lg p-2 text-rose-500 text-sm">
          Please use 'Generate' to produce solutions first.
        </p>
      )}

      {result && <PreviewManager data={{ ...result, grid: config.gird }} />}
    </div>
  );
}
