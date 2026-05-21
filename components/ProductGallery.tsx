"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(images[0]);
  return (
    <div>
      <div className="relative h-[440px] overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-soft">
        <Image src={active} alt={name} fill className="object-cover" priority />
      </div>
      <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar">
        {images.map((image) => (
          <button
            key={image}
            onClick={() => setActive(image)}
            className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl border ${active === image ? "border-cocoa" : "border-orange-100"}`}
          >
            <Image src={image} alt={name} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
