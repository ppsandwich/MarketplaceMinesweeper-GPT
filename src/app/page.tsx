"use client";

import { Flag, Pi, RotateCcw, Search, Timer, Trophy, Wallet } from "lucide-react";
import { Sixtyfour_Convergence } from "next/font/google";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ListingModal } from "@/components/ListingModal";
import { listingsBySuspicionCount } from "@/data/listings";
import { validateListingsData } from "@/data/validateListings";
import { generateBoard, createEmptyBoard } from "@/game/board";
import { BOARD_HEIGHT, BOARD_WIDTH, DIFFICULTIES } from "@/game/difficulty";
import { randomSeed } from "@/game/seededRandom";
import type { Difficulty, GameStatus, Tile } from "@/types/game";
import type { MarketplaceListing } from "@/types/listing";

const falseReportLimit = 3;
const gameStateKey = "marketsweeper:game-state:v1";
const bannedMessage = "GAME OVER - you've been banned for making too many false reports.";
const outOfCashMessage = "GAME OVER! You're out of cash.";
const titleFont = Sixtyfour_Convergence({
  subsets: ["latin"],
  weight: "400"
});

interface PurchasedListing {
  tileId: string;
  title: string;
  price: string;
  amount: number;
}

interface SavedGameState {
  version: 1;
  status: GameStatus;
  board: Tile[];
  seed: string;
  selectedTileId: string | null;
  startedAt: number | null;
  endedAt: number | null;
  falseReports: number;
  gameOverMessage: string | null;
  delayWinOverlay: boolean;
  winOverlayDismissed: boolean;
  secretMode: boolean;
  startingBudget: number | null;
  budgetRemaining: number | null;
  purchasedListings: PurchasedListing[];
}

function listingMap(): Map<string, MarketplaceListing> {
  const map = new Map<string, MarketplaceListing>();
  Object.values(listingsBySuspicionCount).flat().forEach((listing) => map.set(listing.id, listing));
  return map;
}

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function parseListingPrice(price: string): number {
  const numericPrice = price.match(/\d+(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?/);
  return numericPrice ? Number(numericPrice[0].replaceAll(",", "")) : 0;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0
  }).format(Math.max(0, amount));
}

function calculateStartingBudget(board: Tile[], listings: Map<string, MarketplaceListing>): number {
  const totalListingPrice = board.reduce((total, tile) => {
    const listing = tile.listing ?? (tile.listingId ? listings.get(tile.listingId) : null);
    return total + (listing ? parseListingPrice(listing.price) : 0);
  }, 0);

  return Math.round(totalListingPrice * 0.6);
}

function normalizeListingImageFilename(filename: string): string {
  if (filename === "placeholder.svg") return filename;
  if (filename === "dining-table-clue-0-1-01.png") return filename;
  return filename.replace(/\.png$/i, ".jpg");
}

function normalizeProfileImageFilename(filename: string | null | undefined): string | null | undefined {
  return filename?.startsWith("profile-") ? filename.replace(/\.png$/i, ".jpg") : filename;
}

function normalizeListingImages(board: Tile[]): Tile[] {
  return board.map((tile) => ({
    ...tile,
    listing: tile.listing
      ? {
          ...tile.listing,
          sellerAvatarFilename: normalizeProfileImageFilename(tile.listing.sellerAvatarFilename),
          imageFilenames: tile.listing.imageFilenames.slice(0, 1).map(normalizeListingImageFilename)
        }
      : null
  }));
}

function generateInitialBoard(seed: string, mineCount: number): Tile[] {
  return normalizeListingImages(generateBoard({
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    mineCount,
    seed,
    safeFirstClickPosition: { x: -1, y: -1 }
  }));
}

function statusCopy(status: GameStatus, gameOverMessage: string | null): string | null {
  if (status === "won") {
    return "YOU WON!";
  }
  if (status === "lost") {
    return gameOverMessage ?? "All scam listings are revealed. The paperwork is fictional, but the pain is educational.";
  }
  return null;
}

