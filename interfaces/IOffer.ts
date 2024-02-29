import { Document } from "mongoose";

export interface IOffer extends Document {
  checkpoint: number;
  creatorId: string;
  brandId: string;
  brandName: string;
  subCategories: string[];
  offerTitle: string;
  offerDescription: string;
  offerMedia: {
    mediaType: string;
    source: string;
  }[];
  // offerPriceType: string;
  offerPriceAmount: number;
  paymentType: string;
  installmentPeriod: string;
  installmentTimePeriod: number;
  installmentDuration: number;
  minAccessBalance?: number;
  maxOAccess?: number;
  serviceUnitName: string;
  totalOffersSold: number;
  totalServiceUnitType: string;
  totalServiceUnitItems: number;
  durationUnitType: string;
  durationUnitItems: number;
  totalOffersAvailable: number;
  offerLimitPerCustomer: number;
  offerActivitiesAt: string; //[Both/Online Store/Offline]
  offerActivationStartTime: number; //time
  offerActivationEndTime: number; //time
  offerValidityStartDate: number; //date
  offerValidityEndDate: number; //date
  offerStatus: string; //[pending/live/onhold/draft]
  offerThumbnailImage: string;
  createdAt?: number;
  updateAt?: number;
}

export enum OFFER_STATUS {
  UNKNOWN = "unknown",
  PENDING = "pending",
  LIVE = "live",
  ON_HOLD = "onhold",
  DRAFT = "draft",
  REJECTED = "rejected",
}

// Service unit name : String — [Quantity/Classes/Hours/Lessons/Miles/Sessions/Minutes/Movies]
// Total Service unit type: String — [Fixed/Dynamic]
// Duration unit type: String — [Minutes/Hours/Days/Weeks/Months/Years]
// Duration unit items: int
