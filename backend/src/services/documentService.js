// Regras de negócio relacionadas a documentos.

const { randomUUID } = require('node:crypto');
const documentRepository = require('../repositories/documentRepository');

class MissingFileError extends Error {
  constructor() {
    super('Arquivo obrigatório para upload.');
    this.code = 'MISSING_FILE';
  }
}

class DocumentNotFoundError extends Error {
  constructor() {
    super('Documento não encontrado.');
    this.code = 'DOCUMENT_NOT_FOUND';
  }
}

function createDocument({ file, owner }) {
  if (!file) {
    throw new MissingFileError();
  }

  const document = {
    id: `doc_${randomUUID()}`,
    originalName: file.originalname,
    storedName: file.filename,
    storagePath: file.path,
    size: file.size,
    mimeType: file.mimetype,
    uploadedAt: new Date().toISOString(),
    owner: owner || 'anonimo',
    status: 'active',
  };

  return documentRepository.save(document);
}

function listDocuments() {
  return documentRepository.findAll();
}

function getDocumentForDownload(id) {
  const document = documentRepository.findById(id);
  if (!document) {
    throw new DocumentNotFoundError();
  }
  return document;
}

module.exports = {
  createDocument,
  listDocuments,
  getDocumentForDownload,
  MissingFileError,
  DocumentNotFoundError,
};
