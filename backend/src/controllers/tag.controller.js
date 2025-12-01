import prisma from "../utils/client.js";

export const getTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" }
    });
    res.json({ message: "success", response: tags });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};

export const getTagById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag)
      return res.status(404).json({ message: "Tag not found", response: null });

    res.json({ message: "success", response: tag });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};

export const getTagByName = async (req, res) => {
  try {
    const { name } = req.params;
    if (!name) return res.status(400).json({ message: "Tag name is required" });

    const tag = await prisma.tag.findUnique({ 
      where: { name } ,
      include: {
        products: {
          include: {
            category: true
          }
        }
      }
    });
    
    if (!tag)
      return res.status(404).json({ message: "Tag not found", response: null });

    res.json({ message: "success", response: tag });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};

export const createTag = async (req, res) => {
  try {
    const name = req.body?.name?.trim();

    if (!name) return res.status(400).json({ message: "Tag name cannot be null", response: null });

    // Check if tag already exists
    const existingTag = await prisma.tag.findUnique({
      where: { name }
    });

    if (existingTag) {
      return res.status(400).json({ message: "Tag already exists", response: existingTag });
    }

    const tag = await prisma.tag.create({
      data: { name },
    });

    res.status(201).json({ message: "Tag created successfully", response: tag });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};

export const addTagToProduct = async (req, res) => {
  try {
    const { productId, tagId } = req.body;
    
    // Validate inputs
    if (!productId || !tagId) {
      return res.status(400).json({ message: "Product ID and Tag ID are required", response: null });
    }
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) }
    });
    
    if (!product) {
      return res.status(404).json({ message: "Product not found", response: null });
    }
    
    // Check if tag exists
    const tag = await prisma.tag.findUnique({
      where: { id: Number(tagId) }
    });
    
    if (!tag) {
      return res.status(404).json({ message: "Tag not found", response: null });
    }
    
    // Check if tag is already assigned to product
    const existingProductTag = await prisma.productTag.findUnique({
      where: {
        productId_tagId: {
          productId: Number(productId),
          tagId: Number(tagId)
        }
      }
    });
    
    if (existingProductTag) {
      return res.status(400).json({ message: "Tag already assigned to this product", response: null });
    }
    
    // Assign tag to product
    const productTag = await prisma.productTag.create({
      data: {
        productId: Number(productId),
        tagId: Number(tagId)
      }
    });
    
    res.status(201).json({ message: "Tag assigned to product successfully", response: productTag });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};

export const removeTagFromProduct = async (req, res) => {
  try {
    const { productId, tagId } = req.params;
    
    // Validate inputs
    if (!productId || !tagId) {
      return res.status(400).json({ message: "Product ID and Tag ID are required", response: null });
    }
    
    // Check if tag is assigned to product
    const existingProductTag = await prisma.productTag.findUnique({
      where: {
        productId_tagId: {
          productId: Number(productId),
          tagId: Number(tagId)
        }
      }
    });
    
    if (!existingProductTag) {
      return res.status(404).json({ message: "Tag not assigned to this product", response: null });
    }
    
    // Remove tag from product
    await prisma.productTag.delete({
      where: {
        productId_tagId: {
          productId: Number(productId),
          tagId: Number(tagId)
        }
      }
    });
    
    res.json({ message: "Tag removed from product successfully", response: null });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};