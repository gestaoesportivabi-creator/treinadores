// User Types
export type UserRole = 'Treinador' | 'Preparador Físico' | 'Supervisor' | 'Diretor' | 'Atleta';

export interface User {
  name: string;
  email: string;
  role: UserRole;
  photoUrl?: string;
  linkedPlayerId?: string;
}

// Championship Table Types
export interface ChampionshipMatch {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  team: string; // Nome da equipe
  opponent: string; // Nome do adversário
  competition: string; // Nome da competição
  location?: string; // Mandante/Visitante
  scoreTarget?: string; // Meta de pontuação esperada (texto livre)
}

export interface Championship {
  id: string;
  name: string;
  phase?: string; // Fase da competição
  suspensionRules: {
    yellowCardsForSuspension: number; // Quantidade de amarelos para suspensão
    redCardSuspension: number; // Jogos de suspensão por vermelho
    yellowAccumulationSuspension: number; // Jogos de suspensão por acumulação de amarelos
  };
  createdAt?: string;
}

// Player Types
export type Position = 'Goleiro' | 'Fixo' | 'Ala' | 'Pivô';

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
  returnDate?: string; // Data de retorno prevista
  returnDateActual?: string; // Data de retorno real
  daysOut?: number;
}

// Max Load Types
export type LoadType = 'Kg' | 'Repetições';

export interface MaxLoad {
  id: string;
  exerciseId: string;
  exerciseName: string;
  category: string;
  loadType: LoadType;
  value: number;
  date?: string; // Data do registro YYYY-MM-DD
}

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
  severanceValue?: number; // Valor de recisão
  severanceEndDate?: string; // Data até quando receberá do clube após recisão
  salary?: number; // Salário negociado
  salaryStartDate?: string; // Data início recebimento salário
  salaryEndDate?: string; // Data término recebimento salário
  injuryHistory?: InjuryRecord[];
  birthDate?: string; // YYYY-MM-DD
  cpf?: string; // Formato: XXX.XXX.XXX-XX
  maxLoads?: MaxLoad[];
}

// Match Types
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

// Physical Assessment Types
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

// Schedule Types
export interface DaySchedule {
  day: string;
  activities: {
    time: string;
    activity: string;
    location: string;
    notes?: string;
  }[];
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

// Stat Targets Types
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

// Time Control Types
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

// Team Types
export interface Team {
  id: string;
  nome: string;
  categoria?: string;
  temporada?: string;
  tecnicoId: string;
  clubeId?: string;
  logoUrl?: string; // URL/base64 do escudo da equipe
  createdAt: string;
}

// Sport Config Types
export interface SportConfig {
  name: string;
  positions: Position[];
  playerCount: number;
  fieldType: string;
  icon: string;
}
