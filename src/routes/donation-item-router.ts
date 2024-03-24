import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";

import { DonationItemController } from "../controllers/donation-item-controller";
import { modelProvider } from "../models/model-provider";

// Create a new router to handle /donation-items routes
const donationItemRouter = express.Router();

// Create a new multer storage object to define random file names
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, path.basename(uniqueName));
  },
});

// Create a new multer upload object with the storage configuration
const upload = multer({ storage: storage });

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
