// Accessories: [Accessories, Bag, belts, gloves, sunglasses, wallets, watches];
// Clothing: [
//   Clothing,
//   Coats,
//   Dresses,
//   Hoodies & Sweatshirts,
//   jackets,
//   jeans,
//   pants,
// ];
// Shoes: [Shoes, Boots, Loafers, Sandals, Slippers];

import { pupulateOrUpdateCategory } from "../helper/methods_for_controller_script/category";
import { ICategory } from "../interfaces/ICategory";
import Category from "../models/Category";

// categoryTitle: string;
// categories: string[];
// categoryPic: string;
// activeCategoryPic: string;
// description: string;
// cratededAt: number;
// updateAt: number;

const category: ICategory | any = {
  categoryTitle: "Shoes",
  categories: ["Boots", "Loafers", "Sandals", "Slippers"],
  categoryPic: "",
  activeCategoryPic: "",
  description: "",
  // cratededAt: 0,
  // updateAt: 0,
};

const categories = [
  {
    name: "Wellbeing",
    categoryPic: "WellBingSvg",
    categories: [
      "Wellness",
      "Self Care",
      "Nutrition",
      "Mental Health",
      "Beauty",
      "Health",
    ],
  },
  {
    name: "Learning",
    categoryPic: "LearningSvg",
    categories: [
      "Courses",
      "Mentoring",
      "Books",
      "Podcasts",
      "Workshops",
      "Webinars",
      "Upskilling",
      "Tutorials",
      "Art & Craft",
      "Sports",
    ],
  },
  {
    name: "Going",
    categoryPic: "GoingSvg",
    categories: [
      "Riding",
      "Driving",
      "Walking",
      "Delerving",
      "Travelling",
      "Camping",
      "Renting",
    ],
  },
  {
    name: "Showing",
    categoryPic: "ShowingSvg",
    categories: [
      "Concerts",
      "Exhibitions",
      "Performances",
      "Sports Events",
      "Festivals",
      "Shows",
      "Performers",
    ],
  },
  {
    name: " Wearing",
    categoryPic: "WearingSvg",
    categories: [
      "Womenwear",
      "Menwear",
      "Kidswear",
      "Footwear",
      "Wardrobs",
      "Clothing",
      "Shoes",
    ],
  },
  {
    name: "Helping",
    categoryPic: "HelpingSvg",
    categories: [
      "Volunteering",
      "Donating",
      "Fundraising",
      "Advising",
      "Caregiving",
      "Housekeeping",
      "Cleaning",
      "Repairing",
      "Maintaining",
    ],
  },
];

const runMethods = async () => {
  // const status = await pupulateOrUpdateCategory(category);
  // Category.deleteMany({});

  const c = await Category.insertMany(categories);
  console.log(c);
};

// runMethods();

// Checkpoint: 6
// Creator id: int
// Brand Id : int
// Brand Name: String
// Product Id: [int],
// Offer Title: String
// Offer Description: String
// Offer Media: [Blob]
// Offer price type: String — [Mininum/Maximum]
// Offer price amount : int
// Payment type: String — [One time/Installments]
// Instalment time period : String —- [ Days/Week/Month/Year]
// Installment duration: int
// Min Access Balance : int
// Max O access: int — generated through backend logic
// Service unit name : String — [Quantity/Classes/Hours/Lessons/Miles/Sessions/Minutes/Movies]
// Total Service unit type: String — [Fixed/Dynamic]
// Total Service unit items: int
// Duration unit type: String — [Minutes/Hours/Days/Weeks/Months/Years]
// Duration unit items: int
// Total offers available: int
// Offer limit per customer: int
// Offer activities at : String — [Both/Online Store/Offline]
// Offer activation start time : time
// Offer activation end time: time
// Offer validity start date: date
// Offer validity end date: date
// Offer status: int — [pending/live/onhold]
// Offer Thumbnail image : blob
