// Botão de download de um documento pelo identificador.

import { useState } from 'react';
import { downloadDocument } from '../services/documentApi';

export default function DownloadButton({ documentId, originalName, currentUser }) {
  const [error, setError] = useState(null);

  async function handleDownload() {
    setError(null);
    try {
      const blob = await downloadDocument(documentId, currentUser);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError.message);
    }
  }

  return (
    <>
      <button type="button" onClick={handleDownload}>
        Baixar
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}

