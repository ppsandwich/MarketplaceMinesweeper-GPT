import type { MarketplaceListing } from "@/types/listing";

const scams = [
  ["bond-before-keys", "Sunny studio, keys after bond", "$600 bond", "Rental Desk Morgan", "apartment photos are identical to four other dreams"],
  ["console-box-photo", "Current-gen console, box shown", "$90", "GameSupply Neil", "console available after transfer, box definitely included emotionally"],
  ["lego-vault", "Rare licensed brick mountain", "$65", "BrickWizard Official", "deposit required because another buyer is apparently breathing nearby"],
  ["festival-ticket", "Two sold-out festival tickets", "$140", "Ticket Auntie", "transfer first and screenshots will materialise after dinner"],
  ["couch-vanishing", "Designer couch, delivery only", "$80", "LoungeKing 74", "driver needs fuel money before the couch starts its journey"],
  ["camera-kit", "Professional camera kit", "$210", "Lens Hub Kelvin", "no inspection because gear is already bubble wrapped in another suburb"],
  ["ute-parts", "Rare ute parts bundle", "$120", "Motor Parts Direct", "photos from supplier but parts are real in spirit"],
  ["phone-sealed", "Latest phone sealed, receipt missing", "$250", "Mobile Warehouse Tom", "payment outside platform keeps fees away from everyone"],
  ["puppy-deposit", "Tiny designer puppy", "$300 deposit", "Paws Courier", "delivery only from interstate breeder with no video calls"],
  ["moving-overseas", "Everything must go today", "$50", "Plane Ticket Greg", "moving overseas in two hours, pay now and trust history"],
  ["gaming-pc-specs-later", "Gaming PC, specs after payment", "$180", "RGB Nathan", "specs are excellent but currently private for security"],
  ["fridge-courier", "French door fridge", "$75", "Cold Goods Office", "courier arranged after small holding fee"],
  ["watch-certificate", "Luxury watch with certificate", "$190", "Timepiece Club", "certificate photographed from a distance for privacy"],
  ["scooter-storage", "Electric scooter in storage", "$110", "Quick Wheelz", "cannot inspect because storage boss is strict"],
  ["violin-estate", "Old violin estate sale", "$60", "Estate Helper Jo", "sob story arrives before any usable photo"],
  ["tool-pallet", "Tradie tool pallet", "$95", "Tool Clearance Max", "brand new profile and wholesale promises"],
  ["tablet-classroom", "Bulk tablets from school upgrade", "$45 each", "Edu Tech Pete", "asks for direct bank transfer to reserve a carton"],
  ["caravan-weekend", "Caravan weekend bargain", "$500 deposit", "Holiday Storage", "deposit unlocks viewing address"],
  ["designer-bag", "Designer bag unwanted gift", "$85", "Bag Boutique Liam", "stock photos and urgent sale before airport"],
  ["drone-kit", "Drone kit with spare batteries", "$120", "Sky Dealz", "photos show three different drones and one heroic sunset"]
] as const;

export const scamListings: MarketplaceListing[] = scams.map(([id, title, price, sellerName, detail]) => ({
  id,
  title,
  price,
  location: "VIC, maybe",
  sellerName,
  sellerProfileAge: "Joined this month",
  sellerAvatarType: "logo",
  description: `The listing looks tempting until the fine print starts wearing tap shoes: ${detail}.`,
  imageFilenames: [`${id}-01.png`],
  suspiciousSignals: [
    "deposit_required",
    "delivery_only",
    "payment_outside_platform",
    "urgent_sale_pressure"
  ],
  category: "misc",
  isScamTemplate: true
}));
