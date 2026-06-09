import type { MarketplaceListing } from "@/types/listing";

const mismatchedSafePhotos = [
  "dining-table-clue-0-1-01.png",
  "switch-console-clue-1-11-01.png",
  "espresso-machine-clue-2-9-01.png",
  "tool-chest-clue-3-7-01.png",
  "camera-lens-clue-4-5-01.png",
  "lego-bin-clue-5-3-01.png",
  "guitar-amp-clue-6-1-01.png",
  "bike-rack-clue-7-1-01.png"
];

const scams = [
  [
    "bond-before-keys",
    "Sunny studio, keys after bond",
    "$600 bond",
    "Rental Desk Morgan",
    "Small studio with bright windows and tidy kitchenette. Owner is interstate this week, so the viewing address is sent once the holding bond is confirmed."
  ],
  [
    "console-box-photo",
    "Current-gen console, box shown",
    "$90",
    "GameSupply Neil",
    "Console is packed for moving and ready to go. Box photo added because it is already taped up; can arrange courier today after payment clears."
  ],
  [
    "lego-vault",
    "Rare licensed brick mountain",
    "$65",
    "BrickWizard Official",
    "Mixed collector lot from storage, includes ships, figures, and display pieces. Lots of messages already, small hold payment keeps it aside until tonight."
  ],
  [
    "festival-ticket",
    "Two sold-out festival tickets",
    "$140",
    "Ticket Auntie",
    "Two digital passes available because friends pulled out. Screenshots can be sent once transfer is done; need gone before the name-change window closes."
  ],
  [
    "couch-vanishing",
    "Designer couch, delivery only",
    "$80",
    "LoungeKing 74",
    "Three-seat couch in good condition, currently wrapped in the van. Delivery available this afternoon, driver asks for fuel contribution before leaving."
  ],
  [
    "camera-kit",
    "Professional camera kit",
    "$210",
    "Lens Hub Kelvin",
    "Camera body, two lenses, charger, bag, and spare battery. Packed for relocation, so inspection is tricky today; courier pickup is easiest."
  ],
  [
    "ute-parts",
    "Rare ute parts bundle",
    "$120",
    "Motor Parts Direct",
    "Bonnet, mirrors, trim pieces, and lights from a workshop cleanout. Supplier photos attached while everything is boxed at the back of storage."
  ],
  [
    "phone-sealed",
    "Latest phone sealed, receipt missing",
    "$250",
    "Mobile Warehouse Tom",
    "Unopened phone in original wrap, unwanted upgrade. Receipt went through work email, but serial can be checked after sale. Bank transfer preferred."
  ],
  [
    "puppy-deposit",
    "Tiny designer puppy",
    "$300 deposit",
    "Paws Courier",
    "Last little pup available from a family litter. Transport can be arranged from regional Victoria; deposit confirms the spot before travel is booked."
  ],
  [
    "moving-overseas",
    "Everything must go today",
    "$50",
    "Plane Ticket Greg",
    "Clearing furniture and electronics before the flight. Pickup windows are tight, but payment now holds any item while the movers finish loading."
  ],
  [
    "gaming-pc-specs-later",
    "Gaming PC, specs after payment",
    "$180",
    "RGB Nathan",
    "High-end gaming tower with coloured fans, very fast. Specs are on the invoice in storage, but it ran all the big games smoothly last week."
  ],
  [
    "fridge-courier",
    "French door fridge",
    "$75",
    "Cold Goods Office",
    "Large fridge from office refit, clean shelves and working freezer. Courier is booked for multiple deliveries, small holding fee confirms your stop."
  ],
  [
    "watch-certificate",
    "Luxury watch with certificate",
    "$190",
    "Timepiece Club",
    "Gifted watch with box and papers. Certificate photo is cropped because it has family details on it; happy to post securely."
  ],
  [
    "scooter-storage",
    "Electric scooter in storage",
    "$110",
    "Quick Wheelz",
    "Foldable electric scooter, battery still strong. It is stored in a unit I cannot access until the booking is paid, but delivery can be organised."
  ],
  [
    "violin-estate",
    "Old violin estate sale",
    "$60",
    "Estate Helper Jo",
    "Older violin from a relative's estate, unsure of brand but looks lovely. Selling quickly to help clear the house before settlement."
  ],
  [
    "tool-pallet",
    "Tradie tool pallet",
    "$95",
    "Tool Clearance Max",
    "Bulk tools from a cancelled renovation job. Drills, batteries, saws, and cases included; wholesale lot, no splitting, quick collection preferred."
  ],
  [
    "tablet-classroom",
    "Bulk tablets from school upgrade",
    "$45 each",
    "Edu Tech Pete",
    "Classroom tablets from an upgrade, good for kids or parts. Minimum two per buyer, direct transfer reserves a carton for pickup."
  ],
  [
    "caravan-weekend",
    "Caravan weekend bargain",
    "$500 deposit",
    "Holiday Storage",
    "Older caravan ready for summer trips. Stored off-site, viewing address is sent after deposit because the yard has limited access."
  ],
  [
    "designer-bag",
    "Designer bag unwanted gift",
    "$85",
    "Bag Boutique Liam",
    "Unwanted gift, never used, comes with dust bag. Using catalogue photos because the bag is boxed for travel; can post before airport run."
  ],
  [
    "drone-kit",
    "Drone kit with spare batteries",
    "$120",
    "Sky Dealz",
    "Drone kit with controller, charger, and spare batteries. Photos show the kit from a few angles; selling because I upgraded and need desk space."
  ]
] as const;

function sellerSlug(sellerName: string): string {
  return sellerName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const scamListings: MarketplaceListing[] = scams.map(([id, title, price, sellerName, detail], index) => {
  const imageFilenames = [`${id}-01.png`];

  if (index % 2 === 0) {
    imageFilenames.push(mismatchedSafePhotos[index % mismatchedSafePhotos.length]);
  }

  return {
    id,
    title,
    price,
    location: "VIC, maybe",
    sellerName,
    sellerProfileAge: "Joined this month",
    sellerAvatarType: "logo",
    sellerAvatarFilename: `profile-${sellerSlug(sellerName)}-non-face-01.png`,
    description: detail,
    imageFilenames,
    suspiciousSignals: [
      "deposit_required",
      "delivery_only",
      "payment_outside_platform",
      "urgent_sale_pressure",
      "brand_new_profile",
      "seller_no_face_photo",
      "vague_location",
      ...(imageFilenames.length > 1 ? ["image_description_mismatch" as const] : [])
    ],
    category: "misc",
    isScamTemplate: true
  };
});
