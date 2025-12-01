import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load favorites on initial load
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/favorites");
      setFavorites(response.data.response || []);
    } catch (error) {
      console.error("Failed to load favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (productId) => {
    try {
      const response = await axios.post("/api/favorites", { productId });
      setFavorites(prev => [...prev, response.data.response]);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const removeFavorite = async (productId) => {
    try {
      await axios.delete(`/api/favorites/${productId}`);
      setFavorites(prev => prev.filter(product => product.id !== productId));
      return { message: "Removed from favorites" };
    } catch (error) {
      throw error;
    }
  };

  const isFavorite = (productId) => {
    return favorites.some(product => product.id === productId);
  };

  const toggleFavorite = async (productId) => {
    if (isFavorite(productId)) {
      return await removeFavorite(productId);
    } else {
      return await addFavorite(productId);
    }
  };

  const value = {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    loadFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

FavoritesProvider.propTypes = {
  children: PropTypes.node.isRequired
};