/**
 * Serverless Function Entry Point para Vercel
 * Wrapper do Express App para funcionar como serverless function
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Importar o app Express compilado dinamicamente
// O backend compila para CommonJS
const getApp = () => {
  try {
    // Usar require para CommonJS
    const backendApp = require('../backend/dist/app.js');
    return backendApp.default || backendApp;
  } catch (error) {
    console.error('❌ Erro ao carregar backend:', error);
    throw error;
  }
};

// Cache do app para evitar recarregar a cada requisição
let cachedApp: any = null;

// Handler serverless para Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Carregar o app na primeira requisição
    if (!cachedApp) {
      cachedApp = getApp();
    }
    
    // O app Express já está configurado com todas as rotas
    // Apenas passar o request e response para ele
    return cachedApp(req as any, res as any);
  } catch (error: any) {
    console.error('❌ Erro no handler:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: error?.message || 'Erro desconhecido'
      });
    }
  }
}
