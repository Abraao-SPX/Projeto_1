// Uso: node generate_hash.js MinhaSenha123!
// Gera um hash bcrypt para ser usado no seed.sql (ex.: em ambientes sem backend disponível)

const bcrypt = require('bcrypt');

const senha = process.argv[2];
if (!senha) {
  console.error('Uso: node generate_hash.js <senha>');
  process.exit(1);
}

(async () => {
  try {
    const hash = await bcrypt.hash(senha, 10);
    console.log('HASH_BCRYPT=' + hash);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
