import mongoose, { Schema } from "mongoose";
import logging from "../config/logging";
import { IOffer, OFFER_STATUS } from "../interfaces/IOffer";

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
    subCategories: {
      type: [String],
    },
    offerTitle: {
      type: String,
    },
    offerDescription: {
      type: String,
    },
    offerMedia: [
      {
        mediaType: String,
        source: String,
      },
    ],
    offerPriceAmount: {
      type: Number,
      default: 0,
    },
    offerPriceMinAmount: {
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
    },
    installmentPeriod: {
      type: String,
      lowercase: true,
    },
    installmentTimePeriod: {
      type: Number,
      lowercase: true,
    },
    durationName: {
      type: String,
      default: "",
    },
    installmentDuration: {
      type: Number,
    },
    minAccessBalance: {
      type: Number,
    },
    maxOAccess: {
      type: Number,
    },
    serviceUnitName: {
      type: String,
    },
    totalServiceUnitType: {
      type: String,
    },
    totalServiceUnitItems: {
      type: Number,
    },
    durationUnitType: {
      type: String,
    },
    durationUnitItems: {
      type: Number,
    },
    totalOffersAvailable: {
      type: Number,
    },
    totalOffersSold: {
      type: Number,
      default: 0,
    },
    offerLimitPerCustomer: {
      type: Number,
    },
    offerActivitiesAt: {
      type: String,
    },
    offerActivationStartTime: {
      type: String,
    },
    offerActivationEndTime: {
      type: String,
    },
    offerValidityStartDate: {
      type: Date,
    },
    offerValidityEndDate: {
      type: Date,
    },
    offerStatus: {
      type: String,
      default: OFFER_STATUS.DRAFT,
    },
    offerThumbnailImage: {
      type: String,
    },

    createdAt: {
      type: Number,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

OfferSchema.index(
  { brandId: 1, offerTitle: 1 },
  { unique: true, background: true }
);
OfferSchema.index(
  { offerTitle: "text", offerDescription: "text", brandName: "text" },
  {
    weights: { offerTitle: 1000, offerDescription: 100, brandName: 1 },
    background: true,
  }
);

OfferSchema.post<IOffer>("save", function () {
  logging.info("Mongo", "Offer just saved: ");
});

export default mongoose.model<IOffer>("Offer", OfferSchema);
