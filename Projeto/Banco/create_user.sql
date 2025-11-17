-- create_user.sql
-- Exemplos (execute como root ou usuário com privilégios suficientes):
CREATE USER 'proj_user'@'localhost' IDENTIFIED BY 'senha_forte';
GRANT ALL PRIVILEGES ON `projeto1`.* TO 'proj_user'@'localhost';
FLUSH PRIVILEGES;
