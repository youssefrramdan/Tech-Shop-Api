import express from "express";
import { bootstrap } from "./modules/bootstrap.js";
import { dbConnect } from "./databases/dbConnection.js";
import { globalError } from "./middlewares/globalError.js";
import { AppError } from "./utils/appError.js";
import dotenv from "dotenv";
dotenv.config({path :"./config.env"});
const app = express();
app.use(cors());
app.use("/uploads", express.static("./uploads"));
dotenv.config({path:'config.env'})
app.use(express.json());
bootstrap(app);
app.use("*", (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
});

app.use(globalError);
app.listen(process.env.PORT, () => console.log(`Example app listening on port ${process.env.PORT}!`));
