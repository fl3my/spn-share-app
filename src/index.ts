import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { engine } from "express-handlebars";
import passport from "./passport-config";
import session from "express-session";
import makeStore from "nedb-promises-session-store";

import { authRouter } from "./routes/auth-router";

// configure environment variables
dotenv.config();

// Create an express application
const app = express();
const port = process.env.PORT || 3000;

// Use express middleware to parse the request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  res.locals.user = req.user;
  next();
});

// Use morgan to log HTTP requests
app.use(morgan("dev"));

// Configure the handlebars engine
app.engine(
  ".hbs",
  engine({
    extname: ".hbs",
  })
);

// Set the view engine and views directory
app.set("view engine", ".hbs");
app.set("views", "src/views");

// Define the routes
app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.render("home");
});

// Start the express server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
