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
    },
    createdAt: {
      type: Number,
      required: true,
    },
    updateAt: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

CollectorSchema.post<ICollector>("save", function () {
  logging.info("Mongo", "Collector just saved: ");
});

export default mongoose.model<ICollector>("Collector", CollectorSchema);
