import React, { useMemo } from 'react';
import { UserCheck, UserCog, UserX } from 'lucide-react';
import { Player } from '../types';
import { getChampionshipCards, getPlayerStatus } from '../utils/championshipCards';
import { Championship } from '../types';

type ChampionshipMatch = { competition?: string } | null;

interface DashboardSquadAvailabilityProps {
  players: Player[];
  nextMatch: ChampionshipMatch;
  championships: Championship[];
}

export const DashboardSquadAvailability: React.FC<DashboardSquadAvailabilityProps> = ({
  players,
  nextMatch,
  championships,
}) => {
  const { available, withRestriction, unavailable } = useMemo(() => {
    const available: Player[] = [];
    const withRestriction: Player[] = [];
    const unavailable: Player[] = [];

    let suspendedIds = new Set<string>();
    let penduradoIds = new Set<string>();
    if (nextMatch?.competition && championships?.length) {
      const champ = championships.find((c) => c.name === nextMatch.competition);
      if (champ?.suspensionRules) {
        const rules = champ.suspensionRules;
        const cards = getChampionshipCards(champ.id);
        players.forEach((p) => {
          const status = getPlayerStatus(champ.id, p.id, rules);
          if (status.suspended) suspendedIds.add(p.id);
          else if (status.pendurado) penduradoIds.add(p.id);
        });
      }
    }

    const hasActiveInjury = (p: Player): boolean => {
      if (!p.injuryHistory?.length) return false;
      return p.injuryHistory.some((inj) => !(inj.returnDateActual || inj.endDate));
    };

    players.forEach((p) => {
      if (suspendedIds.has(p.id) || hasActiveInjury(p)) {
        unavailable.push(p);
      } else if (penduradoIds.has(p.id)) {
        withRestriction.push(p);
      } else {
        available.push(p);
      }
    });

    return { available, withRestriction, unavailable };
  }, [players, nextMatch, championships]);

  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 font-bold">Elenco disponível</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="text-emerald-400" size={18} />
            <span className="text-emerald-200 font-bold text-sm">Disponíveis</span>
          </div>
          <p className="text-2xl font-black text-white">{available.length}</p>
          <p className="text-[10px] text-zinc-400 mt-1 truncate">
            {available.slice(0, 3).map((p) => p.nickname || p.name).join(' · ')}
            {available.length > 3 ? ` +${available.length - 3}` : ''}
          </p>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <UserCog className="text-amber-400" size={18} />
            <span className="text-amber-200 font-bold text-sm">Com restrição</span>
          </div>
          <p className="text-2xl font-black text-white">{withRestriction.length}</p>
          <p className="text-[10px] text-zinc-400 mt-1 truncate">
            {withRestriction.length === 0
              ? 'Nenhum pendurado'
              : withRestriction.slice(0, 3).map((p) => p.nickname || p.name).join(' · ') + (withRestriction.length > 3 ? ` +${withRestriction.length - 3}` : '')}
          </p>
        </div>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <UserX className="text-red-400" size={18} />
            <span className="text-red-200 font-bold text-sm">Indisponíveis</span>
          </div>
          <p className="text-2xl font-black text-white">{unavailable.length}</p>
          <p className="text-[10px] text-zinc-400 mt-1 truncate">
            {unavailable.length === 0
              ? 'Nenhum'
              : unavailable.slice(0, 3).map((p) => p.nickname || p.name).join(' · ') + (unavailable.length > 3 ? ` +${unavailable.length - 3}` : '')}
          </p>
        </div>
      </div>
    </div>
  );
};
