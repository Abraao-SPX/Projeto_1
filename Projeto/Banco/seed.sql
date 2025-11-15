-- seed.sql
-- Insere dados de exemplo na base `projeto1`

USE `projeto1`;

-- Exemplo de usuário (NÃO use esse hash em produção; substitua por um hash real gerado com bcrypt):
-- Para gerar um hash bcrypt localmente, execute (na pasta banco):
-- npm install bcrypt
-- node generate_hash.js SuaSenhaDeTeste
-- Copie o hash impresso e substitua abaixo em 'password_hash'.

INSERT INTO `users` (`nome`, `email`, `password_hash`) VALUES
('Usuário Exemplo', 'usuario@exemplo.com', '$2b$10$EXEMPLOHASHDEEXEMPLOEXEMPLOEXEMPLOEXEMPLOEXEMPLOEX');

-- Adicione mais inserts de teste conforme necessário
