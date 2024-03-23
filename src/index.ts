import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { engine } from "express-handlebars";
import passport from "./passport-config";
import session from "express-session";
import makeStore from "nedb-promises-session-store";
import methodOverride from "method-override";

import { authRouter } from "./routes/auth-router";
import { userRouter } from "./routes/user-router";

// configure environment variables
dotenv.config();

// Create an express application
const app = express();
const port = process.env.PORT || 3000;

// Use express middleware to parse the request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use method override middleware to support PUT and DELETE requests
app.use(methodOverride("_method"));

// Set the session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    store: makeStore({ connect: session, filename: "data/store.db" }),
  })
);

// Set the passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set the user in the response locals, so it can be used in the views
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// Use morgan to log HTTP requests
app.use(morgan("dev"));

// Configure the handlebars engine
app.engine(
  ".hbs",
  engine({
    extname: ".hbs",
    helpers: {
      eq: function (v1: string, v2: string): boolean {
        return v1 === v2;
      },
    },
  })
);

// Set the view engine and views directory
app.set("view engine", ".hbs");
app.set("views", "src/views");

// Define the routes
app.use("/auth", authRouter);
app.use("/users", userRouter);

app.get("/", (req, res) => {
  res.render("home");
});

// Start the express server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
