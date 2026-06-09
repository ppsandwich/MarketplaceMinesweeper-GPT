# PRD: Marketplace Minesweeper

## 1. Product Summary

**Product name:** Marketplace Minesweeper  
**Type:** Browser-based web game  
**Deployment target:** Vercel Hobby plan  
**Core concept:** Minesweeper, but every square is a fictional online marketplace listing. Mines are scam listings. Safe listings contain subtle suspicious details that indicate how many scam listings are adjacent, replacing the traditional numeric clues.

The player’s job is to inspect each listing, count the suspicious elements, infer nearby scams, and clear the board without clicking a scam listing.

This is not a Facebook integration and must not scrape, fetch, copy, or reproduce real Marketplace listings. All listings are fictional, generated, parody-like, and locally stored as game content.

---

## 2. Goals

### 2.1 Player Goals

The player should be able to:

- Start a new game quickly.
- Click tiles to inspect fictional marketplace listings.
- Use suspicious listing details as clues.
- Flag likely scam listings.
- Clear all safe listings without clicking on a scam.
- Feel like they are using judgment, not simply reading highlighted clues.

### 2.2 Product Goals

The app should:

- Reinterpret Minesweeper in a funny, modern, internet-literate way.
- Make scam detection feel like a deduction puzzle.
- Avoid using real marketplace data.
- Run fully in-browser after initial load.
- Deploy cleanly on Vercel Hobby.
- Use no more than 12 API endpoints; ideally use zero.
- Allow the user to generate listing images separately and drop them into a known folder.

---

## 3. Non-Goals

The app should not:

- Connect to Facebook, Meta, Marketplace, Gumtree, eBay, or any real marketplace platform.
- Use real people’s names, photos, profile details, or listings.
- Use AI image generation inside the app.
- Require a database.
- Require authentication.
- Require server-side game state.
- Store personally identifiable information.
- Use paid APIs.
- Highlight suspicious clues for the player.
- Display traditional Minesweeper numbers on tiles during normal gameplay.

---

## 4. Target Platform

### 4.1 Runtime

- Web browser.
- Desktop-first but fully usable on mobile.
- Must work on modern Chrome, Safari, Firefox, and Edge.

### 4.2 Hosting

- Vercel Hobby plan.
- Prefer static generation.
- The game should work as a static app with client-side state.

### 4.3 API Endpoint Constraint

The user is limited to **12 Vercel API endpoints**.

The recommended implementation should use:

- **0 required API endpoints**
- Static JSON content files
- Static image assets
- Client-side board generation
- Local browser state only

Optional future endpoints must be documented but not required.

---

## 5. Recommended Tech Stack

Use a simple, Vercel-friendly stack.

### 5.1 Preferred Stack

- **Framework:** Next.js using App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** React state, `useReducer`, or Zustand if needed
- **Persistence:** LocalStorage only
- **Deployment:** Vercel
- **Asset storage:** `/public/listings/`

### 5.2 Avoid

- Databases
- Server actions
- Auth libraries
- Heavy animation frameworks
- External marketplace APIs
- Runtime AI calls
- Image processing pipelines
- More than one optional API route unless absolutely necessary

---

## 6. Core Game Design

Marketplace Minesweeper follows the logic of classic Minesweeper with one major change:

Traditional Minesweeper shows a number on each safe square.  
Marketplace Minesweeper instead shows a fictional listing.

The number of suspicious details in that listing equals the number of scam listings in adjacent squares.

When inspecting a listing, the player must enter how many suspicious elements they think the listing contains. This is done using a number input flanked by plus and minus controls.

This player-entered number does **not** affect the underlying game logic. It is a note-taking aid. Once entered, the number is shown on the corresponding Minesweeper board tile to help the player reason about the potential location of scam listings.

Example:

- A safe square has 3 scam listings adjacent to it.
- The listing shown on that square must contain exactly 3 suspicious details.
- These details are blended naturally into the listing.
- The player inspects the listing and decides there are 3 suspicious signals.
- The player sets the listing’s suspected count to 3.
- The board tile then displays `3` as the player’s own note.

---

## 7. Board Rules

### 7.1 Tile Types

Each tile is one of:

