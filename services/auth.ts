/**
 * Serviço de Autenticação
 * Para versão de produção, integrar com backend real
 * Para desenvolvimento local, usa dados mockados dos coaches
 */

import { User } from '../types';

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
  active: boolean;
}

// Simulação de banco de dados de coaches
// Em produção, isso viria de uma API
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
    spreadsheetId: '', // Será configurado no config.ts
    active: true
  }
];

/**
 * Função de hash simples (MD5-like)
 * Em produção, use bcrypt ou similar
 */
function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Autentica um treinador
 */
export async function authenticateCoach(email: string, password: string): Promise<User | null> {
  try {
    // Normalizar email
    const normalizedEmail = email.trim().toLowerCase();
    
    // Buscar coach (em produção, viria de API)
    const coach = MOCK_COACHES.find(c => c.email === normalizedEmail && c.active);
    
    if (!coach) {
      console.error('❌ Coach não encontrado ou inativo');
      return null;
    }

    // Validar senha (em produção, usar bcrypt.compare)
    const inputHash = simpleHash(password);
    
    // Para demo, aceitar tanto o hash correto quanto comparação direta
    const isValidPassword = coach.passwordHash === inputHash || 
                           coach.email === 'treinador@clube.com' && password === 'afc25';
    
    if (!isValidPassword) {
      console.error('❌ Senha incorreta');
      return null;
    }

    // Converter CoachData para User
    const user: User = {
      id: coach.id,
      name: coach.name,
      email: coach.email,
      role: coach.role,
      photoUrl: coach.photoUrl,
      // Dados adicionais para o sistema
      teamName: coach.teamName,
      sport: coach.sport,
      spreadsheetId: coach.spreadsheetId
    };

    console.log('✅ Login bem-sucedido:', user.name);
    return user;
  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    return null;
  }
}

/**
 * Busca coach por email (para configuração inicial)
 */
export async function getCoachByEmail(email: string): Promise<CoachData | null> {
  const normalizedEmail = email.trim().toLowerCase();
  return MOCK_COACHES.find(c => c.email === normalizedEmail) || null;
}

/**
 * Lista todos os coaches ativos
 */
export async function listActiveCoaches(): Promise<CoachData[]> {
  return MOCK_COACHES.filter(c => c.active);
}

/**
 * Carrega coaches do sistema de arquivos (Node.js only)
 * Usar apenas em ambiente de desenvolvimento local
 */
export async function loadCoachesFromFiles(): Promise<CoachData[]> {
  // Esta função seria implementada no backend Node.js
  // Aqui apenas retornamos os mock
  console.warn('⚠️  loadCoachesFromFiles() não implementado para browser. Usando dados mock.');
  return MOCK_COACHES;
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
  // Em produção, limpar tokens, cookies, etc
  console.log('👋 Logout realizado');
}

/**
 * INTEGRAÇÃO COM SISTEMA DE ARQUIVOS (Node.js)
 * Para usar em produção, criar endpoint de API que lê data/coaches/
 */
export async function loadCoachesFromAPI(): Promise<CoachData[]> {
  try {
    // Em produção, fazer fetch para API
    // const response = await fetch('/api/coaches');
    // const coaches = await response.json();
    // return coaches;
    
    // Por enquanto, retornar mock
    return MOCK_COACHES;
  } catch (error) {
    console.error('❌ Erro ao carregar coaches:', error);
    return [];
  }
}

