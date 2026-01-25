import React, { useState, useEffect, useMemo } from 'react';
import { X, Play, Pause, Square, Users, ArrowRightLeft, Goal, AlertTriangle, Clock } from 'lucide-react';
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

type LateralResult = 'defesaDireita' | 'defesaEsquerda' | 'ataqueDireita' | 'ataqueEsquerda';

interface MatchEvent {
  id: string;
  type: 'pass' | 'shot' | 'foul' | 'goal' | 'card' | 'tackle' | 'save' | 'block' | 'corner' | 'freeKick' | 'penalty' | 'lateral';
  playerId?: string;
  playerName?: string;
  time: number; // segundos
  period: '1T' | '2T'; // Período em que ocorreu
  result?: 'correct' | 'wrong' | 'inside' | 'outside' | 'post' | 'blocked' | 'normal' | 'contra' | 'withBall' | 'withoutBall' | 'counter' | 'goal' | 'saved' | 'noGoal' | LateralResult;
  cardType?: 'yellow' | 'secondYellow' | 'red';
  isOpponentGoal?: boolean; // true se for gol do adversário
  passToPlayerId?: string; // ID do jogador que recebeu o passe
  passToPlayerName?: string; // Nome do jogador que recebeu o passe
  tipo: string; // Tipo da ação para análise (ex: "Passe", "Finalização", "Gol")
  subtipo: string; // Subtipo da ação (ex: "Certo", "No gol", "A favor")
  details?: any;
  // Campos para falta com zona
  foulZone?: 'ataque' | 'defesa';
  // Campos para tiro livre e pênalti
  kickerId?: string; // ID do cobrador (tiro livre/pênalti)
  kickerName?: string; // Nome do cobrador
  isForUs?: boolean; // true se tiro livre/pênalti a favor
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
  const [pendingGoalTime, setPendingGoalTime] = useState<number | null>(null); // Tempo capturado quando GOL foi clicado
  const [goalStep, setGoalStep] = useState<'team' | 'author' | 'confirm' | null>(null); // Fluxo inline do gol
  
  // Estado para rastrear cartões por jogador
  const [playerCards, setPlayerCards] = useState<Record<string, Array<'yellow' | 'secondYellow' | 'red'>>>({});
  
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
  const [pendingPassSenderId, setPendingPassSenderId] = useState<string | null>(null); // ID do passador aguardando receptor
  
  // Estados para período e posse
  const [currentPeriod, setCurrentPeriod] = useState<'1T' | '2T'>('1T');
  const [ballPossessionNow, setBallPossessionNow] = useState<'com' | 'sem'>('com');
  const [showIntervalAnalysis, setShowIntervalAnalysis] = useState<boolean>(false);
  
  // Estado para goleiro atual (fixo ou goleiro linha)
  const [currentGoalkeeperId, setCurrentGoalkeeperId] = useState<string | null>(null);
  
  // Estados para rastreamento de substituições
  const [substitutionHistory, setSubstitutionHistory] = useState<Array<{
    playerOutId: string;
    playerInId: string;
    time: number;
    period: '1T' | '2T';
  }>>([]);
  const [substitutionCounts, setSubstitutionCounts] = useState<Record<string, number>>({});
  
  // Estados para confirmação de falta com zona
  const [showFoulConfirmation, setShowFoulConfirmation] = useState<boolean>(false);
  const [pendingFoulZone, setPendingFoulZone] = useState<'ataque' | 'defesa' | null>(null);
  
  // Estados para tiro livre e pênalti (fluxo inline)
  const [showFreeKickTeamSelection, setShowFreeKickTeamSelection] = useState<boolean>(false);
  const [showFreeKickKickerSelection, setShowFreeKickKickerSelection] = useState<boolean>(false);
  const [showFreeKickResult, setShowFreeKickResult] = useState<boolean>(false);
  const [pendingFreeKickTeam, setPendingFreeKickTeam] = useState<'for' | 'against' | null>(null);
  const [pendingFreeKickKickerId, setPendingFreeKickKickerId] = useState<string | null>(null);
  const [freeKickStep, setFreeKickStep] = useState<'team' | 'kicker' | 'result' | null>(null);
  const [penaltyStep, setPenaltyStep] = useState<'team' | 'kicker' | 'result' | null>(null);
  
  const [showPenaltyTeamSelection, setShowPenaltyTeamSelection] = useState<boolean>(false);
  const [showPenaltyKickerSelection, setShowPenaltyKickerSelection] = useState<boolean>(false);
  const [showPenaltyResult, setShowPenaltyResult] = useState<boolean>(false);
  const [pendingPenaltyTeam, setPendingPenaltyTeam] = useState<'for' | 'against' | null>(null);
  const [pendingPenaltyKickerId, setPendingPenaltyKickerId] = useState<string | null>(null);

  const teamName = teams && teams.length > 0 ? teams[0].nome : 'Nossa Equipe';
  
