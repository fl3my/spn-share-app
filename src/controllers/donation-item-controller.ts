import { Request, Response } from "express";
import { z } from "zod";

import {
  Category,
  DateType,
  DeliveryMethod,
  DonationStatus,
  MeasurementType,
  RequestStatus,
  Role,
  StorageRequirement,
} from "../models/enums";
import { deleteImage, saveImage, updateImage } from "../utils/image-handler";
import { DataStoreContext } from "../models/data-store-context";
import {
  donationItemSchema,
  updateDonationItemSchema,
} from "../schemas/donation-item-schemas";
import { geocodeAddress } from "../utils/geocode";
import { calculateDistance } from "../utils/calculate-distance";

// Define a list of options for the form
const formOptions = {
  storageOptions: Object.values(StorageRequirement),
  categoryOptions: Object.values(Category),
  measurementOptions: Object.values(MeasurementType),
  dateOptions: Object.values(DateType),
};

export class DonationItemController {
  constructor(private dsContext: DataStoreContext) {}

  // Get all donation items
  getAllDonationItems = async (req: Request, res: Response) => {
    const donationItems = await this.dsContext.donationItem.findAll();
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

      let donationItems = [];

      // Check if the user is an admin and get all donation items
      if (user.role === Role.ADMIN) {
        // Get all donation items by user ID
        donationItems = await this.dsContext.donationItem.findAll();
      } else {
        // Get all donation items by user ID
        donationItems =
          await this.dsContext.donationItem.findDonationItemsByUserId(user.id);
      }

      // If there are donation items
      if (donationItems) {
        //
        const donationItemsWithRequests = await Promise.all(
          donationItems.map(async (donationItem) => {
            // Get the count of domations for the donation item

            if (!donationItem._id) {
              throw new Error("Donation Item ID is required");
            }

            if (!donationItem.userId) {
              throw new Error("User ID is required");
            }

            const donationItemUser = await this.dsContext.user.findById(
              donationItem.userId
            );

            // Get the donation item by ID
            const requestCount =
              await this.dsContext.request.getRequestCountByDonationItemId(
                donationItem._id
              );
            return {
              ...donationItem,
              requestCount,
              email: donationItemUser?.email,
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
    try {
      if (!req.user) {
        throw new Error("No user ID found in request");
      }
      // Get the user by ID
      const user = await this.dsContext.user.findById(req.user.id);

      if (!user) {
        throw new Error("User not found");
      }

      // Prefill the address fields with the user's address
      const donationItem = {
        address: {
          street: user.address?.street,
          city: user.address?.city,
          postcode: user.address?.postcode,
        },
      };

      // Render the new donation item form with address prefilled
      res.render("donation-items/new", { formOptions, donationItem });
    } catch (error) {
      res.status(500).render("error", { error: error });
    }
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

      // Get the coordinates of the address
      const coordinates = await geocodeAddress(
        newDonationItem.address.street,
        newDonationItem.address.city,
        newDonationItem.address.postcode
      );

      // Create a new donation item document with missing fields
      const donationItemDocument = {
        ...newDonationItem,
        userId: user.id,
        dateCreated: new Date(),
        imageFilename: filename,
        status: DonationStatus.AVAILABLE,
        address: {
          ...newDonationItem.address,
          coordinates,
        },
      };

      // Insert the new donation item
      const donationItem = await this.dsContext.donationItem.insert(
        donationItemDocument
      );

      // When the donation Item is created, all warehouse users should automatically request
      const warehouseUsers = await this.dsContext.user.findUsersByRole(
        Role.WAREHOUSE
      );

      if (warehouseUsers) {
        await Promise.all(
          warehouseUsers.map(async (warehouseUser) => {
            if (!warehouseUser._id) {
              throw new Error("User ID is required");
            }

            if (!donationItem._id) {
              throw new Error("Donation Item ID is required");
            }

            if (!warehouseUser.address) {
              throw new Error("Warehouse user address is required");
            }

            // Create a new request
            await this.dsContext.request.insert({
              userId: warehouseUser._id,
              donationItemId: donationItem._id,
              status: RequestStatus.PENDING,
              dateRequested: new Date(),
              deliveryMethod: DeliveryMethod.RECIEVE,
              address: warehouseUser.address,
              additionalNotes:
                "This was automatically requested by the warehouse.",
            });
          })
        );
      }

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
    const donationItem = await this.dsContext.donationItem.findById(
      req.params.id
    );

    if (!req.user) {
      return res.status(403).render("error", {
        error: new Error("You are not authorized to edit this donation item"),
      });
    }

    if (!donationItem) {
      return res
        .status(404)
        .render("error", { error: "Donation Item not found" });
    }

    if (req.user.id !== donationItem.userId && req.user.role !== Role.ADMIN) {
      return res.status(403).render("error", {
        error: new Error("You are not authorized to edit this donation item"),
      });
    }

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
      const currentDonationItem = await this.dsContext.donationItem.findById(
        req.params.id
      );

      if (!currentDonationItem) {
        throw new Error("Donation Item not found");
      }

      // Check if the user ID is provided
      if (!req.user) {
        throw new Error("No user ID found in request");
      }

      // Check if the user is authorized to edit the donation item
      if (
        req.user.id !== currentDonationItem.userId &&
        req.user.role !== Role.ADMIN
      ) {
        throw new Error("You are not authorized to edit this donation item");
      }

      // Set the current image filename to pass back to view
      imageFilename = currentDonationItem.imageFilename;

      // Validate the request body
      const updatedDonationItem = updateDonationItemSchema.parse(req.body);

      // Check if a new image file is provided
      if (req.file) {
        // Get the current donation item
        const currentDonationItem = await this.dsContext.donationItem.findById(
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
        await this.dsContext.donationItem.update(
          req.params.id,
          updatedDonationItemWithImage
        );
      } else {
        // Update the donation item
        await this.dsContext.donationItem.update(
          req.params.id,
          updatedDonationItem
        );
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
    const donationItem = await this.dsContext.donationItem.findById(
      req.params.id
    );

    res.render("donation-items/delete", { donationItem });
  };

  // Delete a donation item
  deleteDonationItem = async (req: Request, res: Response) => {
    try {
      if (!req.params.id) {
        throw new Error("Donation Item ID is required");
      }
      // Delete the donation item by ID
      const { imageFilename } = await this.dsContext.donationItem.remove(
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
      const donationItem = await this.dsContext.donationItem.findById(
        req.params.id
      );

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

      const donationItem = await this.dsContext.donationItem.findById(
        donationItemId
      );

      if (!donationItem) {
        throw new Error("Donation Item not found");
      }

      if (req.user.id !== donationItem.userId && req.user.role !== "ADMIN") {
        throw new Error("User is not authorised to view this page");
      }

      // Get the donation item by ID
      const requests =
        await this.dsContext.request.findRequestsByDonationItemId(
          donationItemId
        );

      // Get the user for each request
      let requestsWithUser = await Promise.all(
        requests.map(async (request) => {
          if (!request.userId) {
            throw new Error("User ID is required");
          }

          const user = await this.dsContext.user.findById(request.userId);

          const donationItem = await this.dsContext.donationItem.findById(
            request.donationItemId
          );

          if (!donationItem) {
            throw new Error("Donation Item not found");
          }

          let distance = 0;

          if (request.address.coordinates) {
            distance = calculateDistance(
              request.address.coordinates,
              donationItem.address.coordinates
            );
          }

          return {
            ...request,
            user,
            distance,
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

      // Accept the donation
      await this.dsContext.donationItem.acceptDonationItem(donationItemId);

      // Accept the request
      await this.dsContext.request.acceptRequest(requestId);

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
      const request = await this.dsContext.request.findById(requestId);

      if (!request) {
        throw new Error("Request not found");
      }

      if (!req.user) {
        throw new Error("No user ID found");
      }

      // Check if the user is authorised to view the request
      if (request.userId !== req.user.id && req.user.role !== Role.ADMIN) {
        throw new Error("User is not authorised to view this request");
      }

      // Get the user for the request
      const user = await this.dsContext.user.findById(request.userId);

      const donationItem = await this.dsContext.donationItem.findById(
        request.donationItemId
      );

      if (!donationItem) {
        throw new Error("Donation Item not found");
      }

      res.render("donation-items/requests/show", {
        request,
        user,
        donationItem,
      });
    } catch (error) {
      res.status(500).render("error", { error: error });
    }
  };
}
