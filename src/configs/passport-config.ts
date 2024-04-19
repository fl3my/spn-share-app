import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { dsContext } from "../models/data-store-context";
import { Role } from "../models/enums";

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
          user.password &&
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

// Create a google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the email is found in the profile
        if (!profile.emails?.[0]?.value) {
          return done(null, false, {
            message: "No email found in the Google account.",
          });
        }

        // Get the user by email
        const user = await dsContext.user.findByEmail(profile.emails[0].value);

        // If the user does not exist, create a new user
        if (!user) {
          const newUser = await dsContext.user.insert({
            email: profile.emails?.[0]?.value ?? "",
            role: Role.DONATOR,
            score: 0,
            firstname: profile.name?.givenName ?? "",
            lastname: profile.name?.familyName ?? "",
          });
          return done(null, newUser);
        }

        // Return the user
        return done(null, user);
      } catch (err) {
        return done(err as Error);
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
  score: number;
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
      score: user.score as number,
    };
    // Return the user session
    done(null, userSession);
  } catch (err) {
    done(err);
  }
});

export default passport;
