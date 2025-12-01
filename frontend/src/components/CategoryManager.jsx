import { useState, useEffect } from "react";
import { Button, Col, Row, Form, Table, Modal } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { IoMdAdd, IoMdCreate, IoMdTrash } from "react-icons/io";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  const getCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/categories");
      setCategories(response.data.response);
    } catch (error) {
      const errMessage = error.response?.data?.message || "Failed to fetch categories";
      toast.error(errMessage, {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      toast.error("Category name is required", {
        position: "top-center",
      });
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        await axios.put(`/api/categories/${editingCategory.id}`, { name: categoryName });
        toast.success("Category updated successfully", {
          position: "top-center",
        });
      } else {
        // Create new category
        await axios.post("/api/categories", { name: categoryName });
        toast.success("Category created successfully", {
          position: "top-center",
        });
      }
      
      // Reset form and refresh categories
      setCategoryName("");
      setEditingCategory(null);
      setShowModal(false);
      getCategories();
    } catch (error) {
      const errMessage = error.response?.data?.message || "Failed to save category";
      toast.error(errMessage, {
        position: "top-center",
      });
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await axios.delete(`/api/categories/${id}`);
      toast.success("Category deleted successfully", {
        position: "top-center",
      });
      getCategories();
    } catch (error) {
      const errMessage = error.response?.data?.message || "Failed to delete category";
      toast.error(errMessage, {
        position: "top-center",
      });
    }
  };

  const handleShowModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setCategoryName("");
  };

  return (
    <>
      <div className="container mt-3">
        <Row>
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h4>Manage Categories</h4>
              <Button variant="success" onClick={handleShowModal}>
                <IoMdAdd /> Add Category
              </Button>
            </div>
            <hr />

            {loading ? (
              <div className="text-center my-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (
                    <tr key={category.id}>
                      <td>{index + 1}</td>
                      <td>{category.name}</td>
                      <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(category)}
                        >
                          <IoMdCreate /> Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                        >
                          <IoMdTrash /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No categories found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Col>
        </Row>
      </div>

      {/* Category Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategory ? "Edit Category" : "Add New Category"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingCategory ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default CategoryManager;