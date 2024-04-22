import mongoose from "mongoose";

const quantitySchema = new mongoose.Schema(
  {
    quantityType: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    }, //name of usee who quantity
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

quantitySchema.index({ uid: 1, id: 1 }, { unique: true });

export default mongoose.model("quantity", quantitySchema);
