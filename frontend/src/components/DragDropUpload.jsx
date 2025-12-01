import { useState, useRef } from "react";
import { Form, Figure } from "react-bootstrap";
import PropTypes from "prop-types";
import { compressImage, blobToFile } from "../utils/imageCompression.js";

const DragDropUpload = ({ onFileSelect, preview, errors }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    // Check if it's an image file
    if (!file.type.match('image.*')) {
      onFileSelect(file);
      return;
    }

    setIsCompressing(true);
    
    try {
      // Compress the image
      const compressedBlob = await compressImage(file, 0.7, 1920, 1080);
      
      // Convert blob back to file
      const compressedFile = blobToFile(
        compressedBlob, 
        file.name, 
        file.lastModified
      );
      
      onFileSelect(compressedFile);
    } catch (error) {
      console.warn("Failed to compress image, using original:", error);
      // If compression fails, use original file
      onFileSelect(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      <div 
        className={`border rounded p-4 text-center ${isDragging ? 'border-primary bg-light' : 'border-secondary'} ${errors?.file ? 'border-danger' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        style={{ cursor: 'pointer' }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="d-none"
        />
        
        {isCompressing ? (
          <div>
            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            <h5>Compressing image...</h5>
            <p className="text-muted">Please wait</p>
          </div>
        ) : isDragging ? (
          <div>
            <h5>Drop your image here</h5>
            <p className="text-muted">Release to upload</p>
          </div>
        ) : (
          <div>
            <h5>Drag & Drop your image here</h5>
            <p className="text-muted">or click to browse files</p>
            <p className="small text-muted mb-0">Supported formats: JPG, JPEG, PNG. Max size: 2MB</p>
          </div>
        )}
      </div>
      
      {errors?.file && (
        <div className="text-danger mt-2">
          {errors.file}
        </div>
      )}
      
      {preview && (
        <div className="mt-3">
          <h6>Preview:</h6>
          <Figure>
            <Figure.Image
              width={171}
              height={180}
              alt="preview image"
              src={preview}
            />
          </Figure>
        </div>
      )}
    </>
  );
};

DragDropUpload.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  preview: PropTypes.string,
  errors: PropTypes.object
};

export default DragDropUpload;