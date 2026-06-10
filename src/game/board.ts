import { adjacentPositions } from "@/game/adjacency";
import { seededRandom } from "@/game/seededRandom";
import { listingFromTemplateWithSuspicionCount, neutralListingTemplates } from "@/data/listings";
import type { Position, Tile } from "@/types/game";
import type { MarketplaceListing, SuspiciousSignal } from "@/types/listing";

interface GenerateBoardOptions {
  width: number;
  height: number;
  mineCount: number;
  seed: string;
  safeFirstClickPosition: Position;
}

const MAX_SAFE_ADJACENT_MINE_COUNT = 3;
const MAX_BOARD_GENERATION_ATTEMPTS = 500;
const scamDescriptionClues = [
  "A small deposit holds it before anyone else arrives.",
  "Postage only because pickup is complicated today.",
  "Payment by direct transfer preferred before confirming pickup.",
  "Need gone tonight before a very important van appears."
] as const;
const unnaturalSellerNames = [
  "Market Value Kelvin",
  "Pickup Window Office",
  "Fast Deal Warehouse",
  "Definitely Greg",
  "Listing Support Desk"
] as const;
const nonFaceAvatarFilenames = [
  "profile-non-face-moving-box-01.jpg",
  "profile-non-face-dealz-logo-01.jpg",
  "profile-non-face-suspicious-cat-01.jpg",
  "profile-non-face-blank-grey-01.jpg",
  "profile-non-face-ai-weird-smile-01.jpg"
] as const;

function tileId(x: number, y: number): string {
  return `${x}-${y}`;
}

function pickUnused<T extends MarketplaceListing>(pool: T[], used: Set<string>, random: () => number): T {
  const unused = pool.filter((item) => !used.has(item.id));
  const source = unused.length > 0 ? unused : pool;

  if (source.length === 0) {
    throw new Error("Cannot assign listing from an empty pool.");
  }

  const picked = source[Math.floor(random() * source.length)];
  used.add(picked.id);
  return picked;
}

function scamListingFromTemplate(
  template: MarketplaceListing,
  allTemplates: MarketplaceListing[],
  index: number,
  random: () => number
): MarketplaceListing {
  const sellerSignalChoices: SuspiciousSignal[] = ["unnatural_seller_name", "seller_no_face_photo", "brand_new_profile"];
  const descriptionSignalChoices: SuspiciousSignal[] = ["deposit_required", "delivery_only", "payment_outside_platform", "urgent_sale_pressure"];
  const sellerSignal = sellerSignalChoices[Math.floor(random() * sellerSignalChoices.length)];
  const descriptionSignal = descriptionSignalChoices[Math.floor(random() * descriptionSignalChoices.length)];
  const signals: SuspiciousSignal[] = [
    "explicit_not_a_scam",
    descriptionSignal,
    sellerSignal,
    "image_description_mismatch",
    "vague_location"
  ];
  const alternateImages = allTemplates
    .filter((candidate) => candidate.id !== template.id && candidate.imageFilenames.length > 0)
    .flatMap((candidate) => candidate.imageFilenames);
  const mismatchedImage = alternateImages[Math.floor(random() * alternateImages.length)] ?? template.imageFilenames[0];
  const listing: MarketplaceListing = {
    ...template,
    id: `${template.id}-scam-${index}`,
    title: `${template.title} - Definitely real, quick sale`,
    location: "VIC, maybe",
    description: `${template.description} ${scamDescriptionClues[descriptionSignalChoices.indexOf(descriptionSignal)]}`,
    imageFilenames: [mismatchedImage],
    suspiciousSignals: signals,
    isScamTemplate: true
  };

  if (sellerSignal === "unnatural_seller_name") {
    listing.sellerName = unnaturalSellerNames[Math.floor(random() * unnaturalSellerNames.length)];
    listing.sellerAvatarType = "face";
    listing.sellerAvatarFilename = null;
  }

  if (sellerSignal === "seller_no_face_photo") {
    listing.sellerAvatarType = "object";
    listing.sellerAvatarFilename = nonFaceAvatarFilenames[Math.floor(random() * nonFaceAvatarFilenames.length)];
  }

  if (sellerSignal === "brand_new_profile") {
    listing.sellerProfileAge = "Joined this week";
  }

  return listing;
}

export function generateBoard({
  width,
  height,
  mineCount,
  seed,
  safeFirstClickPosition
}: GenerateBoardOptions): Tile[] {
  const safeFirstId = tileId(safeFirstClickPosition.x, safeFirstClickPosition.y);
  const baseCandidates = Array.from({ length: width * height }, (_, index) => ({
    x: index % width,
    y: Math.floor(index / width)
  })).filter((position) => tileId(position.x, position.y) !== safeFirstId);

  for (let attempt = 0; attempt < MAX_BOARD_GENERATION_ATTEMPTS; attempt += 1) {
    const random = seededRandom(`${seed}:${safeFirstClickPosition.x},${safeFirstClickPosition.y}:${attempt}`);
    const candidates = [...baseCandidates];

    for (let i = candidates.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    const mineIds = new Set(candidates.slice(0, mineCount).map((position) => tileId(position.x, position.y)));
    const adjacentCounts = Array.from({ length: width * height }, (_, index) => {
      const x = index % width;
      const y = Math.floor(index / width);
      return adjacentPositions(x, y, width, height).filter((position) =>
        mineIds.has(tileId(position.x, position.y))
      ).length;
    });
    const hasImpossibleSafeListing = adjacentCounts.some((count, index) => {
      const x = index % width;
      const y = Math.floor(index / width);
      return !mineIds.has(tileId(x, y)) && count > MAX_SAFE_ADJACENT_MINE_COUNT;
    });

    if (hasImpossibleSafeListing) continue;

    const usedListingTemplates = new Set<string>();

    return Array.from({ length: width * height }, (_, index): Tile => {
      const x = index % width;
      const y = Math.floor(index / width);
      const id = tileId(x, y);
      const isMine = mineIds.has(id);
      const adjacentMineCount = adjacentCounts[index];

      const listing = isMine
        ? scamListingFromTemplate(
            pickUnused(neutralListingTemplates, usedListingTemplates, random),
            neutralListingTemplates,
            index,
            random
          )
        : listingFromTemplateWithSuspicionCount(
            pickUnused(neutralListingTemplates, usedListingTemplates, random),
            adjacentMineCount,
            index,
            neutralListingTemplates,
            random
          );

      return {
        id,
        x,
        y,
        type: isMine ? "mine" : "safe",
        state: "hidden",
        adjacentMineCount,
        listingId: listing.id,
        listing,
        playerSuspicionCount: 0
      };
    });
  }

  throw new Error(`Could not generate a board with safe adjacent mine counts at or below ${MAX_SAFE_ADJACENT_MINE_COUNT}.`);
}

export function createEmptyBoard(width: number, height: number): Tile[] {
  return Array.from({ length: width * height }, (_, index) => {
    const x = index % width;
    const y = Math.floor(index / width);
    return {
      id: tileId(x, y),
      x,
      y,
      type: "safe",
      state: "hidden",
      adjacentMineCount: 0,
      listingId: null,
      listing: null,
      playerSuspicionCount: 0
    };
  });
}
