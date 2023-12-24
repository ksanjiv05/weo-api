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
  description: string;
  profileImage?: string;
  phoneNumber: string;
  coverImg?: string;
  email?: string;

  recoveryCode?: string;
  fcmToken?: string;

  successRate: number;
  learned: number;

  addresses?: IAddress[];
  socialMedia: SocialMediaProps;
  kyc: kycProps;
  devices: IDevice[];

  wishLists: IOffer[];
  likes: IOffer[];

  bankAccounts: bankAccountProps[];
  createdAt: number;
  updateAt: number;
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
