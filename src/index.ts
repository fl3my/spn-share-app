import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";

// configure environment variables
dotenv.config();

// Create an express application
const app = express();
const port = process.env.PORT || 3000;

// Use morgan to log HTTP requests
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start the express server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
