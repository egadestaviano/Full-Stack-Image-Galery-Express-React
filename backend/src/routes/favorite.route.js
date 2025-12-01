import { Router } from "express";
import {
  addFavorite,
  getFavorites,
  isFavorite,
  removeFavorite,
} from "../controllers/favorite.controller.js";

const favoriteRouter = Router();

favoriteRouter.get("/favorites", getFavorites);
favoriteRouter.post("/favorites", addFavorite);
favoriteRouter.delete("/favorites/:productId", removeFavorite);
favoriteRouter.get("/favorites/:productId", isFavorite);

export default favoriteRouter;