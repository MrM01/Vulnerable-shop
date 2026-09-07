const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// [VULN-5] Tampering — subida de archivos insegura
// No se valida extensión, tipo MIME real, ni tamaño máximo
// (viola ASVS V12.1 / V12.4). Además se conserva el nombre original
// del archivo tal cual lo envía el cliente, lo que abre la puerta a
// path traversal (ej. "../../public/shell.html").
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, file.originalname), // sin sanitizar
});
const upload = multer({ storage }); // sin fileFilter ni límites de tamaño

router.post('/feedback', upload.single('attachment'), (req, res) => {
  res.json({ ok: true, filename: req.file ? req.file.originalname : null });
});

module.exports = router;
