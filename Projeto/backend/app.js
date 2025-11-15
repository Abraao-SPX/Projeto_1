const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Helpers
function generateToken(user) {
  const payload = { id: user.id, nome: user.nome, email: user.email };
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  return jwt.sign(payload, secret, { expiresIn: '8h' });
}

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ message: 'Campos incompletos' });

    // Verifica se já existe
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length) return res.status(409).json({ message: 'Email já registrado' });

    const hash = await bcrypt.hash(senha, 10);

    await pool.query('INSERT INTO users (nome, email, password_hash) VALUES (?, ?, ?)', [nome, email, hash]);
    return res.status(201).json({ message: 'Conta criada' });
  } catch (err) {
    console.error('[REGISTER ERROR]', err.message || err);
    return res.status(500).json({ message: 'Erro ao registrar: ' + err.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ message: 'Campos incompletos' });

    let rows;
    try {
      [rows] = await pool.query('SELECT id, nome, email, password_hash FROM users WHERE email = ?', [email]);
    } catch (dbErr) {
      console.error('[DB ERROR]', dbErr.message);
      return res.status(500).json({ message: 'Erro na conexão com banco: ' + dbErr.message });
    }

    if (!rows || !rows.length) return res.status(401).json({ message: 'Credenciais inválidas' });

    const user = rows[0];
    const match = await bcrypt.compare(senha, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Credenciais inválidas' });

    // Gerar token JWT
    const token = generateToken(user);
    return res.json({ id: user.id, nome: user.nome, email: user.email, token });
  } catch (err) {
    console.error('[LOGIN ERROR]', err.message || err);
    return res.status(500).json({ message: 'Erro ao logar: ' + err.message });
  }
});

// Perfil (protegido)
function authenticateToken(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ message: 'Token ausente' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ message: 'Token inválido' });
  const token = parts[1];
  try {
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    // Opcionalmente, buscar dados adicionais no banco
    return res.json({ id: req.user.id, nome: req.user.nome, email: req.user.email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro interno' });
  }
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    const conn = await pool.getConnection();
    console.log('[DB] Conexão com banco bem-sucedida');
    conn.release();
  } catch (err) {
    console.error('[DB] Falha ao conectar com banco:', err.message);
  }
});
