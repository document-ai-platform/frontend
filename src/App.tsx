import { useState } from "react";
import FileUpload from "./components/FileUpload";
import DocumentList from "./components/DocumentList";

function App() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  const handleUploadSuccess = (document: any) => {
    setDocuments([document, ...documents]);
    setError("");
  };

  const handleUploadError = (errorMsg: string) => {
    setError(errorMsg);
  };

  return (
    <div className="App">
      <h1>AI Document Platform</h1>

      {error && <div style={{ color: "red", padding: "10px" }}>{error}</div>}

      <FileUpload
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />

      {/* DocumentList tulee tähän myöhemmin */}

      <DocumentList />
    </div>
  );
}

export default App;
