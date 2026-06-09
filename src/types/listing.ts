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
