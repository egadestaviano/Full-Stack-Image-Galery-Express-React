/**
 * Compress an image file using canvas
 * @param {File} file - The image file to compress
 * @param {number} quality - Compression quality (0-1)
 * @param {number} maxWidth - Maximum width for the compressed image
 * @param {number} maxHeight - Maximum height for the compressed image
 * @returns {Promise<Blob>} - Compressed image as a Blob
 */
export const compressImage = (file, quality = 0.7, maxWidth = 1920, maxHeight = 1080) => {
  return new Promise((resolve, reject) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Convert a Blob to a File object
 * @param {Blob} blob - The blob to convert
 * @param {string} filename - The filename for the new file
 * @param {number} lastModified - Last modified timestamp
 * @returns {File} - The File object
 */
export const blobToFile = (blob, filename, lastModified = Date.now()) => {
  return new File([blob], filename, {
    type: blob.type,
    lastModified: lastModified,
  });
};