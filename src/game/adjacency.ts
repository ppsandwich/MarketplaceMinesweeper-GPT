import type { Position } from "@/types/game";

export function adjacentPositions(x: number, y: number, width: number, height: number): Position[] {
  const positions: Position[] = [];

  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) continue;

      const nextX = x + dx;
      const nextY = y + dy;

      if (nextX >= 0 && nextX < width && nextY >= 0 && nextY < height) {
        positions.push({ x: nextX, y: nextY });
      }
    }
  }

  return positions;
}
