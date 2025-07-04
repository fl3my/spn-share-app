import { Request, Response } from "express";
import { z } from "zod";

import { DataStoreContext } from "../models/data-store-context";
import { newUserSchema, updatedUserSchema } from "../schemas/user-schemas";
import { geocodeAddress } from "../utils/geocode";

export class UserController {
  constructor(private dsContext: DataStoreContext) {}
  // Get all users
  getAllUsers = async (req: Request, res: Response) => {
    const users = await this.dsContext.user.findAll();
    res.render("users/index", { users });
  };

  // Get the form to create a new user
  getNewUserForm = async (req: Request, res: Response) => {
    res.render("users/new");
  };

  // Create a new user
  createUser = async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const newUser = newUserSchema.parse(req.body);

      // Get the coordinates of a new user's address
      const coordinates = await geocodeAddress(
        newUser.address.street,
        newUser.address.city,
        newUser.address.postcode
      );

      // Insert the new user
      await this.dsContext.user.registerUser({
        ...newUser,
        address: { ...newUser.address, coordinates },
        score: 0,
      });

      // Redirect to the users page
      res.redirect("/users");
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle zod validation errors

        //Map over the errors and return the first error message for each field
        const errorMessages = error.errors.map(
          (err) => `${err.path[0]}: ${err.message}`
        );

        res.status(400).render("users/new", { errors: errorMessages });
      } else {
        // Other errors
        res.status(500).render("users/new", { errors: [error as Error] });
      }
    }
  };

  // Get the form to edit a user
  getEditUserForm = async (req: Request, res: Response) => {
    if (!req.params.id) {
      return res.json({ error: "User ID is required" });
    }
    // Get the user by ID
    const user = await this.dsContext.user.findById(req.params.id);

    res.render("users/edit", { user });
  };

  // Update a user
  updateUser = async (req: Request, res: Response) => {
    let _id = req.params.id;

    try {
      // Check if the user ID is provided
      if (!req.params.id) {
        throw new Error("User ID is required");
      }

      // Validate the request body
      const updatedUser = updatedUserSchema.parse(req.body);

      // Check if the user is trying to update their own role
      if (req.user && req.params.id === req.user.id) {
        throw new Error("You cannot update your own role");
      }

      const coordinates = await geocodeAddress(
        updatedUser.address.street,
        updatedUser.address.city,
        updatedUser.address.postcode
      );

      // Update the user
      await this.dsContext.user.update(req.params.id, {
        ...updatedUser,
        address: { ...updatedUser.address, coordinates },
      });

      // Redirect to the users page
      res.redirect("/users");
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle zod validation errors

        //Map over the errors and return the first error message for each field
        const errorMessages = error.errors.map(
          (err) => `${err.path[0]}: ${err.message}`
        );

        res.status(400).render("users/edit", {
          errors: errorMessages,
          user: { ...req.body, _id },
        });
      } else {
        // Other errors
        res.status(500).render("users/edit", {
          errors: [error as Error],
          user: { ...req.body, _id },
        });
      }
    }
  };

  getDeleteUserForm = async (req: Request, res: Response) => {
    if (!req.params.id) {
      return res.status(500).render("error", { error: "User ID is required" });
    }
    // Get the user by ID
    const user = await this.dsContext.user.findById(req.params.id);

    res.render("users/delete", { user });
  };

  // Delete a user
  deleteUser = async (req: Request, res: Response) => {
    try {
      if (!req.params.id) {
        throw new Error("User ID is required");
      }

      // Prevent self deletion
      if (req.params.id == req.user?.id) {
        return res
          .status(403)
          .render("error", { error: "You cannot delete yourself" });
      }

      // Delete the user by ID
      await this.dsContext.user.remove(req.params.id);

      res.redirect("/users");
    } catch (error) {
      res.status(500).render("error", { error: error });
    }
  };

  // Get a user
  getUser = async (req: Request, res: Response) => {
    try {
      if (!req.params.id) {
        throw new Error("User ID is required");
      }
      // Get the user by ID
      const user = await this.dsContext.user.findById(req.params.id);

      if (!user) {
        throw new Error("User not found");
      }
      res.render("users/show", { user });
    } catch (error) {
      res.status(500).render("error", { error: error });
    }
  };
}
