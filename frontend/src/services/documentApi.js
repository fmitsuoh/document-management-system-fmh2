// Cliente de API: centraliza as chamadas fetch ao backend via prefixo /api.

const API_BASE_URL = '/api';

async function parseErrorResponse(response) {
  try {
    const data = await response.json();
    return data.message || 'Erro inesperado na comunicação com o servidor.';
  } catch {
    return 'Erro inesperado na comunicação com o servidor.';
  }
}

export async function uploadDocument({ file, owner }) {
  const formData = new FormData();
  formData.append('file', file);
  if (owner) {
    formData.append('owner', owner);
  }

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  return response.json();
}

export async function listDocuments() {
  const response = await fetch(`${API_BASE_URL}/documents`);

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  return response.json();
}

export function getDownloadUrl(id) {
  return `${API_BASE_URL}/documents/${id}/download`;
}
