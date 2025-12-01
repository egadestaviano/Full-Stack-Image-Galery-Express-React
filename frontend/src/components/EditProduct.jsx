import { useCallback, useEffect, useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Figure from "react-bootstrap/Figure";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { IoIosSave } from "react-icons/io";
import DragDropUpload from "./DragDropUpload.jsx";

const EditProduct = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        setCategories(response.data.response);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };

    fetchCategories();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "Product name is required";
    } else if (name.trim().length < 3) {
      newErrors.name = "Product name must be at least 3 characters";
    }
    
    // File is optional in edit, but if provided, validate it
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const maxSize = 2 * 1024 * 1024; // 2MB
      
      if (!validTypes.includes(file.type)) {
        newErrors.file = "Only JPG, JPEG, and PNG files are allowed";
      }
      
      if (file.size > maxSize) {
        newErrors.file = "File size must be less than 2MB";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getProductById = useCallback(async () => {
    try {
      const out = await axios.get(`/api/products/${id}`);
      setName(out.data.response.name);
      setDescription(out.data.response.description || "");
      setFile(out.data.response.image);
      setPreview(out.data.response.url);
      // Set category if it exists
      if (out.data.response.categoryId) {
        setSelectedCategory(out.data.response.categoryId.toString());
      }
    } catch (error) {
      const errMessage = error.response?.data?.message || "Failed to fetch product";
      toast.error(errMessage, {
        position: "top-center",
      });
    }
  }, [id]);

  useEffect(() => {
    getProductById();
  }, [getProductById]);

  const loadImage = (image) => {
    if (image) {
      setFile(image);
      setPreview(URL.createObjectURL(image));
      
      // Clear file error when a new file is selected
      if (errors.file) {
        setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors.file;
          return newErrors;
        });
      }
    }
  };

  const editProduct = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting", {
        position: "top-center",
      });
      return;
    }
    
    const data = new FormData();
    data.append("file", file);
    data.append("name", name);
    if (description) {
      data.append("description", description);
    }
    if (selectedCategory) {
      data.append("categoryId", selectedCategory);
    }
    
    try {
      const out = await axios.put(`/api/products/${id}`, data, {
        headers: {
          "Content-Type": "multipart/from-data",
        },
      });
      toast.info(out.data.message, {
        position: "top-center",
      });
      navigate("/");
    } catch (error) {
      const errMessage = error.response?.data?.message || "Failed to update product";
      toast.error(errMessage, {
        position: "top-center",
      });
    }
  };

  return (
    <>
      <div className="container mt-3">
        <Row>
          <Col>
            <h4>Edit Product</h4>
            <hr />
            <form onSubmit={editProduct}>
              <Form.Group as={Row} className="mb-3" controlId="frmProductName">
                <Form.Label column sm="2">
                  Product Name
                </Form.Label>
                <Col sm="10">
                  <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      // Clear name error when user types
                      if (errors.name) {
                        setErrors(prev => {
                          const newErrors = {...prev};
                          delete newErrors.name;
                          return newErrors;
                        });
                      }
                    }}
                    placeholder="Product Name"
                    isInvalid={!!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3" controlId="frmProductDescription">
                <Form.Label column sm="2">
                  Description
                </Form.Label>
                <Col sm="10">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Product Description (optional)"
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3" controlId="frmProductCategory">
                <Form.Label column sm="2">
                  Category
                </Form.Label>
                <Col sm="10">
                  <Form.Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Select a category (optional)</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3" controlId="frmProductImage">
                <Form.Label column sm="2">
                  Image (Optional)
                </Form.Label>
                <Col sm="10">
                  <DragDropUpload 
                    onFileSelect={loadImage}
                    preview={preview}
                    errors={errors}
                  />
                </Col>
              </Form.Group>

              <Row>
                <Col md={{ span: 10, offset: 2 }}>
                  <Button type="submit" variant="success">
                    <IoIosSave /> Update
                  </Button>
                </Col>
              </Row>
            </form>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default EditProduct;