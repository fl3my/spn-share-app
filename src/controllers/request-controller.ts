import { Request, Response } from "express";
import { RequestModel } from "../models/request-model";
import { DonationItemModel } from "../models/donation-item-model";
import { z } from "zod";
import { DeliveryMethod, RequestStatus } from "../models/enums";

const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  county: z.string(),
  postcode: z.string(),
});

const newRequestSchema = z.object({
  donationItemId: z.string(),
  deliveryMethod: z.nativeEnum(DeliveryMethod),
  address: addressSchema,
});

export class RequestController {
  private requestModel: RequestModel;
  private donationItemModel: DonationItemModel;

  constructor(
    requestModel: RequestModel,
    donationItemModel: DonationItemModel
  ) {
    this.requestModel = requestModel;
    this.donationItemModel = donationItemModel;
  }

  // Define a method to get all user requests
  getUserRequests = async (req: Request, res: Response) => {
    try {
      const user = req.user;

      // Check if the user is logged in
      if (!user) {
        throw new Error("User ID is required");
      }

      // Find all requests by user ID
      const requests = await this.requestModel.findRequestsByUserId(user.id);

      res.render("request/index", { requests });
    } catch (error) {
      res.render("error", { error });
    }
  };

  // Define a method to get all requests
  getNewRequestForm = async (req: Request, res: Response) => {
    try {
      // Get the donation item ID from the request parameters
      const donationItemId = req.params.donationItemId;

      if (!donationItemId) {
        throw new Error("Donation item ID is required");
      }

      const donationItem = await this.donationItemModel.findById(
        donationItemId
      );

      if (!donationItem) {
        throw new Error("Donation item not found");
      }

      // Get the delivery options to return to view
      const deliveryOptions = Object.values(DeliveryMethod);

      res.render("request/new", { donationItem, deliveryOptions });
    } catch (error) {
      res.render("error", { error });
    }
  };

  createRequest = async (req: Request, res: Response) => {
    try {
      const newRequest = newRequestSchema.parse(req.body);

      const user = req.user;

      if (!user) {
        throw new Error("User ID is required");
      }

      // Check if a request already exists for this donation item
      const requestExists = await this.requestModel.requestExists(
        newRequest.donationItemId,
        user.id
      );

      // If a request already exists, throw an error
      if (requestExists) {
        throw new Error("A request already exists for this donation item");
      }

      // Insert the new request with additional properties
      await this.requestModel.insert({
        ...newRequest,
        userId: user.id,
        dateRequested: new Date(),
        status: RequestStatus.PENDING,
      });

      res.redirect("/requests");
    } catch (error) {
      res.render("error", { error });
    }
  };

  getCancelRequestForm = async (req: Request, res: Response) => {
    res.render("request/cancel", { requestId: req.params.requestId });
  };

  cancelRequest = async (req: Request, res: Response) => {
    try {
      const requestId = req.params.requestId;

      if (!requestId) {
        throw new Error("Request ID is required");
      }

      // Check if the request exists
      const request = await this.requestModel.findById(requestId);

      if (!request) {
        throw new Error("Request not found");
      }

      // Delete the request
      await this.requestModel.remove(requestId);

      res.redirect("/requests");
    } catch (error) {
      res.render("error", { error });
    }
  };
}
