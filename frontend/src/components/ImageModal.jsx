import { Modal, Button } from "react-bootstrap";
import { IoMdClose, IoMdDownload, IoMdZoomIn, IoMdZoomOut } from "react-icons/io";
import PropTypes from "prop-types";
import { useState } from "react";

const ImageModal = ({ show, handleClose, product }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  
  if (!product) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = product.url;
    link.download = product.image;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header>
        <Modal.Title>{product.name}</Modal.Title>
        <Button variant="link" onClick={handleClose}>
          <IoMdClose size={24} />
        </Button>
      </Modal.Header>
      <Modal.Body className="text-center">
        <div className="d-flex justify-content-center mb-2">
          <Button variant="outline-primary" size="sm" onClick={handleZoomOut} className="me-2">
            <IoMdZoomOut /> Zoom Out
          </Button>
          <Button variant="outline-primary" size="sm" onClick={resetZoom} className="me-2">
            Reset ({Math.round(zoomLevel * 100)}%)
          </Button>
          <Button variant="outline-primary" size="sm" onClick={handleZoomIn}>
            <IoMdZoomIn /> Zoom In
          </Button>
        </div>
        <div 
          className="d-flex justify-content-center align-items-center"
          style={{ 
            minHeight: "70vh",
            overflow: "auto"
          }}
        >
          <img 
            src={product.url} 
            alt={product.name} 
            className="rounded"
            style={{ 
              transform: `scale(${zoomLevel})`,
              transition: "transform 0.2s ease",
              maxWidth: "100%",
              maxHeight: "70vh"
            }}
          />
        </div>
        {product.description && (
          <div className="mt-3 text-start">
            <h6>Description:</h6>
            <p>{product.description}</p>
          </div>
        )}
        {product.category && (
          <div className="mt-2 text-start">
            <span className="badge bg-secondary">{product.category.name}</span>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleDownload}>
          <IoMdDownload /> Download
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ImageModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  product: PropTypes.object
};

export default ImageModal;