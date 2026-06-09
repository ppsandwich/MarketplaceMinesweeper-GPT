"use client";

/* eslint-disable @next/next/no-img-element */
import { AlertTriangle, Flag, Minus, Plus, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { signalLabels } from "@/data/signalLabels";
import type { GameStatus, Tile } from "@/types/game";
import type { MarketplaceListing } from "@/types/listing";
import { ImageCarousel } from "@/components/ImageCarousel";

interface ListingModalProps {
  tile: Tile;
  listing: MarketplaceListing;
  status: GameStatus;
  onClose: () => void;
  onOpenTile: (tileId: string) => void;
  onToggleFlag: (tileId: string) => void;
  onSetSuspicionCount: (tileId: string, value: number) => void;
  onReplay: () => void;
  gameOverMessage: string | null;
}

function avatarLabel(type: MarketplaceListing["sellerAvatarType"]) {
  const labels = {
    face: "ID",
    object: "OBJ",
    blank: "□",
    logo: "LOG",
    pet: "PET",
    ai_weird: "AI"
  };
  return labels[type];
}

function avatarAlt(type: MarketplaceListing["sellerAvatarType"], sellerName: string): string {
  if (type === "face") return `${sellerName} profile photo`;
  if (type === "blank") return `${sellerName} profile has no photo`;
  return `${sellerName} profile photo is not a face`;
}

export function ListingModal({
  tile,
  listing,
  status,
  onClose,
  onOpenTile,
  onToggleFlag,
  onSetSuspicionCount,
  onReplay,
  gameOverMessage
}: ListingModalProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const isScammed = status === "lost" && tile.state === "exploded";
  const showGameOverOverlay = status === "lost" && (tile.state === "exploded" || gameOverMessage !== null);
  const reportDisabled = tile.state === "opened" || tile.state === "false_report" || status === "won" || status === "lost";
  const note = tile.playerSuspicionCount;

  useEffect(() => {
    setAvatarFailed(false);
  }, [listing.id, listing.sellerAvatarFilename]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="modal-panel relative max-h-[94vh] w-full overflow-y-auto rounded-t-lg bg-paper shadow-card sm:max-w-4xl sm:rounded-lg">
        <div className="grid gap-0 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="bg-[#e8e0d2] p-4 sm:p-5">
            <ImageCarousel filenames={listing.imageFilenames} title={listing.title} />
          </div>

          <div className="relative p-5 sm:p-6">
            <button
              type="button"
              aria-label="Close listing"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-ink/15 bg-white"
              onClick={onClose}
            >
              <X size={18} />
            </button>

            <div className="pr-10">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-moss">Marketplace listing</p>
              <h2 id="listing-title" className="mt-2 text-2xl font-black leading-tight text-ink">
                {listing.title}
              </h2>
              <p className="mt-2 text-3xl font-black text-gum">{listing.price}</p>
              <p className="mt-1 text-sm font-semibold text-ink/65">{listing.location}</p>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-md border border-ink/10 bg-white/70 p-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-notice text-sm font-black text-ink">
                {listing.sellerAvatarFilename && !avatarFailed ? (
                  <img
                    src={`/listings/${listing.sellerAvatarFilename}`}
                    alt={avatarAlt(listing.sellerAvatarType, listing.sellerName)}
                    className="h-full w-full object-cover"
                    onError={() => {
                      if (process.env.NODE_ENV === "development") {
                        console.warn(`Missing seller profile image: /listings/${listing.sellerAvatarFilename}`);
                      }
                      setAvatarFailed(true);
                    }}
                  />
                ) : listing.sellerAvatarType === "blank" ? (
                  <span className="text-[10px] leading-tight">No photo</span>
                ) : (
                  avatarLabel(listing.sellerAvatarType)
                )}
              </div>
              <div>
                <p className="font-bold">{listing.sellerName}</p>
                <p className="text-sm text-ink/65">{listing.sellerProfileAge}</p>
              </div>
            </div>

            <p className="mt-5 whitespace-pre-line text-base leading-7 text-ink/85">{listing.description}</p>

            <div className="mt-5 rounded-md border border-ink/15 bg-white/75 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-bold text-ink/75">Suspicious details spotted</span>
                <div className="flex items-center overflow-hidden rounded-md border border-ink/20 bg-paper">
                  <button
                    type="button"
                    aria-label="Decrease suspicious details note"
                    className="grid h-10 w-10 place-items-center border-r border-ink/15"
                    onClick={() => onSetSuspicionCount(tile.id, Math.max(0, note - 1))}
                  >
                    <Minus size={16} />
                  </button>
                  <output className="grid h-10 min-w-12 place-items-center px-3 text-lg font-black">
                    {note}
                  </output>
                  <button
                    type="button"
                    aria-label="Increase suspicious details note"
                    className="grid h-10 w-10 place-items-center border-l border-ink/15"
                    onClick={() => onSetSuspicionCount(tile.id, Math.min(8, note + 1))}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-ink/55">Your note only; the board will not confirm it during play.</p>
            </div>

            {status !== "playing" && tile.type === "safe" && (
              <div className="mt-4 rounded-md border border-moss/25 bg-moss/10 p-3 text-sm text-ink/75">
                This listing had {tile.adjacentMineCount} suspicious detail{tile.adjacentMineCount === 1 ? "" : "s"}:{" "}
                {listing.suspiciousSignals.length > 0
                  ? listing.suspiciousSignals.map((signal) => signalLabels[signal]).join(", ")
                  : "none worth writing home about"}
                .
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-moss px-4 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-55"
                onClick={() => onOpenTile(tile.id)}
                disabled={status === "won" || (status === "lost" && tile.state !== "exploded")}
              >
                <ShieldCheck size={18} />
                Looks safe
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-ink/20 bg-white px-4 py-3 font-black text-ink disabled:cursor-not-allowed disabled:border-ink/10 disabled:bg-ink/10 disabled:text-ink/35"
                onClick={() => onToggleFlag(tile.id)}
                disabled={reportDisabled}
              >
                <Flag size={18} />
                {tile.state === "false_report" ? "False report" : tile.state === "flagged" ? "Unreport" : "Report listing"}
              </button>
              <button type="button" className="rounded-md border border-ink/20 px-4 py-3 font-bold" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>

        {showGameOverOverlay && (
          <div className="absolute inset-0 grid place-items-center bg-[#b42318]/92 p-6 text-center text-white">
            <div>
              <AlertTriangle className="mx-auto mb-4" size={58} aria-hidden="true" />
              <h3 className="text-4xl font-black">{isScammed ? "SCAMMED! Game Over" : gameOverMessage}</h3>
              <p className="mx-auto mt-3 max-w-md text-lg font-semibold">
                {isScammed
                  ? "You sent a deposit to “Definitely Greg” and the couch has entered witness protection."
                  : "Marketplace moderation has reviewed your enthusiasm and revoked your clipboard."}
              </p>
              <button type="button" className="mt-6 rounded-md bg-white px-5 py-3 font-black text-[#8f1d16]" onClick={onReplay}>
                Replay
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
