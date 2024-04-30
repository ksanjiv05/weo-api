import mongoose, { Schema, Document } from "mongoose";
import logging from "../config/logging";

const userSchema: Schema = new Schema(
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
      lowercase: true,
    },
    description: String,
    phoneNumber: String,
    profileImage: String,
    coverImg: String,
    phone: {
      type: String,
      required: true,
    },
    oEarned: Number,
    fcmToken: String,
    kyc: {
      panCardImage: String,
      govtIdFrontImage: String,
      govtIdBackImage: String,
      passportImage: String,
      drivingLicenseImage: String,
    },
    wishLists: [{ type: Schema.Types.ObjectId, ref: "Offer" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "Offer" }],

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

// const salt = 10;

// UserSchema.pre<IUser>("save", async function (next) {
//   const user = this;
//   if (user.isModified("password")) {
//     user.password = await bcryptjs.hash(user.password, salt);
//   }
//   next();
// });

userSchema.post<IUser>("save", function () {
  logging.info("Mongo", "User just saved: ");
});

export default mongoose.model<IUser>("User", userSchema);

export interface IUser extends Document {
  uid: string; // unique id from firebase
  creatorName: string; // name of the creator of the user it also unique
  name: string;
  description?: string;
  phoneNumber?: string;
  profileImage?: string;
  coverImg?: string;
  phone?: string;
  oEarned?: Number;
  fcmToken?: String;

  kyc: [{ type: Schema.Types.ObjectId; ref: "KYC" }];
  wishLists: [{ type: Schema.Types.ObjectId; ref: "Offer" }];
  likes: [{ type: Schema.Types.ObjectId; ref: "Offer" }];

  socialMedia: {
    instagramURL: String;
    facebookURL: String;
    xURL: String;
  };
  bankAccounts: [{ type: Schema.Types.ObjectId; ref: "BankAccount" }];
  successRate: Number;
  lastLogin: Date;
  lastActive: Date;
}
