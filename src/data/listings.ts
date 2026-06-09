import type { ListingCategory, MarketplaceListing, SuspiciousSignal } from "@/types/listing";

const requiredCounts: Record<number, number> = {
  0: 12,
  1: 12,
  2: 12,
  3: 12,
  4: 8,
  5: 6,
  6: 4,
  7: 2,
  8: 1
};

const signalOrder: SuspiciousSignal[] = [
  "suspiciously_low_price",
  "delivery_only",
  "deposit_required",
  "brand_new_profile",
  "seller_no_face_photo",
  "vague_location",
  "urgent_sale_pressure",
  "image_description_mismatch",
  "explicit_not_a_scam",
  "payment_outside_platform",
  "refuses_inspection",
  "stock_photo",
  "unnatural_seller_name",
  "multiple_items_in_photos",
  "poor_grammar",
  "too_many_emojis",
  "sob_story",
  "duplicate_listing_language"
];

const photoSignals: SuspiciousSignal[] = ["image_description_mismatch", "multiple_items_in_photos"];
const textSignals = signalOrder.filter((signal) => !photoSignals.includes(signal));

const bases: Array<{
  slug: string;
  title: string;
  normalPrice: string;
  cheapPrice: string;
  category: ListingCategory;
  baseDescription: string;
}> = [
  {
    slug: "dining-table",
    title: "Solid timber dining table",
    normalPrice: "$240",
    cheapPrice: "$35",
    category: "furniture",
    baseDescription: "Six-seat table with a few honest scratches and a drawer full of spare Allen keys."
  },
  {
    slug: "switch-console",
    title: "Handheld game console bundle",
    normalPrice: "$310",
    cheapPrice: "$70",
    category: "gaming",
    baseDescription: "Includes dock, charger, two controllers, and one game nobody in the house admits buying."
  },
  {
    slug: "espresso-machine",
    title: "Compact espresso machine",
    normalPrice: "$180",
    cheapPrice: "$40",
    category: "appliances",
    baseDescription: "Works well after descaling and still judges instant coffee silently."
  },
  {
    slug: "tool-chest",
    title: "Rolling tool chest",
    normalPrice: "$260",
    cheapPrice: "$55",
    category: "tools",
    baseDescription: "Seven drawers, two sticky wheels, and a heroic number of mystery washers."
  },
  {
    slug: "camera-lens",
    title: "Portrait camera lens",
    normalPrice: "$420",
    cheapPrice: "$95",
    category: "electronics",
    baseDescription: "Clean glass, caps included, selling because the camera hobby became a spreadsheet hobby."
  },
  {
    slug: "lego-bin",
    title: "Large mixed brick collection",
    normalPrice: "$150",
    cheapPrice: "$25",
    category: "lego",
    baseDescription: "Mostly sorted by colour, except for the grey pieces, which have formed their own government."
  },
  {
    slug: "guitar-amp",
    title: "Practice guitar amplifier",
    normalPrice: "$120",
    cheapPrice: "$30",
    category: "musical_instruments",
    baseDescription: "Bedroom volume amp with clean and crunchy channels. Neighbours have voted it acceptable."
  },
  {
    slug: "office-chair",
    title: "Ergonomic office chair",
    normalPrice: "$190",
    cheapPrice: "$45",
    category: "furniture",
    baseDescription: "Adjustable chair, mesh back, and one armrest that has heard too many meetings."
  },
  {
    slug: "record-crate",
    title: "Crate of vintage records",
    normalPrice: "$90",
    cheapPrice: "$20",
    category: "collectibles",
    baseDescription: "Mostly jazz, folk, and one exercise record that seems personally disappointed in you."
  },
  {
    slug: "bike-rack",
    title: "Tow bar bike rack",
    normalPrice: "$130",
    cheapPrice: "$30",
    category: "vehicles",
    baseDescription: "Carries two bikes and has survived multiple family holidays with quiet dignity."
  },
  {
    slug: "air-fryer",
    title: "Large family air fryer",
    normalPrice: "$95",
    cheapPrice: "$18",
    category: "appliances",
    baseDescription: "Basket is clean, timer works, and the previous owner briefly believed everything was fries."
  },
  {
    slug: "garden-planter",
    title: "Raised garden planter",
    normalPrice: "$80",
    cheapPrice: "$15",
    category: "misc",
    baseDescription: "Timber planter box, weathered but sturdy, suitable for herbs or optimistic tomatoes."
  },
  {
    slug: "standing-desk",
    title: "Electric standing desk",
    normalPrice: "$280",
    cheapPrice: "$60",
    category: "furniture",
    baseDescription: "Motorised desk with memory buttons and one cable tray that has seen office politics up close."
  },
  {
    slug: "noise-headphones",
    title: "Noise cancelling headphones",
    normalPrice: "$160",
    cheapPrice: "$35",
    category: "electronics",
    baseDescription: "Over-ear headphones with case, charger, and enough silence to make public transport negotiable."
  },
  {
    slug: "camping-stove",
    title: "Two-burner camping stove",
    normalPrice: "$85",
    cheapPrice: "$20",
    category: "misc",
    baseDescription: "Clean camp stove with hose, knobs, and the faint memory of sausages cooked in drizzle."
  },
  {
    slug: "cordless-drill",
    title: "Cordless drill kit",
    normalPrice: "$145",
    cheapPrice: "$32",
    category: "tools",
    baseDescription: "Drill, charger, two batteries, and a case that closes if you negotiate with it."
  },
  {
    slug: "washing-machine",
    title: "Front loader washing machine",
    normalPrice: "$220",
    cheapPrice: "$45",
    category: "appliances",
    baseDescription: "Reliable washer, cold and warm cycles working, selling because the laundry got promoted."
  },
  {
    slug: "turntable",
    title: "Belt-drive turntable",
    normalPrice: "$175",
    cheapPrice: "$38",
    category: "electronics",
    baseDescription: "Turntable with dust cover, spare belt, and a stylus that prefers not to discuss house parties."
  },
  {
    slug: "mountain-bike",
    title: "Hardtail mountain bike",
    normalPrice: "$360",
    cheapPrice: "$85",
    category: "vehicles",
    baseDescription: "Medium frame bike with hydraulic brakes and tyres that still believe in weekends."
  },
  {
    slug: "bookshelf-pair",
    title: "Pair of tall bookshelves",
    normalPrice: "$110",
    cheapPrice: "$25",
    category: "furniture",
    baseDescription: "Two matching shelves, adjustable pegs included, previously supported ambitious unread novels."
  },
  {
    slug: "sewing-machine",
    title: "Portable sewing machine",
    normalPrice: "$125",
    cheapPrice: "$28",
    category: "appliances",
    baseDescription: "Compact machine with foot pedal, bobbins, and a manual full of very confident diagrams."
  },
  {
    slug: "keyboard-synth",
    title: "Compact keyboard synth",
    normalPrice: "$210",
    cheapPrice: "$50",
    category: "musical_instruments",
    baseDescription: "Small synth with power supply and presets ranging from tasteful pad to spaceship argument."
  },
  {
    slug: "pokemon-cards",
    title: "Folder of trading cards",
    normalPrice: "$140",
    cheapPrice: "$30",
    category: "collectibles",
    baseDescription: "Sleeved card folder from a tidy collection, mostly shiny things and childhood negotiations."
  },
  {
    slug: "gaming-monitor",
    title: "Curved gaming monitor",
    normalPrice: "$230",
    cheapPrice: "$55",
    category: "gaming",
    baseDescription: "Curved monitor with stand and cable, no dead pixels, only emotional ones after ranked matches."
  },
  {
    slug: "bar-fridge",
    title: "Compact bar fridge",
    normalPrice: "$100",
    cheapPrice: "$22",
    category: "appliances",
    baseDescription: "Small fridge for drinks, snacks, or the yoghurt no one at work is brave enough to move."
  },
  {
    slug: "socket-set",
    title: "Mechanic socket set",
    normalPrice: "$95",
    cheapPrice: "$18",
    category: "tools",
    baseDescription: "Mostly complete socket set in a hard case, with only one size lost to the driveway."
  },
  {
    slug: "camera-tripod",
    title: "Aluminium camera tripod",
    normalPrice: "$75",
    cheapPrice: "$16",
    category: "electronics",
    baseDescription: "Tripod with quick-release plate, smooth head, and legs more stable than most group chats."
  },
  {
    slug: "outdoor-lounge",
    title: "Outdoor lounge setting",
    normalPrice: "$260",
    cheapPrice: "$60",
    category: "furniture",
    baseDescription: "Weathered outdoor seats with cushions, table, and a firm position on afternoon snacks."
  },
  {
    slug: "pressure-washer",
    title: "Electric pressure washer",
    normalPrice: "$150",
    cheapPrice: "$34",
    category: "tools",
    baseDescription: "Pressure washer with wand and hose, last used to discover the driveway was a different colour."
  },
  {
    slug: "baby-pram",
    title: "Foldable baby pram",
    normalPrice: "$190",
    cheapPrice: "$42",
    category: "misc",
    baseDescription: "Clean pram with rain cover, basket, and a fold mechanism that rewards calm adults."
  },
  {
    slug: "robot-vacuum",
    title: "Robot vacuum cleaner",
    normalPrice: "$170",
    cheapPrice: "$40",
    category: "appliances",
    baseDescription: "Robot vacuum with dock, filters, and a proud history of challenging chair legs."
  },
  {
    slug: "bass-guitar",
    title: "Four-string bass guitar",
    normalPrice: "$240",
    cheapPrice: "$58",
    category: "musical_instruments",
    baseDescription: "Bass guitar with soft case, fresh strings, and enough low end to annoy a garage door."
  },
  {
    slug: "board-game-stack",
    title: "Stack of modern board games",
    normalPrice: "$130",
    cheapPrice: "$26",
    category: "collectibles",
    baseDescription: "Five strategy games, pieces counted, friendships only mildly tested."
  },
  {
    slug: "graphics-card",
    title: "Desktop graphics card",
    normalPrice: "$320",
    cheapPrice: "$75",
    category: "gaming",
    baseDescription: "Graphics card from a clean build, boxed with adapter, selling after an upgrade spiral."
  },
  {
    slug: "car-roof-box",
    title: "Car roof cargo box",
    normalPrice: "$210",
    cheapPrice: "$48",
    category: "vehicles",
    baseDescription: "Lockable roof box with clamps and key, suitable for holidays or avoiding boot Tetris."
  },
  {
    slug: "ceramic-vase",
    title: "Large ceramic floor vase",
    normalPrice: "$70",
    cheapPrice: "$12",
    category: "misc",
    baseDescription: "Tall vase with no chips, suitable for branches, umbrellas, or decorative confusion."
  }
];

