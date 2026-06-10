"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

interface ImageCarouselProps {
  filenames: string[];
  title: string;
}

const maxListingPhotos = 1;

export function ImageCarousel({ filenames, title }: ImageCarouselProps) {
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const images = filenames.length > 0 ? filenames.slice(0, maxListingPhotos) : ["placeholder.svg"];
  const filename = images[0];
  const missing = failed[filename];

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-md border border-ink/15 bg-[#eee5d7]">
      {missing ? (
        <div className="flex h-full items-center justify-center p-6 text-center text-sm font-semibold text-ink/70">
          Photo unavailable, which is honestly suspicious in its own little way.
        </div>
      ) : (
        <img
          src={`/listings/${filename}`}
          alt={`${title} listing photo`}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => {
            if (process.env.NODE_ENV === "development") {
              console.warn(`Missing listing image: /listings/${filename}`);
            }
            setFailed((current) => ({ ...current, [filename]: true }));
          }}
        />
      )}
    </div>
  );
}
