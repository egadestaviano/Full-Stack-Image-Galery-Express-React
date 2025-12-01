import { Router } from "express";
import {
  addTagToProduct,
  createTag,
  getTagById,
  getTagByName,
  getTags,
  removeTagFromProduct,
} from "../controllers/tag.controller.js";

const tagRouter = Router();

tagRouter.get("/tags", getTags);
tagRouter.get("/tags/:id", getTagById);
tagRouter.get("/tags/name/:name", getTagByName);
tagRouter.post("/tags", createTag);
tagRouter.post("/tags/product", addTagToProduct);
tagRouter.delete("/tags/product/:productId/:tagId", removeTagFromProduct);

export default tagRouter;