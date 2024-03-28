import { Request, Response } from "express";
import { z } from "zod";

import { DataStoreContext } from "../models/data-store-context";
import { newUserSchema, updatedUserSchema } from "../schemas/user-schemas";

export class UserController {
  constructor(private modelProvider: DataStoreContext) {}
  // Get all users
  getAllUsers = async (req: Request, res: Response) => {
    const users = await this.modelProvider.user.findAll();
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

      // Insert the new user
      await this.modelProvider.user.registerUser(newUser);

      // Redirect to the users page
      res.redirect("/users");
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle zod validation errors
        res.status(400).render("users/new", { errors: error.errors });
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
    const user = await this.modelProvider.user.findById(req.params.id);

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

      // Update the user
      await this.modelProvider.user.update(req.params.id, updatedUser);

      // Redirect to the users page
      res.redirect("/users");
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle zod validation errors
        res.status(400).render("users/edit", {
          errors: error.errors,
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
    const user = await this.modelProvider.user.findById(req.params.id);

    res.render("users/delete", { user });
  };

  // Delete a user
  deleteUser = async (req: Request, res: Response) => {
    try {
      if (!req.params.id) {
        throw new Error("User ID is required");
      }
      // Delete the user by ID
      await this.modelProvider.user.remove(req.params.id);

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
      const user = await this.modelProvider.user.findById(req.params.id);

      if (!user) {
        throw new Error("User not found");
      }

      res.render("users/show", { user });
    } catch (error) {
      res.status(500).render("error", { error: error });
    }
  };
}
