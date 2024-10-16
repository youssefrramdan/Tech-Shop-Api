import mongoose from "mongoose";
import dotenv from"dotenv"
dotenv.config()
export const dbConnect = mongoose
  .connect("mongodb+srv://admine:1234@cluster0.rgnxpsp.mongodb.net/ramadan?retryWrites=true&w=majority")
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
