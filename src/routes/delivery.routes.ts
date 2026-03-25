import { Router } from "express";
import {
  getDeliveryByIdController,
  listDeliveriesController,
} from "../controllers/delivery.controller.js";

const deliveryRouter = Router();

// READ
deliveryRouter.get("/", listDeliveriesController);
deliveryRouter.get("/:id", getDeliveryByIdController);

export default deliveryRouter;
