# PRD: MarketSweeper

## 1. Product Summary

**Product name:** MarketSweeper

**Subheading:** Second-hand marketplaces can be a real minefield. 💣

**Type:** Browser-based web game

**Deployment target:** Vercel Hobby plan

**Core concept:** Minesweeper, but every tile is a fictional second-hand marketplace listing. Scam listings are mines. Safe listings contain suspicious details whose count equals the number of adjacent scam listings.

The player inspects listings, counts suspicious details, buys listings they believe are safe, and reports listings they believe are scams.

The game uses fictional, local content only. It must not connect to, scrape, fetch, copy, or reproduce real marketplace listings.

---

## 2. Current Product Goals

The app should:

- Reinterpret Minesweeper as a marketplace scam-detection puzzle.
- Make suspicious details useful as deduction clues, not obvious answer labels.
- Use fictional listing data and static image assets.
- Run fully client-side after initial load.
- Deploy cleanly on Vercel Hobby with no required API endpoints.
- Persist the current game to `localStorage` so refreshes preserve progress.
- Work on desktop and mobile.

---

## 3. Non-Goals

The app should not:

- Connect to Facebook, Meta, Marketplace, Gumtree, eBay, Craigslist, or any real marketplace platform.
- Use real listings, real seller identities, real addresses, real payment details, or real marketplace screenshots.
- Require authentication, a database, server-side game state, paid APIs, or runtime AI calls.
- Treat seller profile photos as suspicious details.
- Use profile-picture quality, missing profile photos, non-face profile photos, or avatar mismatch as clue elements.
- Use price as a suspicious detail.
- Require more than one image per listing.

---

## 4. Platform And Stack

### 4.1 Runtime

- Modern web browser.
- Static app behavior with client-side state.
- Desktop and mobile support.

### 4.2 Hosting

- Vercel Hobby plan.
- No required API routes.
- Static assets served from `/public/listings/`.

### 4.3 Current Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React state
- `localStorage` persistence
- Static JPG/PNG/SVG assets in `/public/listings/`

---

## 5. Branding And Visual Design

### 5.1 Header

The header must show:

- Title: `MarketSweeper`
- Subheading: `Second-hand marketplaces can be a real minefield. 💣`
- New game button

The title uses the Google font `Sixtyfour Convergence`.

### 5.2 Favicon

The favicon should be a bomb icon.

### 5.3 Overall Feel

The game should feel:

- Marketplace-inspired
- Puzzle-like
- Slightly absurd
- Clear and playable
- Polished without becoming generic SaaS UI

---

## 6. Board And Difficulty

### 6.1 Board Size

The board is always:

- Width: 9
- Height: 9
- Tiles: 81

### 6.2 Difficulty

The difficulty selector is not shown.

The game defaults to Hard:

- Mines: 16

The code may retain `easy`, `medium`, and `hard` constants internally, but v1 UI uses Hard only.

### 6.3 Board Generation

The board is generated immediately when:

- The app first loads without saved state.
- The player starts a new game.

The budget must be available immediately after board generation.

The generator should:

- Use deterministic seeded randomness.
- Randomly place 16 scam tiles.
- Assign one listing to every tile.
- Avoid repeating listing templates within a board where possible.
- Reject generated boards where any safe tile would need more than 3 suspicious details.

---

## 7. Tile Types And States

### 7.1 Tile Types

```ts
type TileType = "safe" | "mine";
```

### 7.2 Tile States

```ts
type TileState =
  | "hidden"
  | "opened"
  | "flagged"
  | "false_report"
  | "exploded"
  | "revealed_mine";
```

### 7.3 Tile Labels

- Hidden tiles show a search/listing affordance.
- Opened safe tiles show the player's submitted suspicious-detail count if it is greater than 0.
- Correct opened safe tiles are green.
- Incorrect opened safe tiles are yellow.
- Reported scam tiles show `SCAM FOUND!` with dark green tile styling and light green text.
- False reports show `FALSE REPORT` with red tile styling.
- Scam tiles revealed after loss show scam styling.

Reported scam and false-report tile states should animate prominently when set.

---

## 8. Listing Model

