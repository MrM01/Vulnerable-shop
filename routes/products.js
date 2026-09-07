const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM products').all());
});

router.get('/:id/reviews', (req, res) => {
  res.json(db.prepare('SELECT * FROM reviews WHERE product_id = ?').all(req.params.id));
});

// [VULN-3] Tampering — XSS almacenado
// El comentario se guarda tal cual, sin sanitizar ni escapar
// (viola ASVS V5.3.3). El frontend además lo inserta con innerHTML,
// así que cualquier <script> guardado aquí se ejecuta en el navegador
// de todos los usuarios que vean la reseña.
router.post('/:id/reviews', (req, res) => {
  const { author, comment } = req.body;
  db.prepare('INSERT INTO reviews (product_id, author, comment) VALUES (?, ?, ?)')
    .run(req.params.id, author, comment);
  res.status(201).json({ ok: true });
});

module.exports = router;
