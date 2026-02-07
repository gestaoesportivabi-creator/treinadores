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
}

export const SuspensionsAlert: React.FC<SuspensionsAlertProps> = ({
  nextMatch,
  championships,
  players,
}) => {
  const { suspended, pendurados } = useMemo(() => {
    if (!nextMatch?.competition || championships.length === 0) {
      return { suspended: [] as { player: Player; reason: string }[], pendurados: [] as { player: Player; yellows: number }[] };
    }

    const championship = championships.find((c) => c.name === nextMatch.competition);
    if (!championship?.suspensionRules) {
      return { suspended: [] as { player: Player; reason: string }[], pendurados: [] as { player: Player; yellows: number }[] };
    }

    const rules = championship.suspensionRules;
    const cards = getChampionshipCards(championship.id);

    const suspendedList: { player: Player; reason: string }[] = [];
    const penduradosList: { player: Player; yellows: number }[] = [];

    players.forEach((player) => {
      const record = cards[player.id];
      if (!record) return;

      const status = getPlayerStatus(championship.id, player.id, rules);

      if (status.suspended) {
        let reason = '';
        if (record.redSuspensionGamesRemaining > 0) {
          reason = `Cartão vermelho (${record.redSuspensionGamesRemaining} jogo${record.redSuspensionGamesRemaining > 1 ? 's' : ''} restante${record.redSuspensionGamesRemaining > 1 ? 's' : ''})`;
        } else if (record.yellowSuspensionGamesRemaining > 0) {
          reason = `Acumulação de amarelos (${record.yellowSuspensionGamesRemaining} jogo${record.yellowSuspensionGamesRemaining > 1 ? 's' : ''} restante${record.yellowSuspensionGamesRemaining > 1 ? 's' : ''})`;
        }
        if (reason) suspendedList.push({ player, reason });
      } else if (status.pendurado) {
        penduradosList.push({ player, yellows: status.yellows });
      }
    });

    return { suspended: suspendedList, pendurados: penduradosList };
  }, [nextMatch, championships, players]);

  if (suspended.length === 0 && pendurados.length === 0) return null;

  return (
    <div className="space-y-2">
      {suspended.length > 0 && (
        <div className="bg-red-500/20 border-l-4 border-red-500 rounded-r-lg px-4 py-3">
          <div className="flex items-start gap-2 text-xs">
            <UserX className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-red-200 font-bold block mb-1">Suspensos para o próximo jogo:</span>
              <span className="text-red-300 text-[10px] font-medium">
                {suspended.map(({ player, reason }) => `${player.nickname || player.name} (${reason})`).join(' • ')}
              </span>
            </div>
          </div>
        </div>
      )}
      {pendurados.length > 0 && (
        <div className="bg-yellow-500/20 border-l-4 border-yellow-500 rounded-r-lg px-4 py-3">
          <div className="flex items-start gap-2 text-xs">
            <UserCheck className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-yellow-200 font-bold block mb-1">Pendurados (1 amarelo da suspensão):</span>
              <span className="text-yellow-300 text-[10px] font-medium">
                {pendurados.map(({ player, yellows }) => `${player.nickname || player.name} (${yellows} amarelo${yellows > 1 ? 's' : ''})`).join(' • ')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
