import { Request, Response } from "express";
import { DonationItemModel } from "../models/donation-item-model";
import { z } from "zod";

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
});

export class ShopController {
  constructor(private donationItemModel: DonationItemModel) {}

  // Get all items available in the shop
  getShopItems = async (req: Request, res: Response) => {
    try {
      // Use zod to validate the query parameters
      const query = queryParamsSchema.parse(req.query);
      const { daysAfterBestBefore, daysAfterProduction } = query;

      // Get the shop items based on the query parameters
      const shopItems = await this.donationItemModel.findNotOutOfDate(
        daysAfterBestBefore,
        daysAfterProduction
      );

      res.render("shop/index", { shopItems, query });
    } catch (error) {
      console.error("Error getting shop items: ", error);
      res.render("error", { error });
    }
  };

  // Get a specific shop item by its ID
  getShopItemById = (req: Request, res: Response) => {
    res.render("shop/show");
  };

  // Get all items in a specific category
  getShopItemsByCategory = (req: Request, res: Response) => {
    res.render("shop/category");
  };

  // Search for items in the shop
  searchShopItems = (req: Request, res: Response) => {
    res.render("shop/search");
  };
}
