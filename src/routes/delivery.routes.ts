import { Router } from "express";
import {
  createDeliveryController,
  getDeliveryByIdController,
  listDeliveriesController,
} from "../controllers/delivery.controller.js";

const deliveryRouter = Router();

// CREATE
deliveryRouter.post("/", createDeliveryController);

// READ
deliveryRouter.get("/", listDeliveriesController);
deliveryRouter.get("/:id", getDeliveryByIdController);

export default deliveryRouter;
