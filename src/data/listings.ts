import type { ListingCategory, MarketplaceListing, SuspiciousSignal } from "@/types/listing";

const requiredCounts: Record<number, number> = {
  0: 12,
  1: 12,
  2: 12,
  3: 12
};

const sectionSignalChoices: Array<{
  section: "title" | "description" | "seller" | "photos" | "location";
  signals: SuspiciousSignal[];
}> = [
  { section: "description", signals: ["delivery_only", "deposit_required", "payment_outside_platform", "urgent_sale_pressure", "refuses_inspection", "poor_grammar", "too_many_emojis", "sob_story", "duplicate_listing_language"] },
  { section: "seller", signals: ["brand_new_profile", "seller_no_face_photo", "unnatural_seller_name"] },
  { section: "photos", signals: ["image_description_mismatch", "multiple_items_in_photos", "stock_photo"] },
  { section: "location", signals: ["vague_location"] },
  { section: "title", signals: ["explicit_not_a_scam"] }
];

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
  },
  {
    slug: "patio-umbrella",
    title: "Large patio umbrella",
    normalPrice: "$95",
    cheapPrice: "$20",
    category: "furniture",
    baseDescription: "Outdoor umbrella with crank handle, weighted base, and a mild lean toward shade."
  },
  {
    slug: "tablet-keyboard",
    title: "Tablet with keyboard case",
    normalPrice: "$260",
    cheapPrice: "$62",
    category: "electronics",
    baseDescription: "Tablet, charger, and keyboard case included. Battery still lasts through a sensible afternoon."
  },
  {
    slug: "stand-mixer",
    title: "Bench stand mixer",
    normalPrice: "$210",
    cheapPrice: "$48",
    category: "appliances",
    baseDescription: "Mixer with bowl, whisk, and dough hook, mostly used during one ambitious bread era."
  },
  {
    slug: "mitre-saw",
    title: "Sliding mitre saw",
    normalPrice: "$190",
    cheapPrice: "$45",
    category: "tools",
    baseDescription: "Saw cuts square, guard works, and the dust bag remains more symbolic than effective."
  },
  {
    slug: "road-bike",
    title: "Lightweight road bike",
    normalPrice: "$430",
    cheapPrice: "$100",
    category: "vehicles",
    baseDescription: "Aluminium frame road bike with fresh tape and tyres keen to discuss gradients."
  },
  {
    slug: "mandolin",
    title: "Acoustic mandolin",
    normalPrice: "$160",
    cheapPrice: "$35",
    category: "musical_instruments",
    baseDescription: "Mandolin with case, spare strings, and a bright tone that arrives before permission."
  },
  {
    slug: "comic-box",
    title: "Box of vintage comics",
    normalPrice: "$180",
    cheapPrice: "$40",
    category: "collectibles",
    baseDescription: "Long box of mixed issues, bagged neatly and alphabetised by previous optimism."
  },
  {
    slug: "vr-headset",
    title: "VR headset bundle",
    normalPrice: "$290",
    cheapPrice: "$68",
    category: "gaming",
    baseDescription: "Headset with controllers, charger, and enough foam padding for several realities."
  },
  {
    slug: "storage-cabinet",
    title: "Lockable storage cabinet",
    normalPrice: "$140",
    cheapPrice: "$30",
    category: "furniture",
    baseDescription: "Metal cabinet with two keys, adjustable shelves, and a history of hiding printer paper."
  },
  {
    slug: "portable-projector",
    title: "Portable mini projector",
    normalPrice: "$170",
    cheapPrice: "$38",
    category: "electronics",
    baseDescription: "Compact projector with remote and case, best paired with dim rooms and brave snacks."
  },
  {
    slug: "rice-cooker",
    title: "Large rice cooker",
    normalPrice: "$75",
    cheapPrice: "$15",
    category: "appliances",
    baseDescription: "Rice cooker with steamer basket, measuring cup, and a lid that has seen many weeknights."
  },
  {
    slug: "ladder",
    title: "Telescopic extension ladder",
    normalPrice: "$155",
    cheapPrice: "$35",
    category: "tools",
    baseDescription: "Ladder locks properly, folds compactly, and makes gutters seem briefly achievable."
  },
  {
    slug: "child-car-seat",
    title: "Convertible child car seat",
    normalPrice: "$120",
    cheapPrice: "$25",
    category: "vehicles",
    baseDescription: "Clean car seat with manual, spare covers, and crumbs removed with professional seriousness."
  },
  {
    slug: "electronic-drum-kit",
    title: "Compact electronic drum kit",
    normalPrice: "$360",
    cheapPrice: "$82",
    category: "musical_instruments",
    baseDescription: "Mesh pads, pedal, module, and headphones included for rhythm with domestic diplomacy."
  },
  {
    slug: "coin-album",
    title: "Album of collectable coins",
    normalPrice: "$130",
    cheapPrice: "$28",
    category: "collectibles",
    baseDescription: "Coin album from a family collection, labelled carefully by someone who owned tweezers."
  },
  {
    slug: "arcade-stick",
    title: "Arcade fight stick",
    normalPrice: "$115",
    cheapPrice: "$24",
    category: "gaming",
    baseDescription: "Fight stick with clicky buttons, long cable, and a grudge against coffee tables."
  },
  {
    slug: "bed-frame",
    title: "Queen timber bed frame",
    normalPrice: "$220",
    cheapPrice: "$50",
    category: "furniture",
    baseDescription: "Solid bed frame with slats, bolts labelled, and only one dramatic assembly memory."
  },
  {
    slug: "smart-speaker-pair",
    title: "Pair of smart speakers",
    normalPrice: "$150",
    cheapPrice: "$34",
    category: "electronics",
    baseDescription: "Two speakers reset and ready, with power cords and no strong opinions left configured."
  },
  {
    slug: "microwave",
    title: "Stainless steel microwave",
    normalPrice: "$90",
    cheapPrice: "$18",
    category: "appliances",
    baseDescription: "Microwave heats evenly, plate spins, and the popcorn button remains overconfident."
  },
  {
    slug: "angle-grinder",
    title: "Corded angle grinder",
    normalPrice: "$85",
    cheapPrice: "$17",
    category: "tools",
    baseDescription: "Grinder with handle and guard, used for one project and several cautious pauses."
  },
  {
    slug: "roof-racks",
    title: "Universal car roof racks",
    normalPrice: "$125",
    cheapPrice: "$27",
    category: "vehicles",
    baseDescription: "Adjustable racks with keys and clamps, previously carried kayaks and unrealistic packing plans."
  },
  {
    slug: "clarinet",
    title: "Student clarinet",
    normalPrice: "$145",
    cheapPrice: "$32",
    category: "musical_instruments",
    baseDescription: "Clarinet with case, reeds, and a school-band past it refuses to elaborate on."
  },
  {
    slug: "stamp-collection",
    title: "Starter stamp collection",
    normalPrice: "$95",
    cheapPrice: "$19",
    category: "collectibles",
    baseDescription: "Mixed album of stamps, hinges, and tiny labels written with admirable patience."
  },
  {
    slug: "racing-wheel",
    title: "Gaming racing wheel",
    normalPrice: "$250",
    cheapPrice: "$58",
    category: "gaming",
    baseDescription: "Wheel and pedals with desk clamp, force feedback, and a record of oversteer excuses."
  },
  {
    slug: "hallway-console",
    title: "Narrow hallway console table",
    normalPrice: "$115",
    cheapPrice: "$24",
    category: "furniture",
    baseDescription: "Slim console table with two drawers, ideal for keys, mail, and unresolved errands."
  },
  {
    slug: "wireless-router",
    title: "Mesh wireless router set",
    normalPrice: "$185",
    cheapPrice: "$42",
    category: "electronics",
    baseDescription: "Three-node mesh system reset to factory settings and ready to negotiate with walls."
  },
  {
    slug: "dehumidifier",
    title: "Portable dehumidifier",
    normalPrice: "$155",
    cheapPrice: "$36",
    category: "appliances",
    baseDescription: "Dehumidifier with clean filter, working tank sensor, and a vendetta against damp towels."
  },
  {
    slug: "workbench",
    title: "Garage workbench",
    normalPrice: "$200",
    cheapPrice: "$46",
    category: "tools",
    baseDescription: "Timber workbench with vice marks, sturdy legs, and stains that imply useful weekends."
  },
  {
    slug: "motorcycle-jacket",
    title: "Armoured motorcycle jacket",
    normalPrice: "$175",
    cheapPrice: "$40",
    category: "vehicles",
    baseDescription: "Textile jacket with shoulder and elbow armour, clean liner, and reflective piping."
  },
  {
    slug: "viola",
    title: "Student viola outfit",
    normalPrice: "$190",
    cheapPrice: "$44",
    category: "musical_instruments",
    baseDescription: "Viola with bow, rosin, and case, suitable for lessons or confusing violinists."
  },
  {
    slug: "model-train-set",
    title: "Model train starter set",
    normalPrice: "$160",
    cheapPrice: "$35",
    category: "collectibles",
    baseDescription: "Starter train set with track pieces, controller, and tiny scenery full of ambition."
  },
  {
    slug: "retro-handheld",
    title: "Retro handheld console",
    normalPrice: "$120",
    cheapPrice: "$26",
    category: "gaming",
    baseDescription: "Pocket console with charger, case, and enough old games to damage a commute."
  },
  {
    slug: "linen-armchair",
    title: "Linen accent armchair",
    normalPrice: "$170",
    cheapPrice: "$38",
    category: "furniture",
    baseDescription: "Comfortable armchair with removable cover and one cushion that always looks relaxed."
  },
  {
    slug: "dash-cam",
    title: "Front and rear dash cam",
    normalPrice: "$130",
    cheapPrice: "$30",
    category: "electronics",
    baseDescription: "Dash cam kit with cables, rear camera, and memory card already formatted."
  },
  {
    slug: "portable-freezer",
    title: "Portable camping freezer",
    normalPrice: "$310",
    cheapPrice: "$72",
    category: "appliances",
    baseDescription: "Car fridge freezer with 12V lead, basket, and a proven commitment to cold drinks."
  },
  {
    slug: "tile-cutter",
    title: "Manual tile cutter",
    normalPrice: "$105",
    cheapPrice: "$22",
    category: "tools",
    baseDescription: "Tile cutter with scoring wheel, guide rail, and the confidence of a renovated bathroom."
  },
  {
    slug: "folding-kayak",
    title: "Folding recreational kayak",
    normalPrice: "$340",
    cheapPrice: "$78",
    category: "vehicles",
    baseDescription: "Light kayak with paddle, carry bag, and several dry weekends still implied."
  },
  {
    slug: "banjo",
    title: "Five-string banjo",
    normalPrice: "$230",
    cheapPrice: "$52",
    category: "musical_instruments",
    baseDescription: "Banjo with case and strap, bright enough to make quiet rooms reconsider themselves."
  },
  {
    slug: "film-camera",
    title: "Manual 35mm film camera",
    normalPrice: "$210",
    cheapPrice: "$48",
    category: "collectibles",
    baseDescription: "Film camera with lens, strap, and shutter click that sounds more expensive than it is."
  },
  {
    slug: "flight-stick",
    title: "USB flight stick controller",
    normalPrice: "$95",
    cheapPrice: "$20",
    category: "gaming",
    baseDescription: "Flight stick with throttle slider and buttons labelled for missions nobody completed."
  },
  {
    slug: "butchers-block",
    title: "Kitchen butcher block trolley",
    normalPrice: "$180",
    cheapPrice: "$40",
    category: "furniture",
    baseDescription: "Rolling kitchen trolley with timber top, shelves, and one wheel that enjoys being noticed."
  },
  {
    slug: "photo-printer",
    title: "Compact photo printer",
    normalPrice: "$125",
    cheapPrice: "$28",
    category: "electronics",
    baseDescription: "Photo printer with power cable and sample paper, last used for fridge-door diplomacy."
  },
  {
    slug: "bread-maker",
    title: "Automatic bread maker",
    normalPrice: "$110",
    cheapPrice: "$24",
    category: "appliances",
    baseDescription: "Bread maker with pan and paddle, capable of making the kitchen smell like intent."
  },
  {
    slug: "air-compressor",
    title: "Small workshop air compressor",
    normalPrice: "$195",
    cheapPrice: "$44",
    category: "tools",
    baseDescription: "Compressor with hose and gauge, used for tyres, tools, and one very clean keyboard."
  },
  {
    slug: "roof-pod",
    title: "Slimline roof storage pod",
    normalPrice: "$260",
    cheapPrice: "$60",
    category: "vehicles",
    baseDescription: "Narrow roof pod with mounts and key, ready for skis, camping gear, or overpacking."
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

const listingImageExtensionOverrides: Record<string, "jpg" | "png"> = {
  "dining-table": "png"
};

function imageFilename(baseSlug: string, count: number, index: number): string {
  const extension = listingImageExtensionOverrides[baseSlug] ?? "jpg";
  return `${baseSlug}-clue-${count}-${index + 1}-01.${extension}`;
}

function mismatchedImageFilenames(baseSlug: string, count: number, index: number): string[] {
  const bucketCount = Object.keys(requiredCounts).length;
  const firstCount = (count + 2) % bucketCount;
  const firstIndex = (index + 5) % requiredCounts[firstCount];
  const firstBase = bases.find((base) => base.slug !== baseSlug && base.category !== bases[firstIndex % bases.length].category)
    ?? bases[(index + 5) % bases.length];
  const secondCount = (count + 5) % bucketCount;
  const secondIndex = (index + 8) % requiredCounts[secondCount];
  const secondBase = bases.find((base) => base.slug !== baseSlug && base.slug !== firstBase.slug) ?? bases[(index + 8) % bases.length];

  return [
    imageFilename(firstBase.slug, firstCount, firstIndex),
    imageFilename(secondBase.slug, secondCount, secondIndex)
  ];
}

function chooseSignals(count: number, index: number): SuspiciousSignal[] {
  if (count === 0) return [];

  if (count > sectionSignalChoices.length) {
    throw new Error(`Cannot create ${count} suspicious elements with one clue per listing section.`);
  }

  return Array.from({ length: count }, (_, offset) => {
    const sectionChoice = sectionSignalChoices[(index + offset) % sectionSignalChoices.length];
    return sectionChoice.signals[(count + index + offset) % sectionChoice.signals.length];
  });
}

function suspiciousText(signal: SuspiciousSignal): Partial<MarketplaceListing> {
  switch (signal) {
    case "suspiciously_low_price":
      return {};
    case "delivery_only":
      return { description: "Postage only because pickup is complicated today." };
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
      return { title: "Definitely real, quick sale" };
    case "payment_outside_platform":
      return { description: "Payment by direct transfer preferred before confirming pickup." };
    case "refuses_inspection":
      return { description: "No inspections, too many time wasters, please trust the vibe." };
    case "stock_photo":
      return {};
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
    price: base.normalPrice,
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
    listing.title = patch.title ? `${listing.title} - ${patch.title}` : listing.title;
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
    listing.imageFilenames = [mismatchedImageFilenames(base.slug, count, index)[0]];
  }

  if (signals.includes("multiple_items_in_photos")) {
    listing.imageFilenames = [mismatchedImageFilenames(base.slug, count, index)[1]];
  }

  return listing;
}

export const neutralListingTemplates: MarketplaceListing[] = bases.map((base, index) => {
  const sellerName = sellerNames[index % sellerNames.length];

  return {
    id: `${base.slug}-template`,
    title: base.title,
    price: base.normalPrice,
    location: "Brunswick, VIC",
    sellerName,
    sellerProfileAge: "Joined 2018",
    sellerAvatarType: "face",
    sellerAvatarFilename: faceAvatarFilename(sellerName),
    description: base.baseDescription,
    imageFilenames: [imageFilename(base.slug, 0, index % requiredCounts[0])],
    suspiciousSignals: [],
    category: base.category
  };
});

export function listingFromTemplateWithSuspicionCount(
  template: MarketplaceListing,
  count: number,
  index: number,
  allTemplates: MarketplaceListing[] = neutralListingTemplates,
  random?: () => number
): MarketplaceListing {
  const signals = chooseSignals(count, index);
  const listing: MarketplaceListing = {
    ...template,
    id: `${template.id}-clue-${count}-${index}`,
    imageFilenames: template.imageFilenames.slice(0, 1),
    suspiciousSignals: signals,
    isScamTemplate: false
  };

  for (const signal of signals) {
    const patch = suspiciousText(signal);
    listing.title = patch.title ? `${listing.title} - ${patch.title}` : listing.title;
    listing.description = patch.description ? `${listing.description} ${patch.description}` : listing.description;
    listing.price = patch.price ?? listing.price;
    listing.location = patch.location ?? listing.location;
    listing.sellerName = patch.sellerName ?? listing.sellerName;
    listing.sellerProfileAge = patch.sellerProfileAge ?? listing.sellerProfileAge;
    listing.sellerAvatarType = patch.sellerAvatarType ?? listing.sellerAvatarType;
    listing.sellerAvatarFilename = patch.sellerAvatarFilename ?? listing.sellerAvatarFilename;
  }

  if (signals.includes("seller_no_face_photo")) {
    listing.sellerAvatarFilename = nonFaceAvatarFilenames[(count + index) % nonFaceAvatarFilenames.length];
  }

  const alternateImages = allTemplates
    .filter((candidate) => candidate.id !== template.id && candidate.imageFilenames.length > 0)
    .flatMap((candidate) => candidate.imageFilenames);

  if (signals.includes("image_description_mismatch")) {
    const imageIndex = random ? Math.floor(random() * alternateImages.length) : (count + index) % alternateImages.length;
    const image = alternateImages[imageIndex] ?? listing.imageFilenames[0];
    listing.imageFilenames = [image];
  }

  if (signals.includes("multiple_items_in_photos")) {
    const imageIndex = random ? Math.floor(random() * alternateImages.length) : (count + index + 7) % alternateImages.length;
    const image = alternateImages[imageIndex] ?? listing.imageFilenames[0];
    listing.imageFilenames = [image];
  }

  return listing;
}

export const listingsBySuspicionCount: Record<number, MarketplaceListing[]> = Object.fromEntries(
  Object.entries(requiredCounts).map(([count, amount]) => [
    Number(count),
    Array.from({ length: amount }, (_, index) => makeListing(Number(count), index))
  ])
) as Record<number, MarketplaceListing[]>;
