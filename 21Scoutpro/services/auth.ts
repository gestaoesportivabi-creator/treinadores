/**
 * Serviço de Autenticação
 * 
 * MODO PRODUÇÃO:
 * - Autentica via API Mestra (Google Admin Sheet)
 * - Recebe dados do usuário + URL da planilha dele
 * 
 * MODO DESENVOLVIMENTO (Fallback):
 * - Se a API Mestra não estiver configurada, usa Login Mock
 */

import { User } from '../types';
import { AUTH_API_URL } from '../config';

// Interface para dados do coach (armazenado localmente)
export interface CoachData {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  teamName: string;
  sport: string;
  photoUrl: string;
  role: 'Treinador';
  createdAt: string;
  spreadsheetId: string;
  spreadsheetUrl?: string; // URL completa do Web App
  active: boolean;
}

// Simulação de banco de dados de coaches
const MOCK_COACHES: CoachData[] = [
  {
    id: 'default-coach-1',
    name: 'Treinador Demo',
    email: 'treinador@clube.com',
    passwordHash: 'e99a18c428cb38d5f260853678922e03', // hash de 'afc25'
    teamName: 'AFC 25',
    sport: 'futsal',
    photoUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=600&auto=format&fit=crop',
    role: 'Treinador',
    createdAt: new Date().toISOString(),
    spreadsheetId: '1h1EeCezkEfFZ-oxObrs3G8f0f4DODEsTXv10WYduL2w',
    spreadsheetUrl: 'https://script.google.com/macros/s/AKfycbywCHc-MEJDN-nvNLVYCC3UXelnZFxhQEuZr4aBfz4kQjvLfzqTRD1NuBytgKLs8TD5/exec',
    active: true
  }
];

/**
 * Autentica um treinador via API Mestra
 */
export async function authenticateCoach(email: string, password: string): Promise<User | null> {
  console.group('🔐 [Auth Service] Authenticate');
  console.log('Parameters:', { email, passwordLength: password.length });

  try {
    // 1. Tentar login Mock Local (apenas se for o email de teste e não tiver API configurada)
    if (email === 'treinador@clube.com' && (!AUTH_API_URL || AUTH_API_URL.includes('SUA_URL'))) {
      console.warn('⚠️ Usando login MOCK local (API Mestra não configurada)');
      console.groupEnd();
      const coach = MOCK_COACHES[0];
      if (password === 'afc25') {
        return {
          id: coach.id,
          name: coach.name,
          email: coach.email,
          role: coach.role,
          photoUrl: coach.photoUrl,
          teamName: coach.teamName,
          sport: coach.sport,
          spreadsheetId: coach.spreadsheetId,
          spreadsheetUrl: coach.spreadsheetUrl
        };
      }
      return null;
    }

    // 2. Login Real via API Mestra
    console.log('📡 Calling API:', AUTH_API_URL);

    const response = await fetch(AUTH_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Evita preflight
      body: JSON.stringify({ email, password })
    });

    console.log('📡 Response Status:', response.status);

    const result = await response.json();
    console.log('📦 Result Body:', result);

    if (!result.success) {
      console.error('❌ Login failed:', result.error);
      console.groupEnd();
      return null;
    }

    console.log('✅ Login successful:', result.user);
    console.groupEnd();
    return result.user;

  } catch (error) {
    console.error('❌ Exception in authentication:', error);
    console.groupEnd();
    return null;
  }
}

/**
 * Registra um novo treinador (SaaS V2)
 */
export async function registerCoach(name: string, email: string, password: string): Promise<{ success: boolean, error?: string, user?: User }> {
  console.group('📝 [Auth Service] Register');
  console.log('Parameters:', { name, email, passwordLength: password.length });

  try {
    if (!AUTH_API_URL || AUTH_API_URL.includes('SUA_URL')) {
      console.error('❌ API URL not configured');
      console.groupEnd();
      return { success: false, error: 'API de Registro não configurada.' };
    }

    const payload = {
      action: 'register',
      name,
      email,
      password
    };

    console.log('📡 Sending Registration Payload:', payload);

    const response = await fetch(AUTH_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    console.log('📡 Response Status:', response.status);
    const result = await response.json();
    console.log('📦 Result Body:', result);

    console.groupEnd();
    return result;

  } catch (e: any) {
    console.error('❌ Exception in registration:', e);
    console.groupEnd();
    return { success: false, error: e.toString() };
  }
}

/**
 * Valida se o usuário está autenticado
 */
export function isAuthenticated(user: User | null): boolean {
  return user !== null && user.role === 'Treinador';
}

/**
 * Logout (limpa sessão)
 */
export function logout(): void {
  console.log('👋 Logout realizado');
}

/**
 * Função mock para compatibilidade (não usada mais)
 */
export async function getCoachByEmail(email: string): Promise<CoachData | null> {
  const normalizedEmail = email.trim().toLowerCase();
  return MOCK_COACHES.find(c => c.email === normalizedEmail) || null;
}
