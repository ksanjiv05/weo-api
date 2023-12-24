import mongoose from "mongoose";

const LikedSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
    },
    likedBy: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    }, //name of usee who liked
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    }, //id of the product or brand etc
  },
  { timestamps: true }
);

export default mongoose.model("Liked", LikedSchema);
