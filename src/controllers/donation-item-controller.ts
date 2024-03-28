import { Request, Response } from "express";
import { DonationItemModel } from "../models/donation-item-model";
import { z } from "zod";
import {
  Category,
  DateType,
  DonationStatus,
  MeasurementType,
  StorageRequirement,
} from "../models/enums";
import { deleteImage, saveImage, updateImage } from "../utils/image-handler";
import { RequestModel } from "../models/request-model";
import { UserModel } from "../models/user-model";

const measurementSchema = z.object({
  type: z.nativeEnum(MeasurementType),
  value: z.coerce.number(),
});

const dateInfoSchema = z
  .object({
    dateType: z.nativeEnum(DateType),
    date: z.coerce.date(),
  })
  .refine(
    (data) => {
      const currentDate = new Date();

      // Set to start of date
      currentDate.setHours(0, 0, 0, 0);

      // Use by dates cannot be in the past
      if (data.dateType === DateType.USE_BY && data.date < currentDate) {
        return false;
      }

      return true;
    },
    {
      message: "'Use by' dates cannot be in the past.",
    }
  )
  .refine(
    (data) => {
      // Set date 7 days before
      const bestBeforeDate = new Date();
      bestBeforeDate.setHours(0, 0, 0, 0);
      bestBeforeDate.setDate(bestBeforeDate.getDate() - 7);

      // Best before dates must be from 7 days before onwards
      if (
        data.dateType === DateType.BEST_BEFORE &&
        data.date < bestBeforeDate
      ) {
        return false;
      }

      return true;
    },
    {
      message: "'Best before' dates cannot be more than 7 days old.",
    }
  )
  .refine(
    (data) => {
      const currentDate = new Date();

      // Set to start of day
      currentDate.setHours(0, 0, 0, 0);

      // Production date cannot be in the future
      if (
        data.dateType === DateType.PRODUCTION_DATE &&
        data.date > currentDate
      ) {
        return false;
      }

      return true;
    },
    {
      message: "'Production date' cannot be in the future.",
    }
  );

const donationItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  storageRequirement: z.nativeEnum(StorageRequirement),
  category: z.nativeEnum(Category),
  measurement: measurementSchema,
  dateInfo: dateInfoSchema,
});

// Define a list of options for the form
const formOptions = {
  storageOptions: Object.values(StorageRequirement),
  categoryOptions: Object.values(Category),
  measurementOptions: Object.values(MeasurementType),
  dateOptions: Object.values(DateType),
};

export class DonationItemController {
  constructor(
    private donationItemModel: DonationItemModel,
    private requestModel: RequestModel,
    private userModel: UserModel
  ) {}

  // Get all donation items
  getAllDonationItems = async (req: Request, res: Response) => {
    const donationItems = await this.donationItemModel.findAll();
    res.render("donation-items/index", { donationItems });
  };

  // Get all user donation items
  getAllUserDonationItems = async (req: Request, res: Response) => {
    try {
      // Get the user ID from the request
      const user = req.user;

      // Check if the user ID is provided
      if (!user) {
        throw new Error("No user ID found in request");
      }

      // Get all donation items by user ID
      const donationItems =
        await this.donationItemModel.findDonationItemsByUserId(user.id);

      // If there are donation items
      if (donationItems) {
        //
        const donationItemsWithRequests = await Promise.all(
          donationItems.map(async (donationItem) => {
            // Get the count of domations for the donation item

            if (!donationItem._id) {
              throw new Error("Donation Item ID is required");
            }

            // Get the donation item by ID
            const requestCount =
              await this.requestModel.getRequestCountByDonationItemId(
                donationItem._id
              );
            return {
              ...donationItem,
              requestCount,
            };
          })
        );

        res.render("donation-items/index", {
          donationItems: donationItemsWithRequests,
        });
      } else {
        res.render("donation-items/index", {
          donationItems,
        });
      }
    } catch (error) {
      res.status(500).render("error", { error: error });
    }
  };

  // Get the form to create a new donation item
  getNewDonationItemForm = async (req: Request, res: Response) => {
    res.render("donation-items/new", { formOptions });
  };

