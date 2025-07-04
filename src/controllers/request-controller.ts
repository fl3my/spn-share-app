import { Request, Response } from "express";

import {
  DeliveryMethod,
  DonationStatus,
  RequestStatus,
  Role,
} from "../models/enums";
import { DataStoreContext } from "../models/data-store-context";
import { newRequestSchema } from "../schemas/request-schemas";
import { geocodeAddress } from "../utils/geocode";

export class RequestController {
  constructor(private dsContext: DataStoreContext) {}

  getRequest = async (req: Request, res: Response) => {
    try {
      if (!req.params.requestId) {
        throw new Error("Request ID are required");
      }

      const requestId = req.params.requestId;

      // Get the request by ID
      const request = await this.dsContext.request.findById(requestId);

      if (!request) {
        throw new Error("Request not found");
      }

      // Get the donation item for the request
      const donationItem = await this.dsContext.donationItem.findById(
        request.donationItemId
      );

      // Check if the donation item exists
      if (!donationItem || !donationItem.userId) {
        throw new Error("Request not found");
      }

      if (!req.user) {
        throw new Error("User ID is required");
      }

      // Check if the user is authorised to view the request
      if (request.userId !== req.user.id && req.user.role !== Role.ADMIN) {
        throw new Error("User is not authorised to view this request");
      }

      // Get the user for the request
      const user = await this.dsContext.user.findById(donationItem.userId);

      res.render("request/show", { request, user, donationItem });
    } catch (error) {
      res.status(500).render("error", { error: error });
    }
  };

  // Define a method to get all user requests
  getUserRequests = async (req: Request, res: Response) => {
    try {
      const user = req.user;

      // Check if the user is logged in
      if (!user) {
        throw new Error("User ID is required");
      }

      // Find all requests by user ID
      const requests = await this.dsContext.request.findRequestsByUserId(
        user.id
      );

      // Find the item information for each request
      let requestsWithItem = await Promise.all(
        requests.map(async (request) => {
          // Find the donation item by ID
          const donationItem = await this.dsContext.donationItem.findById(
            request.donationItemId
          );

          // Check if the donation item exists
          if (!donationItem) {
            throw new Error("Donation item not found");
          }

          return { ...request, donationItem };
        })
      );

      res.render("request/index", { requests: requestsWithItem });
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

      const donationItem = await this.dsContext.donationItem.findById(
        donationItemId
      );

      if (!donationItem) {
        throw new Error("Donation item not found");
      }

      // Get the delivery options to return to view
      const deliveryOptions = Object.values(DeliveryMethod);

      if (!req.user) {
        throw new Error("User ID is required");
      }

      const user = await this.dsContext.user.findById(req.user.id);

      if (!user) {
        throw new Error("User not found");
      }

      // Prefill address with users details
      const request = {
        address: {
          street: user.address?.street,
          city: user.address?.city,
          postcode: user.address?.postcode,
        },
      };

      res.render("request/new", { donationItem, deliveryOptions, request });
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
      const requestExists = await this.dsContext.request.requestExists(
        newRequest.donationItemId,
        user.id
      );

      // If a request already exists, throw an error
      if (requestExists) {
        throw new Error("A request already exists for this donation item");
      }

      // Get the user's request coordinates
      const coordinates = await geocodeAddress(
        newRequest.address.street,
        newRequest.address.city,
        newRequest.address.postcode
      );

      // Insert the new request with additional properties
      await this.dsContext.request.insert({
        ...newRequest,
        userId: user.id,
        dateRequested: new Date(),
        status: RequestStatus.PENDING,
        additionalNotes: newRequest.additionalNotes || "",
        address: {
          ...newRequest.address,
          coordinates,
        },
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
      const request = await this.dsContext.request.findById(requestId);

      if (!request) {
        throw new Error("Request not found");
      }

      // Delete the request
      await this.dsContext.request.remove(requestId);

      res.redirect("/requests");
    } catch (error) {
      res.render("error", { error });
    }
  };

  confirmCompleted = async (req: Request, res: Response) => {
    try {
      const requestId = req.params.requestId;

      if (!requestId) {
        throw new Error("Request ID is required");
      }

      // Check if the request exists
      const request = await this.dsContext.request.findById(requestId);

      if (!request) {
        throw new Error("Request not found");
      }

      // If the request is not accepted
      if (request.status !== RequestStatus.ACCEPTED) {
        throw new Error("Request is not accepted");
      }
      // Get the donation item
      const donationItem = await this.dsContext.donationItem.findById(
        request.donationItemId
      );

      if (!donationItem || !donationItem._id) {
        throw new Error("Donation item not found");
      }

      // If the donation is not claimed
      if (donationItem.status !== DonationStatus.CLAIMED) {
        throw new Error("Donation item is not claimed");
      }

      // Update the donation status to completed
      await this.dsContext.donationItem.update(donationItem._id, {
        status: DonationStatus.COMPLETED,
      });

      // Update the request status to completed
      await this.dsContext.request.update(requestId, {
        status: RequestStatus.COMPLETED,
      });

      // Reject all other requests for the donation item
      await this.dsContext.request.rejectOtherRequests(
        donationItem._id,
        requestId
      );

      // Increment the donators score
      await this.dsContext.user.incrementScore(donationItem.userId, 10);

      res.redirect("/requests");
    } catch (error) {
      res.render("error", { error });
    }
  };
}
