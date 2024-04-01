import { Request, Response } from "express";
import { DataStoreContext } from "../models/data-store-context";
import { contactSchema } from "../schemas/contact-schema";
import { z } from "zod";

export class ContactController {
  constructor(private dsContext: DataStoreContext) {}

  getAllContacts = async (req: Request, res: Response) => {
    const contacts = await this.dsContext.contact.findAll();
    res.render("contact/index", { contacts });
  };
  getNewContactForm = (req: Request, res: Response) => {
    res.render("contact/new");
  };
  createContact = async (req: Request, res: Response) => {
    try {
      // Parse the request body using the contact schema
      const contact = contactSchema.parse(req.body);

      // Add the current date and time to the contact
      const newContact = { ...contact, sentAt: new Date() };

      // Insert the new contact into the data store
      await this.dsContext.contact.insert(newContact);

      res.render("contact/new", {
        success: { message: "Message sent successfully." },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.render("contact/new", { errors: error.errors });
      } else {
        res.render("contact/new", { error });
      }
    }
  };
  getContact = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;

      if (!id) {
        throw new Error("Contact ID is required.");
      }

      const contact = await this.dsContext.contact.findById(id);

      if (!contact) {
        throw new Error("Contact not found.");
      }

      res.render("contact/show", { contact });
    } catch (error) {
      res.render("error", { error });
    }
  };
}
