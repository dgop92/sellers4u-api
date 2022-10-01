import { Category } from "@features/product/entities/category";

export const APP_CATEGORIES: Pick<Category, "name" | "description">[] = [
  {
    name: "Food",
    description: "A description for food category",
  },
  {
    name: "Accessories",
    description: "A description for accessories category",
  },
];
