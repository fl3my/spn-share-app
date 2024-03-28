import express from "express";

import { ShopController } from "../controllers/shop-controller";
import { dsContext } from "../models/data-store-context";

// Create a new router to handle /shop routes
const shopRouter = express.Router();

const shopController = new ShopController(dsContext);

// GET: /shop?daysAfterBestBefore=daysAfterBestBefore&daysAfterProduction=daysAfterProduction&?category=category&searchTerm=searchTerm
shopRouter.get("/", shopController.getShopItems);

// GET: /shop/:id
shopRouter.get("/:id", shopController.getShopItemById);

export { shopRouter };
