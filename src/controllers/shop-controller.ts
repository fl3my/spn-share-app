import { Request, Response } from "express";
import { DonationItemModel } from "../models/donation-item-model";
import { z } from "zod";
import { Category } from "../models/enums";

// Define a schema for the query parameters
const queryParamsSchema = z.object({
  daysAfterBestBefore: z
    .number({ coerce: true })
    .int()
    .nonnegative()
    .default(0),
  daysAfterProduction: z
    .number({ coerce: true })
    .int()
    .nonnegative()
    .default(7),
  category: z.string().optional(),
  searchTerm: z.string().optional(),
});

export class ShopController {
  constructor(private donationItemModel: DonationItemModel) {}

  // Get all items available in the shop
  getShopItems = async (req: Request, res: Response) => {
    try {
      // Use zod to validate the query parameters
      const query = queryParamsSchema.parse(req.query);
      const { daysAfterBestBefore, daysAfterProduction, category, searchTerm } =
        query;

      // Get the shop items based on the query parameters
      const shopItems = await this.donationItemModel.findNotOutOfDate(
        daysAfterBestBefore,
        daysAfterProduction,
        category,
        searchTerm
      );

      const categoryOptions = Object.values(Category);

      res.render("shop/index", { shopItems, query, categoryOptions });
    } catch (error) {
      console.error("Error getting shop items: ", error);
      res.render("error", { error });
    }
  };

  // Get a specific shop item by its ID
  getShopItemById = async (req: Request, res: Response) => {
    try {
      if (!req.params.id) {
        throw new Error("Donation Item ID is required");
      }
      // Get the donation item by ID
      const shopItem = await this.donationItemModel.findById(req.params.id);

      if (!shopItem) {
        throw new Error("Donation Item not found");
      }

      res.render("shop/show", { shopItem });
    } catch (error) {
      res.status(500).render("error", { error: error });
    }
  };
}
