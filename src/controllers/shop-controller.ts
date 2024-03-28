import { Request, Response } from "express";
import { z } from "zod";

import { Category, DateType } from "../models/enums";
import { DataStoreContext } from "../models/data-store-context";
import { queryParamsSchema } from "../schemas/shop-schemas";

export class ShopController {
  constructor(private dsContext: DataStoreContext) {}

  // Get all items available in the shop
  getShopItems = async (req: Request, res: Response) => {
    try {
      // Use zod to validate the query parameters
      const query = queryParamsSchema.parse(req.query);
      const { daysAfterBestBefore, daysAfterProduction, category, searchTerm } =
        query;

      // Get the shop items based on the query parameters
      const donationItems = await this.dsContext.donationItem.findNotOutOfDate(
        daysAfterBestBefore,
        daysAfterProduction,
        category,
        searchTerm
      );

      // Add a badge to show if the item is expiring today
      const shopItems = donationItems.map((item) => {
        const currentDate = new Date();

        currentDate.setHours(0, 0, 0, 0); // Set the time to midnight

        let date;

        // Check if the item is expiring today
        if (
          item.dateInfo.dateType == DateType.BEST_BEFORE ||
          item.dateInfo.dateType == DateType.USE_BY
        ) {
          date = new Date(item.dateInfo.date);
          date.setHours(0, 0, 0, 0);
        }
        return {
          ...item,
          expiringToday: date && date.getTime() === currentDate.getTime(),
        };
      });

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
      const shopItem = await this.dsContext.donationItem.findById(
        req.params.id
      );

      if (!shopItem) {
        throw new Error("Donation Item not found");
      }

      if (!shopItem.userId) {
        throw new Error("User ID is required");
      }

      const itemUser = await this.dsContext.user.findById(shopItem.userId);

      res.render("shop/show", { shopItem, itemUser });
    } catch (error) {
      res.status(500).render("error", { error: error });
    }
  };
}
