import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { Role } from "../models/enums";
import passport from "../configs/passport-config";
import { DataStoreContext } from "../models/data-store-context";
import { loginSchema, registerSchema } from "../schemas/auth-schemas";

export class AuthController {
  constructor(private dsContext: DataStoreContext) {}

  getLoginForm = async (req: Request, res: Response) => {
    res.render("auth/login");
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use zod to validate the request body
      loginSchema.parse(req.body);
      console.log(req.body);
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
      const userWithRole = { ...validatedRegister, role: Role.DONATOR };

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
}
