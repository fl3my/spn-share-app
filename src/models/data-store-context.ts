import DataStore from "@seald-io/nedb";

import { DonationItemModel } from "./donation-item-model";
import { UserModel } from "./user-model";
import { RequestModel } from "./request-model";

/**
 * DataStore context class that holds all the models in the application.
 * This class is effectively a singleton, ensuring that only one instance of each model exists.
 */
export class DataStoreContext {
  public user: UserModel;
  public donationItem: DonationItemModel;
  public request: RequestModel;

  constructor() {
    const userDb = new DataStore({ filename: "data/users.db", autoload: true });
    this.user = new UserModel(userDb);

    const donationItemDb = new DataStore({
      filename: "data/donation-items.db",
      autoload: true,
    });
    this.donationItem = new DonationItemModel(donationItemDb);

    const requestDb = new DataStore({
      filename: "data/requests.db",
      autoload: true,
    });
    this.request = new RequestModel(requestDb);
  }
}

// Export a singleton instance of the DataStore class
export const dsContext = new DataStoreContext();
