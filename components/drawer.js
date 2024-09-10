"use client";

export default function DrawerRight({ show, setter, children }) {
  const classNameParent =
    "bg-white rounded-tl-xl rounded-bl-xl d h-[100vh] w-[300px] transition-[margin-right] duration-200 fixed bottom-0 right-0 z-50 overflow-auto";

  const appendClassParent = show ? "mr-0" : "mr-[-300px]";
  return (
    <div>
      <div className={`${classNameParent} ${appendClassParent}`}>
        {children}
      </div>
      {show ? (
        <div
          className="flex fixed top-0 right-0 bottom-0 left-0 bg-black/50 z-40"
          onClick={() => {
            setter((oldVal) => !oldVal);
          }}
        />
      ) : (
        <></>
      )}
    </div>
  );
}
