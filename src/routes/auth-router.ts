import express from "express";
import { AuthController } from "../controllers/auth-controller";
import { UserModel } from "../models/user-model";

// Create a new router to handle /auth routes
const authRouter = express.Router();

const userModel = new UserModel();
const authController = new AuthController(userModel);

// GET: /auth/login
authRouter.get("/login", authController.getLoginForm);

// POST: /auth/login
authRouter.post("/login", authController.Login);

// GET: /auth/register
authRouter.get("/register", authController.getRegisterForm);

// POST: /auth/register
authRouter.post("/register", authController.Register);

// GET: /auth/logout
authRouter.get("/logout", authController.Logout);

export { authRouter };
