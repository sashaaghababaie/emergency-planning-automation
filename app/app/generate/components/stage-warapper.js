'use client'

export const StageWrapper = ({ children, setNextPage, setPrevPage }) => {
  return (
    <div className="bg-white p-2 rounded-lg min-h-[500px] flex flex-col">
      <div className="flex-auto">{children}</div>
      <div className="flex gap-8 justify-end">
        <button
          className="text-md text-black  hover:text-zinc-400 transition duration-200 disabled:text-zinc-400"
          disabled={!setPrevPage}
          onClick={setPrevPage}
        >
          {"<"} Back
        </button>
        <button
          onClick={setNextPage}
          disabled={!setNextPage}
          className="p-2 text-md disabled:bg-zinc-300 min-w-[100px] rounded-md text-white bg-black transition duration-200 hover:bg-zinc-700"
        >
          Next
        </button>
      </div>
    </div>
  );
};
