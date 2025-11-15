Banco de Dados MySQL — pasta `banco`

Conteúdo:
- `schema.sql` — cria a base `projeto1` e a tabela `users`.
- `seed.sql` — dados de exemplo para testes.
- `create_user.sql` — (opcional) exemplo para criar usuário MySQL com permissões.

Instruções rápidas (Windows / PowerShell):

1) Importar schema (cria database e tabelas):

```powershell
# Será pedido a senha do root
mysql -u root -p < banco\schema.sql
```

2) Popular dados de exemplo:

```powershell
mysql -u root -p < banco\seed.sql
```

3) Criar usuário dedicado (opcional):

```powershell
# Edite create_user.sql com usuário e senha desejados, então:
mysql -u root -p < banco\create_user.sql
```

Boas práticas:
- NÃO armazene senhas em texto puro. Use `bcrypt` (ou equivalente) no backend e guarde apenas o hash em `password_hash`.
- Em produção, crie um usuário de banco com privilégios restritos (não use `root` no app).
- Faça backups regulares do banco (mysqldump). Exemplo:

```powershell
mysqldump -u root -p projeto1 > projeto1_backup.sql
```

Novos utilitários incluídos:

- `generate_hash.js` — gera um hash bcrypt a partir de uma senha (node).
- `insert_user.js` — insere diretamente um usuário no banco (usa env ou valores padrão).
- `setup_db.ps1` — script PowerShell que executa `schema.sql` e `seed.sql` (no Windows).

Exemplo Rápido para inserir usuário usando `insert_user.js` (na pasta `banco`):

```powershell
cd banco
# ajustar variáveis de ambiente ou setar no terminal temporariamente
node insert_user.js "Usuário Teste" usuario@exemplo.com SenhaDeTeste123!
```

Observação: para que `insert_user.js` funcione sem variáveis de ambiente, certifique-se de que o MySQL esteja acessível com o usuário root sem senha (ou edite o script para fornecer credenciais), ou exporte as variáveis antes de executar.
