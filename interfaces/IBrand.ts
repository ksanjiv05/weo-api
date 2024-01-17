import { Document } from "mongoose";

type LocationProps = {
  location: string;
  latitude: number;
  longitude: number;
};
type OfflineLocationProps = {
  location: string;
  latitude: number;
  longitude: number;
  address: string;
  postcode: string;
  landmark: string;
};

export interface IBrand extends Document {
  uid: string; //user_Id
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
