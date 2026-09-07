const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// [VULN-1] Spoofing — Inyección SQL en el login
// La consulta se arma concatenando strings en lugar de usar parámetros
// preparados (viola ASVS V5.3.4). Un atacante puede enviar
// email = "' OR '1'='1' -- " y entrar sin conocer ninguna contraseña.
//
// [VULN-4] Spoofing — JWT con secreto débil y sin expiración corta
// El secreto está hardcodeado y es trivial, y el token no expira
// (viola ASVS V3.5.3 / V9.1).
const JWT_SECRET = 'shop-secret'; // secreto débil y predecible, a propósito

// [VULN-7] Denial of Service — sin límite de intentos de login
// No hay rate limiting ni bloqueo tras varios intentos fallidos
// (viola ASVS V11.1.4).
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  const user = db.prepare(query).get(email, password);

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET
  );

  res.json({ token, user });
});

module.exports = { router, JWT_SECRET };
