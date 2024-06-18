// Objective : Define the offer data model and interface
// Author : Sanjiv Kumar Pandit (ksanjiv0005@gmail.com)

import mongoose, { Schema, Document } from "mongoose";
import { conn_v2 } from "../db";

export interface IOfferData extends Document {
  offerId: string;
  offerPriceAmount: number; // price of the offer
  offerPriceMinAmount: number; // min negotiable amount
  offerPriceMinPercentage: number; // min percentage of offer price amount to calculate offer price min amount

  paymentType: string;
  installmentDuration: number; // number of installment
  installmentPeriod?: string; // installment period types i.e days, weekly, monthly ……

  totalOfferUnitItem: number; // number of items in offer
  offerUnitType: string; // quanity type of item i.e Day, Weeks, month, year, classes. it will be based on subcategory selection
  minimumOfferUnitItem: number; // minimum item in offer while collecting

  serviceTime: string; // time of service
  serviceStartDate: Date;
  serviceEndDate: Date;

  offerLiveTillSoldOut: boolean; // flag to show offer live till all items are sold
  offerAvailabilityStartDate: Date; // offer avaialable start days
  offerAvailabilityEndDate: Date; // offer available end days
  offerAvailableAllTime: boolean; //   to check if its avaialbe 24/7, if its false then offerAvaibilitydays will be considered
  offerAvailableDays: [{ days: string; time: string }]; // array of week days name along with time
  totalOffersAvailable: number; // total offer available ( circulation and activation )
  offerReSellable: boolean; // is offer available for re selling
  offerLimitPerCustomer: number; // limitation on user to buy offers
  oRewardDeductPercentagePerSale: number; // percentage of O deduction from creator while collecting
  oRewardDeductPercentageLatePayment: number; // percentage of O deduction from collector as well as creator on lote payment

  offerMedia: [string]; // images/video
}

const offerDataSchema: Schema = new Schema(
  {
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
    },
    offerPriceAmount: {
      type: Number,
    },
    offerPriceMinAmount: {
      type: Number,
    },
    offerPriceMinPercentage: {
      type: Number,
    },
    paymentType: {
      type: String,
    },
    installmentDuration: {
      type: Number,
    },
    installmentPeriod: {
      type: String,
      default: "monthly",
    },
    totalOfferUnitItem: {
      type: Number,
    },
    offerUnitType: {
      type: String,
    },
    minimumOfferUnitItem: {
      type: Number,
    },
    serviceTime: {
      type: String,
    },
    serviceStartDate: {
      type: Date,
    },
    serviceEndDate: {
      type: Date,
    },
    offerLiveTillSoldOut: {
      type: Boolean,
    },
    offerAvailabilityStartDate: {
      type: Date,
    },
    offerAvailabilityEndDate: {
      type: Date,
    },
    offerAvailableAllTime: {
      type: Boolean,
    },
    offerAvailableDays: [
      {
        days: {
          type: String,
        },
        time: {
          type: String,
        },
      },
    ],
    totalOffersAvailable: {
      type: Number, //total offer to sell
    },
    offerReSellable: {
      type: Boolean,
    },
    offerLimitPerCustomer: {
      type: Number,
    },
    oRewardDeductPercentagePerSale: {
      type: Number,
    },
    oRewardDeductPercentageLatePayment: {
      type: Number,
    },
    offerMedia: [
      {
        type: String,
      },
    ],
    status: {
      type: Number,
      enum: [0, 1, 2],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const OfferData = conn_v2.model<IOfferData>("OfferData", offerDataSchema);

export default OfferData;
