# MarketSweeper

MarketSweeper is a browser game that reimagines Minesweeper as a second-hand marketplace scam-detection puzzle.

Each tile is a fictional marketplace listing. Some listings are scams. Safe listings contain suspicious details, and the number of suspicious details in a safe listing matches the number of scam listings touching that tile. Players inspect listings, choose how many suspicious details they spotted, buy listings they think are safe, and report listings they think are scams.

The game is fully fictional. It does not connect to Facebook Marketplace or any real marketplace platform, and it does not use real listings.

## Features

- 9 x 9 Minesweeper-style board
- Hard mode by default, with 16 scam listings
- Dynamic listing generation from neutral item templates
- Suspicious details embedded in titles, descriptions, seller details, location, and mismatched listing photos
- One listing image per listing
- Budget and receipt mechanics
- False report limit: the third false report ends the game
- Win condition based on reporting every scam
- Local game-state persistence with `localStorage`
- Mobile-friendly layout with a collapsible How to Play section
- Secret/debug mode for highlighting suspicious elements

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Lucide React icons
- Static assets in `public/listings`
- Local browser state via `localStorage`

No database, authentication, server-side game state, or required API endpoints are used.

## Install

Requirements:

- Node.js 20+
- npm

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Scripts

```bash
npm run dev
```

Runs the local development server.

```bash
npm run lint
```

Runs ESLint.

```bash
npm run typecheck
```

Runs TypeScript without emitting build output.

```bash
npm run build
```

Creates a production Next.js build.

```bash
npm run start
```

Runs the production build locally after `npm run build`.

## Assets

Listing and profile images live in:

```txt
public/listings/
```

The required asset filenames are documented in:

```txt
IMAGE_FILENAMES.md
```

The listing image/title/description table is documented in:

```txt
LISTING_IMAGE_TABLE.md
```

Most listing images are JPG files. The current dining table image is a PNG exception.

## Product Spec

The current product requirements are documented in:

```txt
PRD_MARKETPLACE_MINESWEEPER.md
```

## Deploying To Vercel

Use Vercel's Next.js preset.

Recommended settings:

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: leave as Vercel default for Next.js
- Environment variables: none required

Before deploying, run:

```bash
npm run lint
npm run typecheck
npm run build
```
