import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { Role } from "../models/enums";
import passport from "../configs/passport-config";
import { DataStoreContext } from "../models/data-store-context";
import {
  loginSchema,
  profileSchema,
  registerSchema,
} from "../schemas/auth-schemas";
import { geocodeAddress } from "../utils/geocode";

export class AuthController {
  constructor(private dsContext: DataStoreContext) {}

  getLoginForm = async (req: Request, res: Response) => {
    res.render("auth/login");
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use zod to validate the request body
      loginSchema.parse(req.body);

      passport.authenticate(
        "local",
        (err: Error | null, user: Express.User | false) => {
          if (err) {
            // Handle authentication errors
            return res
              .status(500)
              .render("auth/login", { errors: [err as Error] });
          }

          if (!user) {
            // The authentication was unsuccessful
            return res.status(401).render("auth/login", {
              errors: [{ message: "Incorrect username or password." }],
            });
          }

          // If authentication was successful, log the user in
          req.logIn(user, (err) => {
            if (err) {
              // Handle errors that occur during the login process
              return res
                .status(500)
                .render("auth/login", { errors: [err as Error] });
            }

            // Redirect the user to the home page
            return res.redirect("/");
          });
        }
      )(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle zod validation errors
        res.status(400).render("auth/login", { errors: error.errors });
      } else {
        // Other errors
        res.status(500).render("auth/login", { errors: [error as Error] });
      }
    }
  };

  getRegisterForm = async (req: Request, res: Response) => {
    res.render("auth/register");
  };

  register = async (req: Request, res: Response) => {
    try {
      // Use zod to validate the request body
      const validatedRegister = registerSchema.parse(req.body);

      // Add the role of DONATOR to the user
      const userWithRole = {
        ...validatedRegister,
        role: Role.DONATOR,
        score: 0,
      };

      // Register the user
      await this.dsContext.user.registerUser(userWithRole);

      // Redirect the user to the login page
      res.render("auth/login", {
        success: { message: "User registered successfully" },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle zod validation errors
        res.status(400).render("auth/register", { errors: error.errors });
      } else {
        // Other errors
        res.status(500).render("auth/register", { errors: [error as Error] });
      }
    }
  };

  logout = async (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        throw err;
      }
      res.redirect("/auth/login");
    });
  };

  unauthorized = async (req: Request, res: Response) => {
    res.status(403).render("auth/unauthorized");
  };

  getProfile = async (req: Request, res: Response) => {
    try {
      const currentUser = req.user;

      // If the user is not logged in, redirect them to the login page
      if (!currentUser) {
        return res.redirect("/auth/login");
      }

      // Find the user in the data store
      const user = await this.dsContext.user.findById(currentUser.id);

      // Render the profile page
      res.render("auth/profile", { user });
    } catch (error) {
      res.status(500).render("auth/profile", { errors: [error as Error] });
    }
  };

  updateProfile = async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const updatedUser = profileSchema.parse(req.body);

      const user = req.user;

      // If the user is not logged in, redirect them to the login page
      if (!user) {
        return res.redirect("/auth/login");
      }

      // If the user is not the current user redirect them to the unauthorized page
      if (updatedUser._id !== user.id) {
        return res.status(403).render("auth/unauthorized");
      }

      // Geocode the address
      const coordinates = await geocodeAddress(
        updatedUser.address.street,
        updatedUser.address.city,
        updatedUser.address.postcode
      );

      // Update the user with new coordinates
      const newUser = await this.dsContext.user.update(updatedUser._id, {
        ...updatedUser,
        address: { ...updatedUser.address, coordinates },
      });

      // Redirect to the profile page with success message
      res.render("auth/profile", {
        user: newUser,
        success: "Profile successfully updated!",
      });
    } catch (error) {
      const _id = req.body._id;
      if (error instanceof z.ZodError) {
        // Handle zod validation errors
        res.status(400).render("auth/profile", {
          errors: error.errors,
          user: { ...req.body, _id },
        });
      } else {
        // Other errors
        res.status(500).render("auth/profile", {
          errors: [error as Error],
          user: { ...req.body, _id },
        });
      }
    }
  };
}
