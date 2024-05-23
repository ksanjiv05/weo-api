// Objective : Define the offer model and interface
// Author : Sanjiv Kumar Pandit (ksanjiv0005@gmail.com)

import mongoose, { Schema, Document } from "mongoose";
import { conn_v2 } from "../db";

export interface IOffer extends Document {
  user: any; //creatorId
  brand: any; // brand reference
  outlets: any[]; // outlet reference
  subCategories: any[]; // subCategories reference
  offerName: string;
  offerDescription: string;
  offerDataPoints: any[]; // offer data points
  boost: any[]; // boost reference
}

const offerSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    outlets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Outlet",
        required: true,
      },
    ],
    subCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categories",
        // required: true,
      },
    ],
    offerName: {
      type: String,
    },
    offerDescription: {
      type: String,
    },
    offerDataPoints: [
      {
        offerData: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "OfferData",
        },
        version: {
          type: Number,
          default: 1,
        },
      },
    ],
    boost: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Boost",
      },
    ],
  },
  { timestamps: true }
);

offerSchema.index({ offerName: 1, brand: 1, user: 1 }, { unique: true });

offerSchema.index({ offerName: "text", offerDescription: "text" });

export default conn_v2.model<IOffer>("Offer", offerSchema);

// const outletSchema = {
//   outletName: {
//     type: String,
//     required: true,
//   },
//   address: {
//     outletAddress: String,
//     location: {
//       type: { type: String, enum: ["Point"], default: "Point" },
//       coordinates: { type: [Number], index: "2dsphere" }, // Latitude and Longitude
//     },
//   },
// };

// const offerSchema = {
//   offerName: String,
//   offerDescription: String,
//   outlets: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Outlet",
//       required: true,
//     },
//   ],
// };