```ts
type TileType = "safe" | "mine";
```

A mine represents a scam listing.

A safe tile represents a non-scam listing that may still contain suspicious-looking elements as clues.

### 7.2 Adjacency

Adjacent tiles include the 8 surrounding squares:

- Top
- Bottom
- Left
- Right
- Top-left
- Top-right
- Bottom-left
- Bottom-right

### 7.3 Suspicion Count

For every safe tile:

```ts
suspicionCount = number of adjacent mine tiles;
```

The tile’s marketplace listing must contain exactly `suspicionCount` suspicious elements.

If `suspicionCount` is 0, the listing should look broadly normal and trustworthy.

### 7.4 Mine Behaviour

If the player opens a mine tile:

- The game immediately ends.
- The clicked scam listing is shown to the player.
- The scam listing should remain visible in the listing modal or popover.
- A large red overlay must appear on top of the scam listing.
- The overlay text must read: **SCAMMED! Game Over**
- The overlay must include a clear **Replay** button.
- Clicking **Replay** starts a new game using the currently selected difficulty.
- All scam listings are revealed on the board behind the modal.
- The UI should clearly show that the player was scammed.
- Use playful but not overly smug supporting copy.

Example lose message:

> You sent a deposit to “Definitely Greg” and the couch has entered witness protection.

### 7.5 Win Behaviour

The player wins when:

- All non-mine tiles are opened.
- Mine tiles may remain unopened or flagged.

Example win message:

> You cleared the board without buying a $200 PlayStation from a man named Sofa Warehouse Kelvin.

---

## 8. Difficulty Modes

The board should always be a fixed **9 x 9 grid**.

Difficulty changes only the number of mines.

```ts
type Difficulty = "easy" | "medium" | "hard";
```

### 8.1 Easy

- Board: 9 x 9
- Mines: 8
- Suitable for first-time players

### 8.2 Medium

- Board: 9 x 9
- Mines: 12
- Default mode

### 8.3 Hard

- Board: 9 x 9
- Mines: 16
- More ambiguous and punishing

### 8.4 Custom Mode

Do not implement custom mode in v1.

If implemented later, custom mode may allow:

- Mine count
- Seed value

The board should still default to 9 x 9 unless the user explicitly requests variable board sizes later.

---

## 9. First Click Rule

The first tile clicked by the player must never be a mine.

Implementation:

- Generate board only after first click, excluding that coordinate from possible mine positions.
- Or generate the board initially, then relocate a mine if the first click lands on one.

Preferred:

```ts
generateBoard({
  width,
  height,
  mineCount,
  safeFirstClickPosition
});
```

The first clicked tile should also ideally have a low suspicion count, but this is optional.

---

## 10. Listing Content Model

Each tile points to a fictional marketplace listing.

Listings should be structured data, not hardcoded into React components.

Recommended file:

```txt
/src/data/listings.ts
```

or:

```txt
/public/data/listings.json
```

Preferred TypeScript model:

```ts
export type SuspiciousSignal =
  | "image_description_mismatch"
  | "multiple_items_in_photos"
  | "seller_no_face_photo"
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

```ts
export interface MarketplaceListing {
  id: string;
  title: string;
  price: string;
  location: string;
  sellerName: string;
  sellerProfileAge: string;
  sellerAvatarType: "face" | "object" | "blank" | "logo" | "pet" | "ai_weird";
  description: string;
  imageFilenames: string[];
  suspiciousSignals: SuspiciousSignal[];
  category: ListingCategory;
  isScamTemplate?: boolean;
}
```

```ts
export type ListingCategory =
  | "furniture"
  | "electronics"
  | "vehicles"
  | "collectibles"
  | "tools"
  | "appliances"
  | "musical_instruments"
  | "lego"
  | "gaming"
  | "misc";
