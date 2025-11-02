import React, {
  useState,
  useRef,
  type DragEvent,
  type ChangeEvent,
} from "react";
import "./FileUpload.css";

interface FileUploadProps {
  onUploadSuccess?: (document: any) => void;
  onUploadError?: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = "http://localhost:8080/api";

  // Supported file types
  const SUPPORTED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  const validateFile = (file: File): string | null => {
    if (!SUPPORTED_TYPES.includes(file.type)) {
      return "Unsupported file type. Please upload JPG, PNG, or PDF.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File is too large. Maximum size is 20MB.";
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      if (onUploadError) onUploadError(validationError);
      return;
    }

    setIsUploading(true);
    setUploadProgress(`Uploading ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setUploadProgress("Upload successful!");

      if (onUploadSuccess) {
        onUploadSuccess(data);
      }

      // Reset after 2 seconds
      setTimeout(() => {
        setUploadProgress("");
        setIsUploading(false);
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setUploadProgress("");
      setIsUploading(false);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  // File input handler
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-area ${isDragging ? "dragging" : ""} ${
          isUploading ? "uploading" : ""
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        {isUploading ? (
          <div className="upload-status">
            <div className="spinner"></div>
            <p>{uploadProgress}</p>
          </div>
        ) : (
          <>
            <div className="upload-icon">📁</div>
            <p className="upload-text-primary">
              {isDragging ? "Drop file here" : "Drag & drop a file here"}
            </p>
            <p className="upload-text-secondary">or click to browse</p>
            <p className="upload-formats">
              Supported: JPG, PNG, PDF (max 20MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
