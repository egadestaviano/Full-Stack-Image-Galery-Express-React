import prisma from "../utils/client.js";

export const exportProductsToCSV = async (req, res) => {
  try {
    // Get all products with their categories
    const products = await prisma.product.findMany({
      include: {
        category: true
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    // Create CSV headers
    const headers = [
      "ID",
      "Name",
      "Description",
      "Category",
      "Image URL",
      "Created At",
      "Updated At"
    ];

    // Create CSV rows
    const rows = products.map(product => [
      product.id,
      `"${product.name.replace(/"/g, '""')}"`,
      product.description ? `"${product.description.replace(/"/g, '""')}"` : "",
      product.category ? `"${product.category.name.replace(/"/g, '""')}"` : "",
      `"${product.url}"`,
      product.createdAt.toISOString(),
      product.updatedAt.toISOString()
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Set headers for CSV download
    res.header("Content-Type", "text/csv");
    res.header("Content-Disposition", "attachment; filename=\"products.csv\"");
    
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message, response: null });
  }
};