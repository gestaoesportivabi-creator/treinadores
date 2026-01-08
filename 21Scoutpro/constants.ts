import { Player, MatchRecord, SportConfig, InjuryRecord, TrainingSession, PhysicalAssessment } from './types';

export const SPORT_CONFIGS: Record<string, SportConfig> = {
  futsal: {
    id: 'futsal',
    name: 'Futsal',
    labels: {
      goals: 'Gols',
      assists: 'Assistências',
      tackles: 'Desarmes',
      shots: 'Chutes',
      shotsOn: 'No Gol',
      shotsOff: 'Para Fora',
      cards: 'Cartões',
      period: 'Tempo'
    },
    positions: ['Goleiro', 'Fixo', 'Ala', 'Pivô']
  }
};

export const PLAYERS: Player[] = [];

// Função para gerar estatísticas realistas por posição
const generatePlayerStats = (position: string, playerId: string): any => {
  const baseStats: any = {
    minutesPlayed: 40,
    goalsConceded: 0,
    yellowCards: Math.random() > 0.85 ? 1 : 0,
    redCards: 0,
    rpeMatch: Number((Math.random() * 2 + 7).toFixed(1)), // 7.0 to 9.0
    goalsScoredOpenPlay: 0,
    goalsScoredSetPiece: 0,
    goalsConcededOpenPlay: 0,
    goalsConcededSetPiece: 0,
  };

  switch (position) {
    case 'Pivô':
      return {
        ...baseStats,
        goals: Math.floor(Math.random() * 3) + 1, // 1-3 gols
        assists: Math.floor(Math.random() * 2), // 0-1 assistências
        passesCorrect: Math.floor(Math.random() * 15) + 20, // 20-35
        passesWrong: Math.floor(Math.random() * 5) + 2, // 2-7
        wrongPassesTransition: Math.floor(Math.random() * 3) + 1, // 1-4
        tacklesWithBall: Math.floor(Math.random() * 8) + 12, // 12-20
        tacklesCounterAttack: Math.floor(Math.random() * 4) + 2, // 2-6
        tacklesWithoutBall: Math.floor(Math.random() * 10) + 8, // 8-18
        shotsOnTarget: Math.floor(Math.random() * 4) + 3, // 3-7
        shotsOffTarget: Math.floor(Math.random() * 3) + 2, // 2-5
      };
    case 'Ala':
      return {
        ...baseStats,
        goals: Math.floor(Math.random() * 2) + 1, // 1-2 gols
        assists: Math.floor(Math.random() * 3) + 1, // 1-3 assistências
        passesCorrect: Math.floor(Math.random() * 20) + 25, // 25-45
        passesWrong: Math.floor(Math.random() * 6) + 3, // 3-9
        wrongPassesTransition: Math.floor(Math.random() * 3) + 1, // 1-4
        tacklesWithBall: Math.floor(Math.random() * 10) + 15, // 15-25
        tacklesCounterAttack: Math.floor(Math.random() * 5) + 3, // 3-8
        tacklesWithoutBall: Math.floor(Math.random() * 12) + 10, // 10-22
        shotsOnTarget: Math.floor(Math.random() * 3) + 2, // 2-5
        shotsOffTarget: Math.floor(Math.random() * 4) + 2, // 2-6
      };
    case 'Fixo':
      return {
        ...baseStats,
        goals: Math.floor(Math.random() * 2), // 0-1 gols
        assists: Math.floor(Math.random() * 2), // 0-1 assistências
        passesCorrect: Math.floor(Math.random() * 25) + 30, // 30-55
        passesWrong: Math.floor(Math.random() * 5) + 2, // 2-7
        wrongPassesTransition: Math.floor(Math.random() * 2) + 1, // 1-3
        tacklesWithBall: Math.floor(Math.random() * 12) + 18, // 18-30
        tacklesCounterAttack: Math.floor(Math.random() * 6) + 4, // 4-10
        tacklesWithoutBall: Math.floor(Math.random() * 15) + 15, // 15-30
        shotsOnTarget: Math.floor(Math.random() * 2) + 1, // 1-3
        shotsOffTarget: Math.floor(Math.random() * 2) + 1, // 1-3
      };
    case 'Goleiro':
      return {
        ...baseStats,
        goals: 0,
        assists: Math.floor(Math.random() * 2), // 0-1 assistências
        passesCorrect: Math.floor(Math.random() * 10) + 15, // 15-25
        passesWrong: Math.floor(Math.random() * 4) + 1, // 1-5
        wrongPassesTransition: Math.floor(Math.random() * 2), // 0-2
        tacklesWithBall: Math.floor(Math.random() * 5) + 3, // 3-8
        tacklesCounterAttack: 0,
        tacklesWithoutBall: Math.floor(Math.random() * 8) + 5, // 5-13
        shotsOnTarget: 0,
        shotsOffTarget: 0,
      };
    default:
      return baseStats;
  }
};

