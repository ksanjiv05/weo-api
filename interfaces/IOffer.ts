import { Document } from "mongoose";

export interface IOffer extends Document {
  checkpoint: number; //the point at which the offer is edited
  creatorId: string; // the id of the user who created the offer
  brandId: string; // the id of the brand
  brandName: string; // the name of the brand
  subCategories: string[]; // the subcategories of the offer
  offerTitle: string; // the title of the offer
  offerDescription: string; // the description of the offer
  offerMedia: {
    // the media of the offer
    mediaType: string;
    source: string;
  }[];
  // offerPriceType: string;
  offerPriceAmount: number; // the price of the offer
  paymentType: string; // the payment type of the offer [one-time/installment]
  installmentPeriod: string; // the period of the installment [daily/weekly/monthly/yearly]
  installmentTimePeriod: number; // the time period of the duration of the installment period
  installmentDuration: number; // the duration of the installment [3/6/..]
  serviceUnitName: string; // the name of the service unit [Quantity/Classes/Hours/Lessons/Miles/Sessions/Minutes/Movies]
  totalOffersSold: number; // the total number of offers sold
  totalServiceUnitType: string; // the type of the service unit [Fixed/Dynamic]
  totalServiceUnitItems: number; // the total number of service unit items
  durationName: string; // the name of the duration [Minutes/Hours/Days/Weeks/Months/Years]
  durationUnitType: string; // the type of the duration [Fixed/Dynamic]
  durationUnitItems: number; // the total number of duration unit items in numbers [1/2/3/..] of  durationName
  totalOffersAvailable: number; // the total number of offers available
  offerLimitPerCustomer: number; // the limit of the offer per customer
  offerActivitiesAt: string; //[Both/Online Store/Offline]
  offerActivationStartTime: number; //time the time when user can collect that offer
  offerActivationEndTime: number; //time the time when that offer not collectablele
  offerValidityStartDate: number; //date the date when the offer is valid
  offerValidityEndDate: number; //date the date when the offer is not valid
  offerStatus: string; //[pending/live/onhold/draft]
  offerThumbnailImage: string; // the thumbnail image of the offer
  createdAt?: number;
  updateAt?: number;
  //not use in v1
  minAccessBalance?: number; // the minimum access balance required to access the offer not in use
  maxOAccess?: number; // the maximum access to the offer
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
