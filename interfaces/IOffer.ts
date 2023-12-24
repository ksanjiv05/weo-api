import { Document } from "mongoose";

export interface IOffer extends Document {
  checkpoint: number;
  creatorId: string;
  brandId: string;
  brandName: string;
  productIds: string[];
  offerTitle: string;
  offerDescription: string;
  offerMedia: string[];
  offerPriceType: string;
  offerPriceAmount: number;
  paymentType: string;
  installmentTimePeriod: string;
  installmentDuration: number;
  minAccessBalance: number;
  maxOAccess: number;
  serviceUnitName: string;
  totalServiceUnitType: string;
  totalServiceUnitItems: number;
  durationUnitType: string;
  durationUnitItems: number;

  // Service unit name : String — [Quantity/Classes/Hours/Lessons/Miles/Sessions/Minutes/Movies]
  // Total Service unit type: String — [Fixed/Dynamic]
  // Duration unit type: String — [Minutes/Hours/Days/Weeks/Months/Years]
  // Duration unit items: int
  totalOffersAvailable: number;
  offerLimitPerCustomer: number;
  offerActivitiesAt: string; //[Both/Online Store/Offline]
  offerActivationStartTime: number; //time
  offerActivationEndTime: number; //time
  offerValidityStartDate: number; //date
  offerValidityEndDate: number; //date
  offerStatus: string; //[pending/live/onhold/draft]
  offerThumbnailImage: string;
  cratededAt?: number;
  updateAt?: number;
}
