export const SERVICE_UNITS = [
  "kilogram",
  "gram",
  "milligram",
  "litre",
  "milliliter",
  "centimeter",
  "meter",
  "kilometer",
  "mile",
  "inch",
  "foot",
  "ton",
  "pound",
  "lessons",
  "sessions",
  "movies",
  //"seconds",
  "minutes",
  "hours",
  "days",
  "weeks",
  "months",
  "years",
];

type offerSchema = {
  brandId: string;
  brandName: string;
  subCategories: string[];
  offerTitle: string;
  offerDescription: string;
  offerMedia: string[];
  offerPriceAmount: number;
  offerPriceMinimumAmount: number;
  paymentType: "CASH" | "CARD" | "UPI" | "WALLET";
  installmentPeriod: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  installmentTimePeriod: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  installmentDuration: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  serviceUnitName:
    | "kilogram"
    | "gram"
    | "milligram"
    | "litre"
    | "milliliter"
    | "centimeter"
    | "meter"
    | "kilometer"
    | "mile"
    | "inch"
    | "foot"
    | "ton"
    | "pound"
    | "lessons"
    | "sessions"
    | "movies"
    | "minutes"
    | "hours"
    | "days"
    | "weeks"
    | "months"
    | "years";
  totalServiceUnitType: "FIXED" | "DYNAMIC";
  totalServiceUnitItems: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  durationUnitTypeName: "MINUTES" | "HOURS" | "DAYS" | "WEEKS" | "MONTHS";
  // | "YEARS";
  durationUnitType: "FIXED" | "DYNAMIC";
  durationUnitItems: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  totalOffersAvailable: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  offerLimitPerCustomer: 1 | 2 | 3 | 4 | 5;
  offerActivitiesAt: "BOTH" | "OFFLINE" | "ONLINE";
  offerActivationStartTime: Date;
  offerActivationEndTime: Date;
  offerValidityStartDate: Date;
  offerValidityEndDate: Date;
  offerThumbnailImage: string;
  checkpoint: 6;
  offerStatus: "LIVE" | "HOLD" | "DRAFT";
};

type brandSchema = {
  uid: string;
  brandName: string;
  brandDescription: string;
  status: "LIVE" | "PENDING";
  checkpoint: 5;
  categoriesIds: string[];
  serviceLocationType: "ONLINE" | "OFFLINE" | "BOTH";
  websiteLink: string;
  onlineServiceLocationType: string;
  onlineLocations: [];
  offlineLocations: [
    {
      location: {
        coordinates: number[];
      };
      address: string;
      postcode: string;
      landmark: string;
    }
  ];
  coverImage: string;
  profileImage: string; //profile_image
  createdAt: Date;
  updateAt: Date;
};

//brandId
//brandName

//serviceUnitName
