import mongoose, { Schema } from "mongoose";
import logging from "../config/logging";
import { ICollector } from "../interfaces/ICollector";

const CollectorSchema: Schema = new Schema(
  {
    uid: {
      type: String,
      required: [true, "user id is required"],
    },
    offer: {
      type: Schema.Types.ObjectId,
      ref: "Offer",
      required: [true, "offer id is required"],
    },
    lastPaid: {
      paymentAmount: { type: Number, default: -1 },
      paymentDate: { type: Number, default: null },
      paymentStatus: { type: String, default: "pending" },
      paymentDueDate: { type: Number, default: null },
    },
    paymentDueDate: {
      paymentAmount: { type: Number, default: -1 },
      paymentDate: { type: Number, default: null },
      paymentStatus: { type: String, default: "pending" },
      paymentDueDate: { type: Number, default: null },
    },
    oEarned: {
      type: Number,
      default: 0,
    },
    oSpent: {
      type: Number,
      default: 0,
    },
    paymentDue: {
      type: Number,
      default: null,
    },
    installments: {
      type: Number, //it will be ho much installment user want to pay
      default: 1,
    },
    paymentType: {
      type: String, //payment type
      lowercase: true,
      required: [true, "amount is required"],
    },
    amount: {
      type: Number, //amount
      required: [true, "amount is required"],
    },
    paymentIds: {
      type: [String], //payment ids
      default: [null],
    },
  },
  { timestamps: true }
);

CollectorSchema.post<ICollector>("save", function () {
  logging.info("Mongo", "Collector just saved: ");
});

export default mongoose.model<ICollector>("Collector", CollectorSchema);
