import React, { useState, useRef } from 'react';
import { FaPaperclip, FaFile, FaImage, FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaTimes } from 'react-icons/fa';

const FileAttachment = ({ onFileSelected, onClearFile }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      onFileSelected(file);
    }
  };
  
  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClearFile();
  };
  
  const getFileIcon = (file) => {
    if (!file) return <FaFile />;
    
    const fileType = file.type;
    
    if (fileType.startsWith('image/')) {
      return <FaImage />;
    } else if (fileType === 'application/pdf') {
      return <FaFilePdf />;
    } else if (fileType.includes('word')) {
      return <FaFileWord />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FaFileExcel />;
    } else if (fileType.startsWith('text/')) {
      return <FaFileAlt />;
    }
    
    return <FaFile />;
  };
  
  return (
    <div className="file-attachment">
      {!selectedFile ? (
        <>
          <label htmlFor="file-upload" className="attachment-button">
            <FaPaperclip /> Attach File
          </label>
          <input
            id="file-upload"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept="image/jpeg,image/png,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          />
        </>
      ) : (
        <div className="selected-file">
          <div className="file-preview">
            {getFileIcon(selectedFile)}
            <span className="file-name">{selectedFile.name}</span>
          </div>
          <button
            type="button"
            className="clear-file"
            onClick={handleClearFile}
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileAttachment;
