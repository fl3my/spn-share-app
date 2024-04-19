import express from "express";

import { AuthController } from "../controllers/auth-controller";
import { dsContext } from "../models/data-store-context";

// Create a new router to handle /auth routes
const authRouter = express.Router();

const authController = new AuthController(dsContext);

// GET: /auth/login
authRouter.get("/login", authController.getLoginForm);

// POST: /auth/login
authRouter.post("/login", authController.login);

// GET: /auth/register
authRouter.get("/register", authController.getRegisterForm);

// POST: /auth/register
authRouter.post("/register", authController.register);

// GET: /auth/logout
authRouter.get("/logout", authController.logout);

// Get: /auth/unauthorized
authRouter.get("/unauthorized", authController.unauthorized);

// GET: /auth/profile
authRouter.get("/profile", authController.getProfile);

// PATCH: /auth/profile
authRouter.patch("/profile", authController.updateProfile);

// GET: /auth/google
authRouter.get("/google", authController.googleLogin);

// GET: /auth/google/callback
authRouter.get("/google/callback", authController.googleCallback);

export { authRouter };