export default function Home() {
  const [difficulty] = useState<Difficulty>("hard");
  const [status, setStatus] = useState<GameStatus>("idle");
  const [board, setBoard] = useState<Tile[]>(() => createEmptyBoard(BOARD_WIDTH, BOARD_HEIGHT));
  const [seed, setSeed] = useState("");
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [falseReports, setFalseReports] = useState(0);
  const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);
  const [recentlyReportedTileId, setRecentlyReportedTileId] = useState<string | null>(null);
  const [recentlyFalseReportedTileId, setRecentlyFalseReportedTileId] = useState<string | null>(null);
  const [delayWinOverlay, setDelayWinOverlay] = useState(false);
  const [winOverlayDismissed, setWinOverlayDismissed] = useState(false);
  const [secretMode, setSecretMode] = useState(false);
  const [startingBudget, setStartingBudget] = useState<number | null>(null);
  const [budgetRemaining, setBudgetRemaining] = useState<number | null>(null);
  const [purchasedListings, setPurchasedListings] = useState<PurchasedListing[]>([]);
  const [hasLoadedSavedState, setHasLoadedSavedState] = useState(false);
  const [incorrectGuessRevealTileId, setIncorrectGuessRevealTileId] = useState<string | null>(null);

  const listings = useMemo(() => listingMap(), []);
  const mineCount = DIFFICULTIES[difficulty].mineCount;
  const flagsUsed = board.filter((tile) => tile.state === "flagged").length;
  const reportPercent = Math.round((flagsUsed / mineCount) * 100);
  const reportProgress = status === "won" && flagsUsed === mineCount ? 100 : reportPercent;
  const falseReportMax = falseReportLimit;
  const falseReportPercent = Math.round((falseReports / falseReportMax) * 100);
  const falseReportProgress = Math.min(100, falseReportPercent);
  const currentStatusCopy = statusCopy(status, gameOverMessage);
  const selectedTile = board.find((tile) => tile.id === selectedTileId) ?? null;
  const selectedListing = selectedTile?.listing ?? (selectedTile?.listingId ? listings.get(selectedTile.listingId) ?? null : null);
  const budgetSpent = startingBudget === null || budgetRemaining === null ? 0 : startingBudget - budgetRemaining;
  const budgetSpentPercent = startingBudget && startingBudget > 0
    ? Math.min(100, Math.round((budgetSpent / startingBudget) * 100))
    : 0;
  const budgetProgress = budgetSpentPercent;
  const elapsedSeconds = startedAt
    ? Math.floor(((endedAt ?? now) - startedAt) / 1000)
    : 0;

  useEffect(() => {
    if (process.env.NODE_ENV === "development") validateListingsData();
    const savedState = window.localStorage.getItem(gameStateKey);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState) as SavedGameState;
        if (parsed.version === 1 && Array.isArray(parsed.board) && parsed.board.length === BOARD_WIDTH * BOARD_HEIGHT) {
          setStatus(parsed.status);
          setBoard(normalizeListingImages(parsed.board));
          setSeed(parsed.seed);
          setSelectedTileId(parsed.selectedTileId);
          setStartedAt(parsed.startedAt);
          setEndedAt(parsed.endedAt);
          setNow(Date.now());
          setFalseReports(parsed.falseReports);
          setGameOverMessage(parsed.gameOverMessage);
          setRecentlyReportedTileId(null);
          setRecentlyFalseReportedTileId(null);
          setDelayWinOverlay(parsed.delayWinOverlay);
          setWinOverlayDismissed(parsed.winOverlayDismissed);
          setSecretMode(parsed.secretMode);
          setStartingBudget(parsed.startingBudget);
          setBudgetRemaining(parsed.budgetRemaining);
          setPurchasedListings(parsed.purchasedListings ?? []);
          setHasLoadedSavedState(true);
          return;
        }
      } catch {
        window.localStorage.removeItem(gameStateKey);
      }
    }

    const nextSeed = randomSeed();
    const generated = generateInitialBoard(nextSeed, mineCount);
    const generatedBudget = calculateStartingBudget(generated, listings);
    setSeed(nextSeed);
    setBoard(generated);
    setStartingBudget(generatedBudget);
    setBudgetRemaining(generatedBudget);
    setHasLoadedSavedState(true);
  }, [listings, mineCount]);

  useEffect(() => {
    if (!hasLoadedSavedState) return;

    const savedState: SavedGameState = {
      version: 1,
      status,
      board: normalizeListingImages(board),
      seed,
      selectedTileId,
      startedAt,
      endedAt,
      falseReports,
      gameOverMessage,
      delayWinOverlay,
      winOverlayDismissed,
      secretMode,
      startingBudget,
      budgetRemaining,
      purchasedListings
    };
    window.localStorage.setItem(gameStateKey, JSON.stringify(savedState));
  }, [
    board,
    budgetRemaining,
    delayWinOverlay,
    endedAt,
    falseReports,
    gameOverMessage,
    hasLoadedSavedState,
    purchasedListings,
    secretMode,
    seed,
    selectedTileId,
    startedAt,
    startingBudget,
    status,
    winOverlayDismissed
  ]);

  useEffect(() => {
    if (status !== "playing" || !startedAt || endedAt) return;

    const interval = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(interval);
  }, [endedAt, startedAt, status]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedTileId(null);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!recentlyReportedTileId) return;

    const timeout = window.setTimeout(() => setRecentlyReportedTileId(null), 1100);
    return () => window.clearTimeout(timeout);
  }, [recentlyReportedTileId]);

  useEffect(() => {
    if (!recentlyFalseReportedTileId) return;

    const timeout = window.setTimeout(() => setRecentlyFalseReportedTileId(null), 1100);
    return () => window.clearTimeout(timeout);
  }, [recentlyFalseReportedTileId]);

  useEffect(() => {
    if (status !== "won" || !delayWinOverlay) return;

    const timeout = window.setTimeout(() => setDelayWinOverlay(false), 1100);
    return () => window.clearTimeout(timeout);
  }, [delayWinOverlay, status]);

  const startClock = useCallback(() => {
    setStartedAt((current) => current ?? Date.now());
    setStatus((current) => (current === "idle" ? "playing" : current));
  }, []);

  const resetGame = useCallback(
    () => {
      const nextSeed = randomSeed();
      const generated = generateInitialBoard(nextSeed, mineCount);
      const generatedBudget = calculateStartingBudget(generated, listings);
      setStatus("idle");
      setBoard(generated);
      setSeed(nextSeed);
      setSelectedTileId(null);
      setStartedAt(null);
      setEndedAt(null);
      setNow(Date.now());
      setFalseReports(0);
      setGameOverMessage(null);
      setRecentlyReportedTileId(null);
      setRecentlyFalseReportedTileId(null);
      setDelayWinOverlay(false);
      setWinOverlayDismissed(false);
      setStartingBudget(generatedBudget);
      setBudgetRemaining(generatedBudget);
      setPurchasedListings([]);
    },
    [listings, mineCount]
  );

  const ensureGeneratedBoard = useCallback(
    (tile: Tile): Tile[] => {
      const isGenerated = board.some((candidate) => candidate.listingId);
      if (isGenerated) return board;

      const generated = normalizeListingImages(generateBoard({
        width: BOARD_WIDTH,
        height: BOARD_HEIGHT,
        mineCount,
        seed,
        safeFirstClickPosition: { x: tile.x, y: tile.y }
      }));
      const generatedBudget = calculateStartingBudget(generated, listings);
      setBoard(generated);
      setStartingBudget(generatedBudget);
      setBudgetRemaining(generatedBudget);
      return generated;
    },
    [board, listings, mineCount, seed]
  );

  const ensureGeneratedBoardForReport = useCallback((): Tile[] => {
    const isGenerated = board.some((candidate) => candidate.listingId);
    if (isGenerated) return board;

    const generated = normalizeListingImages(generateBoard({
      width: BOARD_WIDTH,
      height: BOARD_HEIGHT,
      mineCount,
      seed,
      safeFirstClickPosition: { x: -1, y: -1 }
    }));
    const generatedBudget = calculateStartingBudget(generated, listings);
    setBoard(generated);
    setStartingBudget(generatedBudget);
    setBudgetRemaining(generatedBudget);
    return generated;
  }, [board, listings, mineCount, seed]);

  const inspectTile = useCallback(
    (tileId: string) => {
      if (status === "won" || status === "lost") {
        setSelectedTileId(tileId);
        return;
      }

      const tile = board.find((candidate) => candidate.id === tileId);
      if (!tile) return;

      startClock();
      const activeBoard = ensureGeneratedBoard(tile);
      const activeTile = activeBoard.find((candidate) => candidate.id === tileId);
      setSelectedTileId(activeTile?.id ?? tileId);
    },
    [board, ensureGeneratedBoard, startClock, status]
  );

  const openTile = useCallback(
    (tileId: string) => {
      if (status === "won" || status === "lost") return;
      const sourceTile = board.find((candidate) => candidate.id === tileId);
      if (!sourceTile) return;

      startClock();
      const activeBoard = ensureGeneratedBoard(sourceTile);
      const tile = activeBoard.find((candidate) => candidate.id === tileId);
      if (!tile || tile.state === "flagged") return;
      if (tile.state === "opened") {
        setSelectedTileId(null);
        setIncorrectGuessRevealTileId(null);
        return;
      }

      if (tile.type === "mine") {
        setBoard(
          activeBoard.map((candidate) => {
            if (candidate.id === tileId) return { ...candidate, state: "exploded" };
            if (candidate.type === "mine") return { ...candidate, state: "revealed_mine" };
            return candidate;
          })
        );
        setStatus("lost");
        setEndedAt(Date.now());
        setSelectedTileId(tileId);
        return;
      }

      const nextBoard = activeBoard.map((candidate) =>
        candidate.id === tileId ? { ...candidate, state: "opened" as const } : candidate
      );
      const activeStartingBudget = startingBudget ?? calculateStartingBudget(activeBoard, listings);
      if (startingBudget === null) setStartingBudget(activeStartingBudget);
      const listing = tile.listing ?? (tile.listingId ? listings.get(tile.listingId) : null);
      const listingPrice = listing ? parseListingPrice(listing.price) : 0;
      const currentBudgetRemaining = budgetRemaining ?? activeStartingBudget;
      const nextBudgetRemaining = currentBudgetRemaining - listingPrice;
      if (listing) {
        setPurchasedListings((current) => {
          return [
            ...current,
            {
              tileId,
              title: listing.title,
              price: listing.price,
              amount: listingPrice
            }
          ];
        });
      }
      setBudgetRemaining(nextBudgetRemaining);
      if (nextBudgetRemaining <= 0) {
        setBoard(nextBoard);
        setGameOverMessage(outOfCashMessage);
        setStatus("lost");
        setEndedAt(Date.now());
        setSelectedTileId(tileId);
        return;
      }

      const won = nextBoard.every((candidate) => candidate.type === "mine" || candidate.state === "opened");
      setBoard(nextBoard);
      if (tile.playerSuspicionCount !== tile.adjacentMineCount) {
        setIncorrectGuessRevealTileId(tileId);
        setSelectedTileId(tileId);
      } else {
        setIncorrectGuessRevealTileId(null);
        setSelectedTileId(null);
      }
      if (won) {
        setStatus("won");
        setEndedAt(Date.now());
        setDelayWinOverlay(false);
        setWinOverlayDismissed(false);
      }
    },
    [board, budgetRemaining, ensureGeneratedBoard, listings, startingBudget, startClock, status]
  );

  const toggleFlag = useCallback(
    (tileId: string) => {
      if (status === "won" || status === "lost") return;

      const sourceTile = board.find((candidate) => candidate.id === tileId);
      if (!sourceTile || sourceTile.state === "opened") return;

      startClock();
      const activeBoard = ensureGeneratedBoardForReport();
      const activeTile = activeBoard.find((candidate) => candidate.id === tileId);
      if (!activeTile || activeTile.state === "opened") return;
      if (activeTile.state === "false_report") return;

      if (activeTile.state === "flagged") {
        setBoard((current) =>
          current.map((tile) => (tile.id === tileId ? { ...tile, state: "hidden" as const } : tile))
        );
        return;
      }

      if (activeTile.type === "safe") {
        const nextFalseReports = falseReports + 1;

        if (nextFalseReports >= falseReportLimit) {
          setFalseReports(nextFalseReports);
          setRecentlyFalseReportedTileId(tileId);
          setGameOverMessage(bannedMessage);
          setStatus("lost");
          setEndedAt(Date.now());
          setSelectedTileId(tileId);
          setBoard(
            activeBoard.map((tile) => {
              if (tile.id === tileId) return { ...tile, state: "false_report" as const };
              if (tile.type === "mine") return { ...tile, state: "revealed_mine" };
              return tile;
            })
          );
          return;
        }

        setFalseReports(nextFalseReports);
        setRecentlyFalseReportedTileId(tileId);
        setBoard(
          activeBoard.map((tile) =>
            tile.id === tileId ? { ...tile, state: "false_report" as const } : tile
          )
        );
        setSelectedTileId(null);
        return;
      }

      setSelectedTileId(null);
      setRecentlyReportedTileId(tileId);
      const nextBoard = activeBoard.map((tile) => {
        if (tile.id !== tileId || tile.state === "opened") return tile;
        return { ...tile, state: "flagged" as const };
      });
      const wonByReports = nextBoard.filter((tile) => tile.type === "mine" && tile.state === "flagged").length === mineCount;

      setBoard(
        wonByReports
          ? nextBoard.map((tile) => (tile.type === "mine" && tile.state !== "flagged" ? { ...tile, state: "revealed_mine" as const } : tile))
          : nextBoard
      );
      if (wonByReports) {
        setStatus("won");
        setEndedAt(Date.now());
        setDelayWinOverlay(true);
        setWinOverlayDismissed(false);
      }
    },
    [board, ensureGeneratedBoardForReport, falseReports, mineCount, startClock, status]
  );

  const setSuspicionCount = useCallback((tileId: string, value: number) => {
    setBoard((current) =>
      current.map((tile) =>
        tile.id === tileId ? { ...tile, playerSuspicionCount: Math.max(0, Math.min(5, value)) } : tile
      )
    );
  }, []);

  const closeSelectedTile = useCallback(() => {
    setIncorrectGuessRevealTileId(null);
    setSelectedTileId(null);
  }, []);

  function tileLabel(tile: Tile) {
    const base = `listing tile, row ${tile.y + 1}, column ${tile.x + 1}`;
    if (tile.state === "hidden") return `Unopened ${base}`;
    if (tile.state === "flagged") return `Reported ${base}`;
    if (tile.state === "false_report") return `False report on ${base}`;
    if (tile.state === "opened") return `Opened ${base}${status === "playing" ? "" : `, ${tile.adjacentMineCount} adjacent scams`}`;
    if (tile.state === "exploded") return `Scam listing opened, row ${tile.y + 1}, column ${tile.x + 1}`;
    return `Revealed scam listing, row ${tile.y + 1}, column ${tile.x + 1}`;
  }

  const indicatorBars = (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-md border-2 border-ink bg-white/75 p-3">
      <div className="flex flex-wrap gap-2 text-sm font-black">
        <span
          className="relative inline-flex min-w-[190px] items-center gap-2 overflow-hidden rounded-md border border-ink/15 bg-paper px-3 py-2"
          aria-label={`${flagsUsed} of ${mineCount} scams reported, ${reportPercent}%`}
        >
          <span
            className="absolute inset-y-0 left-0 bg-moss/30 transition-[width]"
            style={{ width: `${reportProgress}%` }}
            aria-hidden="true"
          />
          <Flag className="relative" size={16} />
          <span className="relative">
            {flagsUsed}/{mineCount} reported ({reportPercent}%)
          </span>
        </span>
        <span
          className="relative inline-flex min-w-[220px] items-center gap-2 overflow-hidden rounded-md border border-ink/15 bg-paper px-3 py-2"
          aria-label={`${falseReports} of ${falseReportMax} false reports, ${falseReportPercent}%`}
        >
          <span
            className="absolute inset-y-0 left-0 bg-gum/30 transition-[width]"
            style={{ width: `${falseReportProgress}%` }}
            aria-hidden="true"
          />
          <Flag className="relative" size={16} />
          <span className="relative">
            {falseReports}/{falseReportMax} false reports ({falseReportPercent}%)
          </span>
        </span>
        <span
          className="relative inline-flex min-w-[260px] items-center gap-2 overflow-hidden rounded-md border border-ink/15 bg-paper px-3 py-2"
          aria-label={`${formatCurrency(budgetSpent)} of ${startingBudget === null ? "budget loading" : formatCurrency(startingBudget)} spent, ${budgetSpentPercent}%`}
        >
          <span
            className="absolute inset-y-0 left-0 bg-gum/30 transition-[width]"
            style={{ width: `${budgetProgress}%` }}
            aria-hidden="true"
          />
          <Wallet className="relative" size={16} />
          <span className="relative">
            {startingBudget === null
              ? "Budget loading"
              : `${formatCurrency(budgetSpent)} of ${formatCurrency(startingBudget)} spent (${budgetSpentPercent}%)`}
          </span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-md bg-paper px-3 py-2">
          <Timer size={16} />
          {formatSeconds(elapsedSeconds)}
        </span>
      </div>
      {currentStatusCopy && <p className="text-sm font-bold text-ink/65">{currentStatusCopy}</p>}
    </div>
  );

  const howToPlayContent = (
    <>
      <p className="mt-3 text-sm leading-6 text-ink/75">
        Each tile is a marketplace listing. Some are scams. Open one and look for suspicious details.
      </p>
      <p className="mt-3 text-sm leading-6 text-ink/75">
        Scams have four or more suspicious details.
      </p>
      <p className="mt-3 text-sm leading-6 text-ink/75">
        In a safe listing, suspicious details equal the number of scam listings touching the tile.
      </p>
      <p className="mt-3 text-sm leading-6 text-ink/75">
        You win the game by reporting every scam.
      </p>
      <p className="mt-3 text-sm leading-6 text-ink/75">
        You lose the game if you buy a scam item, run out of money, or falsely report three listings.
      </p>
      <div className="mt-4 grid gap-2 border-t border-ink/15 pt-4 text-sm font-bold text-ink/75">
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-sm border border-[#d4aa35] bg-[#fff1b8]" aria-hidden="true" />
          <span>Yellow tiles are incorrect numbers.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-sm border border-[#8fb18a] bg-[#dbe8d7]" aria-hidden="true" />
          <span>Green tiles are correct numbers.</span>
        </div>
      </div>
    </>
  );

  const mobileHowToPlay = (
    <details className="mb-3 rounded-md border-2 border-ink bg-white/80 p-4 lg:hidden">
      <summary className="cursor-pointer text-lg font-black">How to Play</summary>
      {howToPlayContent}
    </details>
  );

  const desktopHowToPlay = (
    <section className="hidden rounded-md border-2 border-ink bg-white/80 p-4 lg:block">
      <h2 className="text-lg font-black">How to Play</h2>
      {howToPlayContent}
    </section>
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-4 border-b-2 border-ink pb-5 lg:flex-row lg:items-end">
        <div>
          <h1 className={`${titleFont.className} text-[1.575rem] leading-none sm:text-[2.1rem]`}>MarketSweeper</h1>
          <p className="mt-2 text-base font-bold text-ink/65 sm:text-lg">
            Second-hand marketplaces can be a real minefield. 💣
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="mt-auto inline-flex h-11 items-center gap-2 rounded-md bg-ink px-4 font-black text-paper"
            onClick={() => resetGame()}
          >
            <RotateCcw size={18} />
            New game
          </button>
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_310px]">
        <div>
          {mobileHowToPlay}
          {indicatorBars}
          <div
            className="tile-grid mx-auto grid aspect-square w-full max-w-[min(82vh,760px)] gap-1 rounded-md border-2 border-ink bg-ink p-1"
            aria-label="Marketplace Minesweeper board"
          >
            {board.map((tile) => {
              const note = tile.playerSuspicionCount;
              const isMineShown = tile.state === "exploded" || tile.state === "revealed_mine";
              const isCorrectOpenedSafeTile =
                tile.state === "opened" && tile.type === "safe" && note === tile.adjacentMineCount;
              const isIncorrectOpenedSafeTile =
                tile.state === "opened" && tile.type === "safe" && note !== tile.adjacentMineCount;
              return (
                <button
                  key={tile.id}
                  type="button"
                  aria-label={tileLabel(tile)}
                  className={[
                    "relative flex min-h-0 min-w-0 items-center justify-center rounded-sm border text-center font-black transition",
                    "focus:z-10",
                    tile.state === "hidden" && "border-[#d4c9b9] bg-[#f8f5ee] hover:bg-[#fffaf0]",
                    tile.state === "flagged" && "border-[#183f2a] bg-[#183f2a] text-[#b8f3c2]",
                    tile.state === "false_report" && "border-[#b42318] bg-[#b42318] text-white",
                    isCorrectOpenedSafeTile && "border-[#8fb18a] bg-[#dbe8d7] text-moss",
                    isIncorrectOpenedSafeTile && "border-[#d4aa35] bg-[#fff1b8] text-ink",
                    tile.state === "exploded" && "border-[#b42318] bg-[#b42318] text-white",
                    tile.state === "revealed_mine" && "border-gum bg-gum text-white",
                    (recentlyReportedTileId === tile.id || recentlyFalseReportedTileId === tile.id) && "tile-report-success"
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => inspectTile(tile.id)}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    toggleFlag(tile.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key.toLowerCase() === "f") {
                      event.preventDefault();
                      toggleFlag(tile.id);
                    }
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      inspectTile(tile.id);
                    }
                  }}
                >
                  <span className="absolute left-1 top-1 hidden h-1.5 w-1.5 rounded-full bg-ink/20 sm:block" />
                  {tile.state === "flagged" && <span className="px-1 text-[9px] leading-tight sm:text-xs">SCAM FOUND!</span>}
                  {tile.state === "false_report" && <span className="px-1 text-[9px] leading-tight sm:text-xs">FALSE REPORT</span>}
                  {tile.state === "opened" && note > 0 && <span className="text-xl sm:text-3xl">{note}</span>}
                  {isMineShown && <span className="text-[10px] sm:text-xs">SCAM</span>}
                  {tile.state === "hidden" && (
                    <Search className="h-[42%] w-[42%] text-ink/35" aria-hidden="true" strokeWidth={2.6} />
                  )}
                </button>
              );
            })}
          </div>
          {recentlyReportedTileId && (
            <div
              className="report-success-toast pointer-events-none absolute left-1/2 top-4 z-20 rounded-md border-2 border-ink bg-notice px-5 py-3 text-lg font-black text-ink shadow-card"
              role="status"
              aria-live="polite"
            >
              Good job!
            </div>
          )}
        </div>

        <aside className="space-y-4">
          {desktopHowToPlay}

          <section className="receipt-panel rounded-md border-2 border-ink bg-white/85 p-4">
            <div className="flex items-center justify-between gap-3 border-b border-dashed border-ink/30 pb-3">
              <h2 className="text-lg font-black">Receipt</h2>
              <span className="rounded-md bg-paper px-2 py-1 text-xs font-black text-ink/65">
                Total {formatCurrency(Math.max(0, budgetSpent))}
              </span>
            </div>
            {purchasedListings.length === 0 ? (
              <p className="mt-4 text-sm font-semibold text-ink/55">No purchases yet.</p>
            ) : (
              <ol className="mt-4 space-y-3">
                {purchasedListings.map((purchase, index) => (
                  <li
                    key={`${purchase.tileId}-${index}`}
                    className="receipt-row grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-sm border-b border-ink/10 pb-3 text-sm"
                  >
                    <span className="font-bold leading-5 text-ink">{purchase.title}</span>
                    <span className="font-black text-gum">{purchase.price}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

        </aside>
      </section>

      {selectedTile && selectedListing && (
        <ListingModal
          tile={selectedTile}
          listing={selectedListing}
          status={status}
          onClose={closeSelectedTile}
          onOpenTile={openTile}
          onToggleFlag={toggleFlag}
          onSetSuspicionCount={setSuspicionCount}
          onReplay={() => resetGame()}
          gameOverMessage={gameOverMessage}
          secretMode={secretMode}
          incorrectGuessReveal={incorrectGuessRevealTileId === selectedTile.id}
          onIncorrectGuessRevealComplete={closeSelectedTile}
        />
      )}

      {status === "won" && !delayWinOverlay && !winOverlayDismissed && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-5" role="dialog" aria-modal="true" aria-labelledby="win-title">
          <section className="w-full max-w-md rounded-lg border-2 border-ink bg-[#fffaf0] p-6 text-center shadow-card">
            <Trophy className="mx-auto mb-4 text-moss" size={56} aria-hidden="true" />
            <h2 id="win-title" className="text-4xl font-black text-ink">
              YOU WON!
            </h2>
            <p className="mt-3 text-base font-semibold text-ink/75">
              You reported the scams without getting banned by marketplace moderation.
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-3 rounded-md border border-ink/15 bg-white/70 p-4 text-sm">
              <dt className="font-bold text-ink/60">False reports</dt>
              <dd className="text-right font-black">{falseReports}</dd>
              <dt className="font-bold text-ink/60">Time taken</dt>
              <dd className="text-right font-black">{formatSeconds(elapsedSeconds)}</dd>
              <dt className="font-bold text-ink/60">Reported</dt>
              <dd className="text-right font-black">
                {flagsUsed}/{mineCount} ({reportPercent}%)
              </dd>
            </dl>
            <button
              type="button"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 font-black text-paper"
              onClick={() => resetGame()}
            >
              <RotateCcw size={18} />
              Restart
            </button>
            <button
              type="button"
              className="ml-3 mt-6 inline-flex items-center rounded-md border-2 border-ink bg-white px-5 py-3 font-black text-ink"
              onClick={() => setWinOverlayDismissed(true)}
            >
              Show Board
            </button>
          </section>
        </div>
      )}
      <button
        type="button"
        aria-label={secretMode ? "Disable secret highlight mode" : "Enable secret highlight mode"}
        aria-pressed={secretMode}
        title="Secret mode"
        className={[
          "fixed bottom-3 right-3 z-40 grid h-8 w-8 place-items-center rounded-full border border-ink/10 bg-paper/70 text-ink/35 shadow-sm transition hover:text-ink/75 focus:text-ink",
          secretMode && "border-gum/50 bg-notice/80 text-gum"
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setSecretMode((current) => !current)}
      >
        <Pi size={16} aria-hidden="true" />
      </button>
    </main>
  );
}
