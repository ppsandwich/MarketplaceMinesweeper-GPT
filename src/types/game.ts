export type TileType = "safe" | "mine";
export type TileState = "hidden" | "opened" | "flagged" | "exploded" | "revealed_mine";
export type Difficulty = "easy" | "medium" | "hard";
export type GameStatus = "idle" | "playing" | "won" | "lost";

export interface Position {
  x: number;
  y: number;
}

export interface Tile {
  id: string;
  x: number;
  y: number;
  type: TileType;
  state: TileState;
  adjacentMineCount: number;
  listingId: string | null;
  playerSuspicionCount: number | null;
}
