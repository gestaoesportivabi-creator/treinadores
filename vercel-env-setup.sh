#!/bin/bash

# 🚀 Script de Configuração Automática - Vercel
# Este script configura todas as variáveis de ambiente no Vercel via CLI

echo "🚀 Configurando variáveis de ambiente no Vercel..."
echo ""

# Verifica se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado!"
    echo "📦 Instale com: npm i -g vercel"
    exit 1
fi

# Verifica se está logado
if ! vercel whoami &> /dev/null; then
    echo "🔐 Faça login no Vercel:"
    vercel login
fi

echo "📋 Configure as variáveis abaixo:"
echo ""
echo "1️⃣ FRONTEND (21Scoutpro)"
echo "   VITE_API_URL=https://seu-backend.vercel.app/api"
echo ""
echo "2️⃣ BACKEND"
echo "   DATABASE_URL=postgresql://postgres:SUA_SENHA@db.SEU_PROJETO.supabase.co:5432/postgres"
echo "   JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
echo "   JWT_EXPIRES_IN=7d"
echo "   NODE_ENV=production"
echo "   CORS_ORIGIN=https://seu-frontend.vercel.app"
echo "   FRONTEND_URL=https://seu-frontend.vercel.app"
echo ""
echo "💡 Use: vercel env add NOME_DA_VARIAVEL"
echo "   Exemplo: vercel env add DATABASE_URL"
echo ""
echo "Ou copie e cole as variáveis acima no dashboard do Vercel:"
echo "https://vercel.com/dashboard → Settings → Environment Variables"

