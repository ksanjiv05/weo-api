import { Document } from "mongoose";

type LocationProps = {
  address: string;
  location: {
    coordinates: number[];
  };
};
type OfflineLocationProps = {
  location: {
    coordinates: number[];
  };
  address: string;
  postcode: string;
  landmark: string;
};

export interface IBrand extends Document {
  uid: string; //user_Id
  creatorName: string;
  brandName: string; //brand_name
  brandDescription: string; //brand_description
  status: string | number;
  checkpoint: number;
  categoriesIds?: string[]; //categories_id
  serviceLocationType?: string;
  websiteLink?: string;
  onlineServiceLocationType?: string;
  onlineLocations?: LocationProps[];
  offlineLocations?: OfflineLocationProps[];
  coverImage?: string;
  profileImage?: string; //profile_image
  createdAt: Date;
  updateAt: Date;
}

// user_Id: int
// brand_name: string
// brand_description: string
// status: string/int — [pending/live/onhold]

export enum BRAND_STATUS {
  UNKNOWN = "unknown",
  PENDING = "pending",
  LIVE = "live",
  ON_HOLD = "onhold",
  DRAFT = "draft",
  REJECTED = "rejected",
}