  // Create a new donation item
  createDonationItem = async (req: Request, res: Response) => {
    try {
      //Get the user ID from the request
      const user = req.user;

      // Check if the user ID is provided
      if (!user) {
        throw new Error("No user ID found in request");
      }

      // Validate the request body
      const newDonationItem = donationItemSchema.parse(req.body);

      // Check if the image file is provided
      if (!req.file) {
        throw new Error("Image file is required");
      }

      // Save the image file and get the filename
      const filename = await saveImage(req.file);

      // Create a new donation item document with missing fields
      const donationItemDocument = {
        ...newDonationItem,
        userId: user.id,
        dateCreated: new Date(),
        imageFilename: filename,
        status: DonationStatus.AVAILABLE,
      };

      // Insert the new donation item
      await this.donationItemModel.insert(donationItemDocument);

      // Redirect to the donation items page
      res.redirect("/donation-items");
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle zod validation errors
        res.status(400).render("donation-items/new", {
          errors: error.errors,
          donationItem: req.body,
          formOptions,
        });
      } else {
        // Other errors
        res.status(500).render("donation-items/new", {
          errors: [error as Error],
          donationItem: req.body,
          formOptions,
        });
      }
    }
  };

  // Get the form to edit a donation item
  getEditDonationItemForm = async (req: Request, res: Response) => {
    if (!req.params.id) {
      return res.json({ error: "Donation Item ID is required" });
    }

    // Get the donation item by ID
    const donationItem = await this.donationItemModel.findById(req.params.id);

    res.render("donation-items/edit", { donationItem, formOptions });
  };

  // Update a donation item
  updateDonationItem = async (req: Request, res: Response) => {
    let imageFilename;
    let _id = req.params.id;

    try {
      // Check if the donation item ID is provided
      if (!req.params.id) {
        throw new Error("Donation Item ID is required");
      }

      // Get the current donation item
      const currentDonationItem = await this.donationItemModel.findById(
        req.params.id
      );

      if (!currentDonationItem) {
        throw new Error("Donation Item not found");
      }

      // Set the current image filename to pass back to view
      imageFilename = currentDonationItem.imageFilename;

      // Validate the request body
      const updatedDonationItem = donationItemSchema.parse(req.body);

      // Check if a new image file is provided
      if (req.file) {
        // Get the current donation item
        const currentDonationItem = await this.donationItemModel.findById(
          req.params.id
        );

        if (!currentDonationItem) {
          throw new Error("Donation Item not found");
        }

        // Delete the old image file and save the new image file
        const newImageFilename = await updateImage(
          currentDonationItem.imageFilename,
          req.file
        );

        // Create a new object that includes all properties of updatedDonationItem and the imageFilename property
        const updatedDonationItemWithImage = {
          ...updatedDonationItem,
          imageFilename: newImageFilename,
        };

        // Update the donation item
        await this.donationItemModel.update(
          req.params.id,
          updatedDonationItemWithImage
        );
      } else {
        // Update the donation item
        await this.donationItemModel.update(req.params.id, updatedDonationItem);
      }

      // Redirect to the donation items page
      res.redirect("/donation-items");
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle zod validation errors
        res.status(400).render("donation-items/edit", {
          errors: error.errors,
          donationItem: { ...req.body, imageFilename, _id },
          formOptions,
        });
      } else {
        // Other errors
        res.status(500).render("donation-items/edit", {
          errors: [error as Error],
          donationItem: { ...req.body, imageFilename, _id },
          formOptions,
        });
      }
    }
  };

  getDeleteDonationItemForm = async (req: Request, res: Response) => {
    if (!req.params.id) {
      return res
        .status(500)
        .render("error", { error: "Donation Item ID is required" });
    }
    // Get the donation item by ID
    const donationItem = await this.donationItemModel.findById(req.params.id);

    res.render("donation-items/delete", { donationItem });
  };

  // Delete a donation item
  deleteDonationItem = async (req: Request, res: Response) => {
    try {
      if (!req.params.id) {
        throw new Error("Donation Item ID is required");
      }
      // Delete the donation item by ID
      const { imageFilename } = await this.donationItemModel.remove(
        req.params.id
      );

      // Delete the image
      deleteImage(imageFilename);

      res.redirect("/donation-items");
    } catch (error) {
      res.status(500).render("error", { error: error });
    }
  };

  // Get a donation item
  getDonationItem = async (req: Request, res: Response) => {
    try {
      if (!req.params.id) {
        throw new Error("Donation Item ID is required");
      }
      // Get the donation item by ID
      const donationItem = await this.donationItemModel.findById(req.params.id);

      if (!donationItem) {
        throw new Error("Donation Item not found");
      }

      res.render("donation-items/show", { donationItem });
    } catch (error) {
      res.status(500).render("error", { error: error });
    }
  };

  getDonationItemRequests = async (req: Request, res: Response) => {
    try {
      if (!req.params.id) {
        throw new Error("Donation Item ID is required");
      }

      const donationItemId = req.params.id;

      if (!req.user) {
        throw new Error("No user ID found");
      }

      // Get the donation item by ID
      const requests = await this.requestModel.findRequestsByDonationItemId(
        donationItemId
      );

      // Get the user for each request
      const requestsWithUser = await Promise.all(
        requests.map(async (request) => {
          if (!request.userId) {
            throw new Error("User ID is required");
          }

          const user = await this.userModel.findById(request.userId);

          return {
            ...request,
            user,
          };
        })
      );

      res.render("donation-items/requests/index", {
        requests: requestsWithUser,
      });
    } catch (error) {
      res.status(500).render("error", { error: error });
    }
  };

  acceptRequest = async (req: Request, res: Response) => {
    try {
      if (!req.params.id || !req.params.requestId) {
        throw new Error("Donation Item ID and Request ID are required");
      }

      const donationItemId = req.params.id;
      const requestId = req.params.requestId;

      if (!req.user) {
        throw new Error("No user ID found");
      }

      // Accept the request
      await this.requestModel.acceptRequest(requestId);

      // Accept the donation
      await this.donationItemModel.acceptDonationItem(donationItemId);

      // Redirect to the donation item requests page
      res.redirect(`/donation-items/${donationItemId}/requests`);
    } catch (error) {
      res.status(500).render("error", { error: error });
    }
  };

  getRequest = async (req: Request, res: Response) => {
    try {
      if (!req.params.id || !req.params.requestId) {
        throw new Error("Donation Item ID and Request ID are required");
      }

      const requestId = req.params.requestId;

      // Get the request by ID
      const request = await this.requestModel.findById(requestId);

      if (!request) {
        throw new Error("Request not found");
      }

      // Get the user for the request
      const user = await this.userModel.findById(request.userId);

      res.render("donation-items/requests/show", { request, user });
    } catch (error) {
      res.status(500).render("error", { error: error });
    }
  };
}
