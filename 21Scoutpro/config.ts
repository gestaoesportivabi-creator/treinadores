/**
 * Configuração da API
 * Backend PostgreSQL - SCOUT 21 PRO
 */

// URL do Backend PostgreSQL
// Em desenvolvimento: http://localhost:3000/api
// Em produção: configurar via variável de ambiente VITE_API_URL
export const getApiUrl = () => {
  // Vite usa import.meta.env ao invés de process.env
  return import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
};

export const API_URL = getApiUrl();

// Mapeamento de recursos para rotas da API
// Mantido para compatibilidade com services/api.ts
export const API_RESOURCES = {
  players: 'players',
  matches: 'matches',
  matchPlayerStats: 'match-player-stats',
  injuries: 'injuries',
  assessments: 'assessments',
  schedules: 'schedules',
  scheduleDays: 'schedule-days',
  competitions: 'competitions',
  statTargets: 'stat-targets',
  users: 'users',
  timeControls: 'time-controls',
  championshipMatches: 'championship-matches'
} as const;


