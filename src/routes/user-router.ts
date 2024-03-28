import express from "express";

import { UserController } from "../controllers/user-controller";
import { dsContext } from "../models/data-store-context";

// Create a new router to handle /user routes
const userRouter = express.Router();

const userController = new UserController(dsContext);

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

// GET: /users/:id/delete
userRouter.get("/:id/delete", userController.getDeleteUserForm);

// DELETE: /users/:id/delete
userRouter.delete("/:id", userController.deleteUser);

// Get: /users/:id
userRouter.get("/:id", userController.getUser);

export { userRouter };
