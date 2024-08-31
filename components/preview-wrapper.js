"use client";

import { useState } from "react";
import HospitalPreview from "@/components/hospital-preview";

export default function PreviewManager({ data }) {
  const [index, setIndex] = useState(0);

  return (
    <>
      <HospitalPreview
        data={{
          ...data,
          design: data.result[index],
        }}
      />
      <button onClick={() => setIndex(index + 1)}>next</button>
    </>
  );
}
