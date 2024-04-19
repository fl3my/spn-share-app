import { Role } from "../../src/models/enums";
import { UserModel, UserDocument } from "../../src/models/user-model";
import DataStore from "@seald-io/nedb";
import argon2 from "argon2";

describe("UserModel", () => {
  let userModel: UserModel;
  let datastore: DataStore<UserDocument>;

  beforeEach(async () => {
    // Create an in memory datastore
    datastore = new DataStore();
    userModel = new UserModel(datastore);

    // Seed the datastore with some data
    const newUser: UserDocument = {
      email: "user@example.com",
      password: "password",
      firstname: "John",
      lastname: "Doe",
      role: Role.DONATOR,
      mobile: "1234567890",
      score: 0,
    };

    await userModel.registerUser(newUser);
  });

  describe("registerUser", () => {
    it("should register a new user successfully", async () => {
      // Arrange
      const newUser: UserDocument = {
        email: "newUser@example.com",
        password: "password",
        firstname: "John",
        lastname: "Doe",
        role: Role.DONATOR,
        mobile: "1234567890",
        score: 0,
      };

      // Act
      const result = await userModel.registerUser(newUser);

      // Assert
      expect(result).toEqual(expect.objectContaining(newUser));
      expect(result._id).toBeDefined();
    });

    it("should throw an error when trying to register an exiting user", async () => {
      // Arrange
      const newUser: UserDocument = {
        email: "user@example.com",
        password: "password",
        firstname: "John",
        lastname: "Doe",
        role: Role.DONATOR,
        mobile: "1234567890",
        score: 0,
      };

      // Act
      const result = userModel.registerUser(newUser);

      // Assert
      await expect(result).rejects.toThrow("User already exists");
    });

    it("should hash the user's password before saving it to the datastore", async () => {
      // Arrange
      const newUser: UserDocument = {
        email: "newUser@example.com",
        password: "password",
        firstname: "John",
        lastname: "Doe",
        role: Role.DONATOR,
        mobile: "1234567890",
        score: 0,
      };

      // Act
      const result = await userModel.registerUser(newUser);

      // Assert
      expect(result.password).toMatch(newUser.password);

      // Use a regex for the argon2 hash
      expect(result.password).toMatch(
        /^\$argon2(?:i|d|id)\$v=\d+\$m=\d+,t=\d+,p=\d+\$.+\$.+$/
      );
    });
  });

  describe("findByEmail", () => {
    it("should return a user document when a valid email is provided", async () => {
      // Arrange
      const email = "user@example.com";

      // Act
      const result = await userModel.findByEmail(email);

      // Assert
      expect(result!.email).toEqual(email);
    });

    it("should return null when the user doesnt exist", async () => {
      // Arrange
      const email = "notEmail@example.com";

      // Act
      const result = await userModel.findByEmail(email);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findUsersByRole", () => {
    it("should return a list of users with the specified role", async () => {
      // Arrange
      const role = Role.DONATOR;

      // Act
      const result = await userModel.findUsersByRole(role);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.role).toEqual(role);
    });

    it("should return an empty list when no users with the role are found", async () => {
      // Arrange
      const role = Role.ADMIN;

      // Act
      const result = await userModel.findUsersByRole(role);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe("hashPassword", () => {
    it("should return a hashed password", async () => {
      // Arrange
      const password = "password";

      // Act
      const result = await userModel.hashPassword(password);

      // Assert
      expect(result).toMatch(
        /^\$argon2(?:i|d|id)\$v=\d+\$m=\d+,t=\d+,p=\d+\$.+\$.+$/
      );
    });
  });

  describe("verifyPassword", () => {
    it("should return true when the provided password matches the stored password", async () => {
      // Arrange
      const password = "password";
      const storedPassword = await argon2.hash("password");

      // Act
      const result = await userModel.verifyPassword(storedPassword, password);

      // Assert
      expect(result).toBe(true);
    });

    it("should return false when the provided password does not match the users password", async () => {
      // Arrange
      const password = "notPassword";
      const storedPassword = await argon2.hash("password");

      // Act
      const result = await userModel.verifyPassword(storedPassword, password);

      // Assert
      expect(result).toBe(false);
    });
  });
});
