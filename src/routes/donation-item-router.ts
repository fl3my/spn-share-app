import express from "express";
import multer from "multer";

import { DonationItemController } from "../controllers/donation-item-controller";
import { modelProvider } from "../models/model-provider";

// Create a new router to handle /donation-items routes
const donationItemRouter = express.Router();

// Use memory storage so that the image can be saved after validation
const storage = multer.memoryStorage();

// Create a new multer upload object with the storage configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: function (req, file, cb) {
    // Only allow image MIME types
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      cb(new Error("Only image files are allowed!"));
    } else {
      cb(null, true);
    }
  },
});

const donationItemModel = modelProvider.getDonationItemModel();
const donationItemController = new DonationItemController(donationItemModel);

// GET: /donation-items
donationItemRouter.get("/", donationItemController.getAllDonationItems);

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

// Get: /donation-items/:id
donationItemRouter.get("/:id", donationItemController.getDonationItem);

export { donationItemRouter };
