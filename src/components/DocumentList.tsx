import React, { useState, useEffect } from "react";
import "./DocumentList.css";

interface Document {
  id: number;
  filename: string;
  status: string;
  documentType: string | null;
  extractedText: string | null;
  createdAt: string;
  processedAt: string | null;
}

interface DocumentListProps {
  refreshTrigger?: number;
  onDocumentClick?: (document: Document) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  refreshTrigger,
  onDocumentClick,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );

  const API_BASE_URL = "http://localhost:8080/api";

  // Fetch documents from API
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/documents`);

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await response.json();
      setDocuments(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Refresh when refreshTrigger changes (e.g., after upload)
  useEffect(() => {
    if (refreshTrigger) {
      fetchDocuments();
    }
  }, [refreshTrigger]);

  // Auto-refresh every 5 seconds to update processing status
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDocuments();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Get status badge class
  const getStatusClass = (status: string): string => {
    switch (status) {
      case "COMPLETED":
        return "status-completed";
      case "PROCESSING":
        return "status-processing";
      case "FAILED":
        return "status-failed";
      case "PENDING":
      default:
        return "status-pending";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "COMPLETED":
        return "✓";
      case "PROCESSING":
        return "⏳";
      case "FAILED":
        return "✗";
      case "PENDING":
      default:
        return "⏱";
    }
  };

  // Handle row click
  const handleRowClick = (document: Document) => {
    setSelectedDocument(document);
    if (onDocumentClick) {
      onDocumentClick(document);
    }
  };

  // Close detail modal
  const closeDetail = () => {
    setSelectedDocument(null);
  };

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading && documents.length === 0) {
    return (
      <div className="document-list-container">
        <div className="loading">Loading documents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="document-list-container">
        <div className="error-message">
          {error}
          <button onClick={fetchDocuments} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="document-list-container">
      <div className="list-header">
        <h2>Documents ({documents.length})</h2>
        <button
          onClick={fetchDocuments}
          className="refresh-button"
          title="Refresh list"
        >
          🔄 Refresh
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="empty-state">
          <p>No documents yet. Upload your first document above!</p>
        </div>
      ) : (
        <div className="documents-table">
          <table>
            <thead>
              <tr>
                <th>Filename</th>
                <th>Type</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() => handleRowClick(doc)}
                  className="document-row"
                >
                  <td className="filename-cell">
                    <span className="file-icon">📄</span>
                    {doc.filename}
                  </td>
                  <td className="type-cell">{doc.documentType || "-"}</td>
                  <td className="status-cell">
                    <span
                      className={`status-badge ${getStatusClass(doc.status)}`}
                    >
                      <span className="status-icon">
                        {getStatusIcon(doc.status)}
                      </span>
                      {doc.status}
                    </span>
                  </td>
                  <td className="date-cell">{formatDate(doc.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDocument && (
        <div className="modal-overlay" onClick={closeDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Document Details</h3>
              <button onClick={closeDetail} className="close-button">
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Filename:</span>
                <span className="detail-value">
                  {selectedDocument.filename}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span
                  className={`status-badge ${getStatusClass(
                    selectedDocument.status
                  )}`}
                >
                  {getStatusIcon(selectedDocument.status)}{" "}
                  {selectedDocument.status}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Document Type:</span>
                <span className="detail-value">
                  {selectedDocument.documentType || "Not yet classified"}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Created:</span>
                <span className="detail-value">
                  {formatDate(selectedDocument.createdAt)}
                </span>
              </div>

              {selectedDocument.processedAt && (
                <div className="detail-row">
                  <span className="detail-label">Processed:</span>
                  <span className="detail-value">
                    {formatDate(selectedDocument.processedAt)}
                  </span>
                </div>
              )}

              {selectedDocument.extractedText && (
                <div className="detail-section">
                  <h4>Extracted Text:</h4>
                  <div className="extracted-text">
                    {selectedDocument.extractedText}
                  </div>
                </div>
              )}

              {selectedDocument.status === "PROCESSING" && (
                <div className="processing-notice">
                  <p>
                    ⏳ Document is being processed. Results will appear soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
