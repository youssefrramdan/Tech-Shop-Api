import express from "express";
import { bootstrap } from "./modules/bootstrap.js";
import { dbConnect } from "./databases/dbConnection.js";
import { globalError } from "./middlewares/globalError.js";
import { AppError } from "./utils/appError.js";
import dotenv from "dotenv";
import cors from "cors";  // Ensure cors is imported
import cookieParser from 'cookie-parser'; // Correctly import cookie-parser

dotenv.config({ path: "./config.env" });
const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',  // Allow localhost for development
  credentials: true  // Include credentials (cookies, authorization headers, etc.) in CORS requests
}));

// Middleware to parse cookies
app.use(cookieParser()); // Initialize cookie-parser

app.use("/uploads", express.static("./uploads"));
app.use(express.json()); // Parse incoming JSON requests

// Bootstrapping the app
bootstrap(app);

// Handle unknown routes
app.use("*", (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
});

// Global error handling middleware
app.use(globalError);

// Start the server
app.listen(process.env.PORT, () => console.log(`Example app listening on port ${process.env.PORT}!`));