  // Funções para gerenciar frequência de substituições em localStorage
  const loadSubstitutionFrequency = (): Record<string, number> => {
    try {
      const stored = localStorage.getItem('substitutionFrequency');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };
  
  const updateSubstitutionFrequency = (history: Array<{ playerOutId: string; playerInId: string }>) => {
    try {
      const frequency = loadSubstitutionFrequency();
      history.forEach(sub => {
        frequency[sub.playerOutId] = (frequency[sub.playerOutId] || 0) + 1;
        frequency[sub.playerInId] = (frequency[sub.playerInId] || 0) + 1;
      });
      localStorage.setItem('substitutionFrequency', JSON.stringify(frequency));
    } catch (error) {
      console.error('Erro ao atualizar frequência de substituições:', error);
    }
  };

  // Mapeamento ação → tipo + subtipo para análise
  const getTipoSubtipo = (type: MatchEvent['type'], result?: MatchEvent['result'], cardType?: MatchEvent['cardType']): { tipo: string; subtipo: string } => {
    switch (type) {
      case 'pass':
        return { tipo: 'Passe', subtipo: result === 'correct' ? 'Certo' : 'Errado' };
      case 'shot':
        if (result === 'inside') return { tipo: 'Finalização', subtipo: 'No gol' };
        if (result === 'outside') return { tipo: 'Finalização', subtipo: 'Pra fora' };
        if (result === 'post') return { tipo: 'Finalização', subtipo: 'Trave' };
        if (result === 'blocked') return { tipo: 'Finalização', subtipo: 'Bloqueado' };
        return { tipo: 'Finalização', subtipo: '' };
      case 'foul':
        if (result === 'defesaDireita') return { tipo: 'Falta', subtipo: 'Defesa - Direita' };
        if (result === 'defesaEsquerda') return { tipo: 'Falta', subtipo: 'Defesa - Esquerda' };
        if (result === 'ataqueDireita') return { tipo: 'Falta', subtipo: 'Ataque - Direita' };
        if (result === 'ataqueEsquerda') return { tipo: 'Falta', subtipo: 'Ataque - Esquerda' };
        return { tipo: 'Falta', subtipo: '' };
      case 'goal':
        if (result === 'contra') return { tipo: 'Gol', subtipo: 'Contra' };
        return { tipo: 'Gol', subtipo: 'A favor' };
      case 'card':
        if (cardType === 'yellow') return { tipo: 'Cartão', subtipo: 'Amarelo' };
        if (cardType === 'secondYellow') return { tipo: 'Cartão', subtipo: 'Segundo Amarelo' };
        if (cardType === 'red') return { tipo: 'Cartão', subtipo: 'Vermelho' };
        return { tipo: 'Cartão', subtipo: '' };
      case 'tackle':
        if (result === 'withBall') return { tipo: 'Desarme', subtipo: 'Com posse' };
        if (result === 'withoutBall') return { tipo: 'Desarme', subtipo: 'Sem posse' };
        if (result === 'counter') return { tipo: 'Desarme', subtipo: 'Contra-ataque' };
        return { tipo: 'Desarme', subtipo: '' };
      case 'save':
        return { tipo: 'Defesa', subtipo: 'Defesa' };
      case 'block':
        return { tipo: 'Bloqueio', subtipo: 'Bloqueio' };
      case 'corner':
        return { tipo: 'Escanteio', subtipo: 'Escanteio' };
      case 'freeKick':
        if (result === 'goal') return { tipo: 'Tiro Livre', subtipo: 'Gol' };
        if (result === 'saved') return { tipo: 'Tiro Livre', subtipo: 'Defendido' };
        if (result === 'outside') return { tipo: 'Tiro Livre', subtipo: 'Pra fora' };
        if (result === 'post') return { tipo: 'Tiro Livre', subtipo: 'Trave' };
        if (result === 'noGoal') return { tipo: 'Tiro Livre', subtipo: 'Não gol' };
        return { tipo: 'Tiro Livre', subtipo: '' };
      case 'penalty':
        if (result === 'goal') return { tipo: 'Pênalti', subtipo: 'Gol' };
        if (result === 'saved') return { tipo: 'Pênalti', subtipo: 'Defendido' };
        if (result === 'outside') return { tipo: 'Pênalti', subtipo: 'Pra fora' };
        if (result === 'post') return { tipo: 'Pênalti', subtipo: 'Trave' };
        if (result === 'noGoal') return { tipo: 'Pênalti', subtipo: 'Não gol' };
        return { tipo: 'Pênalti', subtipo: '' };
      case 'lateral':
        if (result === 'defesaDireita') return { tipo: 'Lateral', subtipo: 'Defesa - Direita' };
        if (result === 'defesaEsquerda') return { tipo: 'Lateral', subtipo: 'Defesa - Esquerda' };
        if (result === 'ataqueDireita') return { tipo: 'Lateral', subtipo: 'Ataque - Direita' };
        if (result === 'ataqueEsquerda') return { tipo: 'Lateral', subtipo: 'Ataque - Esquerda' };
        return { tipo: 'Lateral', subtipo: '' };
      default:
        return { tipo: type, subtipo: '' };
    }
  };

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

  // Encerrar tempo (1T → análise intervalo, 2T → fim de jogo)
  const handleEndTime = () => {
    if (matchTime >= 20 * 60) {
      setIsRunning(false);

      if (currentPeriod === '1T') {
        setFoulsCount(0);
        setShowIntervalAnalysis(true);
      } else {
        // Segundo tempo: encerrar partida
        setIsMatchEnded(true);
      }
    }
  };
  
  // Iniciar segundo tempo
  const handleStartSecondHalf = () => {
    setCurrentPeriod('2T');
    setMatchTime(0); // Zerar cronômetro para 2º tempo
    setShowIntervalAnalysis(false);
    // Posse inicial do 2º tempo: oposto do início do 1º
    setBallPossessionNow(ballPossessionStart === 'us' ? 'sem' : 'com');
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
      
      // Atualizar frequência de substituições em localStorage
      if (substitutionHistory.length > 0) {
        updateSubstitutionFrequency(substitutionHistory);
      }
      
      // Aqui seria salvar os dados coletados
      console.log('Eventos coletados:', matchEvents);
      console.log('Relacionamentos:', relationships);
      console.log('Histórico de substituições:', substitutionHistory);
      
      // TODO: Salvar relationships e substitutionHistory no MatchRecord quando integrar com backend
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
    // Inicializar goleiro atual (primeiro da escalação)
    if (lineupPlayers.length > 0) {
      setCurrentGoalkeeperId(lineupPlayers[0]);
    }
    // Inicializar posse conforme início
    setBallPossessionNow(ballPossessionStart === 'us' ? 'com' : 'sem');
    // Cronômetro permanece zerado e parado; usuário clica em Iniciar para começar
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
    
    // Bloquear comandos quando tempo está parado (exceto GOL e substituições)
    if (!isRunning && action !== 'goal') {
      alert('O cronômetro está parado. Inicie o cronômetro para registrar ações.');
      return;
    }
    
    if (!selectedPlayerId) {
      alert('Por favor, selecione um jogador primeiro.');
      return;
    }
    
    // Se já há passe pendente e clicou em Passe novamente, cancelar
    if (action === 'pass' && pendingPassEventId) {
      setMatchEvents(prev => prev.filter(e => e.id !== pendingPassEventId));
      setPendingPassEventId(null);
      setPendingPassSenderId(null);
      setPendingPassResult(null);
      setSelectedAction(null);
      return;
    }
    
    setSelectedAction(action);
    
    // Se for falta, definir zona como pendente (opções inline, sem modal)
    if (action === 'foul') {
      setPendingFoulZone(null);
    }
  };
  
  // Registrar desarme
  const handleRegisterTackle = (result: 'withBall' | 'withoutBall' | 'counter') => {
    if (!selectedPlayerId) return;
    
    const player = activePlayers.find(p => String(p.id).trim() === selectedPlayerId);
    const { tipo, subtipo } = getTipoSubtipo('tackle', result);
    const newEvent: MatchEvent = {
      id: `tackle-${Date.now()}`,
      type: 'tackle',
      playerId: selectedPlayerId,
      playerName: player?.name || '',
      time: matchTime,
      period: currentPeriod,
      result,
      tipo,
      subtipo,
    };
    
    setMatchEvents(prev => [...prev, newEvent]);

    // Retomar cronômetro (desarme = bola em jogo)
    if (!isRunning) {
      setIsRunning(true);
    }

    setBallPossessionNow('com');
    setSelectedAction(null);
  };

  // Registrar defesa (apenas para goleiro atual)
  const handleRegisterSave = () => {
    if (!selectedPlayerId || selectedPlayerId !== currentGoalkeeperId) return;
    
    const player = activePlayers.find(p => String(p.id).trim() === selectedPlayerId);
    const { tipo, subtipo } = getTipoSubtipo('save');
    const newEvent: MatchEvent = {
      id: `save-${Date.now()}`,
      type: 'save',
      playerId: selectedPlayerId,
      playerName: player?.name || '',
      time: matchTime,
      period: currentPeriod,
      tipo,
      subtipo,
    };
    
    setMatchEvents(prev => [...prev, newEvent]);
    
    // Retomar cronômetro (defesa = bola em jogo)
    if (!isRunning) {
      setIsRunning(true);
    }
    
    setSelectedAction(null);
  };
  
  // Registrar bloqueio
  const handleRegisterBlock = () => {
    if (!selectedPlayerId) return;
    
    const player = activePlayers.find(p => String(p.id).trim() === selectedPlayerId);
    const { tipo, subtipo } = getTipoSubtipo('block');
    const newEvent: MatchEvent = {
      id: `block-${Date.now()}`,
      type: 'block',
      playerId: selectedPlayerId,
      playerName: player?.name || '',
      time: matchTime,
      period: currentPeriod,
      tipo,
      subtipo,
    };
    
    setMatchEvents(prev => [...prev, newEvent]);
    
    // Retomar cronômetro (bloqueio = bola em jogo)
    if (!isRunning) {
      setIsRunning(true);
    }
    
    setSelectedAction(null);
  };

  // Registrar falta (mesmos inputs que lateral: Defesa/Ataque - Direita/Esquerda). Cronômetro já parado ao clicar em FALTA.
  const handleRegisterFoul = (subtipo: LateralResult) => {
    if (!selectedPlayerId) return;

    const player = activePlayers.find(p => String(p.id).trim() === selectedPlayerId);
    const { tipo, subtipo: subtipoText } = getTipoSubtipo('foul', subtipo);
    const newEvent: MatchEvent = {
      id: `foul-${Date.now()}`,
      type: 'foul',
      playerId: selectedPlayerId,
      playerName: player?.name || '',
      time: matchTime,
      period: currentPeriod,
      result: subtipo,
      tipo,
      subtipo: subtipoText,
      foulZone: subtipo.startsWith('ataque') ? 'ataque' : 'defesa',
    };

    setMatchEvents(prev => [...prev, newEvent]);

    if (foulsCount < 5) {
      setFoulsCount(prev => prev + 1);
    } else {
      alert('Limite de 5 faltas atingido. Use a opção "Tiro Livre" para faltas adicionais.');
    }

    setSelectedAction(null);
  };

  // Registrar resultado de passe
  const handleRegisterPass = (result: 'correct' | 'wrong') => {
    if (!selectedPlayerId) return;
    
    const player = activePlayers.find(p => String(p.id).trim() === selectedPlayerId);
    const { tipo, subtipo } = getTipoSubtipo('pass', result);
    const eventId = `pass-${Date.now()}`;
    const newEvent: MatchEvent = {
      id: eventId,
      type: 'pass',
      playerId: selectedPlayerId,
      playerName: player?.name || '',
      time: matchTime,
      period: currentPeriod,
      result,
      tipo,
      subtipo,
    };
    
    setMatchEvents(prev => [...prev, newEvent]);
    
    // Se passe foi correto, aguardar próximo jogador selecionado como receptor
    if (result === 'correct') {
      setPendingPassSenderId(selectedPlayerId);
      setPendingPassEventId(eventId);
      setPendingPassResult('correct');
      // Retomar cronômetro (passe certo = bola em jogo)
      if (!isRunning) {
        setIsRunning(true);
      }
    } else {
      setSelectedAction(null);
    }
  };

  // Confirmar receptor do passe (chamado quando usuário seleciona próximo jogador)
  const handleConfirmPassReceiver = (receiverId: string) => {
    if (!pendingPassEventId || !receiverId || !pendingPassSenderId) return;
    
    // Não permitir que o passador seja o receptor
    if (receiverId === pendingPassSenderId) {
      return;
    }
    
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
    
    // Limpar estado pendente e atualizar jogador selecionado para o receptor
    setPendingPassResult(null);
    setPendingPassEventId(null);
    setPendingPassSenderId(null);
    setSelectedAction(null);
    setSelectedPlayerId(receiverId); // Receptor vira o jogador selecionado
  };

  // Registrar resultado de chute
  const handleRegisterShot = (result: 'inside' | 'outside' | 'post' | 'blocked') => {
    if (!selectedPlayerId) return;
    
    const player = activePlayers.find(p => String(p.id).trim() === selectedPlayerId);
    const { tipo, subtipo } = getTipoSubtipo('shot', result);
    const newEvent: MatchEvent = {
      id: `shot-${Date.now()}`,
      type: 'shot',
      playerId: selectedPlayerId,
      playerName: player?.name || '',
      time: matchTime,
      period: currentPeriod,
      result,
      tipo,
      subtipo,
    };
    
    setMatchEvents(prev => [...prev, newEvent]);
    
    // Parar cronômetro se chute pra fora
    if (result === 'outside') {
      setIsRunning(false);
    } else {
      // Retomar cronômetro se não for pra fora (bola em jogo)
      if (!isRunning) {
        setIsRunning(true);
      }
    }
    
    setSelectedAction(null);
  };
  
  // Registrar escanteio
  const handleRegisterCorner = () => {
    if (!selectedPlayerId) return;
    setIsRunning(false);

    const player = activePlayers.find(p => String(p.id).trim() === selectedPlayerId);
    const { tipo, subtipo } = getTipoSubtipo('corner');
    const newEvent: MatchEvent = {
      id: `corner-${Date.now()}`,
      type: 'corner',
      playerId: selectedPlayerId,
      playerName: player?.name || '',
      time: matchTime,
      period: currentPeriod,
      tipo,
      subtipo,
    };
    
    setMatchEvents(prev => [...prev, newEvent]);
    setSelectedAction(null);
  };

  // Registrar lateral (cronômetro já parado ao clicar em LATERAL)
  const handleRegisterLateral = (subtipo: LateralResult) => {
    if (!selectedPlayerId) return;

    const player = activePlayers.find(p => String(p.id).trim() === selectedPlayerId);
    const { tipo, subtipo: subtipoText } = getTipoSubtipo('lateral', subtipo);
    const newEvent: MatchEvent = {
      id: `lateral-${Date.now()}`,
      type: 'lateral',
      playerId: selectedPlayerId,
      playerName: player?.name || '',
      time: matchTime,
      period: currentPeriod,
      result: subtipo,
      tipo,
      subtipo: subtipoText,
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
    const { tipo, subtipo } = getTipoSubtipo('goal', goalType);
    // Usar o tempo capturado quando GOL foi clicado, ou matchTime como fallback
    const goalTime = pendingGoalTime !== null ? pendingGoalTime : matchTime;
    const newEvent: MatchEvent = {
      id: `goal-${Date.now()}`,
      type: 'goal',
      playerId: playerId || undefined,
      playerName: player?.name || (isOpponent ? 'Adversário' : 'Gol Contra'),
      time: goalTime,
      period: currentPeriod,
      result: goalType,
      isOpponentGoal: isOpponent,
      tipo,
      subtipo,
    };
    
    // Verificar se houve passe que resultou em gol (assistência)
    if (!isOpponent && playerId && goalType === 'normal') {
      const lastPass = findLastPassBeforeGoal(goalTime);
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
    
    // Cronômetro já foi parado quando GOL foi clicado, mas garantir que está parado
    setIsRunning(false);
    
    setShowGoalConfirmation(false);
    setPendingGoalType(null);
    setPendingGoalIsOpponent(false);
    setPendingGoalPlayerId(null);
    setPendingGoalTime(null);
    setGoalStep(null); // Limpar fluxo inline
  };
  
  // Registrar tiro livre
  const handleRegisterFreeKick = (team: 'for' | 'against', kickerId: string | null, result: 'goal' | 'saved' | 'outside' | 'post' | 'noGoal') => {
    const kicker = kickerId ? activePlayers.find(p => String(p.id).trim() === kickerId) : null;
    const { tipo, subtipo } = getTipoSubtipo('freeKick', result);
    const newEvent: MatchEvent = {
      id: `freekick-${Date.now()}`,
      type: 'freeKick',
      playerId: kickerId || undefined,
      playerName: kicker?.name || (team === 'against' ? 'Adversário' : 'Nossa Equipe'),
      time: matchTime,
      period: currentPeriod,
      result,
      tipo,
      subtipo,
      isForUs: team === 'for',
      kickerId: kickerId || undefined,
      kickerName: kicker?.name || undefined,
    };
    
    setMatchEvents(prev => [...prev, newEvent]);
    
    // Atualizar placar se for gol
    if (result === 'goal') {
      if (team === 'for') {
        setGoalsFor(prev => prev + 1);
      } else {
        setGoalsAgainst(prev => prev + 1);
      }
    }
    
    // Parar cronômetro
    setIsRunning(false);
    
    // Retomar se resultado indica bola em jogo (exceto gol e não gol)
    if (result !== 'goal' && result !== 'noGoal') {
      // Retomar após breve pausa (defendido, pra fora, trave = bola volta ao jogo)
      setTimeout(() => {
        if (!isMatchEnded) {
          setIsRunning(true);
        }
      }, 1000);
    }
    
    setShowFreeKickTeamSelection(false);
    setShowFreeKickKickerSelection(false);
    setShowFreeKickResult(false);
    setPendingFreeKickTeam(null);
    setPendingFreeKickKickerId(null);
    setFreeKickStep(null);
    setSelectedAction(null);
  };
  
  // Registrar pênalti
  const handleRegisterPenalty = (team: 'for' | 'against', kickerId: string | null, result: 'goal' | 'saved' | 'outside' | 'post' | 'noGoal') => {
    const kicker = kickerId ? activePlayers.find(p => String(p.id).trim() === kickerId) : null;
    const { tipo, subtipo } = getTipoSubtipo('penalty', result);
    const newEvent: MatchEvent = {
      id: `penalty-${Date.now()}`,
      type: 'penalty',
      playerId: kickerId || undefined,
      playerName: kicker?.name || (team === 'against' ? 'Adversário' : 'Nossa Equipe'),
      time: matchTime,
      period: currentPeriod,
      result,
      tipo,
      subtipo,
      isForUs: team === 'for',
      kickerId: kickerId || undefined,
      kickerName: kicker?.name || undefined,
    };
    
    setMatchEvents(prev => [...prev, newEvent]);
    
    // Atualizar placar se for gol
    if (result === 'goal') {
      if (team === 'for') {
        setGoalsFor(prev => prev + 1);
      } else {
        setGoalsAgainst(prev => prev + 1);
      }
    }
    
    // Parar cronômetro
    setIsRunning(false);
    
    // Retomar se resultado indica bola em jogo (exceto gol e não gol)
    if (result !== 'goal' && result !== 'noGoal') {
      setTimeout(() => {
        if (!isMatchEnded) {
          setIsRunning(true);
        }
      }, 1000);
    }
    
    setShowPenaltyTeamSelection(false);
    setShowPenaltyKickerSelection(false);
    setShowPenaltyResult(false);
    setPendingPenaltyTeam(null);
    setPendingPenaltyKickerId(null);
    setPenaltyStep(null);
    setSelectedAction(null);
  };

  // Verificar se jogador deve ser expulso
  const checkPlayerExpulsion = (playerId: string): boolean => {
    const cards = playerCards[playerId] || [];
    const yellowCount = cards.filter(c => c === 'yellow').length;
    const hasSecondYellow = cards.some(c => c === 'secondYellow');
    const hasRed = cards.some(c => c === 'red');
    
    return yellowCount >= 2 || hasSecondYellow || hasRed;
  };

  // Registrar cartão
  const handleRegisterCard = (cardType: 'yellow' | 'secondYellow' | 'red') => {
    if (!selectedPlayerId) return;
    
    const player = activePlayers.find(p => String(p.id).trim() === selectedPlayerId);
    const { tipo, subtipo } = getTipoSubtipo('card', undefined, cardType);
    const newEvent: MatchEvent = {
      id: `card-${Date.now()}`,
      type: 'card',
      playerId: selectedPlayerId,
      playerName: player?.name || '',
      time: matchTime,
      period: currentPeriod,
      cardType,
      tipo,
      subtipo,
    };
    
    setMatchEvents(prev => [...prev, newEvent]);
    
    // Adicionar cartão ao histórico do jogador
    setPlayerCards(prev => {
      const updatedCards = [...(prev[selectedPlayerId] || []), cardType];
      return {
        ...prev,
        [selectedPlayerId]: updatedCards,
      };
    });
    
    // Verificar expulsão após atualizar cartões (usar useEffect ou verificação imediata)
    const currentCards = [...(playerCards[selectedPlayerId] || []), cardType];
    const yellowCount = currentCards.filter(c => c === 'yellow').length;
    const hasSecondYellow = currentCards.some(c => c === 'secondYellow');
    const hasRed = currentCards.some(c => c === 'red');
    const isExpelled = yellowCount >= 2 || hasSecondYellow || hasRed;
    
    if (isExpelled) {
      // Remover jogador da escalação se estiver em quadra
      if (lineupPlayers.includes(selectedPlayerId)) {
        const newLineup = lineupPlayers.filter(id => id !== selectedPlayerId);
        setLineupPlayers(newLineup);
        setBenchPlayers(prev => [...prev, selectedPlayerId]);
        
        // Se goleiro foi expulso, atualizar currentGoalkeeperId
        if (selectedPlayerId === currentGoalkeeperId) {
          // Se ainda há jogadores em quadra, o primeiro vira goleiro
          if (newLineup.length > 0) {
            setCurrentGoalkeeperId(newLineup[0]);
          } else {
            setCurrentGoalkeeperId(null);
          }
        }
      }
      
      // Remover de activePlayers
      setActivePlayers(prev => prev.filter(p => String(p.id).trim() !== selectedPlayerId));
      
      // Mostrar alerta
      alert(`⚠️ ${player?.name || 'Jogador'} foi expulso e removido da partida.`);
    }
    
    setSelectedAction(null);
    setSelectedPlayerId(null); // Limpar seleção após registrar cartão
  };

  // Últimos 3 comandos para log
  const lastThreeEvents = useMemo(() => {
    return [...matchEvents].reverse().slice(0, 3).reverse();
  }, [matchEvents]);
  
  // Jogadores do banco ordenados por frequência de substituições
  const isBlockedByPenalty = !!penaltyStep;

  const sortedBenchPlayers = useMemo(() => {
    const frequency = loadSubstitutionFrequency();
    return [...benchPlayers].sort((a, b) => {
      const freqA = frequency[a] || 0;
      const freqB = frequency[b] || 0;
      return freqB - freqA; // Mais frequentes primeiro
    });
  }, [benchPlayers]);

  if (!isOpen) return null;

  const canEndTime = matchTime >= 20 * 60;

  return (
    <div className={`fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in overflow-hidden ${
      window.location.pathname === '/scout-realtime' ? 'p-0' : 'p-4'
    }`}>
      <div className={`w-full h-full bg-black flex flex-col relative overflow-hidden ${
        window.location.pathname === '/scout-realtime' ? '' : 'max-w-7xl rounded-3xl border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,1)]'
      }`}>
        
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
              {/* Contador de Faltas com alertas visuais */}
              <div className={`rounded-xl px-4 py-2 border-2 transition-all ${
                foulsCount >= 5
                  ? 'bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse'
                  : foulsCount >= 4
                  ? 'bg-orange-500/20 border-orange-300 shadow-[0_0_15px_rgba(251,146,60,0.4)]'
                  : foulsCount >= 3
                  ? 'bg-yellow-500/20 border-yellow-500'
                  : 'bg-orange-500/10 border-orange-500'
              }`}>
                <p className={`text-xs font-bold uppercase mb-1 ${
                  foulsCount >= 5 ? 'text-red-400' : foulsCount >= 4 ? 'text-orange-300' : foulsCount >= 3 ? 'text-yellow-400' : 'text-orange-400'
                }`}>Faltas</p>
                <p className={`text-2xl font-black text-center ${
                  foulsCount >= 5 ? 'text-red-400' : foulsCount >= 4 ? 'text-orange-300' : foulsCount >= 3 ? 'text-yellow-400' : 'text-orange-400'
                }`}>{Math.min(foulsCount, 5)}</p>
                {foulsCount >= 5 && (
                  <p className="text-red-400 text-[10px] font-bold uppercase mt-1">Tiro Livre</p>
                )}
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
              ) : showSubstitutions ? (
                // Modo Substituição: lista única com banco primeiro, depois quadra
                <>
                  <p className="text-zinc-400 text-xs font-bold uppercase mb-3 text-center">
                    {selectedPlayerId ? 'Selecione jogador do banco para entrar' : 'Clique no jogador em quadra para sair'}
                  </p>
                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {/* Jogadores do banco (primeiro) - ordenados por frequência */}
                    {sortedBenchPlayers.map((playerId) => {
                      const player = players.find(p => String(p.id).trim() === playerId);
                      if (!player) return null;
                      const frequency = loadSubstitutionFrequency();
                      const subCount = frequency[playerId] || 0;
                      return (
                        <button
                          key={playerId}
                          onClick={() => {
                            if (selectedPlayerId && lineupPlayers.includes(selectedPlayerId)) {
                              // Fazer substituição
                              const playerOutId = selectedPlayerId;
                              const playerInId = playerId;
                              
                              // Verificar se goleiro está saindo
                              const isGoalkeeperOut = playerOutId === currentGoalkeeperId;
                              
                              // Registrar substituição no histórico
                              const substitution = {
                                playerOutId,
                                playerInId,
                                time: matchTime,
                                period: currentPeriod,
                              };
                              setSubstitutionHistory(prev => [...prev, substitution]);
                              
                              // Atualizar contadores
                              setSubstitutionCounts(prev => ({
                                ...prev,
                                [playerOutId]: (prev[playerOutId] || 0) + 1,
                                [playerInId]: (prev[playerInId] || 0) + 1,
                              }));
                              
                              // Atualizar escalação
                              setLineupPlayers(prev => prev.map(id => id === playerOutId ? playerInId : id));
                              setBenchPlayers(prev => {
                                const newBench = [...prev.filter(id => id !== playerInId), playerOutId];
                                return newBench;
                              });
                              
                              // Se goleiro saiu, o jogador que entrou vira goleiro linha
                              if (isGoalkeeperOut) {
                                setCurrentGoalkeeperId(playerInId);
                              }
                              
                              // Limpar seleção e sair do modo substituição
                              setSelectedPlayerId(null);
                              setShowSubstitutions(false);
                            } else {
                              alert('Selecione primeiro um jogador em quadra para sair.');
                            }
                          }}
                          className={`w-full rounded-xl p-3 text-left transition-all ${
                            selectedPlayerId && lineupPlayers.includes(selectedPlayerId)
                              ? 'bg-green-500/20 border-2 border-green-500 hover:border-green-400'
                              : 'bg-green-500/10 border-2 border-green-500/50 hover:border-green-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-white font-bold text-sm">
                              {player.name} - {player.jerseyNumber}
                              {selectedPlayerId && lineupPlayers.includes(selectedPlayerId) && ' (ENTRANDO)'}
                            </p>
                            {subCount > 0 && (
                              <span className="text-green-400 text-[10px] font-bold bg-green-500/20 px-2 py-0.5 rounded">
                                {subCount}x
                              </span>
                            )}
                          </div>
                          <p className="text-zinc-500 text-[10px] mt-1">BANCO</p>
                        </button>
                      );
                    })}
                    
                    {/* Separador visual */}
                    {benchPlayers.length > 0 && lineupPlayers.length > 0 && (
                      <div className="border-t border-zinc-800 my-3">
                        <p className="text-zinc-600 text-xs font-bold uppercase text-center py-2">EM QUADRA</p>
                      </div>
                    )}
                    
                    {/* Jogadores em quadra (depois) */}
                    {lineupPlayers.map((playerId) => {
                      const player = players.find(p => String(p.id).trim() === playerId);
                      if (!player) return null;
                      const isGoalkeeper = playerId === currentGoalkeeperId;
                      return (
                        <button
                          key={playerId}
                          onClick={() => {
                            // Selecionar jogador para sair
                            setSelectedPlayerId(playerId);
                          }}
                          className={`w-full rounded-xl p-3 text-left transition-all ${
                            selectedPlayerId === playerId
                              ? 'bg-red-500/20 border-4 border-red-500'
                              : 'bg-zinc-900 border-2 border-zinc-700 hover:border-red-500'
                          }`}
                        >
                          <p className="text-white font-bold text-sm">
                            {isGoalkeeper && '🥅 '}{player.name} - {player.jerseyNumber}
                            {selectedPlayerId === playerId && ' (SAINDO)'}
                          </p>
                          <p className="text-zinc-500 text-[10px] mt-1">QUADRA</p>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      setShowSubstitutions(false);
                      setSelectedPlayerId(null);
                    }}
                    className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-700 text-white font-bold uppercase text-xs rounded-xl p-3 transition-colors"
                  >
                    Cancelar Substituição
                  </button>
                </>
              ) : activePlayers && activePlayers.length > 0 ? (
                activePlayers.map((player) => {
                  const isSelected = selectedPlayerId === String(player.id).trim();
                  const isGoalkeeper = String(player.id).trim() === currentGoalkeeperId;
                  return (
                    <button
                      key={player.id}
                      onClick={() => {
                        if (!isMatchStarted) return;
                        const clickedPlayerId = String(player.id).trim();
                        
                        // Se há passe pendente, completar o passe
                        if (pendingPassEventId && pendingPassSenderId && clickedPlayerId !== pendingPassSenderId) {
                          handleConfirmPassReceiver(clickedPlayerId);
                        } else {
                          // Seleção normal de jogador
                          setSelectedPlayerId(clickedPlayerId);
                          // Se havia passe pendente e clicou no mesmo jogador ou cancelou, limpar
                          if (pendingPassEventId) {
                            setMatchEvents(prev => prev.filter(e => e.id !== pendingPassEventId));
                            setPendingPassEventId(null);
                            setPendingPassSenderId(null);
                            setPendingPassResult(null);
                            setSelectedAction(null);
                          }
                        }
                      }}
                      disabled={!isMatchStarted}
                      className={`w-full rounded-xl p-3 text-left transition-all ${
                        !isMatchStarted
                          ? 'bg-zinc-800 border-2 border-zinc-700 text-zinc-600 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#00f0ff]/20 border-4 border-[#00f0ff]'
                          : pendingPassEventId && String(player.id).trim() !== pendingPassSenderId
                          ? 'bg-yellow-500/20 border-2 border-yellow-500 hover:border-yellow-400'
                          : 'bg-green-500/10 border-2 border-green-500 hover:border-green-400'
                      }`}
                    >
                      <p className="text-white font-bold text-sm">
                        {isGoalkeeper && '🥅 '}{player.name} - {player.jerseyNumber}
                        {pendingPassEventId && String(player.id).trim() !== pendingPassSenderId && ' (receber passe)'}
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
              onClick={() => {
                if (!isRunning) {
                  setShowSubstitutions(true);
                } else {
                  alert('Pare o cronômetro para fazer substituições.');
                }
              }}
              disabled={isRunning}
              className={`mt-4 w-full rounded-xl p-3 font-bold uppercase text-xs transition-colors flex items-center justify-center gap-2 ${
                isRunning
                  ? 'bg-zinc-800 border-2 border-zinc-700 text-zinc-600 cursor-not-allowed'
                  : 'bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500/30'
              }`}
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
              {/* Parte superior: zona reservada (min-height) para manter espaçamento ao abrir/fechar Cartão etc. */}
              <div className="min-h-[120px] mb-4 flex-shrink-0">
              {/* Opções para Passe - ACIMA dos botões */}
              {selectedAction === 'pass' && selectedPlayerId && (
                <div className="mb-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-xs mb-2 font-bold uppercase">Resultado do Passe</p>
                  <div className="grid grid-cols-2 gap-2">
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
                <div className="mb-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-xs mb-2 font-bold uppercase">Resultado do Chute</p>
                  <div className="grid grid-cols-2 gap-2">
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

              {/* Opções para Falta - mesmos inputs que lateral (Defesa/Ataque - Direita/Esquerda) */}
              {selectedAction === 'foul' && selectedPlayerId && (
                <div className="mb-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-xs mb-2 font-bold uppercase">Tipo de Falta</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleRegisterFoul('defesaDireita')}
                      className="px-4 py-3 bg-zinc-500/20 border-2 border-zinc-500 text-zinc-400 font-bold uppercase text-xs rounded-lg hover:bg-zinc-500/30 transition-colors"
                    >
                      Defesa - Direita
                    </button>
                    <button
                      onClick={() => handleRegisterFoul('defesaEsquerda')}
                      className="px-4 py-3 bg-zinc-500/20 border-2 border-zinc-500 text-zinc-400 font-bold uppercase text-xs rounded-lg hover:bg-zinc-500/30 transition-colors"
                    >
                      Defesa - Esquerda
                    </button>
                    <button
                      onClick={() => handleRegisterFoul('ataqueDireita')}
                      className="px-4 py-3 bg-green-500/20 border-2 border-green-500 text-green-400 font-bold uppercase text-xs rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      Ataque - Direita
                    </button>
                    <button
                      onClick={() => handleRegisterFoul('ataqueEsquerda')}
                      className="px-4 py-3 bg-green-500/20 border-2 border-green-500 text-green-400 font-bold uppercase text-xs rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      Ataque - Esquerda
                    </button>
                  </div>
                </div>
              )}

              {/* Opções para Cartão - inline (amarelo, 2º amarelo, vermelho) */}
              {selectedAction === 'card' && selectedPlayerId && (
                <div className="mb-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-xs mb-3 font-bold uppercase">Tipo de Cartão</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleRegisterCard('yellow')}
                      className="px-4 py-3 bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400 font-bold uppercase text-xs rounded-lg hover:bg-yellow-500/30 transition-colors"
                    >
                      Amarelo
                    </button>
                    <button
                      onClick={() => handleRegisterCard('secondYellow')}
                      className="px-4 py-3 bg-orange-500/20 border-2 border-orange-500 text-orange-400 font-bold uppercase text-xs rounded-lg hover:bg-orange-500/30 transition-colors"
                    >
                      2º Amarelo
                    </button>
                    <button
                      onClick={() => handleRegisterCard('red')}
                      className="px-4 py-3 bg-red-500/20 border-2 border-red-500 text-red-400 font-bold uppercase text-xs rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Vermelho
                    </button>
                  </div>
                </div>
              )}

              {/* Opções para Desarme - parte superior */}
              {selectedAction === 'tackle' && selectedPlayerId && (
                <div className="mb-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-xs mb-2 font-bold uppercase">Tipo de Desarme</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleRegisterTackle('withBall')}
                      className="px-4 py-3 bg-blue-500/20 border-2 border-blue-500 text-blue-400 font-bold uppercase text-xs rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      Com Posse
                    </button>
                    <button
                      onClick={() => handleRegisterTackle('withoutBall')}
                      className="px-4 py-3 bg-blue-500/20 border-2 border-blue-500 text-blue-400 font-bold uppercase text-xs rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      Sem Posse
                    </button>
                    <button
                      onClick={() => handleRegisterTackle('counter')}
                      className="px-4 py-3 bg-blue-500/20 border-2 border-blue-500 text-blue-400 font-bold uppercase text-xs rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      Contra-ataque
                    </button>
                  </div>
                </div>
              )}

              {/* Opções para Defesa - parte superior */}
              {selectedAction === 'save' && selectedPlayerId && selectedPlayerId === currentGoalkeeperId && (
                <div className="mb-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <button
                    onClick={handleRegisterSave}
                    className="w-full px-4 py-3 bg-purple-500/20 border-2 border-purple-500 text-purple-400 font-bold uppercase text-xs rounded-lg hover:bg-purple-500/30 transition-colors"
                  >
                    Registrar Defesa
                  </button>
                </div>
              )}

              {/* Opções para Bloqueio - parte superior */}
              {selectedAction === 'block' && selectedPlayerId && (
                <div className="mb-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <button
                    onClick={handleRegisterBlock}
                    className="w-full px-4 py-3 bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400 font-bold uppercase text-xs rounded-lg hover:bg-yellow-500/30 transition-colors"
                  >
                    Registrar Bloqueio
                  </button>
                </div>
              )}

              {/* Opções para Lateral - parte superior */}
              {selectedAction === 'lateral' && selectedPlayerId && (
                <div className="mb-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-xs mb-2 font-bold uppercase">Tipo de Lateral</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleRegisterLateral('defesaDireita')}
                      className="px-4 py-3 bg-zinc-500/20 border-2 border-zinc-500 text-zinc-400 font-bold uppercase text-xs rounded-lg hover:bg-zinc-500/30 transition-colors"
                    >
                      Defesa - Direita
                    </button>
                    <button
                      onClick={() => handleRegisterLateral('defesaEsquerda')}
                      className="px-4 py-3 bg-zinc-500/20 border-2 border-zinc-500 text-zinc-400 font-bold uppercase text-xs rounded-lg hover:bg-zinc-500/30 transition-colors"
                    >
                      Defesa - Esquerda
                    </button>
                    <button
                      onClick={() => handleRegisterLateral('ataqueDireita')}
                      className="px-4 py-3 bg-green-500/20 border-2 border-green-500 text-green-400 font-bold uppercase text-xs rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      Ataque - Direita
                    </button>
                    <button
                      onClick={() => handleRegisterLateral('ataqueEsquerda')}
                      className="px-4 py-3 bg-green-500/20 border-2 border-green-500 text-green-400 font-bold uppercase text-xs rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      Ataque - Esquerda
                    </button>
                  </div>
                </div>
              )}

              {/* Fluxo inline do Gol (equipe → autor → confirmar) */}
              {goalStep === 'team' && (
                <div className="mb-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-xs mb-3 font-bold uppercase">Qual equipe marcou?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setPendingGoalIsOpponent(false);
                        setGoalStep('author');
                      }}
                      className="px-4 py-3 bg-green-500/20 border-2 border-green-500 text-green-400 font-bold uppercase text-xs rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      Gol Nosso
                    </button>
                    <button
                      onClick={() => {
                        setPendingGoalIsOpponent(true);
                        setPendingGoalType('normal');
                        setGoalStep('confirm');
                      }}
                      className="px-4 py-3 bg-red-500/20 border-2 border-red-500 text-red-400 font-bold uppercase text-xs rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Gol Adversário
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setGoalStep(null);
                      setPendingGoalTime(null);
                    }}
                    className="mt-3 w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold uppercase text-xs rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
              {goalStep === 'author' && (
                <div className="mb-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-xs mb-3 font-bold uppercase">Autor do gol ou gol contra</p>
                  <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
                    {activePlayers && activePlayers.length > 0 ? (
                      activePlayers.map((player) => (
                        <button
                          key={player.id}
                          onClick={() => {
                            setPendingGoalPlayerId(String(player.id).trim());
                            setPendingGoalType('normal');
                            setGoalStep('confirm');
                          }}
                          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 text-white font-bold text-xs rounded-lg hover:border-green-500 hover:bg-green-500/10 transition-colors text-left"
                        >
                          #{player.jerseyNumber} {player.name}
                        </button>
                      ))
                    ) : (
                      <p className="text-zinc-500 text-xs text-center py-2">Nenhum jogador ativo</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setPendingGoalPlayerId(null);
                      setPendingGoalType('contra');
                      setGoalStep('confirm');
                    }}
                    className="w-full mb-2 px-4 py-3 bg-red-500/20 border-2 border-red-500 text-red-400 font-bold uppercase text-xs rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Gol Contra (Adversário Marcou)
                  </button>
                  <button
                    onClick={() => {
                      setGoalStep('team');
                      setPendingGoalPlayerId(null);
                      setPendingGoalType(null);
                    }}
                    className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold uppercase text-xs rounded-lg transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              )}
              {goalStep === 'confirm' && (
                <div className="mb-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-xs mb-3 font-bold uppercase">Confirmar gol</p>
                  <div className="space-y-2 mb-3 text-sm">
                    <p className="text-white">
                      <span className="text-zinc-500">Equipe:</span>{' '}
                      {pendingGoalIsOpponent ? 'Adversário' : 'Nossa equipe'}
                    </p>
                    {!pendingGoalIsOpponent && pendingGoalPlayerId && (
                      <p className="text-white">
                        <span className="text-zinc-500">Autor:</span>{' '}
                        {activePlayers.find(p => String(p.id).trim() === pendingGoalPlayerId)?.name || '-'}
                      </p>
                    )}
                    {pendingGoalType === 'contra' && (
                      <p className="text-red-400 font-bold">Gol contra</p>
                    )}
                    <p className="text-zinc-400 font-mono">
                      Tempo: {pendingGoalTime != null ? formatTime(pendingGoalTime) : '-'}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setGoalStep(null);
                        setPendingGoalType(null);
                        setPendingGoalIsOpponent(false);
                        setPendingGoalPlayerId(null);
                        setPendingGoalTime(null);
                      }}
                      className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-xs rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() =>
                        handleRegisterGoal(
                          pendingGoalType || 'normal',
                          pendingGoalIsOpponent,
                          pendingGoalPlayerId
                        )
                      }
                      className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-black uppercase text-xs rounded-lg transition-colors"
                    >
                      Confirmar Gol
                    </button>
                  </div>
                </div>
              )}

              {/* Fluxo inline - Tiro Livre */}
              {freeKickStep === 'team' && (
                <div className="mb-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-xs mb-3 font-bold uppercase">Tiro Livre - Qual equipe?</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <button
                      onClick={() => {
                        setPendingFreeKickTeam('for');
                        setFreeKickStep('kicker');
                      }}
                      className="px-4 py-3 bg-green-500/20 border-2 border-green-500 text-green-400 font-bold uppercase text-xs rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      A Favor (Nossa Equipe)
                    </button>
                    <button
                      onClick={() => {
                        setPendingFreeKickTeam('against');
                        setFreeKickStep('result');
                      }}
                      className="px-4 py-3 bg-red-500/20 border-2 border-red-500 text-red-400 font-bold uppercase text-xs rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Contra (Adversário)
                    </button>
                  </div>
                  <button
                    onClick={() => { setFreeKickStep(null); setPendingFreeKickTeam(null); }}
                    className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold uppercase text-xs rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
              {freeKickStep === 'kicker' && pendingFreeKickTeam === 'for' && (
                <div className="mb-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-xs mb-3 font-bold uppercase">Selecionar cobrador</p>
                  <div className="max-h-40 overflow-y-auto space-y-2 mb-3">
                    {activePlayers?.length ? activePlayers.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => {
                          setPendingFreeKickKickerId(String(player.id).trim());
                          setFreeKickStep('result');
                        }}
                        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 text-white font-bold text-xs rounded-lg hover:border-red-500 hover:bg-red-500/10 transition-colors text-left"
                      >
                        #{player.jerseyNumber} {player.name}
                      </button>
                    )) : (
                      <p className="text-zinc-500 text-xs text-center py-2">Nenhum jogador ativo</p>
                    )}
                  </div>
                  <button
                    onClick={() => { setFreeKickStep('team'); setPendingFreeKickKickerId(null); }}
                    className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold uppercase text-xs rounded-lg transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              )}
              {freeKickStep === 'result' && (
                <div className="mb-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-xs mb-3 font-bold uppercase">Resultado do Tiro Livre</p>
                  {pendingFreeKickTeam === 'for' ? (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <button onClick={() => handleRegisterFreeKick('for', pendingFreeKickKickerId, 'goal')} className="px-4 py-3 bg-green-500/20 border-2 border-green-500 text-green-400 font-bold uppercase text-xs rounded-lg hover:bg-green-500/30">Gol</button>
                      <button onClick={() => handleRegisterFreeKick('for', pendingFreeKickKickerId, 'saved')} className="px-4 py-3 bg-purple-500/20 border-2 border-purple-500 text-purple-400 font-bold uppercase text-xs rounded-lg hover:bg-purple-500/30">Defendido</button>
                      <button onClick={() => handleRegisterFreeKick('for', pendingFreeKickKickerId, 'outside')} className="px-4 py-3 bg-red-500/20 border-2 border-red-500 text-red-400 font-bold uppercase text-xs rounded-lg hover:bg-red-500/30">Pra Fora</button>
                      <button onClick={() => handleRegisterFreeKick('for', pendingFreeKickKickerId, 'post')} className="px-4 py-3 bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400 font-bold uppercase text-xs rounded-lg hover:bg-yellow-500/30">Trave</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <button onClick={() => handleRegisterFreeKick('against', null, 'goal')} className="px-4 py-3 bg-red-500/20 border-2 border-red-500 text-red-400 font-bold uppercase text-xs rounded-lg hover:bg-red-500/30">Gol Adversário</button>
                      <button onClick={() => handleRegisterFreeKick('against', null, 'saved')} className="px-4 py-3 bg-purple-500/20 border-2 border-purple-500 text-purple-400 font-bold uppercase text-xs rounded-lg hover:bg-purple-500/30">Defesa</button>
                      <button onClick={() => handleRegisterFreeKick('against', null, 'noGoal')} className="px-4 py-3 bg-zinc-500/20 border-2 border-zinc-500 text-zinc-400 font-bold uppercase text-xs rounded-lg hover:bg-zinc-500/30">Não Gol</button>
                    </div>
                  )}
                  <button
                    onClick={() => { setFreeKickStep(null); setPendingFreeKickTeam(null); setPendingFreeKickKickerId(null); }}
                    className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold uppercase text-xs rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {/* Fluxo inline - Pênalti */}
              {penaltyStep === 'team' && (
                <div className="mb-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-xs mb-3 font-bold uppercase">Pênalti - Qual equipe?</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <button
                      onClick={() => {
                        setPendingPenaltyTeam('for');
                        setPenaltyStep('kicker');
                      }}
                      className="px-4 py-3 bg-green-500/20 border-2 border-green-500 text-green-400 font-bold uppercase text-xs rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      A Favor (Nossa Equipe)
                    </button>
                    <button
                      onClick={() => {
                        setPendingPenaltyTeam('against');
                        setPenaltyStep('result');
                      }}
                      className="px-4 py-3 bg-red-500/20 border-2 border-red-500 text-red-400 font-bold uppercase text-xs rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Contra (Adversário)
                    </button>
                  </div>
                  <button
                    onClick={() => { setPenaltyStep(null); setPendingPenaltyTeam(null); }}
                    className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold uppercase text-xs rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
              {penaltyStep === 'kicker' && pendingPenaltyTeam === 'for' && (
                <div className="mb-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-xs mb-3 font-bold uppercase">Selecionar cobrador</p>
                  <div className="max-h-40 overflow-y-auto space-y-2 mb-3">
                    {activePlayers?.length ? activePlayers.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => {
                          setPendingPenaltyKickerId(String(player.id).trim());
                          setPenaltyStep('result');
                        }}
                        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 text-white font-bold text-xs rounded-lg hover:border-purple-500 hover:bg-purple-500/10 transition-colors text-left"
                      >
                        #{player.jerseyNumber} {player.name}
                      </button>
                    )) : (
                      <p className="text-zinc-500 text-xs text-center py-2">Nenhum jogador ativo</p>
                    )}
                  </div>
                  <button
                    onClick={() => { setPenaltyStep('team'); setPendingPenaltyKickerId(null); }}
                    className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold uppercase text-xs rounded-lg transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              )}
              {penaltyStep === 'result' && (
                <div className="mb-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-xs mb-3 font-bold uppercase">Resultado do Pênalti</p>
                  {pendingPenaltyTeam === 'for' ? (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <button onClick={() => handleRegisterPenalty('for', pendingPenaltyKickerId, 'goal')} className="px-4 py-3 bg-green-500/20 border-2 border-green-500 text-green-400 font-bold uppercase text-xs rounded-lg hover:bg-green-500/30">Gol</button>
                      <button onClick={() => handleRegisterPenalty('for', pendingPenaltyKickerId, 'saved')} className="px-4 py-3 bg-purple-500/20 border-2 border-purple-500 text-purple-400 font-bold uppercase text-xs rounded-lg hover:bg-purple-500/30">Defendido</button>
                      <button onClick={() => handleRegisterPenalty('for', pendingPenaltyKickerId, 'outside')} className="px-4 py-3 bg-red-500/20 border-2 border-red-500 text-red-400 font-bold uppercase text-xs rounded-lg hover:bg-red-500/30">Pra Fora</button>
                      <button onClick={() => handleRegisterPenalty('for', pendingPenaltyKickerId, 'post')} className="px-4 py-3 bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400 font-bold uppercase text-xs rounded-lg hover:bg-yellow-500/30">Trave</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <button onClick={() => handleRegisterPenalty('against', null, 'goal')} className="px-4 py-3 bg-red-500/20 border-2 border-red-500 text-red-400 font-bold uppercase text-xs rounded-lg hover:bg-red-500/30">Gol Adversário</button>
                      <button onClick={() => handleRegisterPenalty('against', null, 'saved')} className="px-4 py-3 bg-purple-500/20 border-2 border-purple-500 text-purple-400 font-bold uppercase text-xs rounded-lg hover:bg-purple-500/30">Defesa</button>
                      <button onClick={() => handleRegisterPenalty('against', null, 'noGoal')} className="px-4 py-3 bg-zinc-500/20 border-2 border-zinc-500 text-zinc-400 font-bold uppercase text-xs rounded-lg hover:bg-zinc-500/30">Não Gol</button>
                    </div>
                  )}
                  <button
                    onClick={() => { setPenaltyStep(null); setPendingPenaltyTeam(null); setPendingPenaltyKickerId(null); }}
                    className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold uppercase text-xs rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              </div>
              {/* Fim da parte superior reservada */}

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
                  {/* Botões de Estado: COM / SEM posse */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      onClick={() => setBallPossessionNow('com')}
                      disabled={isBlockedByPenalty}
                      className={`px-4 py-3 rounded-xl border-2 font-black uppercase text-xs transition-all ${
                        isBlockedByPenalty
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                          : ballPossessionNow === 'com'
                          ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      COM POSSE
                    </button>
                    <button
                      onClick={() => setBallPossessionNow('sem')}
                      disabled={isBlockedByPenalty}
                      className={`px-4 py-3 rounded-xl border-2 font-black uppercase text-xs transition-all ${
                        isBlockedByPenalty
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                          : ballPossessionNow === 'sem'
                          ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      SEM POSSE
                    </button>
                  </div>

                  {/* Layout com GOL Centralizado */}
                  <div className="relative flex flex-col items-center justify-center min-h-0 mb-4">
                    {/* Linha superior: FALTA/ESCANTEIO | GOL | PASSE/CHUTE ou DESARME/DEFESA */}
                    <div className="flex items-center justify-center gap-3 mb-3">
                      {/* Esquerda - Vertical */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            if (!selectedPlayerId || !isRunning || isBlockedByPenalty || foulsCount >= 5) return;
                            if (selectedAction !== 'foul') setIsRunning(false);
                            handleSelectAction('foul');
                          }}
                          disabled={!selectedPlayerId || !isRunning || isBlockedByPenalty || foulsCount >= 5}
                          className={`min-w-[100px] w-[100px] h-11 flex items-center justify-center rounded-xl border-2 font-bold uppercase text-xs transition-colors ${
                            !selectedPlayerId || !isRunning || isBlockedByPenalty || foulsCount >= 5
                              ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                              : selectedAction === 'foul'
                              ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                              : 'bg-zinc-900 border-orange-500/50 text-zinc-400 hover:border-orange-500'
                          }`}
                        >
                          FALTA
                        </button>
                        <button
                          onClick={() => {
                            if (!isMatchStarted) {
                              alert('A partida ainda não foi iniciada. Complete a escalação primeiro.');
                              return;
                            }
                            if (!isRunning) {
                              alert('O cronômetro está parado. Inicie o cronômetro para registrar ações.');
                              return;
                            }
                            if (!selectedPlayerId) {
                              alert('Por favor, selecione um jogador primeiro.');
                              return;
                            }
                            handleRegisterCorner();
                          }}
                          disabled={!selectedPlayerId || !isRunning || isBlockedByPenalty}
                          className={`min-w-[100px] w-[100px] h-11 flex items-center justify-center rounded-xl border-2 font-bold uppercase text-xs transition-colors ${
                            !selectedPlayerId || !isRunning || isBlockedByPenalty
                              ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                              : 'bg-cyan-500/20 border-cyan-500 text-cyan-400 hover:bg-cyan-500/30'
                          }`}
                        >
                          ESCANTEIO
                        </button>
                      </div>

                      {/* GOL - Centro */}
                      <button
                        onClick={() => {
                          if (!isMatchStarted) {
                            alert('A partida ainda não foi iniciada. Complete a escalação primeiro.');
                            return;
                          }
                          if (isBlockedByPenalty) return;
                          // Parar cronômetro e capturar tempo IMEDIATAMENTE; fluxo inline
                          setIsRunning(false);
                          setPendingGoalTime(matchTime);
                          setGoalStep('team');
                          setPendingGoalIsOpponent(false);
                          setPendingGoalType(null);
                          setPendingGoalPlayerId(null);
                        }}
                        disabled={!isMatchStarted || isBlockedByPenalty}
                        className={`px-8 py-6 rounded-full border-4 border-green-500 font-black uppercase text-lg transition-all flex items-center justify-center gap-2 ${
                          isMatchStarted && !isBlockedByPenalty
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border-zinc-700'
                        }`}
                      >
                        <Goal size={28} />
                        GOL
                      </button>

                      {/* Direita - Vertical: COM posse = PASSE/CHUTE; SEM posse = DESARME/DEFESA */}
                      <div className="flex flex-col gap-2">
                        {ballPossessionNow === 'com' ? (
                          <>
                            <button
                              onClick={() => handleSelectAction('pass')}
                              disabled={!selectedPlayerId || !isRunning || isBlockedByPenalty}
                              className={`min-w-[100px] w-[100px] h-11 flex items-center justify-center rounded-xl border-2 font-bold uppercase text-xs transition-colors ${
                                !selectedPlayerId || !isRunning || isBlockedByPenalty
                                  ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                                  : selectedAction === 'pass'
                                  ? 'bg-black border-zinc-600 text-white'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                              }`}
                            >
                              PASSE
                            </button>
                            <button
                              onClick={() => handleSelectAction('shot')}
                              disabled={!selectedPlayerId || !isRunning || isBlockedByPenalty}
                              className={`min-w-[100px] w-[100px] h-11 flex items-center justify-center rounded-xl border-2 font-bold uppercase text-xs transition-colors ${
                                !selectedPlayerId || !isRunning || isBlockedByPenalty
                                  ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                                  : selectedAction === 'shot'
                                  ? 'bg-red-500/20 border-red-500 text-red-400'
                                  : 'bg-zinc-900 border-red-500/50 text-zinc-400 hover:border-red-500'
                              }`}
                            >
                              CHUTE
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleSelectAction('tackle')}
                              disabled={!selectedPlayerId || !isRunning || isBlockedByPenalty}
                              className={`min-w-[100px] w-[100px] h-11 flex items-center justify-center rounded-xl border-2 font-bold uppercase text-xs transition-colors ${
                                !selectedPlayerId || !isRunning || isBlockedByPenalty
                                  ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                                  : selectedAction === 'tackle'
                                  ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                  : 'bg-zinc-900 border-blue-500/50 text-zinc-400 hover:border-blue-500'
                              }`}
                            >
                              DESARME
                            </button>
                            <button
                              onClick={() => handleSelectAction('save')}
                              disabled={!selectedPlayerId || selectedPlayerId !== currentGoalkeeperId || !isRunning || isBlockedByPenalty}
                              className={`min-w-[100px] w-[100px] h-11 flex items-center justify-center rounded-xl border-2 font-bold uppercase text-xs transition-colors ${
                                !selectedPlayerId || selectedPlayerId !== currentGoalkeeperId || !isRunning || isBlockedByPenalty
                                  ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                                  : selectedAction === 'save'
                                  ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                                  : 'bg-zinc-900 border-purple-500/50 text-zinc-400 hover:border-purple-500'
                              }`}
                            >
                              DEFESA
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Linha inferior: PÊNALTI, TIRO LIVRE, CARTÃO */}
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <button
                        onClick={() => {
                          if (!isRunning || isBlockedByPenalty) return;
                          setIsRunning(false);
                          setPenaltyStep('team');
                          setPendingPenaltyTeam(null);
                          setPendingPenaltyKickerId(null);
                          setSelectedAction(null);
                        }}
                        disabled={!isRunning || isBlockedByPenalty}
                        className={`min-w-[100px] w-[100px] h-11 flex items-center justify-center rounded-xl border-2 font-bold uppercase text-xs transition-colors ${
                          !isRunning || isBlockedByPenalty
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                            : penaltyStep ? 'bg-purple-500/30 border-purple-500 text-purple-400'
                            : 'bg-purple-500/20 border-purple-500 text-purple-400 hover:bg-purple-500/30'
                        }`}
                      >
                        PÊNALTI
                      </button>
                      <button
                        onClick={() => {
                          if (!isRunning || isBlockedByPenalty || foulsCount < 5) return;
                          setIsRunning(false);
                          setFreeKickStep('team');
                          setPendingFreeKickTeam(null);
                          setPendingFreeKickKickerId(null);
                          setSelectedAction(null);
                        }}
                        disabled={!isRunning || isBlockedByPenalty || foulsCount < 5}
                        className={`min-w-[100px] w-[100px] h-11 flex items-center justify-center rounded-xl border-2 font-bold uppercase text-xs transition-colors ${
                          !isRunning || isBlockedByPenalty || foulsCount < 5
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                            : freeKickStep ? 'bg-red-500/30 border-red-500 text-red-400'
                            : 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        }`}
                      >
                        TIRO LIVRE
                      </button>
                      <button
                        onClick={() => {
                          if (!isMatchStarted) {
                            alert('A partida ainda não foi iniciada. Complete a escalação primeiro.');
                            return;
                          }
                          if (!selectedPlayerId) {
                            alert('Por favor, selecione um jogador primeiro.');
                            return;
                          }
                          if (!isRunning || isBlockedByPenalty) return;
                          if (selectedAction !== 'lateral') setIsRunning(false);
                          setSelectedAction(selectedAction === 'lateral' ? null : 'lateral');
                        }}
                        disabled={!isMatchStarted || !selectedPlayerId || !isRunning || isBlockedByPenalty}
                        className={`min-w-[100px] w-[100px] h-11 flex items-center justify-center rounded-xl border-2 font-bold uppercase text-xs transition-colors ${
                          !isMatchStarted || !selectedPlayerId || !isRunning || isBlockedByPenalty
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                            : selectedAction === 'lateral'
                            ? 'bg-cyan-500/30 border-cyan-500 text-cyan-400'
                            : 'bg-cyan-500/20 border-cyan-500 text-cyan-400 hover:bg-cyan-500/30'
                        }`}
                      >
                        LATERAL
                      </button>
                      <button
                        onClick={() => {
                          if (!isMatchStarted) {
                            alert('A partida ainda não foi iniciada. Complete a escalação primeiro.');
                            return;
                          }
                          if (!selectedPlayerId) {
                            alert('Por favor, selecione um jogador primeiro.');
                            return;
                          }
                          if (isBlockedByPenalty) return;
                          setSelectedAction(selectedAction === 'card' ? null : 'card');
                        }}
                        disabled={!isMatchStarted || !selectedPlayerId || isBlockedByPenalty}
                        className={`min-w-[100px] w-[100px] h-11 flex items-center justify-center rounded-xl border-2 font-bold uppercase text-xs transition-colors ${
                          !isMatchStarted || !selectedPlayerId || isBlockedByPenalty
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                            : selectedAction === 'card'
                            ? 'bg-yellow-500/30 border-yellow-500 text-yellow-400'
                            : 'bg-yellow-500/20 border-yellow-500 text-yellow-400 hover:bg-yellow-500/30'
                        }`}
                      >
                        CARTÃO
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Log dos últimos 3 comandos - Parte inferior */}
        <div className="bg-zinc-950 border-t border-zinc-800 p-3">
          <div className="flex items-center gap-4 text-xs">
            <p className="text-zinc-500 font-bold uppercase min-w-[80px]">Últimos comandos:</p>
            <div className="flex-1 flex gap-3">
              {lastThreeEvents.length > 0 ? (
                lastThreeEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg"
                  >
                    <span className="text-zinc-400 font-mono">{formatTime(event.time)}</span>
                    <span className="text-zinc-300">|</span>
                    <span className="text-white font-bold">{event.playerName || 'N/A'}</span>
                    <span className="text-zinc-300">|</span>
                    <span className="text-[#00f0ff]">{event.tipo}</span>
                    {event.subtipo && (
                      <>
                        <span className="text-zinc-500">-</span>
                        <span className="text-zinc-400">{event.subtipo}</span>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-zinc-600 text-xs">Nenhum comando registrado ainda</p>
              )}
            </div>
          </div>
        </div>

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

        {/* Modal de Análise para Intervalo */}
        {showIntervalAnalysis && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <h3 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-3">
                  <Clock className="text-yellow-500" size={24} />
                  Análise para Intervalo - 1º Tempo
                </h3>
                <button
                  onClick={() => setShowIntervalAnalysis(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-zinc-500 hover:text-white" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-6">
                  {/* Placar */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                    <p className="text-zinc-400 text-xs font-bold uppercase mb-2">Placar</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 text-center">
                        <p className="text-zinc-500 text-xs mb-1">Nossa Equipe</p>
                        <p className="text-[#00f0ff] text-3xl font-black">{goalsFor}</p>
                      </div>
                      <span className="text-zinc-600 text-2xl font-black">x</span>
                      <div className="flex-1 text-center">
                        <p className="text-zinc-500 text-xs mb-1">Adversário</p>
                        <p className="text-red-400 text-3xl font-black">{goalsAgainst}</p>
                      </div>
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                      <p className="text-zinc-400 text-xs font-bold uppercase mb-2">Faltas</p>
                      <p className="text-orange-400 text-2xl font-black">{foulsCount}</p>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                      <p className="text-zinc-400 text-xs font-bold uppercase mb-2">Tempo</p>
                      <p className="text-red-400 text-2xl font-black font-mono">{formatTime(matchTime)}</p>
                    </div>
                  </div>

                  {/* Últimos eventos */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                    <p className="text-zinc-400 text-xs font-bold uppercase mb-3">Últimos eventos</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {matchEvents
                        .filter(e => e.period === '1T')
                        .slice(-10)
                        .reverse()
                        .map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center gap-3 px-3 py-2 bg-zinc-900 rounded-lg text-xs"
                          >
                            <span className="text-zinc-400 font-mono min-w-[50px]">{formatTime(event.time)}</span>
                            <span className="text-white font-bold">{event.playerName || 'N/A'}</span>
                            <span className="text-[#00f0ff]">{event.tipo}</span>
                            {event.subtipo && (
                              <>
                                <span className="text-zinc-500">-</span>
                                <span className="text-zinc-400">{event.subtipo}</span>
                              </>
                            )}
                          </div>
                        ))}
                      {matchEvents.filter(e => e.period === '1T').length === 0 && (
                        <p className="text-zinc-600 text-xs text-center py-4">Nenhum evento registrado</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  onClick={() => setShowIntervalAnalysis(false)}
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-sm rounded-xl transition-colors"
                >
                  Continuar Análise
                </button>
                <button
                  onClick={handleStartSecondHalf}
                  className="px-6 py-3 bg-[#00f0ff] hover:bg-[#00d9e6] text-black font-black uppercase text-sm rounded-xl transition-colors"
                >
                  Iniciar 2º Tempo
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
