import React, { useMemo, useState, useEffect } from 'react';
import { Trophy, Calendar, Users, Activity, Moon, UserX, UserCheck } from 'lucide-react';
import { Player } from '../types';
import { Championship } from '../types';
import { getPlayerStatus } from '../utils/championshipCards';
import { QUALIDADE_SONO_STORAGE_KEY } from './QualidadeSonoTab';

const PSE_JOGOS_STORAGE_KEY = 'scout21_pse_jogos';
const PSE_TREINOS_STORAGE_KEY = 'scout21_pse_treinos';

type StoredSono = Record<string, Record<string, number>>;
type StoredPse = Record<string, Record<string, number>>;

export type NextMatchInfo = {
  id?: string;
  date: string;
  time?: string;
  team?: string;
  opponent: string;
  competition?: string;
  dateTime?: Date;
} | null;

interface DashboardNextGameCardProps {
  nextMatch: NextMatchInfo;
  championships: Championship[];
  players: Player[];
}

function teamAvg(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export const DashboardNextGameCard: React.FC<DashboardNextGameCardProps> = ({
  nextMatch,
  championships,
  players,
}) => {
  const [sonoStored, setSonoStored] = useState<StoredSono>({});
  const [pseJogos, setPseJogos] = useState<StoredPse>({});
  const [pseTreinos, setPseTreinos] = useState<StoredPse>({});

  useEffect(() => {
    try {
      const s = localStorage.getItem(QUALIDADE_SONO_STORAGE_KEY);
      if (s) setSonoStored(JSON.parse(s));
      const j = localStorage.getItem(PSE_JOGOS_STORAGE_KEY);
      if (j) setPseJogos(JSON.parse(j));
      const t = localStorage.getItem(PSE_TREINOS_STORAGE_KEY);
      if (t) setPseTreinos(JSON.parse(t));
    } catch (_) {}
  }, []);

  const { suspended, pendurados, availableCount, avgPse, avgSono } = useMemo(() => {
    let suspended: Player[] = [];
    let pendurados: Player[] = [];
    const hasActiveInjury = (p: Player): boolean => {
      if (!p.injuryHistory?.length) return false;
      return p.injuryHistory.some((inj) => !(inj.returnDateActual || inj.endDate));
    };

    if (nextMatch?.competition && championships?.length) {
      const champ = championships.find((c) => c.name === nextMatch.competition);
      if (champ?.suspensionRules) {
        const rules = champ.suspensionRules;
        players.forEach((p) => {
          const status = getPlayerStatus(champ.id, p.id, rules);
          if (status.suspended) suspended.push(p);
          else if (status.pendurado) pendurados.push(p);
        });
      }
    }
    const injuredCount = players.filter(hasActiveInjury).length;
    const availableCount = players.length - suspended.length - injuredCount;
    let avgPse: number | null = null;
    let avgSono: number | null = null;

    const pseValues: number[] = [];
    Object.values(pseJogos).forEach((byPlayer) => {
      Object.values(byPlayer).forEach((v) => {
        if (typeof v === 'number' && v >= 0 && v <= 10) pseValues.push(v);
      });
    });
    Object.values(pseTreinos).forEach((byPlayer) => {
      Object.values(byPlayer).forEach((v) => {
        if (typeof v === 'number' && v >= 0 && v <= 10) pseValues.push(v);
      });
    });
    if (pseValues.length > 0) avgPse = teamAvg(pseValues);

    const sonoValues: number[] = [];
    Object.values(sonoStored).forEach((byPlayer) => {
      Object.values(byPlayer).forEach((v) => {
        if (typeof v === 'number' && v >= 1 && v <= 5) sonoValues.push(v);
      });
    });
    if (sonoValues.length > 0) avgSono = teamAvg(sonoValues);

    return { suspended, pendurados, availableCount, avgPse, avgSono };
  }, [nextMatch, championships, players, pseJogos, pseTreinos, sonoStored]);

  if (!nextMatch) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2 mb-4">
          <Trophy className="text-zinc-500" size={18} />
          Próximo jogo
        </h3>
        <p className="text-zinc-500 text-sm">Nenhum jogo agendado.</p>
      </div>
    );
  }

  const dateLabel = nextMatch.date
    ? new Date(nextMatch.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
    : '—';
  const timeLabel = nextMatch.time ? nextMatch.time.slice(0, 5) : '';

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-6">
      <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 mb-4">
        <Trophy size={18} />
        Próximo jogo
      </h3>
      <div className="mb-4">
        <p className="text-white font-black text-lg">
          {nextMatch.team || 'Time'} x {nextMatch.opponent}
        </p>
        <p className="text-zinc-400 text-xs mt-1 flex items-center gap-2">
          <Calendar size={12} /> {dateLabel} {timeLabel && `· ${timeLabel}`}
        </p>
        {nextMatch.competition && (
          <p className="text-amber-300/90 text-xs mt-0.5">{nextMatch.competition}</p>
        )}
      </div>

      <div className="space-y-3 pt-3 border-t border-zinc-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 flex items-center gap-1.5">
            <Users size={14} /> Impacto no elenco
          </span>
          <span className="text-white font-bold">{availableCount} disp. · {suspended.length} susp. · {pendurados.length} pend.</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {avgPse != null && (
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Activity size={14} /> PSE médio <strong className="text-white">{avgPse}</strong>/10
            </span>
          )}
          {avgSono != null && (
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Moon size={14} /> Sono <strong className="text-white">{avgSono}</strong>/5
            </span>
          )}
        </div>
        {suspended.length > 0 && (
          <div className="flex items-start gap-2 text-[11px]">
            <UserX className="text-red-400 flex-shrink-0 mt-0.5" size={14} />
            <span className="text-red-200">
              Suspensos: {suspended.map((p) => p.nickname || p.name).join(', ')}
            </span>
          </div>
        )}
        {pendurados.length > 0 && (
          <div className="flex items-start gap-2 text-[11px]">
            <UserCheck className="text-amber-400 flex-shrink-0 mt-0.5" size={14} />
            <span className="text-amber-200">
              Pendurados: {pendurados.map((p) => p.nickname || p.name).join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
