import express from "express";
import { ContactController } from "../controllers/contact-controller";
import { dsContext } from "../models/data-store-context";

// Create a new router to handle /contact routes
const contactRouter = express.Router();

const contactController = new ContactController(dsContext);

// GET: /contacts/
contactRouter.get("/", contactController.getAllContacts);

// GET: /contacts/new
contactRouter.get("/new", contactController.getNewContactForm);

// POST: /contacts/
contactRouter.post("/", contactController.createContact);

// GET: /contacts/:id
contactRouter.get("/:id", contactController.getContact);

export { contactRouter };
