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
  const random = seededRandom(`${seed}:${safeFirstClickPosition.x},${safeFirstClickPosition.y}`);
  const safeFirstId = tileId(safeFirstClickPosition.x, safeFirstClickPosition.y);
  const candidates = Array.from({ length: width * height }, (_, index) => ({
    x: index % width,
    y: Math.floor(index / width)
  })).filter((position) => tileId(position.x, position.y) !== safeFirstId);

  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const mineIds = new Set(candidates.slice(0, mineCount).map((position) => tileId(position.x, position.y)));
  const usedSafeListings = new Set<string>();
  const usedScamListings = new Set<string>();

  return Array.from({ length: width * height }, (_, index): Tile => {
    const x = index % width;
    const y = Math.floor(index / width);
    const id = tileId(x, y);
    const isMine = mineIds.has(id);
    const adjacentMineCount = adjacentPositions(x, y, width, height).filter((position) =>
      mineIds.has(tileId(position.x, position.y))
    ).length;

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
