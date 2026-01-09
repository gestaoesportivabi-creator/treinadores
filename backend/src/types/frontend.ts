/**
 * Tipos do Frontend (compatibilidade)
 * Duplicados do 21Scoutpro/types.ts para evitar problemas de importação
 */

export type Position = 'Goleiro' | 'Fixo' | 'Ala' | 'Pivô';

export interface Player {
  id: string;
  name: string;
  nickname: string;
  position: Position;
  jerseyNumber: number;
  dominantFoot: 'Destro' | 'Canhoto' | 'Ambidestro';
  age: number;
  height: number;
  lastClub: string;
  photoUrl?: string;
  isTransferred?: boolean;
  transferDate?: string;
  injuryHistory?: InjuryRecord[];
}

export interface InjuryRecord {
  id: string;
  playerId?: string;
  date?: string;
  type: string;
  location: string;
  side: 'Direito' | 'Esquerdo' | 'Bilateral' | 'N/A';
  severity: string;
  origin: 'Treino' | 'Jogo' | 'Outros';
  startDate: string;
  endDate?: string;
  daysOut?: number;
}

export interface PhysicalAssessment {
  id: string;
  playerId: string;
  date: string;
  weight: number;
  height: number;
  bodyFat: number;
  muscleMass: number;
  vo2max: number;
  flexibility: number;
  speed: number;
  strength: number;
  agility: number;
}

export interface MatchRecord {
  id: string;
  opponent: string;
  date: string;
  result: 'V' | 'D' | 'E';
  goalsFor: number;
  goalsAgainst: number;
  competition?: string;
  playerStats: { [playerId: string]: MatchStats };
  teamStats: MatchStats;
}

export interface MatchStats {
  goals: number;
  assists: number;
  passesCorrect: number;
  passesWrong: number;
  shotsOnTarget: number;
  shotsOffTarget: number;
  tacklesWithBall: number;
  tacklesWithoutBall: number;
  tacklesCounterAttack: number;
  transitionErrors: number;
}

export interface WeeklySchedule {
  id: string;
  title: string;
  weekStart: string;
  weekEnd: string;
  days: DaySchedule[];
  isActive?: boolean;
  createdAt?: number;
}

export interface DaySchedule {
  day: string;
  activities: {
    time: string;
    activity: string;
    location: string;
    notes?: string;
  }[];
}

export interface StatTargets {
  goals: number;
  assists: number;
  passesCorrect: number;
  passesWrong: number;
  shotsOn: number;
  shotsOff: number;
  tacklesPossession: number;
  tacklesNoPossession: number;
  tacklesCounter: number;
  transitionError: number;
}

export interface PlayerTimeControl {
  id: string;
  matchId: string;
  playerId: string;
  timeEntries: {
    entryTime: string;
    exitTime?: string;
  }[];
  totalTime: number;
}


export interface Team {
  id: string;
  nome: string;
  categoria?: string;
  temporada?: string;
  tecnicoId: string;
  clubeId?: string;
  createdAt: string;
}
