# 🚀 Quick Start - Setup do Banco de Dados

## ⚠️ IMPORTANTE: PostgreSQL Necessário

O sistema precisa de um banco de dados PostgreSQL rodando. Escolha uma das opções abaixo:

## 📦 Opção 1: Docker (Mais Fácil - Recomendado)

### 1. Instalar Docker Desktop
- **macOS**: Baixe em https://www.docker.com/products/docker-desktop/
- Instale e inicie o Docker Desktop

### 2. Criar e Iniciar Container PostgreSQL
```bash
cd backend

# Criar container PostgreSQL
docker run --name scout21pro-postgres \
  -e POSTGRES_USER=scout21pro \
  -e POSTGRES_PASSWORD=scout21pro \
  -e POSTGRES_DB=scout21pro \
  -p 5432:5432 \
  -d postgres:14

# Verificar se está rodando
docker ps | grep scout21pro-postgres
```

### 3. Atualizar .env
```bash
# O arquivo .env já deve ter:
DATABASE_URL="postgresql://scout21pro:scout21pro@localhost:5432/scout21pro?schema=public"
```

### 4. Executar Migrations
```bash
cd backend

# Criar schema e executar migrations
npx prisma migrate dev --name init

# OU executar migrations SQL manualmente:
docker exec -i scout21pro-postgres psql -U scout21pro -d scout21pro < migrations/000_seed_roles.sql
```

## 📦 Opção 2: PostgreSQL Local (Homebrew)

### 1. Instalar PostgreSQL
```bash
brew install postgresql@14
brew services start postgresql@14
```

### 2. Criar Banco de Dados
```bash
createdb scout21pro
```

### 3. Atualizar .env
```bash
# Edite backend/.env e atualize:
DATABASE_URL="postgresql://$(whoami)@localhost:5432/scout21pro?schema=public"
```

### 4. Executar Migrations
```bash
cd backend

# Criar schema
npx prisma migrate dev --name init

# OU executar SQL manualmente:
psql -d scout21pro -f migrations/000_seed_roles.sql
```

## ✅ Verificar se Funcionou

```bash
cd backend

# Testar conexão
npx prisma db pull

# Se funcionar, você verá o schema sendo sincronizado
```

## 🎯 Próximos Passos

Após configurar o banco:

1. ✅ Backend já está rodando (tsx watch)
2. ✅ Frontend já está rodando (vite)
3. ✅ CORS já está configurado
4. ✅ Registro e Login já estão integrados

**Agora você pode:**
- Acessar http://localhost:5174 (ou a porta que o Vite estiver usando)
- Clicar em "Criar Conta Grátis"
- Preencher os dados e criar sua conta!

## 🆘 Problemas?

### Erro: "Can't reach database server"
- Verifique se PostgreSQL/Docker está rodando
- Verifique a porta 5432
- Verifique as credenciais no `.env`

### Erro: "database does not exist"
- Crie o banco: `createdb scout21pro`
- Ou use Docker que cria automaticamente

### Erro: "role does not exist"
- Execute: `psql -d scout21pro -f migrations/000_seed_roles.sql`
- Ou use Prisma: `npx prisma migrate dev`

