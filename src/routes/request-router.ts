import express from "express";
import { RequestController } from "../controllers/request-controller";
import { modelProvider } from "../models/model-provider";
import { UserModel } from "../models/user-model";

// Create a new router to handle / routes
const requestRouter = express.Router();

// Get the request model from the model provider
const requestModel = modelProvider.getRequestModel();
const donationItemModel = modelProvider.getDonationItemModel();
const userModel = modelProvider.getUserModel();

const requestController = new RequestController(
  requestModel,
  donationItemModel,
  userModel
);

// GET: /requests
requestRouter.get("/", requestController.getUserRequests);

// GET: /requests/new/:donationItemId
requestRouter.get("/new/:donationItemId", requestController.getNewRequestForm);

// POST: /requests/:donationItemId
requestRouter.post("/", requestController.createRequest);

// GET: /requests/:requestId/cancel
requestRouter.get("/:requestId/cancel", requestController.getCancelRequestForm);

// DELETE: /requests/:requestId
requestRouter.delete("/:requestId", requestController.cancelRequest);

// POST: /requests/:requestId/complete
requestRouter.post("/:requestId/complete", requestController.confirmCompleted);

// GET: /requests/:requestId
requestRouter.get("/:requestId", requestController.getRequest);

export { requestRouter };