Every tile has a `MarketplaceListing`.

```ts
export interface MarketplaceListing {
  id: string;
  title: string;
  price: string;
  location: string;
  sellerName: string;
  sellerProfileAge: string;
  sellerAvatarType: "face" | "object" | "blank" | "logo" | "pet" | "ai_weird";
  sellerAvatarFilename?: string | null;
  description: string;
  imageFilenames: string[];
  suspiciousSignals: SuspiciousSignal[];
  category: ListingCategory;
  isScamTemplate?: boolean;
}
```

### 8.1 Suspicious Signals

Current TypeScript signal union:

```ts
export type SuspiciousSignal =
  | "image_description_mismatch"
  | "multiple_items_in_photos"
  | "unnatural_seller_name"
  | "suspiciously_low_price"
  | "delivery_only"
  | "deposit_required"
  | "brand_new_profile"
  | "explicit_not_a_scam"
  | "payment_outside_platform"
  | "urgent_sale_pressure"
  | "vague_location"
  | "stock_photo"
  | "poor_grammar"
  | "too_many_emojis"
  | "sob_story"
  | "refuses_inspection"
  | "duplicate_listing_language";
```

New games must not generate these legacy/inactive signals:

- `stock_photo`
- `multiple_items_in_photos`
- `seller_no_face_photo`
- `suspiciously_low_price`

`seller_no_face_photo` is no longer part of the TypeScript union, but saved-state migration still recognizes it as a raw legacy value.

### 8.2 One Suspicious Element Per Section

There must be no more than one suspicious element in each listing section:

- Title
- Description
- Seller profile
- Listing image
- Location

Price must not be used as a suspicious element.

Seller profile photos must not be used as suspicious elements.

---

## 9. Safe Listing Rules

For every safe tile:

```ts
suspiciousSignals.length === adjacentMineCount
```

The safe listing's suspicious detail count equals the number of adjacent scam tiles.

Safe listings:

- Must have 0 to 3 suspicious details.
- Must never have more than 3 suspicious details.
- Must not have hardcoded copy that gives away that the listing is a scam.
- May look odd, but must still be a non-scam listing.

If the adjacent scam count is 0:

- `suspiciousSignals` must be empty.
- The suspicious detail value should default to 0.
- The tile should not display a number.

---

## 10. Scam Listing Rules

Scam listings are generated dynamically from neutral listing templates.

The same base item can be safe in one playthrough and a scam in another.

Scam listings:

- Must have at least 4 suspicious details.
- Currently use 5 suspicious details.
- Must include a mismatched listing image.
- Must not rely on seller profile photos as suspicious details.
- May dynamically mutate the title, description, seller name, seller profile age, location, and listing image.

Current scam signals include:

- Title: listing insists it is definitely real or quick sale.
- Description: deposit required, postage only, payment outside platform, or urgency pressure.
- Seller: unnatural seller name or brand-new profile.
- Image: photo does not match the listed item.
- Location: vague location.

---

## 11. Image Rules

### 11.1 Listing Images

Each listing displays exactly one image.

Listing images live in:

```txt
/public/listings/
```

Most listing images are JPG files:

```txt
{base-slug}-clue-{count}-{index}-01.jpg
```

Current exception:

```txt
dining-table-clue-0-1-01.png
```

### 11.2 Suspicious Image Detail

The only active photo suspicious detail is:

```ts
"image_description_mismatch"
```

If a listing has `image_description_mismatch`, the app must show a randomly selected image from a different listing instead of the correct image.

The game must not report an image suspicious detail when the displayed image is the correct image for the listing.

### 11.3 Removed Photo Signals

These must not be generated for new games:

- `stock_photo`
- `multiple_items_in_photos`

The app only displays one listing image, so multi-photo clues are out of scope.

### 11.4 Profile Images

Seller profile photos are normal seller context only.

They must not:

- Count as suspicious details.
- Be highlighted in secret mode.
- Be highlighted during reveal animations.
- Be required as clue assets.

Face profile images are JPG files:

```txt
profile-{seller-slug}-face-01.jpg
```

