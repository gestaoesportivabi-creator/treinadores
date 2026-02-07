import React, { useMemo } from 'react';
import { Player } from '../types';
import { Ambulance } from 'lucide-react';

interface InjuredPlayersAlertProps {
  players: Player[];
}

/**
 * Atletas em recuperação = lesão sem data de Retorno Real/Alta (returnDateActual, endDate) salva.
 * Retorno Previsto (returnDate) não conta - só Retorno Real indica que o atleta voltou.
 */
export const InjuredPlayersAlert: React.FC<InjuredPlayersAlertProps> = ({ players }) => {
  const injuredList = useMemo(() => {
    return players.filter((player) => {
      if (!player.injuryHistory || player.injuryHistory.length === 0) return false;
      return player.injuryHistory.some((injury) => {
        const hasActualReturn = !!(injury.returnDateActual || injury.endDate);
        return !hasActualReturn; // Lesão sem Retorno Real/Alta = vigente = em recuperação
      });
    });
  }, [players]);

  if (injuredList.length === 0) return null;

  return (
    <div className="bg-red-500/25 border-l-4 border-red-500 rounded-r-lg px-3 py-2 backdrop-blur-sm shadow-md">
      <div className="flex items-start gap-1.5 text-[11px]">
        <Ambulance className="w-3.5 h-3.5 text-red-200 flex-shrink-0 mt-0" />
        <div className="min-w-0">
          <span className="text-red-100 font-bold block mb-0.5">
            {injuredList.length} desfalque{injuredList.length > 1 ? 's' : ''} por lesão
          </span>
          <span className="text-red-200/90 text-[10px] font-medium line-clamp-2">
            {injuredList.map((p) => p.nickname || p.name).join(' • ')}
          </span>
        </div>
      </div>
    </div>
  );
};
