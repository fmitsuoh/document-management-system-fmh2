// Controllers: tratam entrada/saída HTTP e delegam para os services.

const asyncHandler = require('../utils/asyncHandler');
const documentService = require('../services/documentService');

// Converte o arquivo do multer (req.file) em um DTO simples, sem acoplar o service à lib.
function toFileInfo(file) {
  return {
    originalName: file.originalname,
    storedName: file.filename,
    storagePath: file.path,
    size: file.size,
    mimeType: file.mimetype,
  };
}

const upload = asyncHandler((req, res) => {
  const document = documentService.createDocument({
    file: req.file ? toFileInfo(req.file) : null,
    owner: req.body.owner,
  });
  res.status(201).json(documentService.toPublicDocument(document));
});

const list = asyncHandler((req, res) => {
  const documents = documentService
    .listDocuments(req.get('X-User-Id'))
    .map(documentService.toPublicDocument);
  res.status(200).json(documents);
});

const download = asyncHandler((req, res) => {
  const document = documentService.getDocumentForDownload(req.params.id, req.get('X-User-Id'));
  res.download(document.storagePath, document.originalName);
});

module.exports = { upload, list, download };
