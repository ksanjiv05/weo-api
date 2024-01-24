import { Document } from "mongoose";
import { IAddress } from "./IAddress";
import { IDevice } from "./IDevice";
import { IOffer } from "./IOffer";

type SocialMediaProps = {
  instagramURL?: string;
  facebookURL?: string;
  xURL?: string;
};

type kycProps = {
  panCardImage?: string;
  govtIdFrontImage?: string;
  govtIdBackImage?: string;
  passportImage?: string;
  drivingLicenseImage?: string;
};

type bankAccountProps = {
  accounId: string;
  isPrimary: boolean;
  accountHolderName: string;
};

export interface IUser extends Document {
  uid: string;
  name: string;
  description?: string;
  profileImage?: string;
  phone: string;
  coverImg?: string;
  email?: string;

  recoveryCode?: string;
  fcmToken?: string;

  successRate?: number;
  earned?: number;

  socialMedia?: SocialMediaProps;
  kyc?: kycProps;

  addresses?: string[];
  devices?: string[];
  wishLists?: string[];
  likes?: string[];

  bankAccounts?: bankAccountProps[];
  createdAt?: number;
  updateAt?: number;
}

// import { Document } from "mongoose";

// export interface IWishList extends Document {
//   uid: string;
//   name: string; //name of usee who liked
//   description: string;
//   image: string;
//   id: string; //id of the product or brand etc
//   createdAt: Date;
//   updatedAt: Date;
// }