Non-face profile images may exist in the repository, but they are not required by the current game.

---

## 12. Listing Popover

Clicking a tile opens the listing modal.

The modal includes:

- Listing image
- Listing title
- Price
- Location prefixed with `Location: `
- Seller profile card
- Seller name
- Seller profile age
- Seller avatar
- Description
- Suspicious details spotted control
- Buy/report/close actions depending on state

Clicking outside the popover must not close it.

When secret mode is off, unopened listing popovers do not show a Close button.

When a tile has already been bought, reported, or false-reported, reopening it shows a Close button to the left of the Report Listing button.

---

## 13. Suspicious Details Input

The suspicious-detail input is required.

The control uses:

- Minus button
- Numeric display
- Plus button

Rules:

- Default value: 0
- Minimum: 0
- Maximum: 5
- Value is player-entered.
- Value is shown on the board tile after the player buys the listing if greater than 0.
- If the player selects 4, the number turns yellow.
- If the player selects 5, the number turns red.
- The red/yellow number styling must not reveal the actual suspicious count of the current listing.
- The plus/minus controls are disabled when reopening an already bought listing.

If the player already bought the listing, the `Buy it` button is replaced with a grey `Close` button.

---

## 14. Buying Listings

The primary safe action is labelled:

```txt
Buy it
```

Buying a safe listing:

- Opens the tile.
- Adds the listing to the receipt.
- Deducts the listing price from the player's budget.
- Colours the tile green if the submitted count is correct.
- Colours the tile yellow if the submitted count is incorrect.

If the submitted count is incorrect:

- The modal stays open.
- Each actual suspicious element is highlighted in red sequentially.
- A large counter increments as the animation progresses.
- The animation lasts approximately 3 seconds when there are suspicious elements.
- The modal pauses for 1 second after the reveal.
- The modal then closes automatically.

Buying a scam listing:

- Triggers game over.
- Before the game-over overlay appears, each suspicious element in the scam listing is highlighted in red sequentially.
- A large counter increments for each suspicious element.
- The animation lasts approximately 3 seconds.
- Then the game-over overlay appears.

---

## 15. Reporting Listings

The report action is labelled:

```txt
Report listing
```

Reporting a scam:

- Marks the tile as `SCAM FOUND!`.
- Uses dark green tile styling with light green text.
- Plays a prominent success animation.
- Briefly shows `Good job!`.
- Advances the reported progress indicator.

Reporting a safe listing:

- Marks the tile as `FALSE REPORT`.
- Uses red tile styling.
- Plays the same prominent tile animation.
- Increments the false report count.

The player gets two warnings implicitly through the false-report counter.

The third false report ends the game with:

```txt
GAME OVER - you've been banned for making too many false reports.
```

No separate false-report warning text should be displayed.

If a listing has already been bought as safe, the Report Listing button is disabled and greyed out.

---

## 16. Win And Loss Conditions

### 16.1 Win

The intended win condition is reporting every scam listing.

When all scams are reported:

- Status becomes won.
- Reported progress reaches 100%.
- The overlay shows `YOU WON!`.
- The overlay includes false report count, time taken, and reported count.
- The overlay includes Restart and Show Board actions.

The current implementation also treats opening all safe listings as a win path. Product copy should continue to emphasize reporting every scam.

### 16.2 Loss

The player loses if:

- They buy a scam listing.
- They run out of budget.
- They falsely report three safe listings.

Buying a scam listing shows:

```txt
You sent a deposit to “Definitely Greg”, and you definitely won't hear from Greg again.
```

Running out of budget shows:

```txt
GAME OVER! You're out of cash.
```

All game-over and win overlays must darken the background enough that message text is readable.

Game-over overlays and win overlays must include a Show Board option where applicable.

---

## 17. Budget And Receipt

At the start of each game:

```txt
startingBudget = 60% of the total sum of every listing price on the board
```

Budget rules:

- Buying a listing spends its price.
- Reporting does not spend budget.
- Running out of money ends the game.
- Budget must load immediately after board generation.

The top bar includes a budget spent indicator:

```txt
$X of $Y spent (Z%)
```

The budget indicator:

