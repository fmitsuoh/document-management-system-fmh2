// Regras de negócio relacionadas a documentos.

const { randomUUID } = require('node:crypto');
const documentRepository = require('../repositories/documentRepository');
const {
  MissingFileError,
  DocumentNotFoundError,
  OwnerRequiredError,
} = require('./documentErrors');

function requireOwner(owner) {
  if (!owner) {
    throw new OwnerRequiredError();
  }
}

// file é um DTO simples ({ originalName, storedName, storagePath, size, mimeType }),
// desacoplado do formato interno do multer.
function buildDocument(file, owner) {
  return {
    id: `doc_${randomUUID()}`,
    originalName: file.originalName,
    storedName: file.storedName,
    storagePath: file.storagePath,
    size: file.size,
    mimeType: file.mimeType,
    uploadedAt: new Date().toISOString(),
    owner: owner || 'anonimo',
    status: 'active',
  };
}

function createDocument({ file, owner }) {
  if (!file) {
    throw new MissingFileError();
  }

  return documentRepository.save(buildDocument(file, owner));
}

function listDocuments(owner) {
  requireOwner(owner);
  return documentRepository.findAll().filter((document) => document.owner === owner);
}

function getDocumentForDownload(id, owner) {
  requireOwner(owner);
  const document = documentRepository.findById(id);
  // Não revela se o documento existe quando pertence a outro dono.
  if (!document || document.owner !== owner) {
    throw new DocumentNotFoundError();
  }
  return document;
}

function toPublicDocument(document) {
  return {
    id: document.id,
    originalName: document.originalName,
    size: document.size,
    uploadedAt: document.uploadedAt,
    owner: document.owner,
  };
}

module.exports = {
  createDocument,
  listDocuments,
  getDocumentForDownload,
  toPublicDocument,
  MissingFileError,
  DocumentNotFoundError,
  OwnerRequiredError,
};
