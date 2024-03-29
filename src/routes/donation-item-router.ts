import express from "express";

import { DonationItemController } from "../controllers/donation-item-controller";
import { dsContext } from "../models/data-store-context";
import { createMulterUpload } from "../configs/multer-config";

// Create a new router to handle /donation-items routes
const donationItemRouter = express.Router();

// Create a new multer upload object with the storage configuration
const upload = createMulterUpload();

const donationItemController = new DonationItemController(dsContext);

// GET: /donation-items
donationItemRouter.get("/", donationItemController.getAllUserDonationItems);

// GET: /donation-items/new
donationItemRouter.get("/new", donationItemController.getNewDonationItemForm);

// POST: /donation-items
donationItemRouter.post(
  "/",
  upload.single("image"),
  donationItemController.createDonationItem
);

// GET: /donation-items/:id/edit
donationItemRouter.get(
  "/:id/edit",
  donationItemController.getEditDonationItemForm
);

// PATCH: /donation-items/:id
donationItemRouter.patch(
  "/:id",
  upload.single("image"),
  donationItemController.updateDonationItem
);

// GET: /donation-items/:id/delete
donationItemRouter.get(
  "/:id/delete",
  donationItemController.getDeleteDonationItemForm
);

// DELETE: /donation-items/:id/delete
donationItemRouter.delete("/:id", donationItemController.deleteDonationItem);

// GET: /donation-items/:id/requests
donationItemRouter.get(
  "/:id/requests",
  donationItemController.getDonationItemRequests
);

// GET: /donation-items/:id/requests/:requestId
donationItemRouter.get(
  "/:id/requests/:requestId",
  donationItemController.getRequest
);

// POST: /donation-items/:id/requests/:requestId/accept
donationItemRouter.post(
  "/:id/requests/:requestId/accept",
  donationItemController.acceptRequest
);

// Get: /donation-items/:id
donationItemRouter.get("/:id", donationItemController.getDonationItem);

export { donationItemRouter };
