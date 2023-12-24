import { Document } from "mongoose";

export interface IAddress extends Document {
  uid: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  landmark: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  updateAt: Date;
}
