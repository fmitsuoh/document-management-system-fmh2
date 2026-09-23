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

async function request(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }
  return response;
}

export async function uploadDocument({ file, owner }) {
  const formData = new FormData();
  formData.append('file', file);
  if (owner) {
    formData.append('owner', owner);
  }

  const response = await request(`${API_BASE_URL}/upload`, { method: 'POST', body: formData });
  return response.json();
}

export async function listDocuments(currentUser) {
  const response = await request(`${API_BASE_URL}/documents`, {
    headers: { 'X-User-Id': currentUser },
  });
  return response.json();
}

// Usa fetch (em vez de <a href>) para poder enviar o header de identificação do usuário.
export async function downloadDocument(id, currentUser) {
  const response = await request(`${API_BASE_URL}/documents/${encodeURIComponent(id)}/download`, {
    headers: { 'X-User-Id': currentUser },
  });
  return response.blob();
}

