import logging from "../../config/logging";
import { ICategory } from "../../interfaces/ICategory";
import Category from "../../models/Category";

export const pupulateOrUpdateCategory = async (category: ICategory) => {
  const categories = category.categories;
  delete category.categories;
  try {
    await Category.updateOne(
      { categoryTitle: category.categoryTitle },
      {
        ...category,
        $addToSet: {
          categories: { $each: categories },
        },
      },
      {
        upsert: true,
      }
    );
    return true;
  } catch (err) {
    logging.error("Update Or Pupolute Category ", "Mongo", err);
    return false;
  }
};