```

---

## 11. Suspicious Signal Rules

### 11.1 Signal Count Must Match Adjacent Mines

For every safe tile:

```ts
listing.suspiciousSignals.length === adjacentMineCount
```

This is a core game rule.

### 11.2 Suspicious Info Must Not Be Highlighted

The UI must not:

- Badge suspicious details.
- Colour suspicious words.
- Show tooltips explaining suspicious signals.
- Display the suspicion count directly during active play.
- Use icons beside suspicious content.

The player must infer the count by reading and inspecting.

### 11.3 Examples of Suspicious Info

Suspicious info may include:

- Picture does not match description.
- Different items are shown in different listing photos.
- Seller does not have a face photo.
- Seller name does not sound like a natural person.
- Price is suspiciously low.
- Listing says “delivery only”.
- Listing requires deposit or advance payment.
- Seller profile is brand new.
- Listing explicitly says “not a scam”.
- Seller asks for payment outside platform.
- Seller refuses inspection.
- Listing uses weird urgency pressure.
- Listing has a vague location.
- Description feels copied or duplicated.
- The photos look like stock photos.
- Too many emojis in a suspicious sales context.
- Sob story used to pressure buyer.

### 11.4 Suspicious Signal Presentation

Suspicious details should be naturally embedded in:

- Title
- Price
- Seller name
- Seller avatar
- Seller profile age
- Description
- Image set
- Location
- Delivery/payment terms

Example listing with 3 suspicious signals:

```json
{
  "title": "Nintendo Switch OLED - basically new",
  "price": "$85",
  "location": "Melbourne-ish",
  "sellerName": "Fast Dealz Nathan",
  "sellerProfileAge": "Joined Facebook this week",
  "sellerAvatarType": "logo",
  "description": "Moving today so must go quickly. Delivery only. Small deposit required to hold. This is not a scam.",
  "imageFilenames": [
    "switch-oled-01.png",
    "switch-lite-02.png"
  ],
  "suspiciousSignals": [
    "suspiciously_low_price",
    "delivery_only",
    "explicit_not_a_scam"
  ]
}
```

---

## 12. Content Generation Strategy

### 12.1 Required Listing Pools

To generate boards reliably, the app needs listings grouped by suspicion count.

Recommended structure:

```ts
export const listingsBySuspicionCount: Record<number, MarketplaceListing[]> = {
  0: [],
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
  8: []
};
```

Each safe tile should be assigned a random listing from the correct suspicion count pool.

### 12.2 Minimum Listing Counts for v1

To reduce repetition, create at least:

| Suspicion Count | Minimum Listings |
|---:|---:|
| 0 | 12 |
| 1 | 12 |
| 2 | 12 |
| 3 | 12 |
| 4 | 8 |
| 5 | 6 |
| 6 | 4 |
| 7 | 2 |
| 8 | 1 |

Total minimum safe listings: **69**

Also create at least:

| Type | Minimum Listings |
|---|---:|
| Scam mine listings | 20 |

### 12.3 Mine Listings

Mine listings are actual scams. They do not need to obey suspicion-count rules.

Mine listings should be more obviously dangerous once revealed, but not necessarily before being clicked.

Examples:

- Rental bond scam
- Fake console listing
- Fake LEGO bulk lot
- Fake Taylor Swift ticket listing
- Fake couch with delivery-only deposit
- Fake camera gear
- Fake car parts
- Fake iPhone listing
- Fake puppy listing
- Fake “moving overseas today” listing

### 12.4 Listing Reuse

Within a single board:

- Avoid using the same listing twice if possible.
- If the content pool is exhausted, reuse is allowed but should be rare.

---

## 13. Image Asset Requirements

The app does not generate images.

The user will generate image assets manually and place them into the project.

### 13.1 Image Folder

All listing images should go here:

```txt
/public/listings/
```

### 13.2 Naming Convention

Use this naming pattern:

```txt
/public/listings/{listing-id}-{photo-number}.png
```

Examples:

```txt
/public/listings/switch-oled-too-cheap-01.png
/public/listings/switch-oled-too-cheap-02.png
/public/listings/ikea-couch-delivery-only-01.png
/public/listings/ikea-couch-delivery-only-02.png
/public/listings/lego-bulk-lot-scam-01.png
```

### 13.3 Listing ID Rules

Listing IDs should be:

- Lowercase
- Hyphenated
- Human-readable
- Stable
- Unique

Good:

```txt
ps5-too-cheap
ikea-couch-delivery-only
lego-bulk-lot-scam
brand-new-profile-camera
```

Bad:

```txt
listing1
IMG_4829
scammmmm
test-final-final-2
```

### 13.4 Image Reference Example

```ts
{
  id: "ps5-too-cheap",
  imageFilenames: [
    "ps5-too-cheap-01.png",
    "ps5-too-cheap-02.png",
    "ps5-too-cheap-03.png"
  ]
}
```

Images are rendered with:

```tsx
<img src={`/listings/${filename}`} alt="" />
```

### 13.5 Image Requirements

Recommended image specs:

- Format: PNG or JPG
- Preferred size: 1024 x 1024
- Minimum size: 768 x 768
- Aspect ratio: 1:1 preferred
- Multiple photos per listing supported
- Avoid real people’s faces unless they are synthetic, fictional, or abstracted
- Avoid real names, addresses, phone numbers, license plates, or screenshots of actual marketplace listings

### 13.6 Missing Image Handling

If an image file is missing:

- Show a placeholder card.
- Do not crash the game.
- Log a warning in development mode.

Placeholder text:

> Photo unavailable, which is honestly suspicious in its own little way.

---

## 14. User Interface

### 14.1 Overall Feel

The UI should feel like:

- Minesweeper
- A dodgy marketplace feed
- Internet scam literacy as a puzzle
- Slightly grimy but polished
- Fun, not preachy

Avoid generic SaaS minimalism.

Suggested aesthetic:

- Soft off-white or pale grey background
- Marketplace-style cards
- Rounded popovers
- Subtle grid
- Slightly absurd listing copy
- Friendly but suspicious interface language

### 14.2 Main Screen Layout

Desktop layout:

- Header
- Difficulty selector
- New game button
- Remaining flags counter
- Timer
- Board grid
- Listing popover/modal
- Game status area

Mobile layout:

- Header compacted
- Controls in a horizontal scroll or stacked row
- Board remains square and scroll-safe
- Listing opens as bottom sheet instead of desktop popover

### 14.3 Header

Content:

- Game title: Marketplace Minesweeper
- Subtitle: “Every listing is a clue. Some are just crimes in a trench coat.”

### 14.4 Board Tiles

Each tile has states:

```ts
type TileState =
  | "hidden"
  | "opened"
  | "flagged"
  | "exploded"
  | "revealed_mine";
