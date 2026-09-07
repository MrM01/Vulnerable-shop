# Vulnerable Shop

Aplicación web + API desacoplada, construida deliberadamente con vulnerabilidades
para el proyecto de Software Seguro (Fases 1-4). **Usar solo en un entorno local
aislado, nunca desplegar en producción ni exponerla a internet.**

## Arquitectura

- **Backend**: Node.js + Express + SQLite (better-sqlite3) — API REST en `/api/*`
- **Frontend**: HTML + JS plano (sin framework), servido como estático desde `/public`
- **Autenticación**: JWT (implementado de forma intencionalmente débil, ver abajo)

## Cómo ejecutar

```bash
npm install
npm start
```

La app queda disponible en `http://localhost:3000`.

Usuarios semilla (ver `db.js`):

| email | password | rol |
|---|---|---|
| admin@shop.local | Admin#2026! | admin |
| ana@shop.local | Frutas123 | customer |
| luis@shop.local | Jugo2024 | customer |

## Vulnerabilidades intencionales (mapeo a STRIDE / ASVS)

| # | Archivo | Categoría STRIDE | Control ASVS violado | Descripción |
|---|---|---|---|---|
| 1 | `routes/auth.js` | Spoofing | V5.3.4 | SQLi en login por concatenación de strings — `' OR '1'='1' -- ` permite entrar sin contraseña válida |
| 2 | `routes/users.js` | Elevation of Privilege | V4.1.2 / V4.1.3 | IDOR/BOLA — `/api/users/:id` no valida que el solicitante sea el dueño del recurso |
| 3 | `routes/products.js` + `public/js/app.js` | Tampering | V5.3.3 | XSS almacenado — comentarios de reseñas no se sanitizan al guardar ni se escapan al renderizar (`innerHTML`) |
| 4 | `routes/auth.js` | Spoofing | V3.5.3 / V9.1 | JWT con secreto débil hardcodeado (`shop-secret`) y sin expiración |
| 5 | `routes/upload.js` | Tampering | V12.1 / V12.4 | Subida de archivos sin validar tipo/tamaño y sin sanitizar el nombre (riesgo de path traversal) |
| 6 | `routes/admin.js` | Repudiation | V7.1 / V7.2 | Acción destructiva (borrar usuario) sin ningún registro de auditoría |
| 7 | `routes/auth.js` | Denial of Service | V11.1.4 | Sin rate limiting ni bloqueo de cuenta tras intentos fallidos de login |
| 8 | `routes/users.js` | Information Disclosure | V1.8 / V8.3 | La API regresa el objeto completo del usuario, incluida la contraseña en texto plano |

Cada vulnerabilidad está marcada en el código fuente con un comentario
`// [VULN-N] ...` que explica la categoría STRIDE y el control ASVS que viola,
para facilitar la trazabilidad en el informe de la Fase 1 y las correcciones
de la Fase 2.

## Próximos pasos sugeridos (Fase 2)

Para cada `[VULN-N]`: documentar un PoC (request/response + evidencia),
corregir directamente en el archivo señalado, y volver a probar para
confirmar que la corrección cierra el vector de ataque sin romper la
funcionalidad legítima.
