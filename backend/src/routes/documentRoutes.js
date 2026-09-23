// Rotas: definem os endpoints e delegam para os controllers.

const path = require('node:path');
const { randomUUID } = require('node:crypto');
const express = require('express');
const multer = require('multer');

const documentController = require('../controllers/documentController');

const STORAGE_DIR = path.join(__dirname, '..', '..', 'storage');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, STORAGE_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${randomUUID()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

const router = express.Router();

router.post('/upload', upload.single('file'), documentController.upload);
router.get('/documents', documentController.list);
router.get('/documents/:id/download', documentController.download);

module.exports = router;
