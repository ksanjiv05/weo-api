import { Document } from "mongoose";

// type category = {
//     title:string;
//     categoryPic:string;
// }

export interface ICategory extends Document {
  categoryTitle: string;
  categories?: string[];
  categoryPic: string;
  activeCategoryPic: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updateAt?: Date;
}
