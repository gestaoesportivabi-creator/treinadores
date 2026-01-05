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

export const PLAYERS: Player[] = [
  { id: 'p1', name: 'Ricardo Braga', nickname: 'Ricardinho', position: 'Ala', jerseyNumber: 10, dominantFoot: 'Canhoto', age: 38, height: 167, lastClub: 'Magnus', photoUrl: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=600&auto=format&fit=crop' },
  { id: 'p2', name: 'Carlos Vagner', nickname: 'Ferrão', position: 'Pivô', jerseyNumber: 11, dominantFoot: 'Destro', age: 33, height: 183, lastClub: 'Barcelona', photoUrl: 'https://images.unsplash.com/photo-1628891557008-04f7c11d0440?q=80&w=600&auto=format&fit=crop' },
  { id: 'p3', name: 'Thiago Mendes', nickname: 'Guitta', position: 'Goleiro', jerseyNumber: 1, dominantFoot: 'Destro', age: 36, height: 180, lastClub: 'Sporting', photoUrl: 'https://images.unsplash.com/photo-1629255734327-023a9d701df9?q=80&w=600&auto=format&fit=crop' },
  { id: 'p4', name: 'Rodrigo Hardy', nickname: 'Rodrigo', position: 'Fixo', jerseyNumber: 14, dominantFoot: 'Destro', age: 39, height: 176, lastClub: 'Magnus', photoUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=600&auto=format&fit=crop' },
  { id: 'p5', name: 'Alessandro Rosa', nickname: 'Falcão', position: 'Ala', jerseyNumber: 12, dominantFoot: 'Canhoto', age: 46, height: 177, lastClub: 'Magnus', photoUrl: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=600&auto=format&fit=crop' },
];

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
export const MATCHES: MatchRecord[] = [
  {
    id: 'm1',
    competition: 'Copa Santa Catarina',
    opponent: 'Jaraguá',
    location: 'Mandante',
    date: '2024-03-10',
    result: 'Vitória',
    teamStats: (() => {
      const playerStats: Record<string, any> = {
        p1: generatePlayerStats('Ala', 'p1'),
        p2: generatePlayerStats('Pivô', 'p2'),
        p3: generatePlayerStats('Goleiro', 'p3'),
        p4: generatePlayerStats('Fixo', 'p4'),
        p5: generatePlayerStats('Ala', 'p5'),
      };
      return generateTeamStats(playerStats);
    })(),
    playerStats: {
      p1: generatePlayerStats('Ala', 'p1'),
      p2: generatePlayerStats('Pivô', 'p2'),
      p3: generatePlayerStats('Goleiro', 'p3'),
      p4: generatePlayerStats('Fixo', 'p4'),
      p5: generatePlayerStats('Ala', 'p5'),
    }
  },
  {
    id: 'm2',
    competition: 'Série Prata',
    opponent: 'Joinville',
    location: 'Visitante',
    date: '2024-03-17',
    result: 'Derrota',
    teamStats: (() => {
      const playerStats: Record<string, any> = {
        p1: generatePlayerStats('Ala', 'p1'),
        p2: generatePlayerStats('Pivô', 'p2'),
        p3: generatePlayerStats('Goleiro', 'p3'),
        p4: generatePlayerStats('Fixo', 'p4'),
        p5: generatePlayerStats('Ala', 'p5'),
      };
      return generateTeamStats(playerStats);
    })(),
    playerStats: {
      p1: generatePlayerStats('Ala', 'p1'),
      p2: generatePlayerStats('Pivô', 'p2'),
      p3: generatePlayerStats('Goleiro', 'p3'),
      p4: generatePlayerStats('Fixo', 'p4'),
      p5: generatePlayerStats('Ala', 'p5'),
    }
  },
  {
    id: 'm3',
    competition: 'JASC',
    opponent: 'Tubarão',
    location: 'Mandante',
    date: '2024-03-24',
    result: 'Vitória',
    teamStats: (() => {
      const playerStats: Record<string, any> = {
        p1: generatePlayerStats('Ala', 'p1'),
        p2: generatePlayerStats('Pivô', 'p2'),
        p3: generatePlayerStats('Goleiro', 'p3'),
        p4: generatePlayerStats('Fixo', 'p4'),
        p5: generatePlayerStats('Ala', 'p5'),
      };
      return generateTeamStats(playerStats);
    })(),
    playerStats: {
      p1: generatePlayerStats('Ala', 'p1'),
      p2: generatePlayerStats('Pivô', 'p2'),
      p3: generatePlayerStats('Goleiro', 'p3'),
      p4: generatePlayerStats('Fixo', 'p4'),
      p5: generatePlayerStats('Ala', 'p5'),
    }
  },
  {
    id: 'm4',
    competition: 'Copa Santa Catarina',
    opponent: 'Blumenau',
    location: 'Visitante',
    date: '2024-04-01',
    result: 'Empate',
    teamStats: (() => {
      const playerStats: Record<string, any> = {
        p1: generatePlayerStats('Ala', 'p1'),
        p2: generatePlayerStats('Pivô', 'p2'),
        p3: generatePlayerStats('Goleiro', 'p3'),
        p4: generatePlayerStats('Fixo', 'p4'),
        p5: generatePlayerStats('Ala', 'p5'),
      };
      return generateTeamStats(playerStats);
    })(),
    playerStats: {
      p1: generatePlayerStats('Ala', 'p1'),
      p2: generatePlayerStats('Pivô', 'p2'),
      p3: generatePlayerStats('Goleiro', 'p3'),
      p4: generatePlayerStats('Fixo', 'p4'),
      p5: generatePlayerStats('Ala', 'p5'),
    }
  },
  {
    id: 'm5',
    competition: 'Série Prata',
    opponent: 'Florianópolis',
    location: 'Mandante',
    date: '2024-04-08',
    result: 'Vitória',
    teamStats: (() => {
      const playerStats: Record<string, any> = {
        p1: generatePlayerStats('Ala', 'p1'),
        p2: generatePlayerStats('Pivô', 'p2'),
        p3: generatePlayerStats('Goleiro', 'p3'),
        p4: generatePlayerStats('Fixo', 'p4'),
        p5: generatePlayerStats('Ala', 'p5'),
      };
      return generateTeamStats(playerStats);
    })(),
    playerStats: {
      p1: generatePlayerStats('Ala', 'p1'),
      p2: generatePlayerStats('Pivô', 'p2'),
      p3: generatePlayerStats('Goleiro', 'p3'),
      p4: generatePlayerStats('Fixo', 'p4'),
      p5: generatePlayerStats('Ala', 'p5'),
    }
  },
  {
    id: 'm6',
    competition: 'JASC',
    opponent: 'Chapecó',
    location: 'Visitante',
    date: '2024-04-15',
    result: 'Vitória',
    teamStats: (() => {
      const playerStats: Record<string, any> = {
        p1: generatePlayerStats('Ala', 'p1'),
        p2: generatePlayerStats('Pivô', 'p2'),
        p3: generatePlayerStats('Goleiro', 'p3'),
        p4: generatePlayerStats('Fixo', 'p4'),
        p5: generatePlayerStats('Ala', 'p5'),
      };
      return generateTeamStats(playerStats);
    })(),
    playerStats: {
      p1: generatePlayerStats('Ala', 'p1'),
      p2: generatePlayerStats('Pivô', 'p2'),
      p3: generatePlayerStats('Goleiro', 'p3'),
      p4: generatePlayerStats('Fixo', 'p4'),
      p5: generatePlayerStats('Ala', 'p5'),
    }
  },
  {
    id: 'm7',
    competition: 'Copa Santa Catarina',
    opponent: 'Criciúma',
    location: 'Mandante',
    date: '2024-04-22',
    result: 'Derrota',
    teamStats: (() => {
      const playerStats: Record<string, any> = {
        p1: generatePlayerStats('Ala', 'p1'),
        p2: generatePlayerStats('Pivô', 'p2'),
        p3: generatePlayerStats('Goleiro', 'p3'),
        p4: generatePlayerStats('Fixo', 'p4'),
        p5: generatePlayerStats('Ala', 'p5'),
      };
      return generateTeamStats(playerStats);
    })(),
    playerStats: {
      p1: generatePlayerStats('Ala', 'p1'),
      p2: generatePlayerStats('Pivô', 'p2'),
      p3: generatePlayerStats('Goleiro', 'p3'),
      p4: generatePlayerStats('Fixo', 'p4'),
      p5: generatePlayerStats('Ala', 'p5'),
    }
  },
  {
    id: 'm8',
    competition: 'Série Prata',
    opponent: 'Lages',
    location: 'Visitante',
    date: '2024-04-29',
    result: 'Empate',
    teamStats: (() => {
      const playerStats: Record<string, any> = {
        p1: generatePlayerStats('Ala', 'p1'),
        p2: generatePlayerStats('Pivô', 'p2'),
        p3: generatePlayerStats('Goleiro', 'p3'),
        p4: generatePlayerStats('Fixo', 'p4'),
        p5: generatePlayerStats('Ala', 'p5'),
      };
      return generateTeamStats(playerStats);
    })(),
    playerStats: {
      p1: generatePlayerStats('Ala', 'p1'),
      p2: generatePlayerStats('Pivô', 'p2'),
      p3: generatePlayerStats('Goleiro', 'p3'),
      p4: generatePlayerStats('Fixo', 'p4'),
      p5: generatePlayerStats('Ala', 'p5'),
    }
  },
];

// MOCK DATA FOR PHYSICAL SCOUT
export const TRAINING_SESSIONS: TrainingSession[] = [
  { id: 't1', date: '2024-03-05', week: 1, type: 'Físico', avgRpe: 8.5 },
  { id: 't2', date: '2024-03-06', week: 1, type: 'Tático', avgRpe: 7.2 },
  { id: 't3', date: '2024-03-07', week: 1, type: 'Técnico', avgRpe: 6.5 },
  { id: 't4', date: '2024-03-08', week: 1, type: 'Tático', avgRpe: 7.8 },
  { id: 't5', date: '2024-03-12', week: 2, type: 'Físico', avgRpe: 9.0 },
  { id: 't6', date: '2024-03-13', week: 2, type: 'Tático', avgRpe: 6.8 },
  { id: 't7', date: '2024-03-14', week: 2, type: 'Regenerativo', avgRpe: 4.0 },
  { id: 't8', date: '2024-03-19', week: 3, type: 'Físico', avgRpe: 8.2 },
  { id: 't9', date: '2024-03-20', week: 3, type: 'Tático', avgRpe: 7.5 },
];

// Dados fictícios de lesão removidos - agora usando dados reais dos jogadores (injuryHistory)
export const INJURIES: InjuryRecord[] = [];

export const ASSESSMENTS: PhysicalAssessment[] = []; // Start empty
