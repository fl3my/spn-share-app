import express from "express";
import { HomeController } from "../controllers/home-controller";

// Create a new router to handle / routes
const homeRouter = express.Router();

const homeController = new HomeController();

// GET: /about
homeRouter.get("/about", homeController.aboutPage);

// GET: /contact
homeRouter.get("/contact", homeController.contactPage);

export { homeRouter };
