import React, { useMemo } from 'react';
import { ChampionshipMatch } from '../types';
import { Championship } from '../types';
import { Player } from '../types';
import { getChampionshipCards, getPlayerStatus } from '../utils/championshipCards';
import { UserX, UserCheck } from 'lucide-react';

interface SuspensionsAlertProps {
  nextMatch: ChampionshipMatch | null;
  championships: Championship[];
  players: Player[];
  /** Exibir notificação simulada quando não houver suspensos (para demonstrar o formato). */
  showSimulatedExample?: boolean;
}

type SuspendedItem = { player: Player; reason: string; reasonLabel: string };

export const SuspensionsAlert: React.FC<SuspensionsAlertProps> = ({
  nextMatch,
  championships,
  players,
  showSimulatedExample = true,
}) => {
  const { suspended, pendurados, competitionName } = useMemo(() => {
    const compName = nextMatch?.competition || null;
    if (!nextMatch?.competition || championships.length === 0) {
      return { suspended: [] as SuspendedItem[], pendurados: [] as { player: Player; yellows: number }[], competitionName: compName };
    }

    const championship = championships.find((c) => c.name === nextMatch.competition);
    if (!championship?.suspensionRules) {
      return { suspended: [] as SuspendedItem[], pendurados: [] as { player: Player; yellows: number }[], competitionName: compName };
    }

    const rules = championship.suspensionRules;
    const cards = getChampionshipCards(championship.id);
    const nAmarelos = rules.yellowCardsForSuspension;

    const suspendedList: SuspendedItem[] = [];
    const penduradosList: { player: Player; yellows: number }[] = [];

    players.forEach((player) => {
      const record = cards[player.id];
      if (!record) return;

      const status = getPlayerStatus(championship.id, player.id, rules);

      if (status.suspended) {
        if (record.redSuspensionGamesRemaining > 0) {
          suspendedList.push({ player, reason: `Vermelho direto (${record.redSuspensionGamesRemaining} jogo${record.redSuspensionGamesRemaining > 1 ? 's' : ''} restante${record.redSuspensionGamesRemaining > 1 ? 's' : ''})`, reasonLabel: 'Vermelho direto' });
        } else if (record.yellowSuspensionGamesRemaining > 0) {
          suspendedList.push({ player, reason: `${nAmarelos} amarelos (${record.yellowSuspensionGamesRemaining} jogo${record.yellowSuspensionGamesRemaining > 1 ? 's' : ''} restante${record.yellowSuspensionGamesRemaining > 1 ? 's' : ''})`, reasonLabel: `${nAmarelos} amarelos` });
        }
      } else if (status.pendurado) {
        penduradosList.push({ player, yellows: status.yellows });
      }
    });

    return { suspended: suspendedList, pendurados: penduradosList, competitionName: compName };
  }, [nextMatch, championships, players]);

  const showSimulated = showSimulatedExample && suspended.length === 0 && pendurados.length === 0 && nextMatch?.competition;

  return (
    <div className="space-y-1.5">
      {suspended.length > 0 && (
        <div className="bg-red-500/25 border-l-4 border-red-500 rounded-r-lg px-3 py-2 backdrop-blur-sm shadow-md">
          <div className="flex items-start gap-1.5 text-[11px]">
            <UserX className="w-3.5 h-3.5 text-red-200 flex-shrink-0 mt-0" />
            <div className="min-w-0">
              <span className="text-red-100 font-bold block mb-0.5">
                Suspensos para o próximo jogo{competitionName ? ` · ${competitionName}` : ''}
              </span>
              <ul className="text-red-200/90 text-[10px] font-medium space-y-0.5 list-none">
                {suspended.map(({ player, reasonLabel }) => (
                  <li key={player.id}>
                    <span className="font-semibold text-red-100">{player.nickname || player.name}</span>
                    {' — '}
                    {reasonLabel}
                    {competitionName && ` · ${competitionName}`}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      {pendurados.length > 0 && (
        <div className="bg-yellow-500/20 border-l-4 border-yellow-500 rounded-r-lg px-3 py-2">
          <div className="flex items-start gap-1.5 text-[11px]">
            <UserCheck className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0" />
            <div className="min-w-0">
              <span className="text-yellow-200 font-bold block mb-0.5">
                Pendurados (1 amarelo da suspensão){competitionName ? ` · ${competitionName}` : ''}
              </span>
              <span className="text-yellow-300 text-[10px] font-medium line-clamp-2">
                {pendurados.map(({ player, yellows }) => `${player.nickname || player.name} (${yellows} amarelo${yellows > 1 ? 's' : ''})`).join(' • ')}
              </span>
            </div>
          </div>
        </div>
      )}
      {showSimulated && (
        <div className="bg-red-500/20 border-l-4 border-red-500 rounded-r-lg px-3 py-2 border-dashed">
          <div className="flex items-start gap-1.5 text-[11px]">
            <UserX className="w-3.5 h-3.5 text-red-300/80 flex-shrink-0 mt-0" />
            <div className="min-w-0">
              <span className="text-red-100/90 font-bold block mb-0.5">
                Suspensos para o próximo jogo · {nextMatch!.competition}
              </span>
              <p className="text-red-200/80 text-[10px] font-medium italic">
                Exemplo (a partir das regras do campeonato e dos cartões lançados nos jogos):
              </p>
              <ul className="text-red-200/90 text-[10px] font-medium space-y-0.5 list-none mt-0.5">
                <li><span className="font-semibold text-red-100">João Silva</span> — 3 amarelos · {nextMatch!.competition}</li>
                <li><span className="font-semibold text-red-100">Carlos Souza</span> — Vermelho direto · {nextMatch!.competition}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
