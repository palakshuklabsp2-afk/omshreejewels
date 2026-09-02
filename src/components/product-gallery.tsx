"use client";

import Image from "next/image";
import { useState } from "react";
import { optimizedImage } from "@/lib/images";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const list = images.length ? images : ["/placeholder-jewellery.svg"];
  const [active, setActive] = useState(0);
  const src = optimizedImage(list[active]);

  return (
    <div className="grid gap-3">
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-gold/20 shadow-lg">
        <Image
          src={src}
          alt={name}
          fill
          priority
          className="object-cover"
          sizes="(max-width:1024px) 100vw, 50vw"
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {list.slice(0, 8).map((img, i) => (
          <button
            key={`${img}-${i}`}
            type="button"
            onClick={() => setActive(i)}
            className={`relative aspect-square rounded-xl overflow-hidden border ${
              i === active ? "border-crimson ring-2 ring-gold/40" : "border-crimson/10"
            }`}
          >
            <Image src={optimizedImage(img)} alt="" fill className="object-cover" sizes="120px" />
          </button>
        ))}
      </div>
    </div>
  );
}
