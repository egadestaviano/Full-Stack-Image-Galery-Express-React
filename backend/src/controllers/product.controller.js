import prisma from "../utils/client.js";
import path from "path";
import "dotenv/config";
import fs from "fs";

const MAX_FILE_SIZE = Number(process.env.FILE_MAX_SIZE) || 2 * 1024 * 1024; // default 2MB
const ALLOWED_EXT = (process.env.FILE_EXTENSION || ".png,.jpg,.jpeg").split(",");
const MSG_FILE_SIZE = process.env.FILE_MAX_MESSAGE || "File size too large";

export const getProducts = async (req, res) => {
  try {
    // Get query parameters for search, pagination, and sorting
    const { search, page = 1, limit = 9, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    
    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // Create where condition for search
    const where = search 
      ? { 
          OR: [
            { name: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {};
    
    // Create orderBy object for sorting
    const orderBy = {};
    orderBy[sortBy] = sortOrder;
    
    // Calculate skip for pagination
    const skip = (pageNum - 1) * limitNum;
    
    // Fetch products with search, pagination, and sorting
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limitNum,
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    // Get total count for pagination
    const total = await prisma.product.count({ where });
    
    res.json({
      message: "success",
      response: products,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};

export const getProductById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product)
      return res.status(404).json({ message: "Product not found", response: null });

    res.json({ message: "success", response: product });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};

export const insertProduct = async (req, res) => {
  try {
    const name = req.body?.name?.trim();
    const description = req.body?.description?.trim() || null;
    const categoryId = req.body?.categoryId ? parseInt(req.body.categoryId) : null;
    const tagIds = req.body?.tagIds ? JSON.parse(req.body.tagIds) : [];
    const file = req.files?.file;

    if (!name) return res.status(400).json({ message: "Name cannot be null", response: null });
    if (!file) return res.status(400).json({ message: "No file uploaded", response: null });

    const ext = path.extname(file.name).toLowerCase();
    const fileSize = file.data.length;
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

    if (!ALLOWED_EXT.includes(ext))
      return res.status(422).json({ message: "Invalid image type", response: null });

    if (fileSize > MAX_FILE_SIZE)
      return res.status(422).json({ message: MSG_FILE_SIZE, response: null });

    const uploadPath = `./public/images/${fileName}`;
    await new Promise((resolve, reject) => {
      file.mv(uploadPath, (err) => (err ? reject(err) : resolve()));
    });

    // Validate tag IDs
    if (tagIds.length > 0) {
      const validTags = await prisma.tag.findMany({
        where: {
          id: {
            in: tagIds.map(id => parseInt(id))
          }
        }
      });
      
      if (validTags.length !== tagIds.length) {
        return res.status(400).json({ message: "One or more tags not found", response: null });
      }
    }

    const productData = {
      name,
      description,
      image: fileName,
      url,
      categoryId
    };

    // Add tags if provided
    if (tagIds.length > 0) {
      productData.tags = {
        create: tagIds.map(tagId => ({
          tag: {
            connect: { id: parseInt(tagId) }
          }
        }))
      };
    }

    const product = await prisma.product.create({
      data: productData,
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    res.status(201).json({ message: "Inserted successfully", response: product });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product)
      return res.status(404).json({ message: "Product not found", response: null });

    let { name, description } = req.body;
    name = name?.trim() || product.name;
    description = description?.trim() || product.description || null;

    let fileName = product.image;
    let url = product.url;

    if (req.files?.file) {
      const file = req.files.file;
      const ext = path.extname(file.name).toLowerCase();
      const fileSize = file.data.length;
      const newFileName = file.md5 + ext;
      const newUrl = `${req.protocol}://${req.get("host")}/images/${newFileName}`;

      if (!ALLOWED_EXT.includes(ext))
        return res.status(422).json({ message: "Invalid image type", response: null });

      if (fileSize > MAX_FILE_SIZE)
        return res.status(422).json({ message: MSG_FILE_SIZE, response: null });

      const newPath = `./public/images/${newFileName}`;
      await new Promise((resolve, reject) => {
        file.mv(newPath, (err) => (err ? reject(err) : resolve()));
      });

      // hapus file lama jika ada
      const oldPath = `./public/images/${product.image}`;
      try {
        await fs.promises.unlink(oldPath);
      } catch (err) {
        console.warn("Old file not found, skipping delete:", err.message);
      }

      fileName = newFileName;
      url = newUrl;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { name, description, image: fileName, url },
    });

    res.status(200).json({ message: "Updated successfully", response: updated });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product)
      return res.status(404).json({ message: "Product not found", response: null });

    await prisma.product.delete({ where: { id } });

    const filePath = `./public/images/${product.image}`;
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      console.warn("File already deleted or missing:", err.message);
    }

    res.status(200).json({ message: "Deleted successfully", response: product });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};

// New bulk delete function
export const bulkDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No product IDs provided", response: null });
    }
    
    // Validate all IDs are numbers
    const validIds = ids.filter(id => !isNaN(Number(id))).map(id => Number(id));
    
    if (validIds.length === 0) {
      return res.status(400).json({ message: "No valid product IDs provided", response: null });
    }
    
    // Get products to delete (to get image filenames)
    const products = await prisma.product.findMany({
      where: { id: { in: validIds } }
    });
    
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found with provided IDs", response: null });
    }
    
    // Delete products from database
    await prisma.product.deleteMany({
      where: { id: { in: products.map(p => p.id) } }
    });
    
    // Delete associated files
    for (const product of products) {
      const filePath = `./public/images/${product.image}`;
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.warn("File already deleted or missing:", err.message);
      }
    }
    
    res.status(200).json({ 
      message: `Successfully deleted ${products.length} product(s)`, 
      response: products 
    });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};
