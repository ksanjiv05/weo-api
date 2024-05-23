import mongoose, { Schema } from "mongoose";
import logging from "../config/logging";
import { IBrand } from "../interfaces/IBrand";
import { pointSchema } from "./GeoPoint";
import { conn_v1 } from "../db";

const BrandSchema: Schema = new Schema(
  {
    uid: {
      type: String,
      required: true,
    },
    // creatorName: {
    //   type: String,
    //   required: true,
    // },
    brandName: {
      type: String,
      required: true,
    },
    brandDescription: {
      type: String,
      required: true,
    },
    status: {},
    checkpoint: {
      type: Number,
    },
    categoriesIds: [mongoose.Types.ObjectId],
    serviceLocationType: {
      type: String,
    },
    websiteLink: {
      type: String,
    },
    onlineServiceLocationType: {
      type: String,
    },
    onlineLocations: [
      {
        address: String,
        // latitude: String,
        // longitude: String,
        location: pointSchema,
      },
    ],
    offlineLocations: [
      {
        // latitude: Number,
        // longitude: Number,
        location: pointSchema,
        address: String,
        postcode: String,
        landmark: String,
      },
    ],
    coverImage: {
      type: String,
    },
    profileImage: {
      type: String,
    },
  },
  { timestamps: true }
);

BrandSchema.index({ brandName: 1, uid: 1 }, { unique: true });
BrandSchema.index(
  { brandName: 1, brandDescription: 1 },
  {
    weights: { brandName: 1000, brandDescription: 1 },
    background: true,
  }
);

BrandSchema.post<IBrand>("save", function () {
  logging.info("Mongo", "Brand just saved: ");
});

export default conn_v1.model<IBrand>("Brand", BrandSchema);
