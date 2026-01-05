// ... (mantendo todo o conteúdo anterior até a linha 240) ...
// ... (código existente) ...

// Championship Table Types
export interface ChampionshipMatch {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  team: string; // Nome da equipe
  opponent: string; // Nome do adversário
  competition: string; // Nome da competição
}
