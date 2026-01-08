# ⚙️ Configuração do Vercel

## 📋 Variáveis de Ambiente Necessárias

### Para o Frontend (21Scoutpro)

No Vercel, vá em **Settings → Environment Variables** e adicione:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `VITE_API_URL` | `https://seu-backend.vercel.app/api` | URL completa do backend (com `/api` no final) |

**Exemplo:**
```
VITE_API_URL=https://scout21-backend.vercel.app/api
```

### Para o Backend (se estiver no Vercel também)

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `DATABASE_URL` | `postgresql://postgres:SUA_SENHA@db.SEU_PROJETO.supabase.co:5432/postgres` | Connection string do Supabase (substitua SUA_SENHA e SEU_PROJETO) |
| `JWT_SECRET` | `sua-chave-secreta-forte-aqui` | Chave secreta para JWT (use uma string longa e aleatória) |
| `JWT_EXPIRES_IN` | `7d` | Tempo de expiração do token (opcional) |
| `NODE_ENV` | `production` | Ambiente de produção |
| `PORT` | `3000` | Porta do servidor (Vercel usa automaticamente) |
| `CORS_ORIGIN` | `https://seu-frontend.vercel.app` | URL do frontend para CORS |
| `FRONTEND_URL` | `https://seu-frontend.vercel.app` | URL do frontend (opcional) |

## 🔧 Passo a Passo no Vercel

### 1. Frontend (21Scoutpro)

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto do frontend
3. Vá em **Settings → Environment Variables**
4. Clique em **Add New**
5. Adicione:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://seu-backend.vercel.app/api` (substitua pela URL real do seu backend)
   - **Environment:** Marque todas (Production, Preview, Development)
6. Clique em **Save**
7. Vá em **Deployments** e faça um **Redeploy**

### 2. Backend (se estiver no Vercel)

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto do backend
3. Vá em **Settings → Environment Variables**
4. Adicione todas as variáveis da tabela acima
5. **IMPORTANTE:** Para `DATABASE_URL`, use a connection string completa do Supabase
   - Obtenha a connection string no dashboard do Supabase
   - Se a senha contiver `#`, codifique como `%23` na URL
6. Para `JWT_SECRET`, gere uma chave forte:
   ```bash
   # No terminal, gere uma chave aleatória:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
7. Para `CORS_ORIGIN`, use a URL do seu frontend no Vercel
8. Clique em **Save**
9. Vá em **Deployments** e faça um **Redeploy**

## 🔑 Gerar JWT_SECRET Seguro

Execute no terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado e use como valor de `JWT_SECRET`.

## 📝 Exemplo Completo

### Frontend (.env no Vercel)
```
VITE_API_URL=https://scout21-backend-abc123.vercel.app/api
```

### Backend (.env no Vercel)
```
DATABASE_URL=postgresql://postgres:SUA_SENHA_CODIFICADA@db.SEU_PROJETO.supabase.co:5432/postgres
JWT_SECRET=chave-aleatoria-gerada-com-o-comando-acima
JWT_EXPIRES_IN=7d
NODE_ENV=production
CORS_ORIGIN=https://scout21-frontend-xyz789.vercel.app
FRONTEND_URL=https://scout21-frontend-xyz789.vercel.app
```

**⚠️ IMPORTANTE:** 
- Substitua `SUA_SENHA_CODIFICADA` pela senha real do Supabase (se tiver `#`, use `%23`)
- Substitua `SEU_PROJETO` pelo ID do seu projeto Supabase
- Obtenha a connection string completa no dashboard do Supabase

## ⚠️ Importante

1. **NUNCA** commite essas variáveis no Git
2. Use URLs completas com `https://` em produção
3. Após adicionar variáveis, sempre faça **Redeploy**
4. O Vercel pode levar alguns minutos para aplicar as mudanças

## 🔍 Verificar se Está Funcionando

1. Após configurar, faça um redeploy
2. Acesse o frontend
3. Abra o Console do navegador (F12)
4. Verifique se não há erros de CORS ou conexão
5. Tente fazer login/cadastro

## 🆘 Problemas Comuns

### Erro de CORS
- Verifique se `CORS_ORIGIN` no backend está com a URL exata do frontend
- Certifique-se de incluir `https://` e não ter barra no final

### Erro de conexão com API
- Verifique se `VITE_API_URL` no frontend está correto
- Certifique-se de incluir `/api` no final da URL
- Verifique se o backend está deployado e funcionando

### Erro de banco de dados
- Verifique se `DATABASE_URL` está correta
- Certifique-se de que o `#` na senha está codificado como `%23`
- Verifique se o Supabase permite conexões externas
