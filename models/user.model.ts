import mongoose, { Schema, Document } from "mongoose";
import logging from "../config/logging";
import { conn_v2 } from "../db";

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
    oEarnPotential: {type:Number,default:0},
    oEarned: {type:Number,default:0},
    fcmToken: String,
    kyc: {
      panCardImage: String,
      govtIdFrontImage: String,
      govtIdBackImage: String,
      passportImage: String,
      drivingLicenseImage: String,
    },
    countryCode: {
      type: String,
      lowercase: true,
    },
    currency: {
      type: String,
      lowercase: true,
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
        bankName: String,
        contactId: String,
        lastFourDigits: String,
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

export default conn_v2.model<IUser>("User", userSchema);

export interface IUser extends Document {
  uid: string; // unique id from firebase
  creatorName: string; // name of the creator of the user it also unique
  name: string;
  description?: string;
  phoneNumber?: string;
  profileImage?: string;
  coverImg?: string;
  phone?: string;
  oEarned?: number;
  oEarnPotential?: number;
  fcmToken?: String;

  countryCode?: string;
  currency?: string;

  kyc: [
    {
      panCardImage: string;
      govtIdFrontImage: string;
      govtIdBackImage: string;
      passportImage: string;
      drivingLicenseImage: string;
    }
  ];
  wishLists: [{ type: Schema.Types.ObjectId; ref: "Offer" }];
  likes: [{ type: Schema.Types.ObjectId; ref: "Offer" }];

  socialMedia: {
    instagramURL: String;
    facebookURL: String;
    xURL: String;
  };
  bankAccounts: [
    {
      accountId: string;
      isPrimary: boolean;
      accountHolderName: string;
      bankName: string;
      lastFourDigits: string;
      contactId: string;
    }
  ];
  successRate: Number;
  lastLogin: Date;
  lastActive: Date;
}
