import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { engine } from "express-handlebars";

// configure environment variables
dotenv.config();

// Create an express application
const app = express();
const port = process.env.PORT || 3000;

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

app.get("/", (req, res) => {
  res.render("home");
});

// Start the express server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
