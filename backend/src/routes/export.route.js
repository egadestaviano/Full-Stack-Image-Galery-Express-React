import { Router } from "express";
import { exportProductsToCSV } from "../controllers/export.controller.js";

const exportRouter = Router();

exportRouter.get("/export/products/csv", exportProductsToCSV);

export default exportRouter;