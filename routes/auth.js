const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// [VULN-1] Spoofing — Inyección SQL en el login — CORREGIDO
// Consulta parametrizada en vez de concatenación de strings (ASVS V5.3.4).

// Corregido [VULN-4]: el secreto ya no vive en el código fuente, se carga
// desde una variable de entorno (.env, fuera del control de versiones) y
// debe ser largo y aleatorio (ASVS V3.5.3).
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Falta la variable de entorno JWT_SECRET (revisa el archivo .env)');
}

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  const user = db.prepare(query).get(email, password);

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET, // nosemgrep: javascript.jsonwebtoken.security.jwt-hardcode.hardcoded-jwt-secret -- Falso positivo: JWT_SECRET viene de process.env.JWT_SECRET (variable de entorno vía dotenv), no está hardcodeado.
    { expiresIn: '1h' } // Corregido [VULN-4]: expiración obligatoria (ASVS V9.1)
  );

  res.json({ token, user });
});

module.exports = { router, JWT_SECRET };
