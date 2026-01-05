/**
 * Configuração da API
 * IMPORTANTE: Esta URL será pública no frontend
 * O Google Apps Script já está configurado como "Qualquer pessoa, mesmo sem login"
 * então não há problema em expor esta URL
 */

// URL do Google Apps Script Web App
// Substitua pela sua URL real
export const API_URL = 'https://script.google.com/macros/s/AKfycbywCHc-MEJDN-nvNLVYCC3UXelnZFxhQEuZr4aBfz4kQjvLfzqTRD1NuBytgKLs8TD5/exec';

// Mapeamento de recursos para nomes de abas no Google Apps Script
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
  timeControls: 'time-controls', // Nova rota para controle de tempo jogado
  championshipMatches: 'championship-matches' // Nova rota para tabela de campeonato
} as const;


