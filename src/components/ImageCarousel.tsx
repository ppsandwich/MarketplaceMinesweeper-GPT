"use client";

/* eslint-disable @next/next/no-img-element */
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ImageCarouselProps {
  filenames: string[];
  title: string;
}

const maxListingPhotos = 3;

export function ImageCarousel({ filenames, title }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const images = filenames.length > 0 ? filenames.slice(0, maxListingPhotos) : ["placeholder.svg"];
  const filename = images[index] ?? images[0];
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
          alt={`${title} listing photo ${index + 1}`}
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

      {images.length > 1 && (
        <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between">
          <button
            type="button"
            aria-label="Previous photo"
            className="grid h-9 w-9 place-items-center rounded-full bg-paper/90 text-ink shadow-card"
            onClick={() => setIndex((current) => (current - 1 + images.length) % images.length)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            className="grid h-9 w-9 place-items-center rounded-full bg-paper/90 text-ink shadow-card"
            onClick={() => setIndex((current) => (current + 1) % images.length)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
