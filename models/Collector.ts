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
      paymentAmount: Number,
      paymentDate: Number,
      paymentStatus: String,
      paymentDueDate: Number,
    },
    paymentDueDate: {
      paymentAmount: Number,
      paymentDate: Number,
      paymentStatus: String,
      paymentDueDate: Number,
    },
    oEarned: {
      type: Number,
    },
    oSpent: {
      type: Number,
    },
    paymentDue: {
      type: Number,
    },
    installments: {
      type: Number, //it will be ho much installment user want to pay
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
    },
  },
  { timestamps: true }
);

CollectorSchema.post<ICollector>("save", function () {
  logging.info("Mongo", "Collector just saved: ");
});

export default mongoose.model<ICollector>("Collector", CollectorSchema);
