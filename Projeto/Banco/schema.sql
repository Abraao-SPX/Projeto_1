-- schema.sql
-- Cria a base de dados e tabelas iniciais para o projeto

CREATE DATABASE IF NOT EXISTS `projeto1` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `projeto1`;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(150) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Aqui você pode adicionar outras tabelas (roles, sessions, etc.)
