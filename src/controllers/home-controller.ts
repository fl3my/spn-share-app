import { Request, Response } from "express";

export class HomeController {
  // Return the about page
  public aboutPage(req: Request, res: Response) {
    res.render("home/about");
  }

  // Return the contact page
  public contactPage(req: Request, res: Response) {
    res.render("home/contact");
  }
}
