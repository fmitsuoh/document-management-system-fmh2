// Infraestrutura de upload: multer + diskStorage gravando em backend/storage.

const path = require('node:path');
const { randomUUID } = require('node:crypto');
const multer = require('multer');

const STORAGE_DIR = path.join(__dirname, '..', '..', 'storage');
const MAX_FILE_SIZE_BYTES = Number(process.env.MAX_FILE_SIZE_BYTES) || 20 * 1024 * 1024;
const ALLOWED_MIME_TYPES = process.env.ALLOWED_MIME_TYPES
  ? process.env.ALLOWED_MIME_TYPES.split(',').map((type) => type.trim())
  : null;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, STORAGE_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${randomUUID()}${path.extname(file.originalname)}`);
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME_TYPES && !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const error = new Error('Tipo de arquivo não permitido.');
    error.code = 'UNSUPPORTED_FILE_TYPE';
    cb(error);
    return;
  }
  cb(null, true);
}

const upload = multer({ storage, limits: { fileSize: MAX_FILE_SIZE_BYTES }, fileFilter });

module.exports = { upload, STORAGE_DIR };