```

Hidden tile:

- Looks like a marketplace listing thumbnail/card back.
- May show a generic icon or blurred listing card.
- Does not show suspicion count.

Opened safe tile:

- Shows as cleared.
- May show a small marketplace card thumbnail.
- Shows the player-entered suspicion count if the player has set one.
- Does not show the true adjacent mine count unless the game is over.
- Can be clicked again to reopen the listing popover.

Flagged tile:

- Shows a flag marker.
- Use marketplace-themed language, e.g. “Reported”.
- The player can unflag it.

Mine tile after game over:

- Shows scam state.
- The clicked mine gets special exploded styling.
- The clicked scam listing opens immediately.
- The listing is covered by a large red **SCAMMED! Game Over** overlay.
- The overlay includes a **Replay** button.

### 14.5 Listing Popover

Clicking a tile opens the associated listing in a popover/modal.

The listing popover should include:

- Image carousel
- Title
- Price
- Location
- Seller name
- Seller profile age
- Seller avatar
- Description
- Buttons:
  - “Looks safe”
  - “Report listing”
  - “Close”

Important:

- “Looks safe” opens the tile if it is not already opened.
- “Report listing” flags the tile.
- The player can inspect a tile before deciding.
- On mobile, this should be a bottom sheet.

### 14.6 Player Suspicion Count Input

When a listing is shown, the player must be able to enter the number of suspicious elements they believe are present in that listing.

The control should use:

- A minus button.
- A numeric display.
- A plus button.

Example UI:

```txt
Suspicious details spotted:  [-]  3  [+]
```

Rules:

- Minimum value: 0
- Maximum value: 8
- Default value: null / unset
- The control should be usable with mouse, touch, and keyboard.
- The value is controlled by the player.
- The value does not validate against the real adjacent mine count during active play.
- The value does not open, clear, flag, or otherwise affect the game state beyond note-taking.
- Once set, the value appears on the corresponding board tile.

This allows the player to keep track of their own deduction, similar to writing a number on a Minesweeper square with a slightly suspicious pencil.

### 14.7 Do Not Reveal the True Count

The popover must not say:

- “There are 3 suspicious details.”
- “Adjacent scams: 3.”
- “Clue count: 3.”
- “Correct answer: 3.”

The only clues are the suspicious details themselves.

The player-entered suspicion count is allowed to appear, but it must be clearly treated as the player’s own note, not as confirmed truth.

### 14.8 Optional Post-Game Reveal

After win or loss, the game may reveal the underlying count for each opened safe listing.

This is allowed only after the game is over.

Example post-game detail:

> This listing had 2 suspicious details: delivery only, brand new profile.

This can help the game feel learnable.

---

## 15. Controls

### 15.1 Primary Controls

- New Game
- Difficulty selector
- Flag/report mode toggle for mobile
- Reset
- Optional seed input
- Suspicious detail count control inside listing modal

### 15.2 Desktop Interactions

- Left click hidden tile: open listing popover
- Right click hidden tile: flag/report tile
- Left click flagged tile: no-op or open minimal flag menu
- Right click flagged tile: unflag

### 15.3 Mobile Interactions

Because right click is unavailable:

- Tap tile: open listing popover
- In popover:
  - “Looks safe” opens tile
  - “Report listing” flags tile
- Long press tile may also toggle flag, but this is optional

---

## 16. Game State

Recommended state model:

```ts
interface GameState {
  difficulty: Difficulty;
  status: "idle" | "playing" | "won" | "lost";
  board: Tile[];
  width: 9;
  height: 9;
  mineCount: 8 | 12 | 16;
  flagsUsed: number;
  startedAt: number | null;
  endedAt: number | null;
  selectedTileId: string | null;
  seed: string;
}
```

```ts
interface Tile {
  id: string;
  x: number;
  y: number;
  type: TileType;
  state: TileState;
  adjacentMineCount: number;
  listingId: string;
  playerSuspicionCount: number | null;
}
```

---

## 17. Board Generation

### 17.1 Requirements

The board generator must:

- Always generate a 9 x 9 board.
- Accept mine count, seed, and first clicked coordinate.
- Use the selected difficulty to determine mine count:
  - Easy: 8 mines
  - Medium: 12 mines
  - Hard: 16 mines
- Place mines randomly but deterministically from the seed.
- Ensure first clicked tile is safe.
- Calculate adjacent mine counts.
- Assign listings to each tile:
  - Mine tiles get scam listings.
  - Safe tiles get listings with matching suspicious signal count.

### 17.2 Deterministic Randomness

Use a small seeded random utility.

Do not rely on `Math.random()` for board generation if seed support is implemented.

Recommended:

```ts
function seededRandom(seed: string): () => number
```

### 17.3 Listing Assignment

Pseudo-logic:

```ts
for each tile:
  if tile.type === "mine":
    tile.listingId = getRandomUnusedMineListing()
  else:
    tile.listingId = getRandomUnusedListingBySuspicionCount(tile.adjacentMineCount)
