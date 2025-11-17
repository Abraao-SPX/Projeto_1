-- seed.sql
USE `projeto1`;

INSERT INTO `users` (`nome`, `email`, `password_hash`) VALUES
('Usuário Exemplo', 'usuario@exemplo.com', '$2b$10$EXEMPLOHASHDEEXEMPLOEXEMPLOEXEMPLOEXEMPLOEXEMPLOEX'); -- Senha de exemplo, não use em produção.
