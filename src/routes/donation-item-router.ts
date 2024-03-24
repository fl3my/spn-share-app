import express from "express";
import { DonationItemController } from "../controllers/donation-item-controller";
import { modelProvider } from "../models/model-provider";

// Create a new router to handle /donation-items routes
const donationItemRouter = express.Router();

const donationItemModel = modelProvider.getDonationItemModel();
const donationItemController = new DonationItemController(donationItemModel);

// GET: /donation-items
donationItemRouter.get("/", donationItemController.getAllDonationItems);

// GET: /donation-items/new
donationItemRouter.get("/new", donationItemController.getNewDonationItemForm);

// POST: /donation-items
donationItemRouter.post("/", donationItemController.createDonationItem);

// GET: /donation-items/:id/edit
donationItemRouter.get(
  "/:id/edit",
  donationItemController.getEditDonationItemForm
);

// PATCH: /donation-items/:id
donationItemRouter.patch("/:id", donationItemController.updateDonationItem);

// GET: /donation-items/:id/delete
donationItemRouter.get(
  "/:id/delete",
  donationItemController.getDeleteDonationItemForm
);

// DELETE: /donation-items/:id/delete
donationItemRouter.delete("/:id", donationItemController.deleteDonationItem);

// Get: /donation-items/:id
donationItemRouter.get("/:id", donationItemController.getDonationItem);

export { donationItemRouter };
