import mongoose from "mongoose";

const quantitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    }, //name of usee who quantity
  },
  { timestamps: true }
);

// quantitySchema.index({ uid: 1, id: 1 }, { unique: true });

export default mongoose.model("quantity", quantitySchema);
