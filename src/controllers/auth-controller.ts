import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { Role, UserModel } from "../models/user-model";
import passport from "../passport-config";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  firstname: z.string().min(2),
  lastname: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export class AuthController {
  constructor(private userModel: UserModel) {}

  getLoginForm = async (req: Request, res: Response) => {
    res.render("auth/login");
  };

  Login = async (req: Request, res: Response, next: NextFunction) => {
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

  Register = async (req: Request, res: Response) => {
    try {
      // Use zod to validate the request body
      const validatedRegister = registerSchema.parse(req.body);

      // Add the role of DONATOR to the user
      const userWithRole = { ...validatedRegister, role: Role.DONATOR };

      // Register the user
      await this.userModel.registerUser(userWithRole);

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

  Logout = async (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        throw err;
      }
      res.redirect("/auth/login");
    });
  };
}
