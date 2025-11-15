// Uso: node insert_user.js "Nome Usuario" usuario@exemplo.com Senha123!
// Usa variáveis de ambiente (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) ou valores padrão

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

(async () => {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Uso: node insert_user.js "Nome" email senha');
    process.exit(1);
  }
  const [nome, email, senha] = args;

  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'projeto1',
    waitForConnections: true,
    connectionLimit: 5,
  });

  try {
    const hash = await bcrypt.hash(senha, 10);
    await pool.query('INSERT INTO users (nome, email, password_hash) VALUES (?, ?, ?)', [nome, email, hash]);
    console.log('Usuário inserido com sucesso');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao inserir usuário:', err.message || err);
    process.exit(1);
  }
})();
