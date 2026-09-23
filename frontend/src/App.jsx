// Componente raiz do Document Management System.

import { useCallback, useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import { listDocuments } from './services/documentApi';

const CURRENT_USER_STORAGE_KEY = 'dms:currentUser';

export default function App() {
  const [currentUser, setCurrentUser] = useState(
    () => localStorage.getItem(CURRENT_USER_STORAGE_KEY) || 'user-001'
  );
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listDocuments(currentUser);
      setDocuments(data);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, currentUser);
    loadDocuments();
  }, [currentUser, loadDocuments]);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>
      <div>
        <label htmlFor="current-user">Usuário atual</label>
        <input
          id="current-user"
          type="text"
          value={currentUser}
          onChange={(event) => setCurrentUser(event.target.value)}
        />
      </div>
      <UploadComponent currentUser={currentUser} onUploaded={loadDocuments} />
      <h2>Documentos</h2>
      <DocumentList
        documents={documents}
        isLoading={isLoading}
        error={error}
        currentUser={currentUser}
      />
    </main>
  );
}
