import prisma from "../utils/client.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    });
    res.json({ message: "success", response: categories });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category)
      return res.status(404).json({ message: "Category not found", response: null });

    res.json({ message: "success", response: category });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};

export const insertCategory = async (req, res) => {
  try {
    const name = req.body?.name?.trim();

    if (!name) return res.status(400).json({ message: "Name cannot be null", response: null });

    const category = await prisma.category.create({
      data: { name },
    });

    res.status(201).json({ message: "Category created successfully", response: category });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category)
      return res.status(404).json({ message: "Category not found", response: null });

    const name = req.body?.name?.trim() || category.name;

    const updated = await prisma.category.update({
      where: { id },
      data: { name },
    });

    res.status(200).json({ message: "Category updated successfully", response: updated });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category)
      return res.status(404).json({ message: "Category not found", response: null });

    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId: id }
    });

    if (productCount > 0) {
      return res.status(400).json({ 
        message: "Cannot delete category with associated products", 
        response: null 
      });
    }

    await prisma.category.delete({ where: { id } });

    res.status(200).json({ message: "Category deleted successfully", response: category });
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};