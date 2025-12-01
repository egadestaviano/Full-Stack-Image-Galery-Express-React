import { Router } from "express";
import {
  deleteCategory,
  getCategoryById,
  getCategories,
  insertCategory,
  updateCategory,
} from "../controllers/category.controller.js";

const categoryRouter = Router();

categoryRouter.get("/categories", getCategories);
categoryRouter.get("/categories/:id", getCategoryById);
categoryRouter.post("/categories", insertCategory);
categoryRouter.put("/categories/:id", updateCategory);
categoryRouter.delete("/categories/:id", deleteCategory);

export default categoryRouter;