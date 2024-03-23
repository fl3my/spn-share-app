import express from "express";
import { UserController } from "../controllers/user-controller";
import { UserModel } from "../models/user-model";

// Create a new router to handle /user routes
const userRouter = express.Router();

const userModel = new UserModel();
const userController = new UserController(userModel);

// GET: /users
userRouter.get("/", userController.getAllUsers);

// GET: /users/new
userRouter.get("/new", userController.getNewUserForm);

// POST: /users
userRouter.post("/", userController.createUser);

// GET: /users/:id/edit
userRouter.get("/:id/edit", userController.getEditUserForm);

// PATCH: /users/:id
userRouter.patch("/:id", userController.updateUser);

// DELETE: /users/:id/delete
userRouter.delete("/:id", userController.deleteUser);

// Get: /users/:id
userRouter.get("/:id", userController.getUser);

export { userRouter };