// Função para gerar estatísticas do time
const generateTeamStats = (playerStats: Record<string, any>): any => {
  const totals = Object.values(playerStats).reduce((acc: any, stats: any) => {
    acc.goals += stats.goals || 0;
    acc.assists += stats.assists || 0;
    acc.passesCorrect += stats.passesCorrect || 0;
    acc.passesWrong += stats.passesWrong || 0;
    acc.wrongPassesTransition += stats.wrongPassesTransition || 0;
    acc.tacklesWithBall += stats.tacklesWithBall || 0;
    acc.tacklesCounterAttack += stats.tacklesCounterAttack || 0;
    acc.tacklesWithoutBall += stats.tacklesWithoutBall || 0;
    acc.shotsOnTarget += stats.shotsOnTarget || 0;
    acc.shotsOffTarget += stats.shotsOffTarget || 0;
    acc.rpeMatch += stats.rpeMatch || 0;
    return acc;
  }, {
    goals: 0, assists: 0, passesCorrect: 0, passesWrong: 0,
    wrongPassesTransition: 0, tacklesWithBall: 0, tacklesCounterAttack: 0,
    tacklesWithoutBall: 0, shotsOnTarget: 0, shotsOffTarget: 0, rpeMatch: 0
  });

  const playerCount = Object.keys(playerStats).length;
  
  return {
    minutesPlayed: 40,
    goals: totals.goals,
    goalsConceded: Math.floor(Math.random() * 4) + 1, // 1-4 gols tomados
    assists: totals.assists,
    yellowCards: Math.floor(Math.random() * 3), // 0-2
    redCards: Math.random() > 0.9 ? 1 : 0,
    passesCorrect: totals.passesCorrect,
    passesWrong: totals.passesWrong,
    wrongPassesTransition: totals.wrongPassesTransition,
    tacklesWithBall: totals.tacklesWithBall,
    tacklesCounterAttack: totals.tacklesCounterAttack,
    tacklesWithoutBall: totals.tacklesWithoutBall,
    shotsOnTarget: totals.shotsOnTarget,
    shotsOffTarget: totals.shotsOffTarget,
    rpeMatch: Number((totals.rpeMatch / playerCount).toFixed(1)),
    goalsScoredOpenPlay: Math.floor(totals.goals * 0.7),
    goalsScoredSetPiece: Math.ceil(totals.goals * 0.3),
    goalsConcededOpenPlay: Math.floor((Math.floor(Math.random() * 4) + 1) * 0.6),
    goalsConcededSetPiece: Math.ceil((Math.floor(Math.random() * 4) + 1) * 0.4),
  };
};

// Gerar partidas com estatísticas realistas
export const MATCHES: MatchRecord[] = [];

// MOCK DATA FOR PHYSICAL SCOUT
export const TRAINING_SESSIONS: TrainingSession[] = [];

// Dados fictícios de lesão removidos - agora usando dados reais dos jogadores (injuryHistory)
export const INJURIES: InjuryRecord[] = [];

export const ASSESSMENTS: PhysicalAssessment[] = []; // Start empty
