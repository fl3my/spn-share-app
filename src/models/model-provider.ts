import { UserModel } from "./user-model";
import DataStore from "@seald-io/nedb";

/**
 * Model Provider class that holds all the models in the application.
 * This class is effectively a singleton, ensuring that only one instance of each model exists.
 */
class ModelProvider {
  private userModel: UserModel;

  constructor() {
    const userDb = new DataStore({ filename: "data/users.db", autoload: true });
    this.userModel = new UserModel(userDb);
  }

  public getUserModel(): UserModel {
    return this.userModel;
  }
}

// Export a singleton instance of the DataStore class
export const modelProvider = new ModelProvider();
