import DataStore from "@seald-io/nedb";
import { DonationItemModel } from "./donation-item-model";
import { UserModel } from "./user-model";

/**
 * Model Provider class that holds all the models in the application.
 * This class is effectively a singleton, ensuring that only one instance of each model exists.
 */
class ModelProvider {
  private userModel: UserModel;
  private donationItemModel: DonationItemModel;

  constructor() {
    const userDb = new DataStore({ filename: "data/users.db", autoload: true });
    this.userModel = new UserModel(userDb);

    const donationItemDb = new DataStore({
      filename: "data/donation-items.db",
      autoload: true,
    });
    this.donationItemModel = new DonationItemModel(donationItemDb);
  }

  public getUserModel(): UserModel {
    return this.userModel;
  }

  public getDonationItemModel(): DonationItemModel {
    return this.donationItemModel;
  }
}

// Export a singleton instance of the DataStore class
export const modelProvider = new ModelProvider();
