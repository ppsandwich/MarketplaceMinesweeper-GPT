import { listingsBySuspicionCount } from "@/data/listings";
import { scamListings } from "@/data/scamListings";

const maxListingPhotos = 3;

export function validateListingsData(): void {
  const ids = new Set<string>();

  for (const [bucket, listings] of Object.entries(listingsBySuspicionCount)) {
    const expected = Number(bucket);
    if (listings.length === 0) {
      console.warn(`No listings available for suspicion count ${bucket}.`);
    }

    for (const listing of listings) {
      if (ids.has(listing.id)) console.warn(`Duplicate listing id: ${listing.id}`);
      ids.add(listing.id);
      if (listing.suspiciousSignals.length !== expected) {
        console.warn(
          `Listing ${listing.id} is in bucket ${bucket} but has ${listing.suspiciousSignals.length} signals.`
        );
      }
      if (listing.imageFilenames.length === 0) {
        console.warn(`Listing ${listing.id} has no image filenames.`);
      }
      if (listing.imageFilenames.length > maxListingPhotos) {
        console.warn(`Listing ${listing.id} has ${listing.imageFilenames.length} photos; max is ${maxListingPhotos}.`);
      }
    }
  }

  for (const listing of scamListings) {
    if (ids.has(listing.id)) console.warn(`Scam listing id overlaps safe listing: ${listing.id}`);
    ids.add(listing.id);
    if (!listing.isScamTemplate) console.warn(`Scam listing ${listing.id} is missing isScamTemplate.`);
    if (listing.imageFilenames.length > maxListingPhotos) {
      console.warn(`Scam listing ${listing.id} has ${listing.imageFilenames.length} photos; max is ${maxListingPhotos}.`);
    }
  }
}
