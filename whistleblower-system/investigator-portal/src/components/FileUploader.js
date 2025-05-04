import React, { useState, useRef } from 'react';
import { FaFileUpload, FaFile, FaTrash } from 'react-icons/fa';

const FileUploader = ({ onFilesSelected, maxFiles = 5 }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length > 0) {
      // Check if adding these files would exceed the max
      if (selectedFiles.length + files.length > maxFiles) {
        alert(`You can only upload a maximum of ${maxFiles} files.`);
        return;
      }
      
      const newFiles = [...selectedFiles, ...files];
      setSelectedFiles(newFiles);
      onFilesSelected(newFiles);
    }
    
    // Reset input to allow selecting the same files again
    event.target.value = null;
  };
  
  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      default:
        return '📁';
    }
  };
  
  return (
    <div className="file-uploader">
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      
      <button
        type="button"
        className="file-upload-button"
        onClick={triggerFileInput}
        disabled={selectedFiles.length >= maxFiles}
      >
        <FaFileUpload /> Attach Files ({selectedFiles.length}/{maxFiles})
      </button>
      
      {selectedFiles.length > 0 && (
        <div className="selected-files">
          {selectedFiles.map((file, index) => (
            <div key={index} className="file-item">
              <span className="file-icon">{getFileIcon(file.name)}</span>
              <span className="file-name">{file.name}</span>
              <button 
                type="button" 
                className="remove-file" 
                onClick={() => removeFile(index)}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
