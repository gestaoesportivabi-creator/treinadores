import React from 'react';
import { Clock, Trophy, Target, AlertTriangle } from 'lucide-react';

export type CommitmentType = 'jogo' | 'treino' | null;
export type NextCommitmentInfo = {
  type: CommitmentType;
  label: string;
  competition?: string;
  countdown: { hours: number; minutes: number } | null;
} | null;

export type ActiveAlert = { kind: 'lesão'; count: number } | { kind: 'suspenso'; count: number } | { kind: 'pendurado'; count: number };

interface DashboardTodayBlockProps {
  nextCommitment: NextCommitmentInfo;
  focusOfDay: string;
  activeAlerts: ActiveAlert[];
}

export const DashboardTodayBlock: React.FC<DashboardTodayBlockProps> = ({
  nextCommitment,
  focusOfDay,
  activeAlerts,
}) => {
  return (
    <section
      className="sticky top-0 z-10 w-full rounded-2xl border border-[#00f0ff]/30 bg-zinc-950/95 backdrop-blur-md px-4 py-4 md:px-6 md:py-5 shadow-lg"
      aria-label="Hoje no clube"
    >
      <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#00f0ff] font-black mb-4">
        Hoje no clube
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff]/40 flex items-center justify-center flex-shrink-0">
            <Target className="text-[#00f0ff]" size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Compromisso</p>
            <p className="text-white font-bold text-sm mt-0.5">
              {nextCommitment?.type === 'jogo'
                ? 'Jogo'
                : nextCommitment?.type === 'treino'
                ? 'Treino'
                : '—'}
            </p>
            {nextCommitment?.label && (
              <p className="text-zinc-400 text-xs truncate max-w-[180px]">{nextCommitment.label}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff]/40 flex items-center justify-center flex-shrink-0">
            <Clock className="text-[#00f0ff]" size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Tempo até</p>
            <p className="text-[#00f0ff] font-black text-lg mt-0.5">
              {nextCommitment?.countdown
                ? `${nextCommitment.countdown.hours > 0 ? `${nextCommitment.countdown.hours}h ` : ''}${nextCommitment.countdown.minutes}min`
                : '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
            <Trophy className="text-amber-400" size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Foco do dia</p>
            <p className="text-white font-bold text-sm mt-0.5 line-clamp-2">{focusOfDay || '—'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="text-zinc-400" size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Alertas ativos</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {activeAlerts.length === 0 ? (
                <span className="text-zinc-500 text-xs font-medium">Nenhum</span>
              ) : (
                activeAlerts.map((a, i) =>
                  a.kind === 'lesão' && a.count > 0 ? (
                    <span key={i} className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold">
                      {a.count} lesão{a.count !== 1 ? 'ões' : ''}
                    </span>
                  ) : a.kind === 'suspenso' && a.count > 0 ? (
                    <span key={i} className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold">
                      {a.count} susp.
                    </span>
                  ) : a.kind === 'pendurado' && a.count > 0 ? (
                    <span key={i} className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      {a.count} pend.
                    </span>
                  ) : null
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
