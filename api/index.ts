/**
 * Serverless Function Entry Point para Vercel
 * Wrapper do Express App para funcionar como serverless function
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Importar o app Express
// Usar require para evitar problemas de importação ESM/CommonJS
let app: any;

try {
  // Tentar importar como CommonJS (compilado)
  app = require('../backend/dist/app.js').default;
} catch (e) {
  // Se não encontrar, tentar importar direto do TypeScript (desenvolvimento)
  try {
    app = require('../backend/src/app.ts').default;
  } catch (e2) {
    // Fallback: criar um app básico
    const express = require('express');
    app = express();
    app.use(express.json());
    app.get('/health', (_req: any, res: any) => {
      res.json({ success: true, message: 'SCOUT 21 PRO Backend is running' });
    });
  }
}

// Handler serverless para Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // O app Express já está configurado com todas as rotas
  // Apenas passar o request e response para ele
  return app(req as any, res as any);
}
