import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import { dsContext } from "./models/data-store-context";

// Get the user model instance
// Create a local strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (username, password, done) => {
      try {
        // Convert the email to lowercase
        const email = username.toLowerCase();

        // Get the user by email
        const user = await dsContext.user.findByEmail(email);

        // Check if the user is valid and the password is correct
        const isValid =
          user &&
          (await dsContext.user.verifyPassword(user.password, password));

        // If the user is not valid or the password is incorrect, return false
        if (!user || !isValid) {
          return done(null, false, { message: "Incorrect email or password." });
        }

        // If the user is valid and the password is correct, return the user
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

//Serialize the user
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Define the user session type
interface UserSession {
  id: string;
  email: string;
  role: string;
}

// Deserialize the user
passport.deserializeUser(async (id: string, done) => {
  try {
    // Get the user that matches the ID
    const user = await dsContext.user.findById(id);

    // If the user does not exist, return false
    if (!user) {
      return done(null, false);
    }

    // Cast the user to a user session
    const userSession: UserSession = {
      id: user._id as string,
      email: user.email as string,
      role: user.role as string,
    };
    // Return the user session
    done(null, userSession);
  } catch (err) {
    done(err);
  }
});

export default passport;
