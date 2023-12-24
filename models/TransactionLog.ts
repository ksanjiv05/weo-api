import mongoose, { Schema } from "mongoose";
import logging from "../config/logging";
import { ITransactionLog } from "../interfaces/ITransactionLog";

const TransactionLogSchema: Schema = new Schema(
  {
    uid: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    transactionType: {
      type: String,
      required: true,
    },
    transactionStatus: {
      type: String,
      required: true,
    },
    transactionAmount: {
      type: Number,
      required: true,
    },
    transactionCurrency: {
      type: String,
      required: true,
    },
    transactionDate: {
      type: Number,
      required: true,
    },
    transactionTime: {
      type: Number,
      required: true,
    },
    transactionDescription: {
      type: String,
      required: true,
    },
    transactionMode: {
      type: String,
      required: true,
    },
    transactionModeDetails: {
      type: String,
      required: true,
    },

    updateAt: {
      type: Number,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

TransactionLogSchema.post<ITransactionLog>("save", function () {
  logging.info("Mongo", "TransactionLog just saved: ");
});

export default mongoose.model<ITransactionLog>(
  "TransactionLog",
  TransactionLogSchema
);
