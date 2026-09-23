// Lista de documentos com opção de download para cada item.

import DownloadButton from './DownloadButton';

export default function DocumentList({ documents, isLoading, error, currentUser }) {
  if (isLoading) {
    return <p>Carregando documentos...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (documents.length === 0) {
    return <p>Nenhum documento enviado ainda.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Tamanho (bytes)</th>
          <th>Enviado em</th>
          <th>Dono</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((document) => (
          <tr key={document.id}>
            <td>{document.originalName}</td>
            <td>{document.size}</td>
            <td>{new Date(document.uploadedAt).toLocaleString('pt-BR')}</td>
            <td>{document.owner}</td>
            <td>
              <DownloadButton
                documentId={document.id}
                originalName={document.originalName}
                currentUser={currentUser}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
