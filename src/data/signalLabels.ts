import type { SuspiciousSignal } from "@/types/listing";

export const signalLabels: Record<SuspiciousSignal, string> = {
  image_description_mismatch: "photo does not match the description",
  multiple_items_in_photos: "different items appear across photos",
  seller_no_face_photo: "seller profile avoids a normal face photo",
  unnatural_seller_name: "seller name feels manufactured",
  suspiciously_low_price: "price is suspiciously low",
  delivery_only: "seller insists on delivery only",
  deposit_required: "deposit is required before inspection",
  brand_new_profile: "seller profile is brand new",
  explicit_not_a_scam: "listing insists it is not a scam",
  payment_outside_platform: "payment is requested outside the platform",
  urgent_sale_pressure: "seller uses urgency pressure",
  vague_location: "location is vague",
  stock_photo: "photos sound like stock images",
  poor_grammar: "description has odd grammar",
  too_many_emojis: "description uses suspicious emoji pressure",
  sob_story: "sob story pressures the buyer",
  refuses_inspection: "seller refuses inspection",
  duplicate_listing_language: "description sounds copied"
};
