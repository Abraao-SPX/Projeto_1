-- create_user.sql
-- Script opcional para criar um usuário MySQL dedicado ao aplicativo
-- Substitua <usuario> e <senha_forte> antes de executar

-- Exemplos (execute como root ou usuário com privilégios suficientes):
-- CREATE USER 'proj_user'@'localhost' IDENTIFIED BY 'senha_forte';
-- GRANT ALL PRIVILEGES ON `projeto1`.* TO 'proj_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Observação: em produção, restrinja os privilégios apenas ao necessário.
