/**
 * Serverless Function Entry Point para Vercel
 * Wrapper do Express App para funcionar como serverless function
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Importar o app Express compilado
// O backend precisa ser compilado antes (npm run build no backend)
const app = require('../backend/dist/app.js').default;

// Handler serverless para Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // O app Express já está configurado com todas as rotas
  // Apenas passar o request e response para ele
  return app(req as any, res as any);
}
