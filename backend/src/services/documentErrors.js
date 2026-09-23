// Erros de domínio da camada de serviço, com status HTTP associado.

class AppError extends Error {
  constructor(message, code, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

class MissingFileError extends AppError {
  constructor() {
    super('Arquivo obrigatório para upload.', 'MISSING_FILE', 400);
  }
}

class DocumentNotFoundError extends AppError {
  constructor() {
    super('Documento não encontrado.', 'DOCUMENT_NOT_FOUND', 404);
  }
}

class OwnerRequiredError extends AppError {
  constructor() {
    super('Cabeçalho X-User-Id é obrigatório.', 'OWNER_REQUIRED', 400);
  }
}

module.exports = { AppError, MissingFileError, DocumentNotFoundError, OwnerRequiredError };
