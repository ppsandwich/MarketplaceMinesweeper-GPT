import { adjacentPositions } from "@/game/adjacency";
import { seededRandom } from "@/game/seededRandom";
import { listingsBySuspicionCount } from "@/data/listings";
import { scamListings } from "@/data/scamListings";
import type { Position, Tile } from "@/types/game";
import type { MarketplaceListing } from "@/types/listing";

interface GenerateBoardOptions {
  width: number;
  height: number;
  mineCount: number;
  seed: string;
  safeFirstClickPosition: Position;
}

const MAX_SAFE_ADJACENT_MINE_COUNT = 5;
const MAX_BOARD_GENERATION_ATTEMPTS = 500;

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

    const usedSafeListings = new Set<string>();
    const usedScamListings = new Set<string>();

    return Array.from({ length: width * height }, (_, index): Tile => {
      const x = index % width;
      const y = Math.floor(index / width);
      const id = tileId(x, y);
      const isMine = mineIds.has(id);
      const adjacentMineCount = adjacentCounts[index];

      const listing = isMine
        ? pickUnused(scamListings, usedScamListings, random)
        : pickUnused(listingsBySuspicionCount[adjacentMineCount] ?? [], usedSafeListings, random);

      return {
        id,
        x,
        y,
        type: isMine ? "mine" : "safe",
        state: "hidden",
        adjacentMineCount,
        listingId: listing.id,
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
      playerSuspicionCount: 0
    };
  });
}
