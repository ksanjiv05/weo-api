import mongoose, { Schema } from "mongoose";
import logging from "../config/logging";
import { IOffer } from "../interfaces/IOffer";

// checkpoint: 1
// Creator id: int
// Brand Name: String
// Brand Id: int
// Offer status: int — [pending/live/onhold]

const OfferSchema: Schema = new Schema(
  {
    checkpoint: {
      type: Number,
      required: true,
    },
    creatorId: {
      type: String,
      required: true,
    },
    brandId: {
      type: String,
      required: true,
    },
    brandName: {
      type: String,
      required: true,
    },
    productIds: {
      type: [String],
      // required: true,
    },
    offerTitle: {
      type: String,
      // required: true,
    },
    offerDescription: {
      type: String,
      // required: true,
    },
    offerMedia: {
      type: [String],
      // required: true,
    },
    offerPriceType: {
      type: String,
      // required: true,
    },
    offerPriceAmount: {
      type: Number,
      // validate: {
      //   validator: function (v: number) {
      //     return v > 0;
      //   },
      //   message: () => `offerPriceAmount id is required!`,
      // },
      default: 0,
    },
    paymentType: {
      type: String,
      lowercase: true,
      // required: true,
    },
    installmentTimePeriod: {
      type: String,
      lowercase: true,
      // required: true,
    },
    installmentDuration: {
      type: Number,
      // required: true,
    },
    minAccessBalance: {
      type: Number,
      // required: true,
    },
    maxOAccess: {
      type: Number,
      // required: true,
    },
    serviceUnitName: {
      type: String,
      // required: true,
    },
    totalServiceUnitType: {
      type: String,
      // required: true,
    },
    totalServiceUnitItems: {
      type: Number,
      // required: true,
    },
    durationUnitType: {
      type: String,
      // required: true,
    },
    durationUnitItems: {
      type: Number,
      // required: true,
    },
    totalOffersAvailable: {
      type: Number,
      // required: true,
    },
    offerLimitPerCustomer: {
      type: Number,
      // required: true,
    },
    offerActivitiesAt: {
      type: String,
      // required: true,
    },
    offerActivationStartTime: {
      type: Number,
      // required: true,
    },
    offerActivationEndTime: {
      type: Number,
      // required: true,
    },
    offerValidityStartDate: {
      type: Number,
      // required: true,
    },
    offerValidityEndDate: {
      type: Number,
      // required: true,
    },
    offerStatus: {
      type: String,
      // required: true,
    },
    offerThumbnailImage: {
      type: String,
      // required: true,
    },

    createdAt: {
      type: Number,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

OfferSchema.post<IOffer>("save", function () {
  logging.info("Mongo", "Offer just saved: ");
});

export default mongoose.model<IOffer>("Offer", OfferSchema);
