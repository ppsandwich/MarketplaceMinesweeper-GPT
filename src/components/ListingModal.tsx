"use client";

/* eslint-disable @next/next/no-img-element */
import { AlertTriangle, Flag, Minus, Plus, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { signalLabels } from "@/data/signalLabels";
import type { GameStatus, Tile } from "@/types/game";
import type { MarketplaceListing, SuspiciousSignal } from "@/types/listing";
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
  secretMode: boolean;
  incorrectGuessReveal: boolean;
  onIncorrectGuessRevealComplete: () => void;
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

function hasSignal(listing: MarketplaceListing, signals: SuspiciousSignal[]): boolean {
  return signals.some((signal) => listing.suspiciousSignals.includes(signal));
}

function secretHighlight(active: boolean): string {
  return active ? "ring-2 ring-gum bg-notice/25 shadow-[0_0_0_4px_rgba(245,211,107,0.28)]" : "";
}

function revealHighlight(active: boolean): string {
  return active ? "scam-reveal-outline ring-4 ring-[#d92d20] bg-[#fee4e2] shadow-[0_0_0_6px_rgba(217,45,32,0.22)]" : "";
}

function elementHighlight(secretActive: boolean, revealActive: boolean): string {
  return [secretHighlight(secretActive), revealHighlight(revealActive)].filter(Boolean).join(" ");
}

function splitSentences(description: string): string[] {
  return description.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [description];
}

function isSuspiciousDescriptionSentence(sentence: string, listing: MarketplaceListing): boolean {
  const normalized = sentence.toLowerCase();
  const signals = listing.suspiciousSignals;
  const has = (signal: SuspiciousSignal) => signals.includes(signal);

  return (
    (has("delivery_only") && /\b(delivery|courier|transport|travel|sent|post|postage|shipping)\b/.test(normalized)) ||
    (has("deposit_required") && /\b(deposit|bond|holding|hold payment|holding fee|small fee|fuel contribution|confirms your stop|confirms the spot)\b/.test(normalized)) ||
    (has("explicit_not_a_scam") && /not a scam/.test(normalized)) ||
    (has("payment_outside_platform") && /\b(transfer|bank transfer|direct transfer|payment clears|payment now)\b/.test(normalized)) ||
    (has("urgent_sale_pressure") && /\b(today|tonight|quickly|need gone|before|flight|window closes|lots of messages|selling quickly)\b/.test(normalized)) ||
    (has("poor_grammar") && /is good item working nice/.test(normalized)) ||
    (has("too_many_emojis") && /🔥|😱|💸|🙏|amazing deal/.test(sentence)) ||
    (has("sob_story") && /\b(cousin|emergency|please be kind|estate|settlement)\b/.test(normalized)) ||
    (has("refuses_inspection") && /\b(no inspections|inspection|cannot inspect|viewing address|stored off-site|limited access|storage)\b/.test(normalized)) ||
    (has("duplicate_listing_language") && /excellent condition.*excellent condition|serious buyers only.*serious buyers only/.test(normalized)) ||
    (has("stock_photo") && /\b(catalogue|stock|supplier photos|box photo|boxed|packed already)\b/.test(normalized))
  );
}

function isDescriptionSignal(signal: SuspiciousSignal | null): boolean {
  return signal !== null && [
    "delivery_only",
    "deposit_required",
    "payment_outside_platform",
    "urgent_sale_pressure",
    "poor_grammar",
    "too_many_emojis",
    "sob_story",
    "refuses_inspection",
    "duplicate_listing_language",
    "stock_photo"
  ].includes(signal);
}

function gameOverSupportText(isScammed: boolean, gameOverMessage: string | null): string {
  if (isScammed) {
    return "You sent a deposit to “Definitely Greg”, and you definitely won't hear from Greg again.";
  }

  if (gameOverMessage === "GAME OVER! You're out of cash.") {
    return "The shopping budget is gone.";
  }

  return "Marketplace moderation has reviewed your enthusiasm and revoked your clipboard.";
}

function renderDescription(
  description: string,
  listing: MarketplaceListing,
  secretMode: boolean,
  activeRevealSignal: SuspiciousSignal | null,
  revealAllSuspicious: boolean
) {
  return splitSentences(description).map((sentence, index) => {
    const suspiciousSentence = isSuspiciousDescriptionSentence(sentence, listing);
    const secretHighlighted = secretMode && suspiciousSentence;
    const revealHighlighted = suspiciousSentence && (revealAllSuspicious || isDescriptionSignal(activeRevealSignal));

    return (
      <span
        key={`${sentence}-${index}`}
        className={[
          "rounded-sm",
          secretHighlighted && "bg-notice/45 px-1 py-0.5 ring-2 ring-gum/70",
          revealHighlighted && "scam-reveal-outline bg-[#fee4e2] px-1 py-0.5 ring-4 ring-[#d92d20]"
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {sentence}
        {index < splitSentences(description).length - 1 ? " " : ""}
      </span>
    );
  });
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
  gameOverMessage,
  secretMode,
  incorrectGuessReveal,
  onIncorrectGuessRevealComplete
}: ListingModalProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [activeRevealIndex, setActiveRevealIndex] = useState(0);
  const [scamRevealComplete, setScamRevealComplete] = useState(false);
  const [activeIncorrectRevealIndex, setActiveIncorrectRevealIndex] = useState(0);
  const isScammed = status === "lost" && tile.state === "exploded";
  const showGameOverOverlay = status === "lost" && (gameOverMessage !== null || (tile.state === "exploded" && scamRevealComplete));
  const reportDisabled = tile.state === "opened" || tile.state === "false_report" || status === "won" || status === "lost";
  const isAlreadyOpened = tile.state === "opened";
  const showActionClose = tile.state === "opened" || tile.state === "flagged" || tile.state === "false_report";
  const note = tile.playerSuspicionCount;
  const noteIsAboveSafeRange = note === 4;
  const noteIndicatesScam = note === 5;
  const secretScamListing = secretMode && tile.type === "mine";
  const completedListingReveal =
    !incorrectGuessReveal &&
    !(isScammed && !scamRevealComplete) &&
    (tile.state === "opened" || tile.state === "flagged" || tile.state === "false_report");
  const imageHighlight = secretMode && hasSignal(listing, ["image_description_mismatch"]);
  const titleHighlight = secretMode && hasSignal(listing, ["explicit_not_a_scam"]);
  const locationHighlight = secretMode && hasSignal(listing, ["vague_location"]);
  const sellerNameHighlight = secretMode && hasSignal(listing, ["unnatural_seller_name"]);
  const sellerAgeHighlight = secretMode && hasSignal(listing, ["brand_new_profile"]);
  const incorrectRevealSignal = incorrectGuessReveal
    ? listing.suspiciousSignals[Math.min(activeIncorrectRevealIndex, listing.suspiciousSignals.length - 1)] ?? null
    : null;
  const activeRevealSignal = isScammed && !scamRevealComplete
    ? listing.suspiciousSignals[Math.min(activeRevealIndex, listing.suspiciousSignals.length - 1)] ?? null
    : incorrectRevealSignal;
  const revealCount = isScammed && !scamRevealComplete
    ? Math.min(activeRevealIndex + 1, listing.suspiciousSignals.length)
    : incorrectGuessReveal
      ? Math.min(activeIncorrectRevealIndex + 1, listing.suspiciousSignals.length)
      : 0;
  const revealOverlayActive = (isScammed && !scamRevealComplete) || incorrectGuessReveal;
  const revealOverlayLabel = isScammed ? "Suspicious detail" : "Missed suspicious detail";
  const imageReveal =
    activeRevealSignal === "image_description_mismatch" ||
    (completedListingReveal && hasSignal(listing, ["image_description_mismatch"]));
  const titleReveal = activeRevealSignal === "explicit_not_a_scam" || (completedListingReveal && hasSignal(listing, ["explicit_not_a_scam"]));
  const locationReveal = activeRevealSignal === "vague_location" || (completedListingReveal && hasSignal(listing, ["vague_location"]));
  const sellerNameReveal = activeRevealSignal === "unnatural_seller_name" || (completedListingReveal && hasSignal(listing, ["unnatural_seller_name"]));
  const sellerAgeReveal = activeRevealSignal === "brand_new_profile" || (completedListingReveal && hasSignal(listing, ["brand_new_profile"]));

  useEffect(() => {
    setAvatarFailed(false);
  }, [listing.id, listing.sellerAvatarFilename]);

  useEffect(() => {
    if (!isScammed) {
      setActiveRevealIndex(0);
      setScamRevealComplete(false);
      return;
    }

    setActiveRevealIndex(0);
    setScamRevealComplete(false);
    const signalCount = Math.max(1, listing.suspiciousSignals.length);
    const stepMs = 3000 / signalCount;
    const interval = window.setInterval(() => {
      setActiveRevealIndex((current) => Math.min(current + 1, signalCount - 1));
    }, stepMs);
    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      setScamRevealComplete(true);
    }, 3000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [isScammed, listing.id, listing.suspiciousSignals.length]);

  useEffect(() => {
    if (!incorrectGuessReveal) {
      setActiveIncorrectRevealIndex(0);
      return;
    }

    setActiveIncorrectRevealIndex(0);
    const signalCount = listing.suspiciousSignals.length;
    const animationMs = signalCount > 0 ? 3000 : 0;
    const stepMs = signalCount > 0 ? animationMs / signalCount : animationMs;
    const interval = signalCount > 1
      ? window.setInterval(() => {
          setActiveIncorrectRevealIndex((current) => Math.min(current + 1, signalCount - 1));
        }, stepMs)
      : null;
    const timeout = window.setTimeout(() => {
      if (interval !== null) window.clearInterval(interval);
      onIncorrectGuessRevealComplete();
    }, animationMs + 1000);

    return () => {
      if (interval !== null) window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [incorrectGuessReveal, listing.id, listing.suspiciousSignals.length, onIncorrectGuessRevealComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/75 p-0 sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-title"
    >
      <section
        className={[
          "modal-panel relative max-h-[94vh] w-full overflow-y-auto rounded-t-lg bg-paper shadow-card sm:max-w-4xl sm:rounded-lg",
          secretScamListing && "border-4 border-gum bg-[#ffe7df] shadow-[0_0_0_8px_rgba(200,95,70,0.28)]"
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="grid gap-0 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className={["bg-[#e8e0d2] p-4 sm:p-5", elementHighlight(imageHighlight, imageReveal)].filter(Boolean).join(" ")}>
            <ImageCarousel filenames={listing.imageFilenames} title={listing.title} />
          </div>

          <div className="relative p-5 sm:p-6">
            {secretMode && (
              <button
                type="button"
                aria-label="Close listing"
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-ink/15 bg-white"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            )}

            <div className="pr-10">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-moss">Marketplace listing</p>
              <h2
                id="listing-title"
                className={[
                  "mt-2 rounded-md text-2xl font-black leading-tight text-ink",
                  elementHighlight(titleHighlight, titleReveal)
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {listing.title}
              </h2>
              <p className="mt-2 inline-block rounded-md px-1 text-3xl font-black text-gum">{listing.price}</p>
              <p className={["mt-1 rounded-md text-sm font-semibold text-ink/65", elementHighlight(locationHighlight, locationReveal)].filter(Boolean).join(" ")}>
                Location: {listing.location}
              </p>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-md border border-ink/10 bg-white/70 p-3">
              <div
                className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-notice text-sm font-black text-ink"
              >
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
                <p className={["rounded-sm font-bold", elementHighlight(sellerNameHighlight, sellerNameReveal)].filter(Boolean).join(" ")}>
                  {listing.sellerName}
                </p>
                <p className={["rounded-sm text-sm text-ink/65", elementHighlight(sellerAgeHighlight, sellerAgeReveal)].filter(Boolean).join(" ")}>
                  {listing.sellerProfileAge}
                </p>
              </div>
            </div>

            <p className="mt-5 text-base leading-7 text-ink/85">
              {renderDescription(listing.description, listing, secretMode, activeRevealSignal, completedListingReveal)}
            </p>

            <div className="mt-5 rounded-md border border-ink/15 bg-white/75 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-bold text-ink/75">Suspicious details spotted</span>
                <div className="flex items-center overflow-hidden rounded-md border border-ink/20 bg-paper">
                  <button
                    type="button"
                    aria-label="Decrease suspicious details note"
                    className="grid h-10 w-10 place-items-center border-r border-ink/15 disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/30"
                    onClick={() => onSetSuspicionCount(tile.id, Math.max(0, note - 1))}
                    disabled={isAlreadyOpened}
                  >
                    <Minus size={16} />
                  </button>
                  <output
                    className={[
                      "grid h-10 min-w-12 place-items-center px-3 text-lg font-black",
                      noteIsAboveSafeRange && "text-[#b88200]",
                      noteIndicatesScam && "text-gum"
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {note}
                  </output>
                  <button
                    type="button"
                    aria-label="Increase suspicious details note"
                    className="grid h-10 w-10 place-items-center border-l border-ink/15 disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/30"
                    onClick={() => onSetSuspicionCount(tile.id, Math.min(5, note + 1))}
                    disabled={isAlreadyOpened}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
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
              {showActionClose && (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-ink/25 px-4 py-3 font-black text-ink"
                  onClick={onClose}
                >
                  <X size={18} />
                  Close
                </button>
              )}
              {!showActionClose ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-moss px-4 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-55"
                  onClick={() => onOpenTile(tile.id)}
                  disabled={status !== "playing"}
                >
                  <ShieldCheck size={18} />
                  Buy it
                </button>
              ) : null}
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border-2 border-gum bg-white px-4 py-3 font-black text-gum disabled:cursor-not-allowed disabled:border-ink/10 disabled:bg-ink/10 disabled:text-ink/35"
                onClick={() => onToggleFlag(tile.id)}
                disabled={reportDisabled}
              >
                <Flag size={18} />
                {tile.state === "false_report" ? "False report" : tile.state === "flagged" ? "Unreport" : "Report listing"}
              </button>
            </div>
          </div>
        </div>

        {revealOverlayActive && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink/10 p-6">
            <div className="rounded-lg border-4 border-[#d92d20] bg-white/95 px-8 py-5 text-center shadow-card">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#d92d20]">{revealOverlayLabel}</p>
              <p className="text-7xl font-black leading-none text-[#d92d20]">
                {revealCount}
              </p>
              <p className="mt-1 text-lg font-black text-ink/70">of {listing.suspiciousSignals.length}</p>
            </div>
          </div>
        )}

        {showGameOverOverlay && (
          <div className="absolute inset-0 grid place-items-center bg-[#5f120d]/95 p-6 text-center text-white">
            <div className="rounded-lg bg-ink/45 p-6 shadow-card">
              <AlertTriangle className="mx-auto mb-4" size={58} aria-hidden="true" />
              <h3 className="text-4xl font-black">{isScammed ? "SCAMMED! Game Over" : gameOverMessage}</h3>
              <p className="mx-auto mt-3 max-w-md text-lg font-semibold">
                {gameOverSupportText(isScammed, gameOverMessage)}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" className="rounded-md bg-white px-5 py-3 font-black text-[#8f1d16]" onClick={onReplay}>
                  Replay
                </button>
                <button
                  type="button"
                  className="rounded-md border-2 border-white bg-transparent px-5 py-3 font-black text-white"
                  onClick={onClose}
                >
                  Show Board
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
