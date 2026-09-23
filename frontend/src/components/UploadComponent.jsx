// Componente de upload de documentos.

import { useState } from 'react';
import { uploadDocument } from '../services/documentApi';

export default function UploadComponent({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [owner, setOwner] = useState('');
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
      const document = await uploadDocument({ file, owner });
      setFile(null);
      setOwner('');
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
        />
      </div>
      <div>
        <label htmlFor="owner">Dono</label>
        <input
          id="owner"
          type="text"
          value={owner}
          placeholder="Identificador do usuário"
          onChange={(event) => setOwner(event.target.value)}
        />
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar'}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
