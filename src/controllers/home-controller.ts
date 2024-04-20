import { Request, Response } from "express";
import { DataStoreContext, dsContext } from "../models/data-store-context";
import { Role } from "../models/enums";

export class HomeController {
  constructor(private dsContext: DataStoreContext) {}
  public homePage(req: Request, res: Response) {
    res.render("home/index");
  }

  // Return the about page
  public aboutPage(req: Request, res: Response) {
    res.render("home/about");
  }

  // Return the leaderboard page
  public async leaderboardPage(req: Request, res: Response) {
    // Get the users from the data store
    const users = await dsContext.user.getLeaderboard(10);

    // Map the user objects to a simpler object for rendering
    const leaderboardUsers = users.map((user, index) => {
      if (req.user && req.user.id === user._id) {
        return {
          rank: index + 1,
          isCurrentUser: true,
          fullname: "You",
          score: user.score,
        };
      }
      return {
        rank: index + 1,
        isCurrentUser: false,
        fullname: user.firstname + " " + user.lastname,
        score: user.score,
      };
    });

    res.render("home/leaderboard", { users: leaderboardUsers });
  }
}
