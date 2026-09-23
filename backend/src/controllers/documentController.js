// Controllers: tratam entrada/saída HTTP e delegam para os services.

const documentService = require('../services/documentService');

function upload(req, res) {
  try {
    const document = documentService.createDocument({
      file: req.file,
      owner: req.body.owner,
    });
    res.status(201).json(document);
  } catch (error) {
    if (error instanceof documentService.MissingFileError) {
      return res.status(400).json({ code: error.code, message: error.message });
    }
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Erro inesperado ao enviar documento.' });
  }
}

function list(req, res) {
  try {
    const documents = documentService.listDocuments().map((document) => ({
      id: document.id,
      originalName: document.originalName,
      size: document.size,
      uploadedAt: document.uploadedAt,
      owner: document.owner,
    }));
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Erro inesperado ao listar documentos.' });
  }
}

function download(req, res) {
  try {
    const document = documentService.getDocumentForDownload(req.params.id);
    res.download(document.storagePath, document.originalName);
  } catch (error) {
    if (error instanceof documentService.DocumentNotFoundError) {
      return res.status(404).json({ code: error.code, message: error.message });
    }
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Erro inesperado ao baixar documento.' });
  }
}

module.exports = { upload, list, download };
