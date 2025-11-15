Backend Node/Express — Instruções

1) Instalar dependências

Abra PowerShell na pasta `backend` e execute:

```powershell
npm install
```

2) Criar arquivo de ambiente

Copie `.env.example` para `.env` e ajuste as credenciais do MySQL:

```powershell
copy .env.example .env
# then edit .env (ex: notepad .env)
```

3) Garantir que o banco de dados `projeto1` exista (use `banco/schema.sql`):

```powershell
mysql -u root -p < ..\banco\schema.sql
```

4) Rodar o servidor

```powershell
npm start
# ou para desenvolvimento (necessita nodemon): npm run dev
```

O backend expõe:
- `POST /api/register` { nome, email, senha }
- `POST /api/login` { email, senha }

Ambos retornam JSON e códigos HTTP apropriados.

Autenticação (JWT):
- O backend emite um token JWT em `POST /api/login` na propriedade `token` do JSON retornado.
- Defina `JWT_SECRET` no arquivo `.env` (ex.: `JWT_SECRET=algum_segredo_long_e_complexo`).
- Rota protegida de exemplo: `GET /api/profile` (exige header `Authorization: Bearer <token>`).

Após iniciar o backend, o frontend já está configurado para gravar o token em `localStorage` como `auth_token`.
