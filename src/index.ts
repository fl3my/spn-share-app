// External modules
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { engine } from "express-handlebars";
import session from "express-session";
import makeStore from "nedb-promises-session-store";
import methodOverride from "method-override";

// Configurations
dotenv.config();
import passport from "./configs/passport-config";

// Utils
import * as helpers from "./utils/handlebars-helpers";

// Routes
import {
  authRouter,
  contactRouter,
  donationItemRouter,
  homeRouter,
  requestRouter,
  shopRouter,
  userRouter,
} from "./routes";

// Middleware
import { ensureInRole, ensureInRoles } from "./middleware/auth-middleware";

// Models
import { Role } from "./models/enums";

// Create an express application
const app = express();
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "localhost";

// Use express middleware to parse the request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static("public"));

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
    helpers: helpers,
  })
);

// Set the view engine and views directory
app.set("view engine", ".hbs");
app.set("views", "src/views");

// Define the routes
app.use("/auth", authRouter);
app.use("/users", ensureInRole(Role.ADMIN), userRouter);
app.use(
  "/donation-items",
  ensureInRoles([Role.DONATOR, Role.PANTRY, Role.ADMIN]),
  donationItemRouter
);
app.use("/shop", ensureInRole(Role.PANTRY), shopRouter);
app.use(
  "/requests",
  ensureInRoles([Role.DONATOR, Role.PANTRY, Role.WAREHOUSE]),
  requestRouter
);
app.use("/contacts", contactRouter);
app.use("/", homeRouter);

// Catch-all route
app.use("*", (req, res) => {
  res.status(404).render("404");
});

// Start the express server
app.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}`);
});
