// Componente de upload de documentos.

import { useState } from 'react';
import { uploadDocument } from '../services/documentApi';

export default function UploadComponent({ currentUser, onUploaded }) {
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setError('Selecione um arquivo para enviar.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const document = await uploadDocument({ file, owner: currentUser });
      setFile(null);
      event.target.reset();
      onUploaded?.(document);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Enviar documento</h2>
      <div>
        <label htmlFor="file">Arquivo</label>
        <input
          id="file"
          type="file"
          onChange={(event) => setFile(event.target.files[0])}
          aria-describedby={error ? 'upload-error' : undefined}
        />
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar'}
      </button>
      {error && (
        <p id="upload-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
