// Rotas: definem os endpoints e delegam para os controllers.

const express = require('express');

const { upload } = require('../infra/upload');
const documentController = require('../controllers/documentController');

const router = express.Router();

router.post('/upload', upload.single('file'), documentController.upload);
router.get('/documents', documentController.list);
router.get('/documents/:id/download', documentController.download);

module.exports = router;
