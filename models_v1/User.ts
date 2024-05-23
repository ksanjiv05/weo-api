import mongoose, { Schema } from "mongoose";
import logging from "../config/logging";
import { IUser } from "../interfaces/IUser";
import { conn_v1 } from "../db";

const UserSchema: Schema = new Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    creatorName: {
      type: String,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    phoneNumber: String,
    profileImage: String,
    coverImg: String,
    phone: {
      type: String,
      required: true,
    },
    earned: Number,
    fcmToken: String,
    kyc: {
      panCardImage: String,
      govtIdFrontImage: String,
      govtIdBackImage: String,
      passportImage: String,
      drivingLicenseImage: String,
    },
    device: [String], //[{ type: Schema.Types.ObjectId, ref: "Device" }],
    addresses: [String], //[{ type: Schema.Types.ObjectId, ref: "Address" }],
    wishLists: [String], //[{ type: Schema.Types.ObjectId, ref: "Offer" }],
    likes: [String], //[{ type: Schema.Types.ObjectId, ref: "Offer" }],

    socialMedia: {
      instagramURL: String,
      facebookURL: String,
      xURL: String,
    },
    bankAccounts: [
      {
        accountId: String,
        isPrimary: Boolean,
        accountHolderName: String,
      },
    ],
    successRate: Number,
    lastLogin: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const salt = 10;

// UserSchema.pre<IUser>("save", async function (next) {
//   const user = this;
//   if (user.isModified("password")) {
//     user.password = await bcryptjs.hash(user.password, salt);
//   }
//   next();
// });

UserSchema.post<IUser>("save", function () {
  logging.info("Mongo", "User just saved: ");
});

export default conn_v1.model<IUser>("User", UserSchema);
