import DataStore from "@seald-io/nedb";
import argon2 from "argon2";

import { DocumentModel, Document } from "./document-model";
import { Role } from "./enums";

// Define an inteface for the user document object
export interface UserDocument extends Document {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  role: Role;
  address?: {
    street: string;
    city: string;
    postcode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

// This is the user model class that extends the base document model
export class UserModel extends DocumentModel<UserDocument> {
  constructor(db: DataStore<UserDocument>) {
    super(db);
  }

  async registerUser(user: UserDocument): Promise<UserDocument> {
    // Check if the user already exists
    const existingUser = await this.findByEmail(user.email);

    // If the user already exists, throw an error
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash the user's password
    user.password = await this.hashPassword(user.password);

    // Insert the user into the database using the base class insert method
    return super.insert(user);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      return await this.db.findOneAsync({ email });
    } catch (error) {
      console.error("Error finding user by email: ", error);
      throw error;
    }
  }

  async findUsersByRole(role: Role): Promise<UserDocument[]> {
    try {
      return await this.db.findAsync({ role });
    } catch (error) {
      console.error("Error finding users by role: ", error);
      throw error;
    }
  }

  // Function to hash the user's password
  async hashPassword(password: string): Promise<string> {
    try {
      // Define the argon2 hash options
      const options = {
        memoryCost: 12288, // 12MiB. This option controls the amount of memory that Argon2 uses (in kibibytes).
        timeCost: 3, // This option controls the execution time, given in number of iterations.
        parallelism: 1, // This option sets the the number of threads to run in parallel.
      };

      // Argon2 hash function automatically generates a random salt, which is returned with the hash string
      const hash = await argon2.hash(password, options);
      return hash;
    } catch (error) {
      console.error("Error hashing password: ", error);
      throw error;
    }
  }

  // Function to verify the user's password
  async verifyPassword(storedPassword: string, providedPassword: string) {
    try {
      // Check if the stored password is empty
      if (!providedPassword) {
        throw new Error("Provided password should not be empty");
      }

      // Verify the password using argon2 and return a boolean
      return await argon2.verify(storedPassword, providedPassword);
    } catch (error) {
      console.error("Error verifying password: ", error);
      throw error;
    }
  }
}
