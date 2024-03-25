import express from "express";
import { ShopController } from "../controllers/shop-controller";
import { modelProvider } from "../models/model-provider";

// Create a new router to handle /shop routes
const shopRouter = express.Router();

const donationItemModel = modelProvider.getDonationItemModel();
const shopController = new ShopController(donationItemModel);

// GET: /shop?daysAfterBestBefore=daysAfterBestBefore&daysAfterProduction=daysAfterProduction&?category=category&searchTerm=searchTerm
shopRouter.get("/", shopController.getShopItems);

// GET: /shop/:id
shopRouter.get("/:id", shopController.getShopItemById);

export { shopRouter };
