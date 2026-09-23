// Botão de download de um documento pelo identificador.

import { getDownloadUrl } from '../services/documentApi';

export default function DownloadButton({ documentId }) {
  return (
    <a href={getDownloadUrl(documentId)} download>
      Baixar
    </a>
  );
}
