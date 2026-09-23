// Middleware central de tratamento de erros da API.

const multer = require('multer');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ code: 'FILE_TOO_LARGE', message: 'Arquivo excede o tamanho máximo permitido.' });
    }
    return res.status(400).json({ code: 'UPLOAD_ERROR', message: err.message });
  }

  if (err.code === 'UNSUPPORTED_FILE_TYPE') {
    return res.status(400).json({ code: err.code, message: err.message });
  }

  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    code: err.code || 'INTERNAL_ERROR',
    message: statusCode >= 500 ? 'Erro inesperado no servidor.' : err.message,
  });
}

module.exports = errorHandler;
