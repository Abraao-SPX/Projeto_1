
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET não está definido no arquivo .env");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

function generateToken(user) {
  const payload = { id: user.id, nome: user.nome, email: user.email };
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  return jwt.sign(payload, secret, { expiresIn: '8h' });
}

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
    return res.status(500).json({ message: 'Ocorreu um erro interno ao tentar registrar a conta.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ message: 'Campos incompletos' });

    let rows;
    try {
      [rows] = await pool.query('SELECT id, nome, email, password_hash FROM users WHERE email = ?', [email]);
    } catch (dbErr) {
      console.error('[DB ERROR]', dbErr.message);
      return res.status(500).json({ message: 'Erro ao acessar o banco de dados.' });
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
    return res.status(500).json({ message: 'Ocorreu um erro interno ao tentar fazer login.' });
  }
});

function authenticateToken(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ message: 'Token ausente' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ message: 'Token inválido' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    return res.json({ id: req.user.id, nome: req.user.nome, email: req.user.email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro interno' });
  }
});

// Dashboard (conecta ao banco quando possível) - rota protegida
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    // Padrões caso não exista tabela de agendamentos
    let totalClients = 0;
    let appointmentsToday = 0;
    let revenueMonth = 0;
    let servicesBreakdown = [];
    let recentAppointments = [];

    // Total de clientes (tabela users)
    try {
      const [rows] = await pool.query('SELECT COUNT(*) AS cnt FROM users');
      totalClients = rows && rows[0] && rows[0].cnt ? rows[0].cnt : 0;
    } catch (err) {
      console.warn('[DASHBOARD] não foi possível ler users:', err.message || err);
    }

    // Verifica se há tabela de agendamentos (appointments) e busca métricas se existir
    try {
      const [tables] = await pool.query("SHOW TABLES LIKE 'appointments'");
      if (tables && tables.length > 0) {
        // Agendamentos hoje
        const [todayRows] = await pool.query("SELECT COUNT(*) AS cnt FROM appointments WHERE DATE(date_time)=CURDATE()");
        appointmentsToday = (todayRows && todayRows[0] && todayRows[0].cnt) || 0;

        // Receita do mês
        const [revRows] = await pool.query("SELECT COALESCE(SUM(price),0) AS sum FROM appointments WHERE MONTH(date_time)=MONTH(CURDATE()) AND YEAR(date_time)=YEAR(CURDATE())");
        revenueMonth = (revRows && revRows[0] && revRows[0].sum) || 0;

        // Breakdown por serviço
        const [svcRows] = await pool.query('SELECT service, COUNT(*) AS count FROM appointments GROUP BY service ORDER BY count DESC LIMIT 20');
        servicesBreakdown = svcRows.map(r => ({ service: r.service, count: r.count }));

        // Próximos agendamentos (assumindo colunas customer_name, date_time, service, price)
        const [appRows] = await pool.query("SELECT customer_name AS cliente, DATE_FORMAT(date_time, '%H:%i') AS time, service, price FROM appointments WHERE date_time >= NOW() ORDER BY date_time ASC LIMIT 20");
        recentAppointments = appRows.map(r => ({ cliente: r.cliente, time: r.time, service: r.service, price: r.price }));
      } else {
        // Sem tabela de appointments — mantemos valores padrão (0 / vazios)
      }
    } catch (err) {
      console.warn('[DASHBOARD] erro ao consultar appointments (talvez tabela não exista):', err.message || err);
    }

    return res.json({ totalClients, appointmentsToday, revenueMonth, servicesBreakdown, recentAppointments });
  } catch (err) {
    console.error('[DASHBOARD ERROR]', err);
    return res.status(500).json({ message: 'Erro ao buscar dados do dashboard' });
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
