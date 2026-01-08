/**
 * Serverless Function Entry Point para Vercel
 * Wrapper do Express App para funcionar como serverless function
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../backend/src/app';

// Handler serverless para Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // O app Express já está configurado com todas as rotas
  // Apenas passar o request e response para ele
  return app(req as any, res as any);
}