- Appears to the left of elapsed time.
- Uses a red progress bar background.
- Fills left to right based on spend percentage.

The receipt appears under How to Play on desktop and under the board/sidebar flow on mobile.

Receipt rules:

- Shows purchased item titles.
- Shows each purchased item price.
- Shows total spent to the right of the Receipt heading.
- Does not show running totals per item.

---

## 18. Progress Indicators

The top indicator area includes:

- Reported scams progress
- False reports progress
- Budget spent progress
- Time elapsed

Reported scams label:

```txt
X/X reported (Y%)
```

False reports label:

```txt
X/3 false reports (Y%)
```

Both reported and false-report indicators use a progress-bar background.

Reported progress uses green.

False-report progress uses red.

Budget progress uses red.

The seed must not be shown in the top bar.

---

## 19. How To Play

Current copy:

```txt
Each tile is a marketplace listing. Some are scams. Open one and look for suspicious details.

Scams have four or more suspicious details.

In a safe listing, suspicious details equal the number of scam listings touching the tile.

You win the game by reporting every scam.

You lose the game if you buy a scam item, run out of money, or falsely report three listings.
```

The How to Play section includes a legend:

- Yellow tiles are incorrect numbers.
- Green tiles are correct numbers.

On small screens:

- How to Play appears above the indicator bars.
- The section is collapsed by default.
- The text after the `How to Play` heading is hidden/shown in an accordion.

On desktop:

- How to Play appears in the right sidebar.
- It is expanded by default.

---

## 20. Secret Mode

Secret mode is activated by a subtle Pi icon button at the bottom-right of the page.

When secret mode is on:

- Scam listing popovers are visually marked in red.
- Suspicious elements are highlighted individually.
- Only the suspicious element itself is highlighted, not the entire section.
- Suspicious description clues highlight only the suspicious sentence.
- Seller profile age can be highlighted when it is the suspicious seller clue.
- Seller name can be highlighted when it is the suspicious seller clue.
- Listing image can be highlighted only for actual image mismatch.
- Seller profile photos must not be highlighted.

Secret mode is a hidden/debug-style feature, not the default player experience.

---

## 21. Reopening Completed Listings

When a bought, reported, or false-reported listing is reopened:

- The suspicious elements are highlighted in red immediately.
- No counter animation is replayed.
- The Close button is available.

For bought safe listings:

- The plus/minus controls are disabled.
- The Buy it button is replaced with a grey Close button.

For bought safe listings:

- Correct submitted count means green tile.
- Incorrect submitted count means yellow tile.

---

## 22. State Persistence

Game state is saved to:

```txt
marketsweeper:game-state:v1
```

The saved state includes:

- Status
- Board
- Seed
- Selected tile
- Start/end times
- False report count
- Game-over message
- Win overlay dismissal
- Secret mode
- Budget
- Purchased listings

Refreshing the page should preserve the current game state.

Saved state migration should:

- Convert old listing PNG filenames to JPG where applicable.
- Preserve the dining-table PNG exception.
- Convert old profile PNG filenames to JPG.
- Convert legacy photo signals to `image_description_mismatch` and ensure the image is actually mismatched.
- Convert legacy profile-photo suspicious signals to a non-photo seller clue.

---

## 23. Assets

### 23.1 Listing Assets

Listing assets live in:

```txt
/public/listings/
```

The full required image filename list is maintained in:

```txt
IMAGE_FILENAMES.md
```

The listing title/description/image table is maintained in:

```txt
LISTING_IMAGE_TABLE.md
```

### 23.2 Listing Photo Rules

- Each listing has one displayed photo.
- Listing photos are mostly JPG.
- Do not change current filenames without updating code and docs.
- If a scam's photo is suspicious, display a random image from a different listing.
- Missing images should show a placeholder and log a warning in development.

### 23.3 Profile Photo Rules

- Profile photos are JPG.
- Profile photos are associated with seller names.
- Profile photos are not suspicious elements.
- Non-face profile photos are not required by the current game.

---

## 24. Accessibility And Interaction

Required interactions:

