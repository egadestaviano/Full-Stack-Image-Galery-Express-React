import prisma from "../utils/client.js";

export const getFavorites = async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    res.json({ 
      message: "success", 
      response: favorites.map(fav => fav.product) 
    });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) }
    });
    
    if (!product) {
      return res.status(404).json({ 
        message: "Product not found", 
        response: null 
      });
    }
    
    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: { productId: Number(productId) }
    });
    
    if (existingFavorite) {
      return res.status(400).json({ 
        message: "Product already in favorites", 
        response: null 
      });
    }
    
    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: { productId: Number(productId) },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });
    
    res.status(201).json({ 
      message: "Added to favorites", 
      response: favorite.product 
    });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Check if favorited
    const favorite = await prisma.favorite.findUnique({
      where: { productId: Number(productId) }
    });
    
    if (!favorite) {
      return res.status(404).json({ 
        message: "Product not in favorites", 
        response: null 
      });
    }
    
    // Remove from favorites
    await prisma.favorite.delete({
      where: { id: favorite.id }
    });
    
    res.json({ 
      message: "Removed from favorites", 
      response: null 
    });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};

export const isFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const favorite = await prisma.favorite.findUnique({
      where: { productId: Number(productId) }
    });
    
    res.json({ 
      message: "success", 
      response: !!favorite 
    });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};