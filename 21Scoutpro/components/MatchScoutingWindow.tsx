import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Square, Users, ArrowRightLeft, Goal, AlertTriangle } from 'lucide-react';
import { MatchRecord, Player, Team } from '../types';
import { MatchType } from './MatchTypeModal';

interface MatchScoutingWindowProps {
  isOpen: boolean;
  onClose: () => void;
  match: MatchRecord;
  players: Player[];
  teams: Team[];
  matchType: MatchType;
  extraTimeMinutes?: number;
  selectedPlayerIds?: string[]; // IDs dos jogadores selecionados
}

interface MatchEvent {
  id: string;
  type: 'pass' | 'shot' | 'foul' | 'goal' | 'card';
  playerId?: string;
  playerName?: string;
  time: number; // segundos
  result?: 'correct' | 'wrong' | 'inside' | 'outside' | 'post' | 'blocked' | 'normal' | 'contra';
  cardType?: 'yellow' | 'secondYellow' | 'red';
  isOpponentGoal?: boolean; // true se for gol do adversário
  passToPlayerId?: string; // ID do jogador que recebeu o passe
  passToPlayerName?: string; // Nome do jogador que recebeu o passe
  details?: any;
}

export const MatchScoutingWindow: React.FC<MatchScoutingWindowProps> = ({
  isOpen,
  onClose,
  match,
  players,
  teams,
  matchType,
  extraTimeMinutes = 5,
  selectedPlayerIds
}) => {
  const [matchTime, setMatchTime] = useState<number>(0); // tempo em segundos
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isMatchEnded, setIsMatchEnded] = useState<boolean>(false);
  const [activePlayers, setActivePlayers] = useState<Player[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);
  const [showSubstitutions, setShowSubstitutions] = useState<boolean>(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null); // ID do jogador selecionado para ação
  const [goalsFor, setGoalsFor] = useState<number>(0); // Gols da nossa equipe
  const [goalsAgainst, setGoalsAgainst] = useState<number>(0); // Gols do adversário
  const [foulsCount, setFoulsCount] = useState<number>(0); // Contador de faltas
  const [showGoalTeamSelection, setShowGoalTeamSelection] = useState<boolean>(false); // Modal para escolher gol nosso ou adversário
  const [showGoalOurOptions, setShowGoalOurOptions] = useState<boolean>(false); // Modal para escolher autor do gol nosso ou gol contra
  const [showGoalConfirmation, setShowGoalConfirmation] = useState<boolean>(false); // Modal de confirmação de gol
  const [showCardOptions, setShowCardOptions] = useState<boolean>(false); // Controla exibição de opções de cartão
  const [pendingGoalType, setPendingGoalType] = useState<'normal' | 'contra' | null>(null); // Tipo de gol pendente (normal = nosso, contra = adversário marcou)
  const [pendingGoalIsOpponent, setPendingGoalIsOpponent] = useState<boolean>(false); // Se o gol é do adversário
  const [pendingGoalPlayerId, setPendingGoalPlayerId] = useState<string | null>(null); // ID do jogador autor do gol (se gol nosso)
  
  // Estados para escalação e controle de partida
  const [showLineupModal, setShowLineupModal] = useState<boolean>(false);
  const [lineupPlayers, setLineupPlayers] = useState<string[]>([]); // Array de 5 IDs - primeiro é goleiro
  const [benchPlayers, setBenchPlayers] = useState<string[]>([]); // IDs dos jogadores no banco
  const [ballPossessionStart, setBallPossessionStart] = useState<'us' | 'opponent' | null>(null);
  const [isMatchStarted, setIsMatchStarted] = useState<boolean>(false);
  
  // Estados para sistema de passes com relacionamento
  const [showPassReceiverSelection, setShowPassReceiverSelection] = useState<boolean>(false);
  const [pendingPassResult, setPendingPassResult] = useState<'correct' | 'wrong' | null>(null);
  const [pendingPassEventId, setPendingPassEventId] = useState<string | null>(null);

  const teamName = teams && teams.length > 0 ? teams[0].nome : 'Nossa Equipe';

  // Inicializar modal de escalação quando janela abrir
  useEffect(() => {
    if (isOpen && !isMatchStarted && !showLineupModal) {
      // Inicializar banco com todos os jogadores relacionados
      if (selectedPlayerIds && selectedPlayerIds.length > 0) {
        setBenchPlayers([...selectedPlayerIds]);
        setLineupPlayers([]);
        setShowLineupModal(true);
      } else if (players && players.length > 0) {
        // Se não houver jogadores selecionados, usar todos os jogadores
        const allPlayerIds = players.map(p => String(p.id).trim());
        setBenchPlayers(allPlayerIds);
        setLineupPlayers([]);
        setShowLineupModal(true);
      }
    }
  }, [isOpen, isMatchStarted]);

  // Atualizar jogadores ativos baseado na escalação
  useEffect(() => {
    if (isOpen && players && players.length > 0 && lineupPlayers.length > 0) {
      const active = players.filter(p => 
        lineupPlayers.includes(String(p.id).trim())
      );
      setActivePlayers(active);
    } else if (isOpen && lineupPlayers.length === 0) {
      setActivePlayers([]);
    }
  }, [isOpen, players, lineupPlayers]);

  // Cronômetro
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && !isMatchEnded) {
      interval = setInterval(() => {
        setMatchTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isMatchEnded]);

  // Formatar tempo (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Toggle cronômetro
  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // Encerrar tempo (só permitido se > 20 minutos)
  const handleEndTime = () => {
    if (matchTime >= 20 * 60) {
      setIsRunning(false);
      setIsMatchEnded(true);
    }
  };

  // Processar dualidades dos eventos
  const processPlayerRelationships = () => {
    const relationships: { [playerId1: string]: { [playerId2: string]: { passes: number; assists: number } } } = {};
    
    matchEvents.forEach(event => {
      if (event.type === 'pass' && event.passToPlayerId && event.playerId && event.result === 'correct') {
        const player1Id = String(event.playerId).trim();
        const player2Id = String(event.passToPlayerId).trim();
        
        // Garantir ordem consistente (menor ID primeiro)
        const [id1, id2] = player1Id < player2Id ? [player1Id, player2Id] : [player2Id, player1Id];
        
        if (!relationships[id1]) {
          relationships[id1] = {};
        }
        if (!relationships[id1][id2]) {
          relationships[id1][id2] = { passes: 0, assists: 0 };
        }
        
        relationships[id1][id2].passes += 1;
        
        // Verificar se foi assistência
        if (event.details?.isAssist) {
          relationships[id1][id2].assists += 1;
        }
      }
    });
    
    return relationships;
  };

  // Encerrar coleta
  const handleEndCollection = () => {
    if (isMatchEnded) {
      // Processar dualidades
      const relationships = processPlayerRelationships();
      
      // Aqui seria salvar os dados coletados
      console.log('Eventos coletados:', matchEvents);
      console.log('Relacionamentos:', relationships);
      
      // TODO: Salvar relationships no MatchRecord quando integrar com backend
      onClose();
    }
  };

  // Confirmar escalação e iniciar partida
  const handleConfirmLineup = () => {
    if (lineupPlayers.length !== 5) {
      alert('Por favor, selecione exatamente 5 jogadores para a escalação.');
      return;
    }
    
    if (!ballPossessionStart) {
      alert('Por favor, selecione quem começou com a bola.');
      return;
    }
    
    setIsMatchStarted(true);
    setShowLineupModal(false);
    setIsRunning(true); // Iniciar cronômetro automaticamente
  };

  // Adicionar jogador à escalação
  const handleAddToLineup = (playerId: string) => {
    if (lineupPlayers.length >= 5) {
      alert('Máximo de 5 jogadores em quadra. Remova um jogador primeiro.');
      return;
    }
    
    setLineupPlayers(prev => [...prev, playerId]);
    setBenchPlayers(prev => prev.filter(id => id !== playerId));
  };

  // Remover jogador da escalação
  const handleRemoveFromLineup = (playerId: string) => {
    setLineupPlayers(prev => prev.filter(id => id !== playerId));
    setBenchPlayers(prev => [...prev, playerId]);
  };

  // Selecionar ação
  const handleSelectAction = (action: string) => {
    if (!isMatchStarted) {
      alert('A partida ainda não foi iniciada. Complete a escalação primeiro.');
      return;
    }
    
    if (!selectedPlayerId) {
      alert('Por favor, selecione um jogador primeiro.');
      return;
    }
    setSelectedAction(action);
    
    // Se for falta, registrar automaticamente
    if (action === 'foul') {
      handleRegisterFoul();
    }
  };

  // Registrar falta
  const handleRegisterFoul = () => {
    if (!selectedPlayerId) return;
    
    const player = activePlayers.find(p => String(p.id).trim() === selectedPlayerId);
    const newEvent: MatchEvent = {
      id: `foul-${Date.now()}`,
      type: 'foul',
      playerId: selectedPlayerId,
      playerName: player?.name || '',
      time: matchTime,
    };
    
    setMatchEvents(prev => [...prev, newEvent]);
    setFoulsCount(prev => prev + 1);
    setSelectedAction(null);
  };

  // Registrar resultado de passe
  const handleRegisterPass = (result: 'correct' | 'wrong') => {
    if (!selectedPlayerId) return;
    
    const player = activePlayers.find(p => String(p.id).trim() === selectedPlayerId);
    const eventId = `pass-${Date.now()}`;
    const newEvent: MatchEvent = {
      id: eventId,
      type: 'pass',
      playerId: selectedPlayerId,
      playerName: player?.name || '',
      time: matchTime,
      result,
    };
    
    setMatchEvents(prev => [...prev, newEvent]);
    
    // Se passe foi correto, abrir modal para selecionar receptor
    if (result === 'correct') {
      setPendingPassResult('correct');
      setPendingPassEventId(eventId);
      setShowPassReceiverSelection(true);
    } else {
      setSelectedAction(null);
    }
  };

  // Confirmar receptor do passe
  const handleConfirmPassReceiver = (receiverId: string) => {
    if (!pendingPassEventId || !receiverId) return;
    
    const receiver = activePlayers.find(p => String(p.id).trim() === receiverId);
    
    // Atualizar evento com receptor
    setMatchEvents(prev => prev.map(event => {
      if (event.id === pendingPassEventId) {
        return {
          ...event,
          passToPlayerId: receiverId,
          passToPlayerName: receiver?.name || '',
        };
      }
      return event;
    }));
    
    setShowPassReceiverSelection(false);
    setPendingPassResult(null);
    setPendingPassEventId(null);
    setSelectedAction(null);
  };

  // Registrar resultado de chute
  const handleRegisterShot = (result: 'inside' | 'outside' | 'post' | 'blocked') => {
    if (!selectedPlayerId) return;
    
    const player = activePlayers.find(p => String(p.id).trim() === selectedPlayerId);
    const newEvent: MatchEvent = {
      id: `shot-${Date.now()}`,
      type: 'shot',
      playerId: selectedPlayerId,
      playerName: player?.name || '',
      time: matchTime,
      result,
    };
    
    setMatchEvents(prev => [...prev, newEvent]);
    setSelectedAction(null);
  };

  // Encontrar último passe antes do gol
  const findLastPassBeforeGoal = (goalTime: number): MatchEvent | null => {
    const timeWindow = 5; // 5 segundos antes do gol
    const passes = matchEvents
      .filter(e => 
        e.type === 'pass' && 
        e.result === 'correct' && 
        e.passToPlayerId && 
        e.time <= goalTime && 
        e.time >= goalTime - timeWindow
      )
      .sort((a, b) => b.time - a.time);
    
    return passes.length > 0 ? passes[0] : null;
  };

  // Registrar gol
  const handleRegisterGoal = (goalType: 'normal' | 'contra', isOpponent: boolean = false, playerId: string | null = null) => {
    const player = playerId ? activePlayers.find(p => String(p.id).trim() === playerId) : null;
    const newEvent: MatchEvent = {
      id: `goal-${Date.now()}`,
      type: 'goal',
      playerId: playerId || undefined,
      playerName: player?.name || (isOpponent ? 'Adversário' : 'Gol Contra'),
      time: matchTime,
      result: goalType,
      isOpponentGoal: isOpponent,
    };
    
    // Verificar se houve passe que resultou em gol (assistência)
    if (!isOpponent && playerId && goalType === 'normal') {
      const lastPass = findLastPassBeforeGoal(matchTime);
      if (lastPass && lastPass.passToPlayerId === playerId) {
        // Marcar o evento de passe como assistência
        setMatchEvents(prev => prev.map(event => {
          if (event.id === lastPass.id) {
            return {
              ...event,
              details: { ...event.details, isAssist: true, goalEventId: newEvent.id },
            };
          }
          return event;
        }));
      }
    }
    
    setMatchEvents(prev => [...prev, newEvent]);
    if (isOpponent) {
      setGoalsAgainst(prev => prev + 1);
    } else {
      setGoalsFor(prev => prev + 1);
    }
    setShowGoalConfirmation(false);
    setPendingGoalType(null);
    setPendingGoalIsOpponent(false);
    setPendingGoalPlayerId(null);
  };

  // Registrar cartão
  const handleRegisterCard = (cardType: 'yellow' | 'secondYellow' | 'red') => {
    if (!selectedPlayerId) return;
    
    const player = activePlayers.find(p => String(p.id).trim() === selectedPlayerId);
    const newEvent: MatchEvent = {
      id: `card-${Date.now()}`,
      type: 'card',
      playerId: selectedPlayerId,
      playerName: player?.name || '',
      time: matchTime,
      cardType,
    };
    
    setMatchEvents(prev => [...prev, newEvent]);
    setShowCardOptions(false);
  };

  if (!isOpen) return null;

  const canEndTime = matchTime >= 20 * 60;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-hidden">
      <div className="w-full h-full max-w-7xl bg-black rounded-3xl border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,1)] flex flex-col relative overflow-hidden">
        
        {/* Header com fechar */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-black">
          <h2 className="text-xl font-black text-white uppercase tracking-wide">
            Scout da Partida
          </h2>
          <button
            onClick={onClose}
            className="bg-zinc-900 hover:bg-zinc-800 text-white p-2 rounded-full transition-colors border border-zinc-700"
            title="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Seção Superior - Header com equipes, placar, cronômetro, faltas e encerrar */}
        <div className="bg-zinc-950 border-b border-zinc-800 p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Nome das Equipes */}
            <div className="flex-1 flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-zinc-400 text-xs font-bold uppercase mb-1">Nossa Equipe</p>
                <p className="text-[#00f0ff] text-lg font-black">{teamName}</p>
              </div>
              <div className="text-zinc-600 text-xl font-black">vs</div>
              <div className="text-center">
                <p className="text-zinc-400 text-xs font-bold uppercase mb-1">Adversário</p>
                <p className="text-red-400 text-lg font-black">{match.opponent}</p>
              </div>
            </div>

            {/* Placar (Apenas Exibição) */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-zinc-400 text-xs font-bold uppercase">Placar</p>
              <div className="flex items-center gap-3">
                <p className="text-[#00f0ff] text-2xl font-black font-mono">{goalsFor}</p>
                <span className="text-zinc-600 text-2xl font-black">x</span>
                <p className="text-red-400 text-2xl font-black font-mono">{goalsAgainst}</p>
              </div>
            </div>

            {/* Cronômetro Centralizado */}
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleToggleTimer}
                  className="w-32 h-32 rounded-full border-4 border-red-500 bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-all active:scale-95"
                >
                  {isRunning ? (
                    <Pause className="text-red-500" size={40} />
                  ) : (
                    <Play className="text-red-500" size={40} />
                  )}
                </button>
                <div className="text-center mt-2">
                  <p className="text-zinc-400 text-xs font-bold uppercase mb-1">TEMPO</p>
                  <p className="text-red-500 text-3xl font-black font-mono">{formatTime(matchTime)}</p>
                </div>
                {canEndTime && !isMatchEnded && (
                  <button
                    onClick={handleEndTime}
                    className="mt-2 px-4 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500 text-red-400 text-xs font-bold uppercase rounded-lg transition-colors"
                  >
                    Encerrar Tempo
                  </button>
                )}
              </div>
            </div>

            {/* Contador de Faltas e Botão Encerrar */}
            <div className="flex-1 flex flex-col items-center justify-end gap-3">
              {/* Contador de Faltas */}
              <div className="bg-orange-500/10 border-2 border-orange-500 rounded-xl px-4 py-2">
                <p className="text-orange-400 text-xs font-bold uppercase mb-1">Faltas</p>
                <p className="text-orange-400 text-2xl font-black text-center">{foulsCount}</p>
              </div>
              
              {/* Botão Encerrar Coleta */}
              <button
                onClick={handleEndCollection}
                disabled={!isMatchEnded}
                className={`px-4 py-2 rounded-lg border text-xs font-bold uppercase transition-colors ${
                  isMatchEnded
                    ? 'bg-red-500/20 hover:bg-red-500/30 border-red-500 text-red-400 cursor-pointer'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed'
                }`}
              >
                Encerrar Coleta
              </button>
            </div>
          </div>
        </div>

        {/* Corpo Principal - Painéis Esquerdo e Direito */}
        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          {/* Painel Esquerdo - Seleção de Jogador */}
          <div className="w-80 bg-black border-2 border-zinc-800 rounded-3xl p-4 flex flex-col">
            <h3 className="text-white font-bold uppercase text-sm mb-4 text-center">
              SELECIONAR JOGADOR
            </h3>
            
            <div className="flex-1 space-y-3 overflow-y-auto">
              {!isMatchStarted ? (
                <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-xl p-3 text-center">
                  <p className="text-yellow-400 text-xs font-bold">Complete a escalação para iniciar</p>
                </div>
              ) : activePlayers && activePlayers.length > 0 ? (
                activePlayers.map((player) => {
                  const isSelected = selectedPlayerId === String(player.id).trim();
                  const isGoalkeeper = lineupPlayers.length > 0 && String(player.id).trim() === lineupPlayers[0];
                  return (
                    <button
                      key={player.id}
                      onClick={() => isMatchStarted && setSelectedPlayerId(String(player.id).trim())}
                      disabled={!isMatchStarted}
                      className={`w-full rounded-xl p-3 text-left transition-all ${
                        !isMatchStarted
                          ? 'bg-zinc-800 border-2 border-zinc-700 text-zinc-600 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#00f0ff]/20 border-4 border-[#00f0ff]'
                          : 'bg-green-500/10 border-2 border-green-500 hover:border-green-400'
                      }`}
                    >
                      <p className="text-white font-bold text-sm">
                        {isGoalkeeper && '🥅 '}{player.name} - {player.jerseyNumber}
                      </p>
                    </button>
                  );
                })
              ) : (
                <div className="bg-green-500/10 border-2 border-green-500 rounded-xl p-3 text-center">
                  <p className="text-zinc-500 text-xs">Nenhum jogador ativo</p>
                </div>
              )}
            </div>

            {/* Botão Substituições */}
            <button
              onClick={() => setShowSubstitutions(true)}
              className="mt-4 w-full bg-yellow-500/20 border-2 border-yellow-500 rounded-xl p-3 text-yellow-400 font-bold uppercase text-xs hover:bg-yellow-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRightLeft size={16} />
              SUBSTITUIÇÕES
            </button>
          </div>

          {/* Painel Direito - Ações/Eventos */}
          <div className="flex-1 bg-black border-2 border-blue-500 rounded-3xl p-4 flex flex-col">
            {/* Mensagem se jogador não selecionado */}
            {!selectedPlayerId && (
              <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg">
                <p className="text-yellow-400 text-xs font-bold text-center">
                  Selecione um jogador no painel esquerdo para registrar ações
                </p>
              </div>
            )}

            {/* Área Principal de Ações */}
            <div className="flex-1 border-2 border-zinc-800 rounded-xl p-4 flex flex-col">
              {/* Opções para Passe - ACIMA dos botões */}
              {selectedAction === 'pass' && selectedPlayerId && (
                <div className="mb-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-xs mb-3 font-bold uppercase">Resultado do Passe</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleRegisterPass('correct')}
                      className="px-4 py-3 bg-green-500/20 border-2 border-green-500 text-green-400 font-bold uppercase text-xs rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      Certo
                    </button>
                    <button
                      onClick={() => handleRegisterPass('wrong')}
                      className="px-4 py-3 bg-red-500/20 border-2 border-red-500 text-red-400 font-bold uppercase text-xs rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Errado
                    </button>
                  </div>
                </div>
              )}

              {/* Opções para Chute - ACIMA dos botões */}
              {selectedAction === 'shot' && selectedPlayerId && (
                <div className="mb-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-xs mb-3 font-bold uppercase">Resultado do Chute</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleRegisterShot('inside')}
                      className="px-4 py-3 bg-green-500/20 border-2 border-green-500 text-green-400 font-bold uppercase text-xs rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      Dentro
                    </button>
                    <button
                      onClick={() => handleRegisterShot('outside')}
                      className="px-4 py-3 bg-red-500/20 border-2 border-red-500 text-red-400 font-bold uppercase text-xs rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Fora
                    </button>
                    <button
                      onClick={() => handleRegisterShot('post')}
                      className="px-4 py-3 bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400 font-bold uppercase text-xs rounded-lg hover:bg-yellow-500/30 transition-colors"
                    >
                      Trave
                    </button>
                    <button
                      onClick={() => handleRegisterShot('blocked')}
                      className="px-4 py-3 bg-orange-500/20 border-2 border-orange-500 text-orange-400 font-bold uppercase text-xs rounded-lg hover:bg-orange-500/30 transition-colors"
                    >
                      Bloqueado
                    </button>
                  </div>
                </div>
              )}

              {!isMatchStarted ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-6 bg-yellow-500/20 border-2 border-yellow-500 rounded-xl">
                    <p className="text-yellow-400 text-sm font-bold uppercase mb-2">
                      Partida não iniciada
                    </p>
                    <p className="text-zinc-400 text-xs">
                      Complete a escalação para habilitar os comandos
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Botões de Ação */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleSelectAction('pass')}
                      disabled={!selectedPlayerId}
                      className={`px-4 py-3 rounded-lg border-2 font-bold uppercase text-xs transition-colors ${
                        !selectedPlayerId
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                          : selectedAction === 'pass'
                          ? 'bg-black border-zinc-600 text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      Passe
                    </button>
                    <button
                      onClick={() => handleSelectAction('shot')}
                      disabled={!selectedPlayerId}
                      className={`px-4 py-3 rounded-lg border-2 font-bold uppercase text-xs transition-colors ${
                        !selectedPlayerId
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                          : selectedAction === 'shot'
                          ? 'bg-red-500/20 border-red-500 text-red-400'
                          : 'bg-zinc-900 border-red-500/50 text-zinc-400 hover:border-red-500'
                      }`}
                    >
                      CHUTE
                    </button>
                    <button
                      onClick={() => handleSelectAction('foul')}
                      disabled={!selectedPlayerId}
                      className={`px-4 py-3 rounded-lg border-2 font-bold uppercase text-xs transition-colors ${
                        !selectedPlayerId
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                          : selectedAction === 'foul'
                          ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                          : 'bg-zinc-900 border-orange-500/50 text-zinc-400 hover:border-orange-500'
                      }`}
                    >
                      FALTA
                    </button>
                  </div>

                  {/* Botão de Gol - Centralizado e Maior */}
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => {
                        if (!isMatchStarted) {
                          alert('A partida ainda não foi iniciada. Complete a escalação primeiro.');
                          return;
                        }
                        setShowGoalTeamSelection(true);
                      }}
                      disabled={!isMatchStarted}
                      className={`px-8 py-4 rounded-xl border-4 border-green-500 font-black uppercase text-lg transition-all flex items-center justify-center gap-3 ${
                        isMatchStarted
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                          : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border-zinc-700'
                      }`}
                    >
                      <Goal size={24} />
                      GOL
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Seleção de Equipe (Gol Nosso ou Adversário) */}
        {showGoalTeamSelection && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <h3 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-3">
                  <Goal className="text-green-500" size={24} />
                  Qual Equipe Marcou?
                </h3>
                <button
                  onClick={() => {
                    setShowGoalTeamSelection(false);
                    setPendingGoalIsOpponent(false);
                  }}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-zinc-500 hover:text-white" />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setPendingGoalIsOpponent(false);
                      setShowGoalTeamSelection(false);
                      setShowGoalOurOptions(true);
                    }}
                    className="w-full px-6 py-4 bg-green-500/20 border-2 border-green-500 text-green-400 font-bold uppercase text-sm rounded-xl hover:bg-green-500/30 transition-colors"
                  >
                    Gol Nosso
                  </button>
                  <button
                    onClick={() => {
                      setPendingGoalIsOpponent(true);
                      setPendingGoalType('normal');
                      setShowGoalTeamSelection(false);
                      setShowGoalConfirmation(true);
                    }}
                    className="w-full px-6 py-4 bg-red-500/20 border-2 border-red-500 text-red-400 font-bold uppercase text-sm rounded-xl hover:bg-red-500/30 transition-colors"
                  >
                    Gol Adversário
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Opções para Gol Nosso (Autor ou Gol Contra) */}
        {showGoalOurOptions && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <h3 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-3">
                  <Goal className="text-green-500" size={24} />
                  Gol Nosso
                </h3>
                <button
                  onClick={() => {
                    setShowGoalOurOptions(false);
                    setPendingGoalPlayerId(null);
                    setPendingGoalType(null);
                  }}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-zinc-500 hover:text-white" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-zinc-400 text-sm mb-4">Selecione o autor do gol ou se foi gol contra:</p>
                
                {/* Lista de Jogadores */}
                <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                  {activePlayers && activePlayers.length > 0 ? (
                    activePlayers.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => {
                          setPendingGoalPlayerId(String(player.id).trim());
                          setPendingGoalType('normal');
                          setShowGoalOurOptions(false);
                          setShowGoalConfirmation(true);
                        }}
                        className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-800 text-white font-bold text-sm rounded-xl hover:border-green-500 hover:bg-green-500/10 transition-colors text-left"
                      >
                        #{player.jerseyNumber} {player.name} - {player.position}
                      </button>
                    ))
                  ) : (
                    <p className="text-zinc-500 text-sm text-center py-4">Nenhum jogador ativo</p>
                  )}
                </div>

                {/* Opção Gol Contra */}
                <button
                  onClick={() => {
                    setPendingGoalPlayerId(null);
                    setPendingGoalType('contra');
                    setShowGoalOurOptions(false);
                    setShowGoalConfirmation(true);
                  }}
                  className="w-full px-6 py-4 bg-red-500/20 border-2 border-red-500 text-red-400 font-bold uppercase text-sm rounded-xl hover:bg-red-500/30 transition-colors"
                >
                  Gol Contra (Adversário Marcou)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Opções de Cartão */}
        {showCardOptions && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <h3 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-3">
                  <AlertTriangle className="text-yellow-500" size={24} />
                  Tipo de Cartão
                </h3>
                <button
                  onClick={() => setShowCardOptions(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-zinc-500 hover:text-white" />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      handleRegisterCard('yellow');
                    }}
                    className="w-full px-6 py-4 bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400 font-bold uppercase text-sm rounded-xl hover:bg-yellow-500/30 transition-colors"
                  >
                    Amarelo
                  </button>
                  <button
                    onClick={() => {
                      handleRegisterCard('secondYellow');
                    }}
                    className="w-full px-6 py-4 bg-orange-500/20 border-2 border-orange-500 text-orange-400 font-bold uppercase text-sm rounded-xl hover:bg-orange-500/30 transition-colors"
                  >
                    Segundo Amarelo
                  </button>
                  <button
                    onClick={() => {
                      handleRegisterCard('red');
                    }}
                    className="w-full px-6 py-4 bg-red-500/20 border-2 border-red-500 text-red-400 font-bold uppercase text-sm rounded-xl hover:bg-red-500/30 transition-colors"
                  >
                    Vermelho
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Escalação Inicial */}
        {showLineupModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <h3 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-3">
                  <Users className="text-[#00f0ff]" size={24} />
                  Escalação Inicial
                </h3>
                <button
                  onClick={() => {
                    if (isMatchStarted) {
                      setShowLineupModal(false);
                    }
                  }}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  disabled={!isMatchStarted}
                >
                  <X size={20} className="text-zinc-500 hover:text-white" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="mb-6">
                  <p className="text-zinc-400 text-sm mb-4">
                    Selecione 5 jogadores para a escalação. O primeiro será o goleiro.
                  </p>
                  
                  {/* Escalação (5 jogadores) */}
                  <div className="mb-6">
                    <h4 className="text-white font-bold uppercase text-sm mb-3">
                      Jogadores em Quadra ({lineupPlayers.length}/5)
                    </h4>
                    <div className="grid grid-cols-5 gap-3 mb-3">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const playerId = lineupPlayers[index];
                        const player = playerId ? players.find(p => String(p.id).trim() === playerId) : null;
                        return (
                          <div
                            key={index}
                            className={`border-2 rounded-xl p-3 min-h-[120px] flex flex-col items-center justify-center ${
                              player
                                ? 'border-[#00f0ff] bg-[#00f0ff]/10'
                                : 'border-zinc-700 bg-zinc-950 border-dashed'
                            }`}
                          >
                            {player ? (
                              <>
                                <p className="text-[#00f0ff] text-xs font-bold mb-1">
                                  {index === 0 ? '🥅 GOLEIRO' : `Jogador ${index}`}
                                </p>
                                <p className="text-white font-bold text-sm text-center">
                                  #{player.jerseyNumber}
                                </p>
                                <p className="text-zinc-400 text-xs text-center truncate w-full">
                                  {player.name}
                                </p>
                                <button
                                  onClick={() => handleRemoveFromLineup(playerId)}
                                  className="mt-2 text-red-400 hover:text-red-300 text-xs"
                                >
                                  Remover
                                </button>
                              </>
                            ) : (
                              <p className="text-zinc-600 text-xs text-center">Vazio</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Banco de Reservas */}
                  <div className="mb-6">
                    <h4 className="text-white font-bold uppercase text-sm mb-3">
                      Banco de Reservas ({benchPlayers.length})
                    </h4>
                    <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                      {benchPlayers.map((playerId) => {
                        const player = players.find(p => String(p.id).trim() === playerId);
                        if (!player) return null;
                        return (
                          <button
                            key={playerId}
                            onClick={() => handleAddToLineup(playerId)}
                            disabled={lineupPlayers.length >= 5}
                            className={`p-3 rounded-lg border-2 text-left transition-colors ${
                              lineupPlayers.length >= 5
                                ? 'border-zinc-700 bg-zinc-900 text-zinc-600 cursor-not-allowed'
                                : 'border-zinc-800 bg-zinc-950 hover:border-[#00f0ff] hover:bg-[#00f0ff]/10'
                            }`}
                          >
                            <p className="text-white font-bold text-xs">
                              #{player.jerseyNumber} {player.name}
                            </p>
                            <p className="text-zinc-500 text-[10px]">{player.position}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quem começou com a bola */}
                  <div className="mb-6">
                    <h4 className="text-white font-bold uppercase text-sm mb-3">
                      Quem começou com a bola?
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setBallPossessionStart('us')}
                        className={`px-6 py-4 rounded-xl border-2 font-bold uppercase text-sm transition-colors ${
                          ballPossessionStart === 'us'
                            ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff]'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        Nossa Equipe
                      </button>
                      <button
                        onClick={() => setBallPossessionStart('opponent')}
                        className={`px-6 py-4 rounded-xl border-2 font-bold uppercase text-sm transition-colors ${
                          ballPossessionStart === 'opponent'
                            ? 'bg-red-500/20 border-red-500 text-red-400'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        Adversário
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  onClick={handleConfirmLineup}
                  disabled={lineupPlayers.length !== 5 || !ballPossessionStart}
                  className={`px-6 py-3 rounded-xl font-black uppercase text-sm transition-colors ${
                    lineupPlayers.length === 5 && ballPossessionStart
                      ? 'bg-[#00f0ff] hover:bg-[#00d9e6] text-black'
                      : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  Confirmar Escalação e Iniciar Partida
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Seleção de Receptor do Passe */}
        {showPassReceiverSelection && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <h3 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-3">
                  <Users className="text-green-500" size={24} />
                  Quem recebeu o passe?
                </h3>
                <button
                  onClick={() => {
                    setShowPassReceiverSelection(false);
                    setPendingPassResult(null);
                    setPendingPassEventId(null);
                    // Remover o evento de passe pendente
                    if (pendingPassEventId) {
                      setMatchEvents(prev => prev.filter(e => e.id !== pendingPassEventId));
                    }
                  }}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-zinc-500 hover:text-white" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-zinc-400 text-sm mb-4">
                  Selecione o jogador que recebeu o passe:
                </p>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {activePlayers
                    .filter(p => String(p.id).trim() !== selectedPlayerId)
                    .map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handleConfirmPassReceiver(String(player.id).trim())}
                        className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-800 text-white font-bold text-sm rounded-xl hover:border-green-500 hover:bg-green-500/10 transition-colors text-left"
                      >
                        #{player.jerseyNumber} {player.name} - {player.position}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Gol */}
        {showGoalConfirmation && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <h3 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-3">
                  <Goal className={pendingGoalIsOpponent ? "text-red-500" : "text-green-500"} size={24} />
                  Confirmar Gol
                </h3>
                <button
                  onClick={() => {
                    setShowGoalConfirmation(false);
                    setPendingGoalType(null);
                    setPendingGoalIsOpponent(false);
                    setPendingGoalPlayerId(null);
                  }}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-zinc-500 hover:text-white" />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {/* Mostrar equipe */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                    <p className="text-zinc-400 text-xs font-bold uppercase mb-1">Equipe</p>
                    <p className="text-white font-bold">
                      {pendingGoalIsOpponent ? 'Adversário' : 'Nossa Equipe'}
                    </p>
                  </div>

                  {/* Mostrar jogador autor (se gol nosso e não for gol contra) */}
                  {!pendingGoalIsOpponent && pendingGoalPlayerId && (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                      <p className="text-zinc-400 text-xs font-bold uppercase mb-1">Autor do Gol</p>
                      <p className="text-white font-bold">
                        {activePlayers.find(p => String(p.id).trim() === pendingGoalPlayerId)?.name || '-'}
                      </p>
                    </div>
                  )}

                  {/* Mostrar tipo (gol contra ou normal) */}
                  {!pendingGoalIsOpponent && (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                      <p className="text-zinc-400 text-xs font-bold uppercase mb-1">Tipo</p>
                      <p className="text-white font-bold">
                        {pendingGoalType === 'contra' ? 'Gol Contra (Adversário Marcou)' : 'Gol Normal'}
                      </p>
                    </div>
                  )}

                  {/* Tempo */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                    <p className="text-zinc-400 text-xs font-bold uppercase mb-1">Tempo</p>
                    <p className="text-white font-bold font-mono">{formatTime(matchTime)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowGoalConfirmation(false);
                      setPendingGoalType(null);
                      setPendingGoalIsOpponent(false);
                      setPendingGoalPlayerId(null);
                    }}
                    className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-xs rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleRegisterGoal(
                      pendingGoalType || 'normal',
                      pendingGoalIsOpponent,
                      pendingGoalPlayerId
                    )}
                    className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-black uppercase text-xs rounded-xl transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                  >
                    Confirmar Gol
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
