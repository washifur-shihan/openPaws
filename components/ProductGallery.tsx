"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const validImages = images.filter(Boolean);
  const [active, setActive] = useState(validImages[0] ?? "");

  if (validImages.length === 0) {
    return (
      <div className="grid h-[440px] place-items-center rounded-3xl border border-orange-100 bg-orange-50 text-sm font-bold text-cocoa/40">
        No image available
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div className="relative h-[440px] overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-soft">
        <Image
          key={active}
          src={active}
          alt={name}
          fill
          className="object-cover transition-opacity duration-300"
          priority
        />
      </div>

      {/* Thumbnail strip — only shown when there are multiple images */}
      {validImages.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar">
          {validImages.map((image, index) => (
            <button
              key={image}
              onClick={() => setActive(image)}
              aria-label={`View image ${index + 1}`}
              className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                active === image
                  ? "border-cocoa shadow-md"
                  : "border-orange-100 hover:border-orange-300"
              }`}
            >
              <Image src={image} alt={`${name} – image ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
