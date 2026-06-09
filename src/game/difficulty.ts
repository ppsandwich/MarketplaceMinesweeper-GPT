import type { Difficulty } from "@/types/game";

export const BOARD_WIDTH = 9;
export const BOARD_HEIGHT = 9;

export const DIFFICULTIES: Record<Difficulty, { label: string; mineCount: 8 | 12 | 16 }> = {
  easy: { label: "Easy", mineCount: 8 },
  medium: { label: "Medium", mineCount: 12 },
  hard: { label: "Hard", mineCount: 16 }
};
