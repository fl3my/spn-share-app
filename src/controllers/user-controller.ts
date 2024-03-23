import { NextFunction, Request, Response } from "express";
import { Role, UserModel } from "../models/user-model";
import { z } from "zod";

const newUserSchema = z.object({
  firstname: z.string().min(2),
  lastname: z.string().min(2),
  role: z.nativeEnum(Role),
  email: z.string().email(),
  password: z.string().min(6),
});

const updatedUserSchema = z.object({
  firstname: z.string().min(2).optional(),
  lastname: z.string().min(2).optional(),
  role: z.nativeEnum(Role).optional(),
  email: z.string().email().optional(),
});

export class UserController {
  constructor(private userModel: UserModel) {}

  // Get all users
  getAllUsers = async (req: Request, res: Response) => {
    const users = await this.userModel.findAll();
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
      await this.userModel.registerUser(newUser);

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
    const user = await this.userModel.findById(req.params.id);

    res.render("users/edit", { user });
  };

  // Update a user
  updateUser = async (req: Request, res: Response) => {
    try {
      // Check if the user ID is provided
      if (!req.params.id) {
        throw new Error("User ID is required");
      }

      // Validate the request body
      const updatedUser = updatedUserSchema.parse(req.body);

      // Update the user
      await this.userModel.update(req.params.id, updatedUser);

      // Redirect to the users page
      res.redirect("/users");
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle zod validation errors
        res.status(400).render("users/edit", {
          errors: error.errors,
          user: req.body,
        });
      } else {
        // Other errors
        res.status(500).render("users/edit", {
          errors: [error as Error],
          user: req.body,
        });
      }
    }
  };

  // Delete a user
  deleteUser = async (req: Request, res: Response) => {
    try {
      if (!req.params.id) {
        throw new Error("User ID is required");
      }
      // Delete the user by ID
      await this.userModel.remove(req.params.id);

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
      const user = await this.userModel.findById(req.params.id);

      if (!user) {
        throw new Error("User not found");
      }

      res.render("users/show", { user });
    } catch (error) {
      res.status(500).render("error", { error: error });
    }
  };
}
