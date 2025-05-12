import { Router } from "express";
import { protectedRoutes } from "../controllers/auth.controller.js";
import {
  createCashOrder,
  getUserOrders,
  getAllOrders,
} from "./order.controler.js";

const orderRouter = Router();

orderRouter.post("/:id", protectedRoutes, createCashOrder);

orderRouter.get("/", protectedRoutes, getAllOrders);

orderRouter.get("/usersorder", protectedRoutes, getUserOrders);

export { orderRouter };
