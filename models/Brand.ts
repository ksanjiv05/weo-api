import mongoose, { Schema } from "mongoose";
import logging from "../config/logging";
import { IBrand } from "../interfaces/IBrand";
import { pointSchema } from "./GeoPoint";

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

BrandSchema.post<IBrand>("save", function () {
  logging.info("Mongo", "Brand just saved: ");
});

export default mongoose.model<IBrand>("Brand", BrandSchema);
