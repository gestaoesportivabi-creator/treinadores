# Instruções para Rodar o Projeto

## ✅ Status Atual

- ✅ Backend rodando em: `http://localhost:3000`
- ✅ Frontend rodando em: `http://localhost:5173`
- ✅ Prisma Client gerado
- ⚠️ PostgreSQL precisa ser configurado

## 📋 Próximos Passos

### 1. Configurar PostgreSQL

**Opção A - PostgreSQL Local:**
```bash
# Instalar PostgreSQL (se não tiver)
# macOS:
brew install postgresql@14
brew services start postgresql@14

# Criar banco de dados
createdb scout21pro

# Atualizar .env com suas credenciais:
# DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/scout21pro?schema=public"
```

**Opção B - Docker (Recomendado):**
```bash
# Rodar PostgreSQL em Docker
docker run --name scout21pro-postgres \
  -e POSTGRES_USER=scout21pro \
  -e POSTGRES_PASSWORD=scout21pro \
  -e POSTGRES_DB=scout21pro \
  -p 5432:5432 \
  -d postgres:14

# Atualizar .env:
# DATABASE_URL="postgresql://scout21pro:scout21pro@localhost:5432/scout21pro?schema=public"
```

### 2. Rodar Migrations

```bash
cd backend

# Usar Prisma Migrate (recomendado)
npx prisma migrate dev --name init

# OU rodar migrations SQL manualmente:
# psql -d scout21pro -f migrations/001_add_missing_fields.sql
# psql -d scout21pro -f migrations/002_normalize_competitions.sql
# ... (todas as migrations)
```

### 3. Verificar Conexão

```bash
cd backend
npx prisma db pull  # Verifica conexão
```

### 4. Criar Usuário Admin (Opcional)

```sql
-- Conectar ao banco e criar roles iniciais
INSERT INTO roles (name, description) VALUES 
  ('ADMIN', 'Administrador do sistema'),
  ('TECNICO', 'Técnico/Treinador'),
  ('CLUBE', 'Clube'),
  ('ATLETA', 'Atleta');
```

## 🚀 Comandos Úteis

### Backend
```bash
cd backend
npm run dev          # Desenvolvimento
npm run build        # Build
npm run start        # Produção
npx prisma studio    # Interface visual do banco
```

### Frontend
```bash
cd 21Scoutpro
npm run dev          # Desenvolvimento
npm run build        # Build
```

## 🔍 Verificar se Está Funcionando

1. **Backend Health Check:**
   ```bash
   curl http://localhost:3000/health
   # Deve retornar: {"success":true,"message":"SCOUT 21 PRO Backend is running"}
   ```

2. **Frontend:**
   - Abrir navegador em: `http://localhost:5173`
   - Deve mostrar a landing page

3. **Testar API:**
   ```bash
   # Criar usuário
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Admin","email":"admin@test.com","password":"admin123"}'
   ```

## ⚠️ Problemas Comuns

### Erro: "Cannot connect to database"
- Verificar se PostgreSQL está rodando
- Verificar credenciais no `.env`
- Verificar se o banco `scout21pro` existe

### Erro: "Table does not exist"
- Rodar migrations: `npx prisma migrate dev`

### Erro: "Prisma Client not generated"
- Rodar: `npx prisma generate`

---

**Status:** ✅ Servidores rodando - Configure PostgreSQL para usar completamente

