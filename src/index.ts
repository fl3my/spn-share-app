import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { engine } from "express-handlebars";
import session from "express-session";
import makeStore from "nedb-promises-session-store";
import methodOverride from "method-override";
import moment from "moment";

// configure environment variables
dotenv.config();

import passport from "./configs/passport-config";
import { authRouter } from "./routes/auth-router";
import { userRouter } from "./routes/user-router";
import { ensureAdmin, ensureAuthenticated } from "./middleware/auth-middleware";
import { homeRouter } from "./routes/home-router";
import { donationItemRouter } from "./routes/donation-item-router";
import { shopRouter } from "./routes/shop-router";
import { requestRouter } from "./routes/request-router";

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
    helpers: {
      eq: function (v1: string, v2: string): boolean {
        return v1 === v2;
      },
      formatDate: function (date: Date, format: string) {
        return moment(date).format(format);
      },
    },
  })
);

// Set the view engine and views directory
app.set("view engine", ".hbs");
app.set("views", "src/views");

// Define the routes
app.use("/", homeRouter);
app.use("/auth", authRouter);
app.use("/users", ensureAdmin, userRouter);
app.use("/donation-items", ensureAuthenticated, donationItemRouter);
app.use("/shop", ensureAuthenticated, shopRouter);
app.use("/requests", ensureAuthenticated, requestRouter);

app.get("/", (req, res) => {
  res.render("home");
});

// Start the express server
app.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}`);
});