const sellerNames = [
  "Mara Bell",
  "Gus Fenwick",
  "Nina Stone",
  "Otto Vale",
  "Clara Finch",
  "Benji Holt",
  "Iris Lane",
  "Sam Rivers",
  "Penny Ward",
  "Leo Marsh",
  "Tess Rowan",
  "Ari Pike",
  "Hannah Cho",
  "Marcus Reed",
  "Priya Nair",
  "Elliot Crane",
  "Zoe Haddad",
  "Noah Clarke",
  "Amelia Tran",
  "Harvey Singh",
  "Luca Romano",
  "Grace Okafor",
  "Mila Novak",
  "Jonah Price"
];

const nonFaceAvatarFilenames = [
  "profile-non-face-moving-box-01.png",
  "profile-non-face-dealz-logo-01.png",
  "profile-non-face-suspicious-cat-01.png",
  "profile-non-face-blank-grey-01.png",
  "profile-non-face-ai-weird-smile-01.png"
];

function sellerSlug(sellerName: string): string {
  return sellerName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function faceAvatarFilename(sellerName: string): string {
  return `profile-${sellerSlug(sellerName)}-face-01.png`;
}

function imageFilename(baseSlug: string, count: number, index: number): string {
  return `${baseSlug}-clue-${count}-${index + 1}-01.png`;
}

function mismatchedImageFilenames(baseSlug: string, count: number, index: number): string[] {
  const firstCount = (count + 2) % 9;
  const firstIndex = (index + 5) % requiredCounts[firstCount];
  const firstBase = bases.find((base) => base.slug !== baseSlug && base.category !== bases[firstIndex % bases.length].category)
    ?? bases[(index + 5) % bases.length];
  const secondCount = (count + 5) % 9;
  const secondIndex = (index + 8) % requiredCounts[secondCount];
  const secondBase = bases.find((base) => base.slug !== baseSlug && base.slug !== firstBase.slug) ?? bases[(index + 8) % bases.length];

  return [
    imageFilename(firstBase.slug, firstCount, firstIndex),
    imageFilename(secondBase.slug, secondCount, secondIndex)
  ];
}

function chooseSignals(count: number, index: number): SuspiciousSignal[] {
  if (count === 0) return [];

  const signals: SuspiciousSignal[] = [];
  if ((count + index) % 3 === 0) {
    signals.push(photoSignals[(count + index) % photoSignals.length]);
  }

  let cursor = (count * 3 + index * 2) % textSignals.length;
  while (signals.length < count) {
    const signal = textSignals[cursor % textSignals.length];
    if (!signals.includes(signal)) signals.push(signal);
    cursor += 1;
  }

  return signals;
}

function suspiciousText(signal: SuspiciousSignal): Partial<MarketplaceListing> {
  switch (signal) {
    case "suspiciously_low_price":
      return { price: "$40" };
    case "delivery_only":
      return { description: "Delivery only because pickup is complicated today." };
    case "deposit_required":
      return { description: "A small deposit holds it before anyone else arrives." };
    case "brand_new_profile":
      return { sellerProfileAge: "Joined this week" };
    case "seller_no_face_photo":
      return { sellerAvatarType: "object" };
    case "vague_location":
      return { location: "Somewhere near Melbourne" };
    case "urgent_sale_pressure":
      return { description: "Need gone tonight before a very important van appears." };
    case "image_description_mismatch":
      return {};
    case "explicit_not_a_scam":
      return { description: "This is absolutely not a scam, which should settle the matter." };
    case "payment_outside_platform":
      return { description: "Payment by direct transfer preferred before confirming pickup." };
    case "refuses_inspection":
      return { description: "No inspections, too many time wasters, please trust the vibe." };
    case "stock_photo":
      return { description: "Photos are from the catalogue because the item is packed already." };
    case "unnatural_seller_name":
      return { sellerName: "Market Value Kelvin" };
    case "multiple_items_in_photos":
      return {};
    case "poor_grammar":
      return { description: "Is good item working nice. Selling because move now quick." };
    case "too_many_emojis":
      return { description: "Amazing deal 🔥🔥🔥 today only 😱💸 no questions pls 🙏" };
    case "sob_story":
      return { description: "Selling for my cousin's landlord's emergency, please be kind and fast." };
    case "duplicate_listing_language":
      return { description: "Excellent condition. Excellent condition. Serious buyers only. Serious buyers only." };
  }
}

function makeListing(count: number, index: number): MarketplaceListing {
  const base = bases[(count * 3 + index) % bases.length];
  const signals = chooseSignals(count, index);
  const sellerName = sellerNames[index % sellerNames.length];

  const listing: MarketplaceListing = {
    id: `${base.slug}-clue-${count}-${index + 1}`,
    title: base.title,
    price: count > 0 && signals.includes("suspiciously_low_price") ? base.cheapPrice : base.normalPrice,
    location: "Brunswick, VIC",
    sellerName,
    sellerProfileAge: "Joined 2018",
    sellerAvatarType: "face",
    sellerAvatarFilename: faceAvatarFilename(sellerName),
    description: base.baseDescription,
    imageFilenames: [imageFilename(base.slug, count, index)],
    suspiciousSignals: signals,
    category: base.category
  };

  for (const signal of signals) {
    const patch = suspiciousText(signal);
    listing.description = patch.description ? `${listing.description} ${patch.description}` : listing.description;
    listing.price = patch.price ?? listing.price;
    listing.location = patch.location ?? listing.location;
    listing.sellerName = patch.sellerName ?? listing.sellerName;
    listing.sellerProfileAge = patch.sellerProfileAge ?? listing.sellerProfileAge;
    listing.sellerAvatarType = patch.sellerAvatarType ?? listing.sellerAvatarType;
    listing.sellerAvatarFilename = patch.sellerAvatarFilename ?? listing.sellerAvatarFilename;
    listing.imageFilenames = patch.imageFilenames ?? listing.imageFilenames;
  }

  if (listing.sellerAvatarType === "face") {
    listing.sellerAvatarFilename = faceAvatarFilename(listing.sellerName);
  }

  if (signals.includes("seller_no_face_photo")) {
    listing.sellerAvatarFilename = nonFaceAvatarFilenames[(count + index) % nonFaceAvatarFilenames.length];
  }

  if (signals.includes("image_description_mismatch")) {
    listing.imageFilenames = [listing.imageFilenames[0], mismatchedImageFilenames(base.slug, count, index)[0]];
  }

  if (signals.includes("multiple_items_in_photos")) {
    listing.imageFilenames = [listing.imageFilenames[0], ...mismatchedImageFilenames(base.slug, count, index)];
  }

  return listing;
}

export const listingsBySuspicionCount: Record<number, MarketplaceListing[]> = Object.fromEntries(
  Object.entries(requiredCounts).map(([count, amount]) => [
    Number(count),
    Array.from({ length: amount }, (_, index) => makeListing(Number(count), index))
  ])
) as Record<number, MarketplaceListing[]>;
