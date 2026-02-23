import { z } from "zod";

export const optionSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Option label is required"),
  displayOrder: z.number().int().nonnegative(),
});

export const reviewCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Category name is required"),
  displayOrder: z.number().int().nonnegative(),
  options: z.array(optionSchema).min(1, "At least one option is required"),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().url().optional().or(z.literal("")),
  category: z.string().min(1, "Category is required"),
  isActive: z.boolean().default(true),
  categories: z.array(reviewCategorySchema).min(1, "At least one review category is required"),
});

export const updateProductSchema = createProductSchema.extend({
  id: z.string().min(1),
});

export const submitReviewSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  reviewerName: z.string().max(120).optional().or(z.literal("")),
  starRating: z.number().int().min(1, "Star rating is required").max(5),
  feedback: z.string().max(1000).optional().or(z.literal("")),
  selectedOptionIds: z.array(z.string().min(1)).min(1),
});

export const toggleProductSchema = z.object({
  isActive: z.boolean(),
});
