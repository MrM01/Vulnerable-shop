require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const { router: authRouter } = require('./routes/auth');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const uploadRouter = require('./routes/upload');
const adminRouter = require('./routes/admin');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/admin', adminRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Vulnerable Shop corriendo en http://localhost:${PORT}`);
  console.log('ADVERTENCIA: esta app tiene vulnerabilidades intencionales. Usar solo en entorno local aislado.');
});
