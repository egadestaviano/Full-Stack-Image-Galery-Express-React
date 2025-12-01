import { Router } from "express";
import {
  deleteProduct,
  getProductById,
  getProducts,
  insertProduct,
  updateProduct,
  bulkDeleteProducts,
} from "../controllers/product.controller.js";
const productRouter = Router();

productRouter.get("/products", getProducts);
productRouter.get("/products/:id", getProductById);
productRouter.post("/products", insertProduct);
productRouter.put("/products/:id", updateProduct);
productRouter.delete("/products/:id", deleteProduct);
productRouter.post("/products/bulk-delete", bulkDeleteProducts);
export default productRouter;