- Mouse click or tap tile to inspect listing.
- Right click tile to report/unreport where available.
- Keyboard Enter/Space opens selected tile listing.
- Keyboard `F` toggles report on focused tile.
- Escape closes modal.

Accessible labels must not reveal hidden game information.

Modal behavior:

- Clicking outside the modal must not close it.
- Escape may close the modal.
- Buttons must have clear labels.
- Text must remain readable on mobile.

---

## 25. Routes And APIs

Required app route:

```txt
/
```

Required API endpoints:

```txt
none
```

The app must remain comfortably below the Vercel Hobby endpoint limit.

---

## 26. Validation And Error Handling

Development validation should check:

- Listing IDs are unique.
- Listing image count is no more than 1.
- Safe listing signal counts match their bucket for generated template pools.
- Missing images do not crash the app.

The board generator should throw if it cannot generate a hard board where safe listings have at most 3 adjacent scams.

---

## 27. Current File Structure

Important files:

```txt
/src/app/page.tsx
/src/components/ListingModal.tsx
/src/components/ImageCarousel.tsx
/src/data/listings.ts
/src/data/signalLabels.ts
/src/data/validateListings.ts
/src/game/board.ts
/src/game/adjacency.ts
/src/game/difficulty.ts
/src/game/seededRandom.ts
/src/types/game.ts
/src/types/listing.ts
/public/listings/
/IMAGE_FILENAMES.md
/LISTING_IMAGE_TABLE.md
```

There is no separate `scamListings.ts` pool in the current design. Scam listings are dynamically generated from neutral listing templates.

---

## 28. Deployment

Deployment target:

- Vercel Hobby

Required settings:

- Framework preset: Next.js
- Build command: `npm run build`
- Install command: `npm install` or Vercel default
- Output directory: leave default for Next.js
- Required environment variables: none

Before deployment:

- `npm run lint` should pass.
- `npm run typecheck` should pass.
- `npm run build` should pass.

---

## 29. Acceptance Criteria

### Gameplay

- Board renders as a 9 x 9 grid.
- Default game is Hard with 16 scams.
- Board and budget are ready immediately after new game.
- Every tile has a fictional listing.
- Safe listings have 0 to 3 suspicious details equal to adjacent scam count.
- Scam listings have four or more suspicious details and currently generate five.
- Player can buy listings.
- Player can report listings.
- Player wins by reporting every scam.
- Player loses by buying a scam, running out of money, or making three false reports.
- False reports are visibly marked.
- Reported scams are visibly marked as `SCAM FOUND!`.
- Bought safe tiles are green when the submitted count is correct and yellow when incorrect.

### Listing Experience

- Listing modal shows image, title, price, `Location:`, seller details, description, suspicious detail counter, and actions.
- Unopened listing popovers do not show Close unless secret mode provides the close control.
- Clicking outside the popover does not close it.
- Reopened bought/reported/false-reported listings highlight suspicious elements in red.
- Incorrect safe guesses trigger the sequential red highlight and counter before closing.
- Buying a scam triggers the sequential red highlight and counter before game over.

### Assets

- Listing photos load from `/public/listings/`.
- Each listing displays one photo.
- Image mismatch clues always show an image from another listing.
- Seller profile photos are never suspicious clues.
- Missing images fail gracefully.

### Persistence

- Refreshing the page preserves current game state.
- Starting a new game resets board, budget, receipt, false reports, win/loss state, and timers.

### Responsive UI

- Mobile How to Play appears above indicators and collapses.
- Desktop How to Play appears in the sidebar.
- Text and controls remain usable on phone-sized screens.

### Deployment

- App deploys to Vercel without required API endpoints.
- Build, lint, and typecheck pass.

---

## 30. Agent Notes

The most important implementation rules are:

```txt
Safe listings: suspicious detail count equals adjacent scam count, capped at 3.
Scam listings: four or more suspicious details, currently 5.
Images: only actual mismatched listing photos count as image clues.
Profile photos: never suspicious clues.
Win: reporting all scams is the intended player goal.
```

The player should feel like they are solving a deduction puzzle, not reading labels. Suspicious details should be visible in the listing content, but not explained during ordinary play.