```

Fallback:

If no unused listing exists for a suspicion count, allow reuse.

---

## 18. Scoring

### 18.1 Required v1 Scoring

Show:

- Time elapsed
- Difficulty
- Flags used
- Win/loss result

### 18.2 Optional Future Scoring

Not required for v1.

Could later include:

- Fewest misflags
- Fastest clear
- Scam detection rating
- Local-only high scores

If high scores are implemented, use LocalStorage only.

---

## 19. LocalStorage

Use LocalStorage for:

- Last selected difficulty
- Optional local high scores
- Optional preferred reduced motion setting

Do not use LocalStorage for critical server-backed state.

Suggested keys:

```txt
marketplace-minesweeper:difficulty
marketplace-minesweeper:high-scores
marketplace-minesweeper:settings
```

---

## 20. Routes

### 20.1 Required Routes

Use only these app routes:

```txt
/
```

Optional:

```txt
/about
/how-to-play
```

These are page routes, not API endpoints.

### 20.2 Required API Endpoints

None.

### 20.3 Optional API Endpoints

Only if needed later:

```txt
/api/share-result
/api/health
```

Do not implement these in v1 unless specifically requested.

The app must remain comfortably below the user’s 12 API endpoint limit.

---

## 21. File Structure

Recommended structure:

```txt
/src
  /app
    /page.tsx
    /layout.tsx
    /globals.css
  /components
    Board.tsx
    Tile.tsx
    ListingModal.tsx
    ListingCard.tsx
    GameHeader.tsx
    GameControls.tsx
    GameStatus.tsx
    ImageCarousel.tsx
    HowToPlay.tsx
  /data
    listings.ts
    scamListings.ts
  /game
    board.ts
    adjacency.ts
    seededRandom.ts
    difficulty.ts
    scoring.ts
  /types
    game.ts
    listing.ts
  /utils
    assert.ts
    localStorage.ts

