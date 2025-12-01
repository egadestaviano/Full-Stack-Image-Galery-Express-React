import { Col, Row, Form, InputGroup, Button } from "react-bootstrap";
import CardComponent from "./CardComponent.jsx";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { IoMdAdd } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import ExportButton from "./ExportButton.jsx";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 9
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Fetch categories
  const getCategories = useCallback(async () => {
    try {
      const response = await axios.get("/api/categories");
      setCategories(response.data.response);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  }, []);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const getProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.itemsPerPage,
        search: searchTerm,
        sortBy,
        sortOrder,
        category: selectedCategory
      };
      
      const out = await axios.get("/api/products", { params });
      setProducts(out.data.response);
      setPagination(out.data.pagination);
    } catch (error) {
      const errMessage = error.response?.data?.message || "Failed to fetch products";
      toast.error(errMessage, {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, sortOrder, pagination.itemsPerPage, selectedCategory]);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    getProducts(1); // Reset to first page when searching
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      getProducts(newPage);
    }
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
    } else {
      // Change sort field
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Handle product selection for bulk operations
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Handle select all products on current page
  const handleSelectAll = () => {
    const currentPageProductIds = products.map(product => product.id);
    const allSelected = currentPageProductIds.every(id => selectedProducts.includes(id));
    
    if (allSelected) {
      // Deselect all
      setSelectedProducts(prev => prev.filter(id => !currentPageProductIds.includes(id)));
    } else {
      // Select all
      setSelectedProducts(prev => {
        const newSelection = [...prev];
        currentPageProductIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  // Bulk delete function
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.error("No products selected for deletion", {
        position: "top-center",
      });
      return;
    }

    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="bg-body-tertiary p-5 rounded shadow">
            <h1>Confirm Bulk Delete</h1>
            <p>Are you sure you want to delete {selectedProducts.length} product(s)? This action cannot be undone.</p>
            <div className="text-center">
              <button className="btn btn-secondary me-2" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={async () => {
                  try {
                    await axios.post("/api/products/bulk-delete", { ids: selectedProducts });
                    toast.success(`Successfully deleted ${selectedProducts.length} product(s)`, {
                      position: "top-center",
                    });
                    setSelectedProducts([]);
                    getProducts();
                  } catch (error) {
                    const errMessage = error.response?.data?.message || "Failed to delete products";
                    toast.error(errMessage, {
                      position: "top-center",
                    });
                  }
                  onClose();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        );
      },
    });
  };

  return (
    <>
      <div className="container mt-3">
        <Row>
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h4>Image Gallery</h4>
              {pagination.totalItems > 0 && (
                <span className="text-muted">
                  {pagination.totalItems} product{pagination.totalItems !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <hr />
            
            {/* Search and Sort Controls */}
            <Form onSubmit={handleSearch} className="mb-3">
              <Row className="align-items-center">
                <Col xxl={4} xl={4} lg={4} md={6} sm={12} className="mb-2">
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                  </InputGroup>
                </Col>
                <Col xxl={2} xl={2} lg={2} md={3} sm={6} className="mb-2">
                  <Form.Select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xxl={2} xl={2} lg={2} md={3} sm={6} className="mb-2">
                  <Form.Select 
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split("-");
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                  >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                  </Form.Select>
                </Col>
                <Col xxl={2} xl={2} lg={2} md={3} sm={6} className="mb-2">
                  <button type="submit" className="btn btn-primary w-100">
                    Search
                  </button>
                </Col>
              </Row>
            </Form>
            
            <div className="d-flex justify-content-between mb-3">
              <div>
                <Link className="btn btn-success" to="/add">
                  <IoMdAdd /> Add New
                </Link>
                <ExportButton />
              </div>
              
              {selectedProducts.length > 0 && (
                <Button variant="danger" onClick={handleBulkDelete}>
                  Delete Selected ({selectedProducts.length})
                </Button>
              )}
            </div>
            
            {/* Loading indicator */}
            {loading && (
              <div className="text-center my-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
            
            {/* Products grid */}
            {!loading && (
              <>
                {products && products.length > 0 && (
                  <div className="mb-2">
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      {products.every(p => selectedProducts.includes(p.id)) 
                        ? "Deselect All" 
                        : "Select All"}
                    </Button>
                  </div>
                )}
                
                <Row>
                  {products && products.length > 0 ? (
                    products.map((product) => (
                      <CardComponent
                        key={product.id}
                        product={product}
                        getProducts={() => getProducts(pagination.currentPage)}
                        isSelected={selectedProducts.includes(product.id)}
                        onSelect={handleSelectProduct}
                      />
                    ))
                  ) : (
                    <Col>
                      <div className="text-center py-5">
                        <h5>No products found</h5>
                        <p>Try adjusting your search criteria</p>
                      </div>
                    </Col>
                  )}
                </Row>
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <nav>
                      <ul className="pagination">
                        <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                          >
                            Previous
                          </button>
                        </li>
                        
                        {[...Array(pagination.totalPages)].map((_, i) => {
                          const pageNum = i + 1;
                          return (
                            <li 
                              key={pageNum} 
                              className={`page-item ${pagination.currentPage === pageNum ? 'active' : ''}`}
                            >
                              <button 
                                className="page-link" 
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </li>
                          );
                        })}
                        
                        <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </div>
    </>
  );
};

export default ProductList;