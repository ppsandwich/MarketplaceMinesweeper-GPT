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
  "Ari Pike"
];

function suspiciousText(signal: SuspiciousSignal, baseTitle: string): Partial<MarketplaceListing> {
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
      return { description: `Photos include ${baseTitle.toLowerCase()} and something that may be a microwave.` };
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
      return { imageFilenames: ["placeholder.svg", "placeholder.svg"] };
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
  const signals = signalOrder.slice(index % 5, index % 5 + count);
  while (signals.length < count) signals.push(signalOrder[signals.length]);

  const listing: MarketplaceListing = {
    id: `${base.slug}-clue-${count}-${index + 1}`,
    title: base.title,
    price: count > 0 && signals.includes("suspiciously_low_price") ? base.cheapPrice : base.normalPrice,
    location: "Brunswick, VIC",
    sellerName: sellerNames[index % sellerNames.length],
    sellerProfileAge: "Joined 2018",
    sellerAvatarType: "face",
    description: base.baseDescription,
    imageFilenames: [`${base.slug}-clue-${count}-${index + 1}-01.png`],
    suspiciousSignals: signals,
    category: base.category
  };

  for (const signal of signals) {
    const patch = suspiciousText(signal, base.title);
    listing.description = patch.description ? `${listing.description} ${patch.description}` : listing.description;
    listing.price = patch.price ?? listing.price;
    listing.location = patch.location ?? listing.location;
    listing.sellerName = patch.sellerName ?? listing.sellerName;
    listing.sellerProfileAge = patch.sellerProfileAge ?? listing.sellerProfileAge;
    listing.sellerAvatarType = patch.sellerAvatarType ?? listing.sellerAvatarType;
    listing.imageFilenames = patch.imageFilenames ?? listing.imageFilenames;
  }

  return listing;
}

export const listingsBySuspicionCount: Record<number, MarketplaceListing[]> = Object.fromEntries(
  Object.entries(requiredCounts).map(([count, amount]) => [
    Number(count),
    Array.from({ length: amount }, (_, index) => makeListing(Number(count), index))
  ])
) as Record<number, MarketplaceListing[]>;
