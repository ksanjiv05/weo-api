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
  installmentPeriod: string; // installment period types i.e days, weekly, monthly ……

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
  offerStatus: number; // 1:pending 2:listed, 3: pushed, 4: sold out, 5: expired
}

const offerDataSchema: Schema = new Schema(
  {
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
    },
    offerPriceAmount: {
      type: Number,
      required: true,
    },
    offerPriceMinAmount: {
      type: Number,
      required: true,
    },
    offerPriceMinPercentage: {
      type: Number,
      required: true,
    },
    paymentType: {
      type: String,
      required: true,
    },
    installmentDuration: {
      type: Number,
      required: true,
    },
    installmentPeriod: {
      type: String,
      required: true,
    },
    totalOfferUnitItem: {
      type: Number,
      required: true,
    },
    offerUnitType: {
      type: String,
      required: true,
    },
    minimumOfferUnitItem: {
      type: Number,
      required: true,
    },
    serviceTime: {
      type: String,
      required: true,
    },
    serviceStartDate: {
      type: Date,
      required: true,
    },
    serviceEndDate: {
      type: Date,
      required: true,
    },
    offerLiveTillSoldOut: {
      type: Boolean,
      required: true,
    },
    offerAvailabilityStartDate: {
      type: Date,
      required: true,
    },
    offerAvailabilityEndDate: {
      type: Date,
      required: true,
    },
    offerAvailableAllTime: {
      type: Boolean,
      required: true,
    },
    offerAvailableDays: [
      {
        days: {
          type: String,
          required: true,
        },
        time: {
          type: String,
          required: true,
        },
      },
    ],
    totalOffersAvailable: {
      type: Number,
      required: true,
    },
    offerReSellable: {
      type: Boolean,
      required: true,
    },
    offerLimitPerCustomer: {
      type: Number,
      required: true,
    },
    oRewardDeductPercentagePerSale: {
      type: Number,
      required: true,
    },
    oRewardDeductPercentageLatePayment: {
      type: Number,
      required: true,
    },
    offerMedia: [
      {
        type: String,
        required: true,
      },
    ],
    offerStatus: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const OfferData = conn_v2.model<IOfferData>("OfferData", offerDataSchema);

export default OfferData;