/public
  /listings
    ps5-too-cheap-01.png
    ps5-too-cheap-02.png
    ikea-couch-delivery-only-01.png
```

---

## 22. Listing Data Files

### 22.1 Safe Listings

Use:

```txt
/src/data/listings.ts
```

This file exports:

```ts
export const listingsBySuspicionCount: Record<number, MarketplaceListing[]>;
```

### 22.2 Scam Listings

Use:

```txt
/src/data/scamListings.ts
```

This file exports:

```ts
export const scamListings: MarketplaceListing[];
```

Scam listings should have:

```ts
isScamTemplate: true
```

---

## 23. Content Tone

The copy should be:

- Dry
- Slightly absurd
- Clear
- Practical
- Australian-friendly but not overloaded with slang
- Funny without turning every listing into a joke grenade

Avoid:

- Corporate safety training tone
- Over-explaining scams
- Real brand defamation
- Real people
- Real phone numbers
- Real addresses

Example listing titles:

- “Nintendo Switch OLED, definitely real, quick sale”
- “Designer couch, delivery only, no inspections”
- “Bulk LEGO lot, rare Star Wars, must pay deposit”
- “iPhone 15 Pro Max, box photo only”
- “Dining table, photos are from when it was happier”
- “Gaming PC, specs available after payment”
- “Camera lens, located somewhere near Melbourne”

---

## 24. Accessibility

The game must be playable with:

- Keyboard
- Mouse
- Touch

### 24.1 Keyboard Support

Required:

- Tab through controls and tiles.
- Enter/Space opens selected tile listing.
- F toggles flag/report on focused tile.
- Escape closes modal.

### 24.2 Screen Reader Support

Tiles should have accessible labels, but must not reveal hidden game information.

Good hidden tile label:

```txt
Unopened listing tile, row 3, column 4
```

Bad hidden tile label:

```txt
Safe tile with 3 adjacent mines
```

After game over, revealing counts in accessible labels is acceptable.

### 24.3 Visual Accessibility

- Ensure sufficient contrast.
- Do not rely only on colour for tile states.
- Support reduced motion.
- Keep text readable on mobile.

---

## 25. Responsive Behaviour

### Desktop

- Board centered.
- Listing opens in modal or popover beside board.
- Tile size can be larger.

### Tablet

- Board remains centered.
- Listing modal overlays board.

### Mobile

- Board should fit viewport width.
- Listing appears as bottom sheet.
- Controls are compact.
- Flagging/reporting must not depend on right click.

---

## 26. Error Handling

### 26.1 Missing Listings

If there are not enough listings for a suspicion count:

- Reuse listings from the same count.
- Log warning in development.

### 26.2 Missing Images

If image path fails:

- Show placeholder.
- Do not crash.

### 26.3 Invalid Data

During development, validate:

- Safe listing suspicious signal count matches its bucket.
- Listing IDs are unique.
- Image filenames are present.
- Scam listings are separate from safe listings.

Create a simple validation function:

```ts
validateListingsData();
```

Run it in development mode only.

---

## 27. Analytics

No analytics required for v1.

If analytics are later added:

- Use privacy-friendly analytics.
- Do not record listing choices at an individual level unless explicitly required.
- Do not require cookies for gameplay.

---

## 28. Performance Requirements

The app should:

- Load quickly on Vercel.
- Avoid server calls during gameplay.
- Lazy-load listing images where possible.
- Preload only the selected listing image when modal opens.
- Keep bundle size reasonable.
- Avoid large image files in the initial render path.

Recommended:

- Use Next.js image optimisation only if it does not complicate static deployment.
- Otherwise use standard image tags with correctly sized assets.

---

## 29. Security & Safety

The app must:

- Use fictional listings only.
- Avoid real profile photos.
- Avoid real addresses.
- Avoid real payment links.
- Avoid real phone numbers.
- Avoid instructing users how to run scams.
- Present scam signs as educational deduction clues, not as a scammer playbook.

Do not include:

- Real marketplace screenshots.
- Real seller names.
- Real scam scripts copied from victims.
- Real payment instructions.

---

## 30. How To Play Copy

Include a short “How to Play” section.

Suggested copy:

> Each square is a marketplace listing. Some are scams.  
>  
> Open a listing and look for suspicious details: weird prices, odd seller names, delivery-only nonsense, brand new profiles, photos that do not match, and the traditional “this is not a scam”, which is usually a small siren wearing a hat.  
>  
> The number of suspicious details in a safe listing tells you how many scam listings are touching it.  
>  
> Report the scams. Clear the safe listings. Do not send a deposit to a man called LoungeKing_74.

---

## 31. Acceptance Criteria

### 31.1 Gameplay

- Player can start a new game.
- Player can choose easy, medium, or hard.
- First clicked tile is never a mine.
- Every tile has a listing.
- Safe tile listings contain suspicious details equal to adjacent mine count.
- Listing modal includes plus/minus controls for the player to enter their suspected number of suspicious elements.
- Player-entered suspicion count is displayed on the corresponding board tile.
- Player-entered suspicion count does not affect win/loss logic, mine placement, tile safety, or board generation.
- Mine tile click ends game.
- Mine tile click shows the scam listing with a large red **SCAMMED! Game Over** overlay.
- Game-over overlay includes a working **Replay** button.
- Opening all safe tiles wins game.
- Player can flag/report suspected scam tiles.
- Timer starts on first tile interaction.
- Game can be reset.

### 31.2 UI

- Board always renders as a 9 x 9 grid.
- Difficulty changes mine count only: Easy has 8 mines, Medium has 12 mines, and Hard has 16 mines.
- Listing popover/modal displays all listing details.
- Suspicious info is not highlighted.
- Game over reveals scam listings.
- Win state is clearly shown.
- Mobile layout is usable.

### 31.3 Assets

- Listing images load from `/public/listings/`.
- Missing images show fallback placeholder.
- Image filenames follow documented convention.
- Listings can have multiple images.

### 31.4 Deployment

- App deploys to Vercel Hobby.
- No database required.
- No required API endpoints.
- No server runtime dependency for gameplay.
- Build passes TypeScript checks.
- App works after refresh.

---

## 32. Suggested Implementation Phases

### Phase 1: Static Game Shell

Build:

- Next.js app
- Header
- Difficulty selector
- Empty board
- Basic styling

### Phase 2: Board Logic

Build:

- Seeded board generation
- Mine placement
- First-click safety
- Adjacent mine calculation
- Win/loss logic
- Flagging

### Phase 3: Listing System

Build:

- Listing types
- Listing data
- Scam listing data
- Listing assignment by suspicion count
- Listing modal

### Phase 4: Asset Integration

Build:

- `/public/listings/` image loading
- Image carousel
- Missing image fallback
- Asset naming docs

### Phase 5: Polish

Build:

- Mobile bottom sheet
- Keyboard support
- Game status copy
- Post-game reveal
- LocalStorage settings
- Accessibility pass

---

## 33. Agent Notes

The most important implementation rule is:

```txt
For safe tiles, the number of suspicious listing details must exactly equal the number of adjacent scam tiles.
```

Do not show this number directly to the player during active gameplay.

This game should feel like Minesweeper wearing a fake Facebook Marketplace moustache. The logic underneath should be clean, deterministic, and boring in a good way. The content on top should be weird enough to make the player suspicious of a $40 OLED TV from “Mark Television Official”.
