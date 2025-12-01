import axios from "axios";
import { Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { MdEdit } from "react-icons/md";
import { IoMdTrash } from "react-icons/io";
import { confirmAlert } from "react-confirm-alert";
import { MdCancel } from "react-icons/md";
import { FaRegCheckCircle } from "react-icons/fa";
import { useState } from "react";
import ImageModal from "./ImageModal.jsx";
import FavoriteToggle from "./FavoriteToggle.jsx";

const CardComponent = ({ product, getProducts, isSelected, onSelect }) => {
  const [showModal, setShowModal] = useState(false);

  const deleteProduct = async (id) => {
    try {
      const out = await axios.delete(`/api/products/${id}`);
      getProducts();
      toast.info(out.data.message, {
        position: "top-center",
      });
    } catch (error) {
      const errMessage = error.response?.data?.message || "Failed to delete product";
      toast.error(errMessage, {
        position: "top-center",
      });
    }
  };

  const confirmDel = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="bg-body-tertiary p-5 rounded shadow">
            <h1>Are you sure?</h1>
            <p>You want to delete this file?</p>
            <div className="text-center">
              <button className="btn btn-danger me-2" onClick={onClose}>
                <MdCancel /> No
              </button>
              <button
                className="btn btn-success"
                onClick={() => {
                  deleteProduct(id), onClose();
                }}
              >
                <FaRegCheckCircle /> Yes
              </button>
            </div>
          </div>
        );
      },
    });
  };

  return (
    <>
      <Col xxl={3} xl={3} lg={4} md={6} sm={6} xs={12} className="mb-4">
        <Card className={`shadow h-100 ${isSelected ? 'border-primary border-2' : ''}`}>
          <div 
            onClick={() => setShowModal(true)}
            style={{ cursor: "pointer", position: "relative" }}
          >
            {onSelect && (
              <div 
                className="position-absolute top-0 start-0 m-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(product.id);
                }}
              >
                <div 
                  className={`rounded-circle border d-flex align-items-center justify-content-center ${isSelected ? 'bg-primary border-primary' : 'bg-white border-secondary'}`}
                  style={{ width: '24px', height: '24px' }}
                >
                  {isSelected && (
                    <span className="text-white" style={{ fontSize: '14px' }}>✓</span>
                  )}
                </div>
              </div>
            )}
            <Card.Img width={"100%"} height={250} variant="top" src={product.url} />
          </div>
          <Card.Body className="d-flex flex-column">
            <div className="d-flex justify-content-between align-items-start">
              <Card.Title>{product.name}</Card.Title>
              <FavoriteToggle productId={product.id} size="sm" />
            </div>
            {product.category && (
              <div className="mb-2">
                <span className="badge bg-secondary">{product.category.name}</span>
              </div>
            )}
            <div className="mt-auto text-end">
              <Link to={`/edit/${product.id}`} className="btn btn-success me-2">
                <MdEdit /> Edit
              </Link>
              <Button onClick={() => confirmDel(product.id)} variant="danger">
                <IoMdTrash /> Delete
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <ImageModal 
        show={showModal} 
        handleClose={() => setShowModal(false)} 
        product={product} 
      />
    </>
  );
};

CardComponent.propTypes = {
  product: PropTypes.object,
  getProducts: PropTypes.func,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
};

export default CardComponent;