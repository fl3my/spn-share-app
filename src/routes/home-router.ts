import express from "express";
import { dsContext } from "../models/data-store-context";
import { HomeController } from "../controllers/home-controller";

// Create a new router to handle / routes
const homeRouter = express.Router();

const homeController = new HomeController(dsContext);

// GET: /
homeRouter.get("/", homeController.homePage);

// GET: /about
homeRouter.get("/about", homeController.aboutPage);

// GET: /leaderboard
homeRouter.get("/leaderboard", homeController.leaderboardPage);

export { homeRouter };
