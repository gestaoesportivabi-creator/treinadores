import React, { useState, useEffect, useMemo } from 'react';
import { Table, Printer, Plus, Trash2, Save, ChevronDown, ChevronUp, X, Minus, Clock, Goal, Shield, Zap, AlertTriangle, ArrowRightLeft, Target, Users, Activity, Gauge, Square, ArrowUpDown } from 'lucide-react';
import { MatchRecord, MatchStats, Player, PlayerTimeControl } from '../types';
import { timeControlsApi } from '../services/api';
import { TimeSelectionModal } from './TimeSelectionModal';

interface GoalTime {
    id: string;
    time: string;
    method: string; // Método do gol
}

interface GoalConceded {
    id: string;
    time: string;
    method: string; // Método do gol tomado
}

interface ScoutEntry {
    id: string;
    date: string;
    athleteId: string;
    athleteName: string;
    jerseyNumber: number | string;
    position: string;
    status: 'Ativo' | 'Suspenso' | 'Lesionado';
    goals: number;
    goalTimes: GoalTime[]; // Array para múltiplos gols
    assists: number;
    passesCorrect: number;
    passesWrong: number;
    shotsOn: number;
    shotsOff: number;
    tacklesPossession: number;
    tacklesNoPossession: number;
    tacklesCounter: number;
    transitionError: number;
    card: 'Nenhum' | 'Amarelo' | 'Vermelho' | 'Amarelo/Vermelho' | 'Amarelo/Amarelo/Vermelho';
    rpe: number;
}

// Lista de métodos de gol
const GOAL_METHODS = [
    'Contra Ataque',
    'Escanteio',
    'Penalti',
    'Falta',
    'Lateral',
    'Roubada de Bola 1 linha',
    'Bola Rolando'
];

// Gerar períodos de tempo de 00:00 a 40:00 em intervalos de 5 minutos (como faixas)
// Cada período representa uma faixa: "00:00 a 05:00", "05:00 a 10:00", etc.
// Mas salvamos apenas o tempo inicial para facilitar o processamento
interface TimePeriod {
    label: string; // Ex: "00:00 a 05:00"
    value: string; // Ex: "00:00" (tempo inicial para salvar)
}

const generateTimePeriods = (): TimePeriod[] => {
    const periods: TimePeriod[] = [];
    for (let minutes = 0; minutes < 40; minutes += 5) {
        const startTime = `${String(minutes).padStart(2, '0')}:00`;
        const endTime = `${String(minutes + 5).padStart(2, '0')}:00`;
        periods.push({
            label: `${startTime} a ${endTime}`,
            value: startTime // Salva o tempo inicial da faixa
        });
    }
    return periods;
};

const TIME_PERIODS = generateTimePeriods(); // [{label: "00:00 a 05:00", value: "00:00"}, ...]

// Campos de lesão removidos do Input de Dados - agora apenas na Gestão de Equipe

interface ChampionshipMatch {
    id: string;
    date: string;
    time: string;
    opponent: string;
    competition: string;
}

interface ScoutTableProps {
    onSave?: (match: MatchRecord) => void;
    players: Player[];
    competitions: string[];
    matches?: MatchRecord[]; // Partidas salvas
    initialData?: { date: string; opponent: string; competition: string }; // Dados iniciais da Tabela de Campeonato
    onInitialDataUsed?: () => void; // Callback quando dados iniciais forem usados
    championshipMatches?: ChampionshipMatch[]; // Partidas da tabela de campeonato
}

export const ScoutTable: React.FC<ScoutTableProps> = ({ onSave, players, competitions, matches = [], initialData, onInitialDataUsed, championshipMatches = [] }) => {
    // Debug: log initialData quando recebido
    useEffect(() => {
        if (initialData) {
            console.log('🔍 ScoutTable recebeu initialData:', initialData);
            console.log('🔍 Competition no initialData:', initialData?.competition);
        }
    }, [initialData]);
    
    // Estado para controlar quais partidas estão expandidas
    const [expandedMatches, setExpandedMatches] = useState<Set<string>>(new Set());
    const [isCreatingNew, setIsCreatingNew] = useState(true); // Começar criando nova partida
    
    // Header state for the Match Record - tudo neutro por padrão
    const [opponent, setOpponent] = useState('');
    const [competition, setCompetition] = useState(''); // Vazio por padrão
    const [location, setLocation] = useState(''); // Vazio por padrão (Mandante/Visitante/vazio)
    const [matchResult, setMatchResult] = useState<'Vitória' | 'Derrota' | 'Empate' | 'Sem informação'>('Sem informação');
    const [goalsConceded, setGoalsConceded] = useState<GoalConceded[]>([]); // Array de gols tomados com tempo e método
    const [goalsConcededSaved, setGoalsConcededSaved] = useState(false); // Flag para indicar se gols tomados foram salvos
    const [showGoalPeriodsList, setShowGoalPeriodsList] = useState(false); // Controlar exibição da lista de períodos de gol
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null); // Jogador selecionado para registrar estatísticas
    const [awaitingGoalPeriod, setAwaitingGoalPeriod] = useState<boolean>(false); // Controlar quando está aguardando seleção de período após clicar em GOL
    
    // Estados para Entradas e Saídas (TimeControl integrado)
    const [timeControls, setTimeControls] = useState<PlayerTimeControl[]>([]);
    const [isLoadingTimeControls, setIsLoadingTimeControls] = useState(false);
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [timeModalType, setTimeModalType] = useState<'entry' | 'exit'>('entry');
    const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);

    const [entries, setEntries] = useState<ScoutEntry[]>([
        {
            id: '1',
            date: new Date().toISOString().split('T')[0],
            athleteId: '',
            athleteName: '',
            jerseyNumber: '',
            position: '',
            status: 'Ativo',
            goals: 0,
            goalTimes: [],
            assists: 0,
            passesCorrect: 0,
            passesWrong: 0,
            shotsOn: 0,
            shotsOff: 0,
            tacklesPossession: 0,
            tacklesNoPossession: 0,
            tacklesCounter: 0,
            transitionError: 0,
            card: 'Nenhum',
            rpe: 5,
        }
    ]);

    // Carregar players quando a lista mudar (para incluir novos atletas)
    useEffect(() => {
        console.log('📋 Players atualizados no ScoutTable:', players.length, 'atletas');
        console.log('📋 IDs dos players:', players.map(p => ({ id: String(p.id).trim(), name: p.name })));
    }, [players]);

    // Auto-preenchimento: Trazer todos os atletas ativos quando não houver entries válidas (quando vem da gestão de equipe ou ao abrir a aba)
    useEffect(() => {
        // Só executar se não houver initialData (para não sobrescrever dados da tabela de campeonato)
        if (initialData) return;
        
        // Verificar se há entries válidas (com atleta selecionado)
        const hasValidEntries = entries.some(e => e.athleteId && e.athleteId.trim() !== '');
        
        // Se já tem entries válidas, não fazer nada
        if (hasValidEntries) return;
        
        // Se não tem players, não fazer nada
        if (!players || players.length === 0) return;
        
        // Obter jogadores ativos (não suspensos, não lesionados)
        const activePlayers = players.filter(p => {
            // Verificar se tem status e se está ativo
            if ((p as any).status) {
                return (p as any).status === 'Ativo';
            }
            // Se não tem status definido, considerar ativo
            return true;
        });
        
        // Se não há jogadores ativos, não fazer nada
        if (activePlayers.length === 0) return;
        
        // Criar entries para todos os jogadores ativos
        const currentDate = entries[0]?.date || new Date().toISOString().split('T')[0];
        const newEntries = activePlayers.map((player, index) => ({
            id: `${Date.now()}-${index}`,
            date: currentDate,
            athleteId: String(player.id).trim(),
            athleteName: player.name,
            jerseyNumber: player.jerseyNumber,
            position: player.position,
            status: 'Ativo' as const,
            goals: 0,
            goalTimes: [],
            assists: 0,
            passesCorrect: 0,
            passesWrong: 0,
            shotsOn: 0,
            shotsOff: 0,
            tacklesPossession: 0,
            tacklesNoPossession: 0,
            tacklesCounter: 0,
            transitionError: 0,
            card: 'Nenhum' as const,
            rpe: 5,
        }));
        
        // Só atualizar se realmente criou entries novas (mais que a entrada vazia inicial)
        if (newEntries.length > 0) {
            console.log('✅ Preenchendo automaticamente com', newEntries.length, 'atletas ativos da gestão de equipe');
            setEntries(newEntries);
        }
    }, [players, initialData]); // Dependências: players e initialData (não incluir entries para evitar loop)

    // Calcular resultado automaticamente baseado em gols feitos vs tomados
    useEffect(() => {
        const totalGoalsScored = entries.reduce((sum, entry) => sum + entry.goals, 0);
        const totalGoalsConceded = goalsConceded.length;
        
        if (totalGoalsScored > totalGoalsConceded) {
            setMatchResult('Vitória');
        } else if (totalGoalsConceded > totalGoalsScored) {
            setMatchResult('Derrota');
        } else {
            setMatchResult('Empate');
        }
    }, [entries.map(e => e.goals).join(','), goalsConceded.length]);

    // Preencher automaticamente quando initialData for fornecido (vindo da Tabela de Campeonato)
    useEffect(() => {
        if (initialData) {
            console.log('📋 initialData recebido:', initialData);
            console.log('📋 Competition no initialData:', initialData.competition);
            
            // Preencher dados do header - garantir que competition seja preenchida
            if (initialData.competition && initialData.competition.trim() !== '') {
                console.log('✅ Preenchendo competition:', initialData.competition);
                setCompetition(initialData.competition);
            } else {
                console.warn('⚠️ Competition não encontrada ou vazia no initialData');
            }
            
            if (initialData.opponent && initialData.opponent.trim() !== '') {
                setOpponent(initialData.opponent);
            }
            
            setLocation('Mandante'); // Padrão
            
            // Preencher data
            const formattedDate = initialData.date;
            
            // Obter jogadores ativos (não suspensos, não lesionados)
            const activePlayers = players.filter(p => {
                // Verificar se tem status e se está ativo
                if ((p as any).status) {
                    return (p as any).status === 'Ativo';
                }
                // Se não tem status definido, considerar ativo
                return true;
            });

            // Criar entries para todos os jogadores ativos
            const newEntries = activePlayers.map((player, index) => ({
                id: `${Date.now()}-${index}`,
                date: formattedDate,
                athleteId: String(player.id).trim(),
                athleteName: player.name,
                jerseyNumber: player.jerseyNumber,
                position: player.position,
                status: 'Ativo' as const,
                goals: 0,
                goalTimes: [],
                assists: 0,
                passesCorrect: 0,
                passesWrong: 0,
                shotsOn: 0,
                shotsOff: 0,
                tacklesPossession: 0,
                tacklesNoPossession: 0,
                tacklesCounter: 0,
                transitionError: 0,
                card: 'Nenhum' as const,
                rpe: 5,
            }));

            setEntries(newEntries);
            setIsCreatingNew(true); // Abrir formulário de criação
            
            // Notificar que os dados foram usados (após um pequeno delay para garantir que os estados foram atualizados)
            setTimeout(() => {
                if (onInitialDataUsed) {
                    onInitialDataUsed();
                }
            }, 100);
        }
    }, [initialData, players, onInitialDataUsed]);

    // Auto-preenchimento baseado na data atual: se a data do input corresponder a uma partida da tabela de campeonato
    useEffect(() => {
        // Só executar se não houver initialData (para não sobrescrever dados manualmente selecionados)
        if (initialData) return;
        
        // Só executar se não houver dados já preenchidos (opponent ou competition vazios indicam que não foi preenchido)
        if (opponent.trim() !== '' && competition.trim() !== '') return;
        
        if (!championshipMatches || championshipMatches.length === 0) return;
        if (entries.length === 0) return;
        
        const currentDate = entries[0].date; // Data atual do input
        if (!currentDate) return;
        
        // Função para normalizar datas (remover horário e comparar apenas data)
        const normalizeDate = (dateStr: string): string => {
            if (!dateStr) return '';
            // Se já está no formato YYYY-MM-DD, retorna diretamente
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                return dateStr;
            }
            // Tenta parsear como Date e retornar no formato YYYY-MM-DD
            try {
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) return '';
                return date.toISOString().split('T')[0];
            } catch {
                return '';
            }
        };
        
        const normalizedCurrentDate = normalizeDate(currentDate);
        if (!normalizedCurrentDate) return;
        
        // Procurar partida na tabela de campeonato com a mesma data
        const matchingMatch = championshipMatches.find(match => {
            const normalizedMatchDate = normalizeDate(match.date);
            return normalizedMatchDate === normalizedCurrentDate;
        });
        
        if (matchingMatch) {
            console.log('✅ Partida da tabela de campeonato encontrada para a data atual:', matchingMatch);
            console.log('📋 Competition da partida:', matchingMatch.competition);
            
            // Preencher dados automaticamente (garantir que competition seja preenchida sempre que houver)
            if (matchingMatch.competition && matchingMatch.competition.trim() !== '') {
                console.log('✅ Preenchendo competition automaticamente:', matchingMatch.competition);
                setCompetition(matchingMatch.competition);
            } else {
                console.warn('⚠️ Competition não encontrada ou vazia na partida:', matchingMatch);
            }
            
            // Preencher opponent apenas se não estiver preenchido
            if (matchingMatch.opponent && matchingMatch.opponent.trim() !== '' && opponent.trim() === '') {
                setOpponent(matchingMatch.opponent);
            }
            
            // Preencher location apenas se não estiver preenchido
            if (location.trim() === '') {
                setLocation('Mandante'); // Padrão apenas se location estiver vazio
            }
            
            // Preencher atletas ativos se ainda não houver entries válidas
            const hasValidEntries = entries.some(e => e.athleteId && e.athleteId.trim() !== '');
            if (!hasValidEntries && players.length > 0) {
                const activePlayers = players.filter(p => (p as any).status === 'Ativo');
                if (activePlayers.length > 0) {
                    const newEntries = activePlayers.map((player, index) => ({
                        id: `${Date.now()}-auto-${index}`,
                        date: normalizedCurrentDate,
                        athleteId: String(player.id).trim(),
                        athleteName: player.name,
                        jerseyNumber: player.jerseyNumber,
                        position: player.position,
                        status: 'Ativo' as const,
                        goals: 0,
                        goalTimes: [],
                        assists: 0,
                        passesCorrect: 0,
                        passesWrong: 0,
                        shotsOn: 0,
                        shotsOff: 0,
                        tacklesPossession: 0,
                        tacklesNoPossession: 0,
                        tacklesCounter: 0,
                        transitionError: 0,
                        card: 'Nenhum' as const,
                        rpe: 5,
                    }));
                    console.log('✅ Preenchendo automaticamente com', newEntries.length, 'atletas ativos da tabela de campeonato');
                    setEntries(newEntries);
                }
            }
        } else {
            console.log('ℹ️ Nenhuma partida encontrada na tabela de campeonato para a data:', normalizedCurrentDate);
        }
    }, [entries, championshipMatches, initialData, opponent, competition, location]);

    // Função para determinar o período do gol (1T ou 2T) baseado no minuto
    const getGoalPeriod = (timeString: string): string => {
        if (!timeString || timeString.trim() === '') return '-';
        
        const trimmedTime = timeString.trim();
        
        // Remover parênteses e período se já existir (ex: "12:43 (1T)" -> "12:43")
        const cleanTime = trimmedTime.replace(/\s*\([12]T\)/gi, '').trim();
        
        // Formato esperado: "MM:SS" ou "M:SS" ou apenas número "MM"
        const timeParts = cleanTime.split(':');
        let minutes = 0;
        
        if (timeParts.length === 2) {
            // Formato "MM:SS" ou "M:SS"
            minutes = parseInt(timeParts[0]) || 0;
        } else if (timeParts.length === 1) {
            // Formato apenas número (minutos)
            minutes = parseInt(timeParts[0]) || 0;
        }
        
        // Em futsal: 1T = 0-20min, 2T = 21-40min
        // Se o minuto for > 0 e <= 20, é 1T; se for > 20 e <= 40, é 2T
        if (minutes > 0 && minutes <= 20) {
            return `${cleanTime} (1T)`;
        } else if (minutes > 20 && minutes <= 40) {
            return `${cleanTime} (2T)`;
        } else if (minutes === 0) {
            // Se for 0, não sabemos o período ainda
            return cleanTime;
        } else {
            // Se passar de 40min, pode ser prorrogação ou erro de digitação
            return `${cleanTime} (ET)`;
        }
    };

    const handlePlayerSelect = (index: number, playerId: string) => {
        console.log('🔍 handlePlayerSelect chamado:', { index, playerId, totalPlayers: players.length });
        
        if (!playerId || playerId === '' || playerId === 'Selecione...') {
            // Se seleção foi limpa, resetar campos
            console.log('🔄 Limpando seleção do atleta');
            const newEntries = [...entries];
            newEntries[index] = {
                ...newEntries[index],
                athleteId: '',
                athleteName: '',
                jerseyNumber: '',
                position: ''
            };
            setEntries(newEntries);
            return;
        }

        // Normalizar IDs para comparação (remover espaços e converter para string)
        const normalizedPlayerId = String(playerId).trim();
        
        console.log('🔍 Buscando atleta com ID normalizado:', normalizedPlayerId);
        console.log('📋 Lista de players disponíveis:', players.map(p => ({ 
            id: p.id, 
            idType: typeof p.id, 
            idString: String(p.id).trim(),
            name: p.name 
        })));
        
        // Tentar encontrar o player de várias formas
        let player = players.find(p => {
            const pId = String(p.id).trim();
            const normalized = normalizedPlayerId;
            const match = pId === normalized;
            if (match) {
                console.log('✅ Match encontrado!', { playerId: p.id, normalized: pId, selected: normalized });
            }
            return match;
        });
        
        // Se não encontrou por comparação exata, tentar comparação mais flexível
        if (!player) {
            console.log('⚠️ Não encontrado por comparação exata, tentando comparação flexível...');
            player = players.find(p => {
                const pId = String(p.id).trim();
                const normalized = normalizedPlayerId;
                // Tentar comparar como número também
                const asNumber = !isNaN(Number(pId)) && !isNaN(Number(normalized));
                if (asNumber) {
                    return Number(pId) === Number(normalized);
                }
                return false;
            });
        }
        
        // Se ainda não encontrou, tentar por nome (caso o ID esteja errado mas o nome esteja correto)
        if (!player) {
            console.log('⚠️ Não encontrado por ID, tentando por nome...');
            const selectElement = document.querySelector(`select[data-entry-index="${index}"]`) as HTMLSelectElement;
            if (selectElement) {
                const selectedOption = selectElement.options[selectElement.selectedIndex];
                const playerName = selectedOption.text;
                console.log('🔍 Tentando encontrar por nome:', playerName);
                player = players.find(p => p.name === playerName);
            }
        }
        
        const newEntries = [...entries];
        
        console.log('📊 Resultado da busca:', {
            selectedId: normalizedPlayerId,
            found: player ? {
                id: player.id,
                name: player.name,
                jerseyNumber: player.jerseyNumber
            } : null,
            totalPlayers: players.length
        });
        
        if (player) {
            const finalId = String(player.id).trim();
            newEntries[index] = {
                ...newEntries[index],
                athleteId: finalId, // Garantir que o ID seja string normalizado
                athleteName: player.name,
                jerseyNumber: player.jerseyNumber,
                position: player.position
            };
            console.log('✅ Atleta selecionado com sucesso!', {
                id: finalId,
                name: player.name,
                jerseyNumber: player.jerseyNumber,
                position: player.position
            });
        } else {
            console.error('❌ ERRO: Atleta não encontrado!', {
                searchedId: normalizedPlayerId,
                availableIds: players.map(p => String(p.id).trim()),
                availableNames: players.map(p => p.name)
            });
            alert(`Erro: Atleta não encontrado no sistema.\n\nID procurado: "${normalizedPlayerId}"\n\nPor favor, verifique se o atleta está cadastrado corretamente.`);
            // Limpar seleção inválida
            newEntries[index] = {
                ...newEntries[index],
                athleteId: '',
                athleteName: '',
                jerseyNumber: '',
                position: ''
            };
        }
        setEntries(newEntries);
    };

    const updateEntry = (index: number, field: keyof ScoutEntry, value: any) => {
        const newEntries = [...entries];
        newEntries[index] = { ...newEntries[index], [field]: value };
        setEntries(newEntries);
    };

    // Funções helper para incrementar/decrementar estatísticas rapidamente (uso em tempo real)
    const incrementStat = (index: number, field: keyof ScoutEntry, max: number = 100) => {
        const newEntries = [...entries];
        const currentValue = (newEntries[index][field] as number) || 0;
        // RPE tem limite máximo de 10
        const maxValue = field === 'rpe' ? 10 : max;
        if (currentValue < maxValue) {
            newEntries[index] = { ...newEntries[index], [field]: currentValue + 1 };
            setEntries(newEntries);
        }
    };

    const decrementStat = (index: number, field: keyof ScoutEntry, min: number = 0) => {
        const newEntries = [...entries];
        const currentValue = (newEntries[index][field] as number) || 0;
        if (currentValue > min) {
            newEntries[index] = { ...newEntries[index], [field]: currentValue - 1 };
            setEntries(newEntries);
        }
    };

    // Função para registrar estatística via botão (método dinâmico)
    const handleStatButtonClick = (statField: keyof ScoutEntry) => {
        if (!selectedPlayerId) {
            alert('Selecione um jogador primeiro clicando na foto!');
            return;
        }

        // Caso especial: GOL requer seleção de período
        if (statField === 'goals') {
            setAwaitingGoalPeriod(true);
            return; // Não incrementa ainda, aguarda seleção de período
        }

        // Encontrar o índice do entry correspondente ao jogador selecionado
        let entryIndex = entries.findIndex(e => String(e.athleteId).trim() === String(selectedPlayerId).trim());
        
        if (entryIndex === -1) {
            // Se não encontrar, criar um novo entry
            const player = players.find(p => String(p.id).trim() === String(selectedPlayerId).trim());
            if (!player) return;

            const newEntry: ScoutEntry = {
                id: Date.now().toString(),
                date: entries[0]?.date || new Date().toISOString().split('T')[0],
                athleteId: String(player.id).trim(),
                athleteName: player.name,
                jerseyNumber: player.jerseyNumber,
                position: player.position,
                status: 'Ativo',
                goals: 0,
                goalTimes: [],
                assists: 0,
                passesCorrect: 0,
                passesWrong: 0,
                shotsOn: 0,
                shotsOff: 0,
                tacklesPossession: 0,
                tacklesNoPossession: 0,
                tacklesCounter: 0,
                transitionError: 0,
                card: 'Nenhum',
                rpe: 5,
            };
            // Para RPE, valor inicial é 5, para outras estatísticas é 1
            newEntry[statField] = (statField === 'rpe' ? 5 : 1) as any;
            setEntries([...entries, newEntry]);
        } else {
            // Incrementar a estatística do jogador selecionado
            incrementStat(entryIndex, statField);
        }
    };

    // Função para decrementar estatística específica
    const handleStatButtonDecrement = (statField: keyof ScoutEntry) => {
        if (!selectedPlayerId) {
            return;
        }

        // Encontrar o índice do entry correspondente ao jogador selecionado
        const entryIndex = entries.findIndex(e => String(e.athleteId).trim() === String(selectedPlayerId).trim());
        
        if (entryIndex === -1) return;

        // Decrementar a estatística específica
        decrementStat(entryIndex, statField);
    };

    // Função para registrar cartão (amarelo ou vermelho)
    const handleCardClick = (cardType: 'Amarelo' | 'Vermelho') => {
        if (!selectedPlayerId) {
            alert('Selecione um jogador primeiro clicando na foto!');
            return;
        }

        // Encontrar o índice do entry correspondente ao jogador selecionado
        let entryIndex = entries.findIndex(e => String(e.athleteId).trim() === String(selectedPlayerId).trim());
        
        if (entryIndex === -1) {
            // Se não encontrar, criar um novo entry
            const player = players.find(p => String(p.id).trim() === String(selectedPlayerId).trim());
            if (!player) return;

            const newEntry: ScoutEntry = {
                id: Date.now().toString(),
                date: entries[0]?.date || new Date().toISOString().split('T')[0],
                athleteId: String(player.id).trim(),
                athleteName: player.name,
                jerseyNumber: player.jerseyNumber,
                position: player.position,
                status: 'Ativo',
                goals: 0,
                goalTimes: [],
                assists: 0,
                passesCorrect: 0,
                passesWrong: 0,
                shotsOn: 0,
                shotsOff: 0,
                tacklesPossession: 0,
                tacklesNoPossession: 0,
                tacklesCounter: 0,
                transitionError: 0,
                card: cardType,
                rpe: 5,
            };
            setEntries([...entries, newEntry]);
        } else {
            // Atualizar cartão do jogador selecionado
            const newEntries = [...entries];
            const currentCard = newEntries[entryIndex].card;
            
            // Lógica de cartões: Nenhum -> Amarelo -> Amarelo/Vermelho -> Vermelho
            if (cardType === 'Amarelo') {
                if (currentCard === 'Nenhum') {
                    newEntries[entryIndex].card = 'Amarelo';
                } else if (currentCard === 'Amarelo') {
                    newEntries[entryIndex].card = 'Amarelo/Amarelo/Vermelho';
                } else if (currentCard === 'Amarelo/Vermelho') {
                    // Já tem amarelo/vermelho, não muda
                } else {
                    newEntries[entryIndex].card = 'Amarelo';
                }
            } else if (cardType === 'Vermelho') {
                if (currentCard === 'Nenhum') {
                    newEntries[entryIndex].card = 'Vermelho';
                } else if (currentCard === 'Amarelo') {
                    newEntries[entryIndex].card = 'Amarelo/Vermelho';
                } else {
                    newEntries[entryIndex].card = 'Vermelho';
                }
            }
            
            setEntries(newEntries);
        }
    };

    // Função para registrar gol com período selecionado
    const handleGoalWithPeriod = (periodValue: string) => {
        if (!selectedPlayerId) return;

        // Encontrar o índice do entry correspondente ao jogador selecionado
        let entryIndex = entries.findIndex(e => String(e.athleteId).trim() === String(selectedPlayerId).trim());
        
        if (entryIndex === -1) {
            // Se não encontrar, criar um novo entry
            const player = players.find(p => String(p.id).trim() === String(selectedPlayerId).trim());
            if (!player) return;

            const newEntry: ScoutEntry = {
                id: Date.now().toString(),
                date: entries[0]?.date || new Date().toISOString().split('T')[0],
                athleteId: String(player.id).trim(),
                athleteName: player.name,
                jerseyNumber: player.jerseyNumber,
                position: player.position,
                status: 'Ativo',
                goals: 1,
                goalTimes: [{
                    id: Date.now().toString(),
                    time: periodValue,
                    method: ''
                }],
                assists: 0,
                passesCorrect: 0,
                passesWrong: 0,
                shotsOn: 0,
                shotsOff: 0,
                tacklesPossession: 0,
                tacklesNoPossession: 0,
                tacklesCounter: 0,
                transitionError: 0,
                card: 'Nenhum',
                rpe: 5,
            };
            setEntries([...entries, newEntry]);
        } else {
            // Adicionar gol com período ao entry existente
            const newEntries = [...entries];
            const newGoalTime: GoalTime = {
                id: Date.now().toString(),
                time: periodValue,
                method: ''
            };
            newEntries[entryIndex].goalTimes = [...newEntries[entryIndex].goalTimes, newGoalTime];
            newEntries[entryIndex].goals = newEntries[entryIndex].goalTimes.length;
            setEntries(newEntries);
        }

        // Voltar ao estado normal após registrar
        setAwaitingGoalPeriod(false);
    };

    const addGoalTime = (index: number) => {
        const newEntries = [...entries];
        const newGoalTime: GoalTime = {
            id: Date.now().toString(),
            time: '',
            method: ''
        };
        newEntries[index].goalTimes = [...newEntries[index].goalTimes, newGoalTime];
        // Atualizar contador de gols
        newEntries[index].goals = newEntries[index].goalTimes.length;
        setEntries(newEntries);
    };

    const removeGoalTime = (entryIndex: number, goalTimeId: string) => {
        const newEntries = [...entries];
        newEntries[entryIndex].goalTimes = newEntries[entryIndex].goalTimes.filter(gt => gt.id !== goalTimeId);
        // Atualizar contador de gols
        newEntries[entryIndex].goals = newEntries[entryIndex].goalTimes.length;
        setEntries(newEntries);
    };

    const updateGoalTime = (entryIndex: number, goalTimeId: string, time: string) => {
        const newEntries = [...entries];
        const goalTime = newEntries[entryIndex].goalTimes.find(gt => gt.id === goalTimeId);
        if (goalTime) {
            goalTime.time = time;
            setEntries(newEntries);
        }
    };

    const updateGoalMethod = (entryIndex: number, goalTimeId: string, method: string) => {
        const newEntries = [...entries];
        const goalTime = newEntries[entryIndex].goalTimes.find(gt => gt.id === goalTimeId);
        if (goalTime) {
            goalTime.method = method;
            setEntries(newEntries);
        }
    };

    const addGoalConceded = () => {
        const newGoalConceded: GoalConceded = {
            id: Date.now().toString() + Math.random(),
            time: '',
            method: ''
        };
        setGoalsConceded([...goalsConceded, newGoalConceded]);
        // Resetar flag quando novo gol é adicionado
        setGoalsConcededSaved(false);
    };

    const removeGoalConceded = (goalConcededId: string) => {
        const newGoalsConceded = goalsConceded.filter(gc => gc.id !== goalConcededId);
        setGoalsConceded(newGoalsConceded);
        // Resetar flag quando gol é removido
        setGoalsConcededSaved(false);
    };

    const updateGoalConcededTime = (goalConcededId: string, time: string) => {
        const newGoalsConceded = goalsConceded.map(gc => 
            gc.id === goalConcededId ? { ...gc, time } : gc
        );
        setGoalsConceded(newGoalsConceded);
        // Resetar flag quando tempo é alterado
        if (goalsConcededSaved) {
            setGoalsConcededSaved(false);
        }
    };

    const updateGoalConcededMethod = (goalConcededId: string, method: string) => {
        const newGoalsConceded = goalsConceded.map(gc => 
            gc.id === goalConcededId ? { ...gc, method } : gc
        );
        setGoalsConceded(newGoalsConceded);
        // Resetar flag quando método é alterado
        if (goalsConcededSaved) {
            setGoalsConcededSaved(false);
        }
    };

    const handleSaveGoalsConceded = () => {
        // Validar que pelo menos um gol tomado tem tempo preenchido
        const hasValidGoals = goalsConceded.some(gc => gc.time && gc.time.trim() !== '');
        
        if (goalsConceded.length > 0 && !hasValidGoals) {
            alert("Por favor, preencha pelo menos o minuto de um gol tomado antes de salvar.");
            return;
        }

        // Validar que todos os gols com tempo têm método
        const goalsWithoutMethod = goalsConceded.filter(gc => gc.time && gc.time.trim() !== '' && (!gc.method || gc.method.trim() === ''));
        if (goalsWithoutMethod.length > 0) {
            const confirmSave = confirm(`${goalsWithoutMethod.length} gol(is) tomado(s) não tem método selecionado. Deseja salvar mesmo assim?`);
            if (!confirmSave) {
                return;
            }
        }

        setGoalsConcededSaved(true);
        alert(`✅ ${goalsConceded.length} gol(is) tomado(s) salvo(s) com sucesso! Agora você pode salvar a partida completa.`);
    };

    // Funções para gerenciar Entradas e Saídas (TimeControl)
    const loadTimeControls = async (matchId: string) => {
        if (!matchId) return;
        try {
            setIsLoadingTimeControls(true);
            const existing = await timeControlsApi.getByMatchId(matchId);
            setTimeControls(existing);
            setCurrentMatchId(matchId);
        } catch (error) {
            console.error('Erro ao carregar controles de tempo:', error);
            setTimeControls([]);
        } finally {
            setIsLoadingTimeControls(false);
        }
    };

    const handleTimeModalConfirm = (minute: number, second: number) => {
        if (!selectedPlayerId || !currentMatchId) return;
        
        const timeString = `${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
        
        setTimeControls(prev => {
            const existing = prev.find(tc => tc.playerId === selectedPlayerId && tc.matchId === currentMatchId);
            
            if (existing) {
                // Atualizar time control existente
                const updated = { ...existing };
                if (timeModalType === 'entry') {
                    // Adicionar nova entrada
                    const lastEntry = updated.timeEntries[updated.timeEntries.length - 1];
                    if (lastEntry && !lastEntry.entryTime) {
                        // Preencher entrada vazia
                        lastEntry.entryTime = timeString;
                    } else {
                        // Adicionar nova entrada
                        updated.timeEntries.push({ entryTime: timeString, exitTime: undefined });
                    }
                } else {
                    // Adicionar saída na última entrada sem saída
                    const lastEntry = updated.timeEntries[updated.timeEntries.length - 1];
                    if (lastEntry && lastEntry.entryTime && !lastEntry.exitTime) {
                        lastEntry.exitTime = timeString;
                    }
                }
                return prev.map(tc => tc.id === existing.id ? updated : tc);
            } else {
                // Criar novo time control
                const player = players.find(p => String(p.id).trim() === selectedPlayerId);
                if (!player) return prev;
                
                const newTimeControl: PlayerTimeControl = {
                    id: `${currentMatchId}-${selectedPlayerId}`,
                    matchId: currentMatchId,
                    playerId: selectedPlayerId,
                    timeEntries: timeModalType === 'entry' 
                        ? [{ entryTime: timeString, exitTime: undefined }]
                        : [{ entryTime: '', exitTime: timeString }],
                    totalTime: 0
                };
                return [...prev, newTimeControl];
            }
        });
    };

    const handleSaveTimeControls = async () => {
        if (!currentMatchId || timeControls.length === 0) {
            alert('Nenhum controle de tempo para salvar.');
            return;
        }

        try {
            await timeControlsApi.saveForMatch(currentMatchId, timeControls);
            alert(`✅ ${timeControls.length} controle(s) de tempo salvo(s) com sucesso!`);
        } catch (error) {
            console.error('Erro ao salvar controles de tempo:', error);
            alert('❌ Erro ao salvar controles de tempo. Verifique o console.');
        }
    };

    const handleEntryButtonClick = () => {
        if (!selectedPlayerId) {
            alert('Selecione um jogador primeiro.');
            return;
        }
        if (!currentMatchId) {
            alert('Salve a partida primeiro para registrar entradas e saídas.');
            return;
        }
        setTimeModalType('entry');
        setShowTimeModal(true);
    };

    const handleExitButtonClick = () => {
        if (!selectedPlayerId) {
            alert('Selecione um jogador primeiro.');
            return;
        }
        if (!currentMatchId) {
            alert('Salve a partida primeiro para registrar entradas e saídas.');
            return;
        }
        setTimeModalType('exit');
        setShowTimeModal(true);
    };

    // Carregar time controls quando uma partida é selecionada ou salva
    useEffect(() => {
        if (matches && matches.length > 0 && !currentMatchId) {
            // Carregar time controls da partida mais recente
            const latestMatch = matches[matches.length - 1];
            loadTimeControls(latestMatch.id);
        }
    }, [matches]);

    const addRow = () => {
        const lastEntry = entries[entries.length - 1];
        setEntries([...entries, { 
            ...lastEntry, 
            id: Date.now().toString(), 
            athleteId: '', 
            athleteName: '', 
            jerseyNumber: '', 
            position: '', 
            goals: 0, 
            goalTimes: [],
            assists: 0, 
            passesCorrect: 0, 
            passesWrong: 0, 
            shotsOn: 0, 
            shotsOff: 0, 
            tacklesPossession: 0, 
            tacklesNoPossession: 0, 
            tacklesCounter: 0, 
            transitionError: 0, 
            card: 'Nenhum', 
            rpe: 5
        }]);
    };

    const removeRow = (index: number) => {
        if (entries.length > 1) {
            setEntries(entries.filter((_, i) => i !== index));
        }
    };

    const toggleMatchExpanded = (matchId: string) => {
        setExpandedMatches(prev => {
            const newSet = new Set(prev);
            if (newSet.has(matchId)) {
                newSet.delete(matchId);
            } else {
                newSet.add(matchId);
            }
            return newSet;
        });
    };

    const handleNewMatch = () => {
        setIsCreatingNew(true);
        setExpandedMatches(new Set());
        // Reset form
        setOpponent('');
        setCompetition('');
        setLocation('');
        setMatchResult('Sem informação');
        setGoalsConceded([]);
        setGoalsConcededSaved(false);
        setEntries([{
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            athleteId: '',
            athleteName: '',
            jerseyNumber: '',
            position: '',
            status: 'Ativo',
            goals: 0,
            goalTimes: [],
            assists: 0,
            passesCorrect: 0,
            passesWrong: 0,
            shotsOn: 0,
            shotsOff: 0,
            tacklesPossession: 0,
            tacklesNoPossession: 0,
            tacklesCounter: 0,
            transitionError: 0,
            card: 'Nenhum',
            rpe: 5,
        }]);
    };

    const handleSave = () => {
        if (!opponent) {
            alert("Por favor, informe o adversário.");
            return;
        }

        if (!competition) {
            alert("Por favor, selecione a competição.");
            return;
        }

        if (!location) {
            alert("Por favor, selecione o local (Mandante/Visitante).");
            return;
        }

        // Validar que há pelo menos um atleta válido (com ID E nome)
        const hasValidEntries = entries.some(entry => 
            entry.athleteId && entry.athleteId.trim() !== '' && 
            entry.athleteName && entry.athleteName.trim() !== ''
        );
        if (!hasValidEntries) {
            alert("Por favor, selecione pelo menos um atleta válido antes de salvar.");
            return;
        }

        // Validar que gols tomados foram salvos (se houver gols tomados)
        if (goalsConceded.length > 0 && !goalsConcededSaved) {
            alert("Por favor, clique em 'Salvar Gols Tomados' antes de salvar a partida completa.");
            return;
        }

        if (!onSave) {
            console.error('❌ Erro: onSave não está definido');
            alert("Erro: Função de salvamento não disponível. Recarregue a página.");
            return;
        }

        // Aggregate Team Stats
        const teamStats: MatchStats = entries.reduce((acc, entry) => {
            acc.goals += entry.goals;
            acc.assists += entry.assists;
            acc.passesCorrect += entry.passesCorrect;
            acc.passesWrong += entry.passesWrong;
            acc.shotsOnTarget += entry.shotsOn;
            acc.shotsOffTarget += entry.shotsOff;
            acc.tacklesWithBall += entry.tacklesPossession;
            acc.tacklesWithoutBall += entry.tacklesNoPossession;
            acc.tacklesCounterAttack += entry.tacklesCounter;
            acc.wrongPassesTransition += entry.transitionError;
            
            // Cards logic
            if (entry.card !== 'Nenhum') {
                if (entry.card.includes('Amarelo')) acc.yellowCards++;
                if (entry.card.includes('Vermelho')) acc.redCards++;
            }
            
            // Accumulate RPE for average
            acc.rpeMatch += entry.rpe;

            return acc;
        }, {
            minutesPlayed: 40,
            goals: 0, goalsConceded: goalsConceded.length, assists: 0,
            yellowCards: 0, redCards: 0,
            passesCorrect: 0, passesWrong: 0, wrongPassesTransition: 0,
            tacklesWithBall: 0, tacklesCounterAttack: 0, tacklesWithoutBall: 0,
            shotsOnTarget: 0, shotsOffTarget: 0,
            rpeMatch: 0,
            goalsScoredOpenPlay: 0, goalsScoredSetPiece: 0,
            goalsConcededOpenPlay: 0, goalsConcededSetPiece: 0
        });

        // Finalize averages
        teamStats.rpeMatch = parseFloat((teamStats.rpeMatch / entries.length).toFixed(1));
        
        // Processar métodos dos gols feitos
        const goalMethodsScored: Record<string, number> = {};
        entries.forEach(entry => {
            entry.goalTimes.forEach(goalTime => {
                if (goalTime.method && goalTime.method.trim() !== '') {
                    goalMethodsScored[goalTime.method] = (goalMethodsScored[goalTime.method] || 0) + 1;
                }
            });
        });
        teamStats.goalMethodsScored = goalMethodsScored;
        
        // Processar métodos dos gols tomados
        const goalMethodsConceded: Record<string, number> = {};
        goalsConceded.forEach(goalConceded => {
            if (goalConceded.method && goalConceded.method.trim() !== '') {
                goalMethodsConceded[goalConceded.method] = (goalMethodsConceded[goalConceded.method] || 0) + 1;
            }
        });
        teamStats.goalMethodsConceded = goalMethodsConceded;
        
        // Atualizar total de gols tomados baseado no array
        teamStats.goalsConceded = goalsConceded.length;
        
        // Calcular resultado automaticamente baseado em gols feitos vs tomados
        const totalGoalsScored = teamStats.goals;
        const totalGoalsConceded = goalsConceded.length;
        let calculatedResult: 'Vitória' | 'Derrota' | 'Empate' = 'Empate';
        if (totalGoalsScored > totalGoalsConceded) {
            calculatedResult = 'Vitória';
        } else if (totalGoalsConceded > totalGoalsScored) {
            calculatedResult = 'Derrota';
        } else {
            calculatedResult = 'Empate';
        }
        
        // Salvar tempos reais dos gols feitos (agregar de todos os jogadores)
        // Salvar com período formatado para facilitar o parse depois
        const allGoalTimes: Array<{ time: string; method?: string }> = [];
        entries.forEach(entry => {
            entry.goalTimes.forEach(goalTime => {
                if (goalTime.time && goalTime.time.trim() !== '') {
                    // Formatar o tempo com período antes de salvar
                    const formattedTime = getGoalPeriod(goalTime.time);
                    allGoalTimes.push({
                        time: formattedTime,
                        method: goalTime.method && goalTime.method.trim() !== '' ? goalTime.method.trim() : undefined
                    });
                }
            });
        });
        teamStats.goalTimes = allGoalTimes.length > 0 ? allGoalTimes : undefined;
        
        // Salvar tempos reais dos gols tomados (com período formatado)
        const allGoalsConcededTimes: Array<{ time: string; method?: string }> = [];
        goalsConceded.forEach(goalConceded => {
            if (goalConceded.time && goalConceded.time.trim() !== '') {
                // Formatar o tempo com período antes de salvar
                const formattedTime = getGoalPeriod(goalConceded.time);
                allGoalsConcededTimes.push({
                    time: formattedTime,
                    method: goalConceded.method && goalConceded.method.trim() !== '' ? goalConceded.method.trim() : undefined
                });
            }
        });
        teamStats.goalsConcededTimes = allGoalsConcededTimes.length > 0 ? allGoalsConcededTimes : undefined;
        
        // Simple heuristic for origin breakdown (mantido para compatibilidade)
        teamStats.goalsScoredOpenPlay = teamStats.goals;
        teamStats.goalsConcededOpenPlay = goalsConceded.length;

        // Create Player Stats Map
        const playerStats: Record<string, MatchStats> = {};
        entries.forEach(entry => {
            // Validar que há um athleteId válido E que o atleta foi encontrado (tem nome)
            if (entry.athleteId && entry.athleteId.trim() !== '' && entry.athleteName && entry.athleteName.trim() !== '') {
                // Normalizar ID do atleta
                const normalizedPlayerId = String(entry.athleteId).trim();
                
                // Processar métodos dos gols feitos por este jogador individualmente
                const playerGoalMethodsScored: Record<string, number> = {};
                entry.goalTimes.forEach(goalTime => {
                    if (goalTime.method && goalTime.method.trim() !== '') {
                        playerGoalMethodsScored[goalTime.method] = (playerGoalMethodsScored[goalTime.method] || 0) + 1;
                    }
                });
                
                // Criar objeto playerStats com todas as informações do Input de Dados
                const playerStat: MatchStats = {
                    minutesPlayed: 40,
                    goals: entry.goals,
                    goalsConceded: 0,
                    assists: entry.assists,
                    yellowCards: entry.card.includes('Amarelo') ? 1 : 0,
                    redCards: entry.card.includes('Vermelho') ? 1 : 0,
                    passesCorrect: entry.passesCorrect,
                    passesWrong: entry.passesWrong,
                    wrongPassesTransition: entry.transitionError,
                    tacklesWithBall: entry.tacklesPossession,
                    tacklesCounterAttack: entry.tacklesCounter,
                    tacklesWithoutBall: entry.tacklesNoPossession,
                    shotsOnTarget: entry.shotsOn,
                    shotsOffTarget: entry.shotsOff,
                    rpeMatch: entry.rpe,
                    goalsScoredOpenPlay: entry.goals,
                    goalsScoredSetPiece: 0,
                    goalsConcededOpenPlay: 0,
                    goalsConcededSetPiece: 0,
                    goalMethodsScored: Object.keys(playerGoalMethodsScored).length > 0 ? playerGoalMethodsScored : undefined,
                    goalMethodsConceded: undefined // Gols tomados são do time, não individuais
                };
                
                // Adicionar informações adicionais do jogador para uso no TimeControl
                // (usando type assertion para adicionar campos extras que não estão no tipo MatchStats)
                (playerStat as any).playerName = entry.athleteName;
                (playerStat as any).position = entry.position;
                (playerStat as any).jerseyNumber = entry.jerseyNumber;
                
                playerStats[normalizedPlayerId] = playerStat;
            }
        });

        // Validar que teamStats está completo antes de salvar
        if (!teamStats || typeof teamStats.minutesPlayed === 'undefined') {
            console.error('❌ Erro: teamStats inválido:', teamStats);
            alert('Erro ao preparar dados para salvamento. Verifique o console para mais detalhes.');
            return;
        }

        const newMatch: MatchRecord = {
            id: Date.now().toString(),
            competition: competition,
            date: entries[0].date,
            location: location as 'Mandante' | 'Visitante',
            opponent: opponent,
            result: calculatedResult, // Resultado calculado automaticamente baseado em gols
            teamStats: teamStats,
            playerStats: playerStats
        };

        console.log('💾 Salvando partida:', {
            id: newMatch.id,
            competition: newMatch.competition,
            opponent: newMatch.opponent,
            teamStats: {
                goals: teamStats.goals,
                goalsConceded: teamStats.goalsConceded,
                minutesPlayed: teamStats.minutesPlayed
            },
            hasPlayerStats: Object.keys(playerStats).length > 0,
            playerStatsKeys: Object.keys(playerStats),
            playerStatsCount: Object.keys(playerStats).length,
            goalMethodsScored: teamStats.goalMethodsScored,
            goalMethodsConceded: teamStats.goalMethodsConceded,
            entriesWithAthleteId: entries.filter(e => e.athleteId && e.athleteId.trim() !== '').length
        });

        try {
        onSave(newMatch);
        
        // Definir match ID atual e carregar time controls
        setCurrentMatchId(newMatch.id);
        loadTimeControls(newMatch.id);
        
        // Fechar formulário de criação e mostrar partida salva
        setIsCreatingNew(false);
        setExpandedMatches(new Set([newMatch.id])); // Expandir a partida recém-salva
        
            // Reset necessary fields apenas se salvamento for bem-sucedido
        setOpponent('');
            setCompetition('');
            setLocation('');
            setMatchResult('Sem informação');
            setGoalsConceded([]);
            setGoalsConcededSaved(false);
            
            // Limpar entries mas manter pelo menos uma linha
            setEntries([{
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                athleteId: '',
                athleteName: '',
                jerseyNumber: '',
                position: '',
                status: 'Ativo',
                goals: 0,
                goalTimes: [],
                assists: 0,
                passesCorrect: 0,
                passesWrong: 0,
                shotsOn: 0,
                shotsOff: 0,
                tacklesPossession: 0,
                tacklesNoPossession: 0,
                tacklesCounter: 0,
                transitionError: 0,
                card: 'Nenhum',
                rpe: 5
            }]);
        } catch (error) {
            console.error('❌ Erro ao salvar partida:', error);
            alert('Erro ao salvar partida. Verifique o console para mais detalhes.');
        }
    };

    // Formatar data para exibição
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
    };

    // Componente helper para botões de estatística
    const StatButton: React.FC<{ label: string; color: string; icon: any; onClick: () => void; onDecrement?: () => void; value: number }> = ({ label, color, icon: Icon, onClick, onDecrement, value }) => (
        <div className="relative">
            <button 
                onClick={onClick}
                className={`${color} border p-4 font-bold uppercase tracking-tight text-xs hover:opacity-90 active:scale-95 transition-all shadow-lg flex flex-col items-center justify-center gap-2 rounded-xl min-h-[100px] w-full`}
            >
                <Icon size={24} strokeWidth={3} />
                <span>{label}</span>
                <span className="text-2xl font-black">{value}</span>
            </button>
            {onDecrement && value > 0 && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDecrement();
                    }}
                    className="absolute bottom-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-lg z-10 transition-all hover:scale-110 active:scale-95"
                    title="Diminuir"
                >
                    <Minus size={12} strokeWidth={3} />
                </button>
            )}
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            
            {/* Partidas Salvas */}
            {matches.length > 0 && (
                <div className="space-y-4">
                    {matches.map(match => {
                        const isExpanded = expandedMatches.has(match.id);
                        return (
                            <div key={match.id} className="bg-black rounded-3xl border border-zinc-900 shadow-lg overflow-hidden">
                                {/* Cabeçalho da Partida */}
                                <div 
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-950 transition-colors"
                                    onClick={() => toggleMatchExpanded(match.id)}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        {isExpanded ? (
                                            <ChevronUp className="text-[#00f0ff]" size={20} />
                                        ) : (
                                            <ChevronDown className="text-[#00f0ff]" size={20} />
                                        )}
                                        <div className="flex-1 grid grid-cols-3 gap-4">
                                            <div>
                                                <span className="text-[10px] text-zinc-500 font-bold uppercase">Competição</span>
                                                <p className="text-white font-bold text-sm">{match.competition || '-'}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-zinc-500 font-bold uppercase">Data</span>
                                                <p className="text-white font-bold text-sm">{formatDate(match.date)}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-zinc-500 font-bold uppercase">Resultado</span>
                                                <p className="text-white font-bold text-sm">{match.result || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Conteúdo Expandido (Tabela) */}
                                {isExpanded && (
                                    <div className="border-t border-zinc-900 p-4">
                                        <div className="text-xs text-zinc-500 mb-4">
                                            <p><strong>Adversário:</strong> {match.opponent || '-'}</p>
                                            <p><strong>Local:</strong> {match.location || '-'}</p>
                                            <p><strong>Gols Feitos:</strong> {match.teamStats?.goals || 0}</p>
                                            <p><strong>Gols Tomados:</strong> {match.teamStats?.goalsConceded || 0}</p>
                                        </div>
                                        {/* Aqui você pode adicionar uma visualização da tabela de dados se necessário */}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Formulário de Nova Partida */}
            {isCreatingNew && (
                <>
                    {/* Header / Controls */}
                    <div className="bg-black p-6 rounded-3xl border border-zinc-900 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div className="flex-1">
                    <h2 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-wide">
                        <Table className="text-[#00f0ff]" /> Input de Dados (Tempo Real)
                    </h2>
                    <p className="text-zinc-500 text-xs font-bold mt-1">Preenchimento manual para controle e alimentação do sistema.</p>
                    {/* Lista de Períodos de Gol - Sempre Visível */}
                    <div className="mt-3">
                        <span className="text-zinc-600 text-[10px] font-bold uppercase mb-2 block">Períodos:</span>
                        <div className="flex items-center gap-1 flex-wrap">
                            {TIME_PERIODS.map(period => (
                                <button
                                    key={period.value}
                                    onClick={() => awaitingGoalPeriod ? handleGoalWithPeriod(period.value) : undefined}
                                    className={`text-[9px] font-medium px-2 py-0.5 rounded border transition-all ${
                                        awaitingGoalPeriod 
                                            ? 'text-black bg-[#ccff00] border-[#ccff00] hover:bg-[#ccff00]/80 animate-pulse cursor-pointer' 
                                            : 'text-zinc-500 bg-zinc-900 border-zinc-800 cursor-default'
                                    }`}
                                    disabled={!awaitingGoalPeriod}
                                >
                                    {period.label}
                                </button>
                            ))}
                        </div>
                        {awaitingGoalPeriod && (
                            <div className="mt-2 text-center">
                                <button
                                    onClick={() => setAwaitingGoalPeriod(false)}
                                    className="text-zinc-400 hover:text-white text-[9px] font-bold uppercase"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Competição</label>
                        <select 
                            value={competition} 
                            onChange={(e) => setCompetition(e.target.value)}
                            className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-[#00f0ff] uppercase"
                        >
                            <option value="">Selecione...</option>
                            {competitions.map((c, i) => <option key={i} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Local</label>
                        <select 
                            value={location} 
                            onChange={(e) => setLocation(e.target.value)}
                            className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-[#00f0ff] uppercase"
                        >
                            <option value="">Selecione...</option>
                            <option value="Mandante">Mandante</option>
                            <option value="Visitante">Visitante</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Adversário</label>
                        <input 
                            type="text" 
                            value={opponent} 
                            onChange={(e) => setOpponent(e.target.value)}
                            placeholder="Nome do Time"
                            className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-[#00f0ff]"
                        />
                    </div>
                     <div className="flex flex-col">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Resultado</label>
                        <select 
                            value={matchResult} 
                            onChange={(e) => setMatchResult(e.target.value as any)}
                            className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-[#00f0ff]"
                        >
                            <option value="Sem informação">Sem informação</option>
                            <option value="Vitória">Vitória</option>
                            <option value="Empate">Empate</option>
                            <option value="Derrota">Derrota</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        {isCreatingNew ? (
                            <>
                                <button 
                                    onClick={addRow}
                                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 font-bold uppercase text-xs rounded-xl transition-colors h-[34px]"
                                >
                                    <Plus size={16} /> <span className="hidden sm:inline">Add Linha</span>
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black px-4 py-2 font-bold uppercase text-xs rounded-xl transition-colors h-[34px] shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                                >
                                    <Save size={16} /> Salvar no Sistema
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={handleNewMatch}
                                className="flex items-center gap-2 bg-[#00f0ff] hover:bg-[#60a5fa] text-black px-4 py-2 font-bold uppercase text-xs rounded-xl transition-colors h-[34px]"
                            >
                                <Plus size={16} /> Nova Partida
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Interface Dinâmica - Grid de Jogadores + Botões de Estatísticas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Grid de Jogadores (Lado Esquerdo) */}
                <div className="lg:col-span-1 bg-black rounded-3xl border border-zinc-900 p-4">
                    <h3 className="text-white font-bold uppercase text-sm mb-4 flex items-center gap-2">
                        <Users size={16} className="text-[#00f0ff]" /> Selecionar Jogador
                    </h3>
                    <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
                        {players.filter(p => (p as any).status === 'Ativo' || !(p as any).status).map(player => {
                            const entry = entries.find(e => String(e.athleteId).trim() === String(player.id).trim());
                            const isSelected = selectedPlayerId === String(player.id).trim();
                            
                            return (
                                <button
                                    key={player.id}
                                    onClick={() => setSelectedPlayerId(String(player.id).trim())}
                                    className={`relative p-3 rounded-xl border-2 transition-all ${
                                        isSelected 
                                            ? 'border-[#00f0ff] bg-[#00f0ff]/10 shadow-[0_0_20px_rgba(0,240,255,0.5)]' 
                                            : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                                    }`}
                                >
                                    {/* Foto Grande do Jogador */}
                                    <div className="w-20 h-20 mx-auto mb-2 rounded-full overflow-hidden border-2 border-zinc-700 bg-zinc-900">
                                        {player.photoUrl ? (
                                            <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-500 text-lg font-bold">
                                                {player.name?.substring(0, 2).toUpperCase() || '??'}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Nome e Número */}
                                    <div className="text-center">
                                        <p className="text-white font-bold text-xs truncate">{player.name}</p>
                                        <p className="text-zinc-400 text-[10px]">#{player.jerseyNumber}</p>
                                        
                                        {/* Indicador de seleção */}
                                        {isSelected && (
                                            <div className="mt-1 text-[#00f0ff] text-[10px] font-bold">✓ SELECIONADO</div>
                                        )}
                                        
                                        {/* Contadores rápidos */}
                                        {entry && (
                                            <div className="mt-1 flex items-center justify-center gap-1 text-[9px]">
                                                {entry.goals > 0 && <span className="text-[#ccff00]">⚽{entry.goals}</span>}
                                                {entry.assists > 0 && <span className="text-blue-400">🎯{entry.assists}</span>}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Botões de Estatísticas (Lado Direito) */}
                <div className="lg:col-span-2 bg-black rounded-3xl border border-zinc-900 p-6">
                    <h3 className="text-white font-bold uppercase text-sm mb-4 flex items-center gap-2">
                        <Target size={16} className="text-[#00f0ff]" /> Estatísticas
                        {selectedPlayerId && (
                            <span className="text-zinc-500 text-xs font-normal">
                                (Selecionado: {players.find(p => String(p.id).trim() === selectedPlayerId)?.name})
                            </span>
                        )}
                    </h3>
                    
                    {!selectedPlayerId && (
                        <div className="text-center py-12 text-zinc-500">
                            <Users size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-sm font-bold">Selecione um jogador para começar</p>
                            <p className="text-xs mt-2">Clique na foto do jogador à esquerda</p>
                        </div>
                    )}

                    {selectedPlayerId && (() => {
                        const currentEntry = entries.find(e => String(e.athleteId).trim() === selectedPlayerId);
                        return (
                            <>
                            {/* Botões ENTRADA/SAÍDA grandes */}
                            {currentMatchId && (
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <button
                                        onClick={handleEntryButtonClick}
                                        className="bg-green-600 hover:bg-green-500 text-white font-black uppercase text-lg py-6 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        <ArrowUpDown size={24} />
                                        ENTRADA
                                    </button>
                                    <button
                                        onClick={handleExitButtonClick}
                                        className="bg-red-600 hover:bg-red-500 text-white font-black uppercase text-lg py-6 rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        <ArrowUpDown size={24} />
                                        SAÍDA
                                    </button>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {/* Gols */}
                                <StatButton 
                                    label="GOL" 
                                    color={awaitingGoalPeriod ? "bg-[#ccff00] text-black border-[#ccff00] animate-pulse" : "bg-white text-black border-white"} 
                                    icon={Goal} 
                                    onClick={() => handleStatButtonClick('goals')}
                                    onDecrement={() => handleStatButtonDecrement('goals')}
                                    value={currentEntry?.goals || 0}
                                />
                                
                                {/* Assistências */}
                                <StatButton 
                                    label="ASSISTÊNCIA" 
                                    color="bg-blue-600 text-white border-blue-600" 
                                    icon={Target} 
                                    onClick={() => handleStatButtonClick('assists')}
                                    onDecrement={() => handleStatButtonDecrement('assists')}
                                    value={currentEntry?.assists || 0}
                                />
                                
                                {/* Passes Certos */}
                                <StatButton 
                                    label="PASSE CERTO" 
                                    color="bg-[#00f0ff] text-black border-[#00f0ff]" 
                                    icon={Target} 
                                    onClick={() => handleStatButtonClick('passesCorrect')}
                                    onDecrement={() => handleStatButtonDecrement('passesCorrect')}
                                    value={currentEntry?.passesCorrect || 0}
                                />
                                
                                {/* Chutes no Gol */}
                                <StatButton 
                                    label="CHUTE NO GOL" 
                                    color="bg-[#ccff00] text-black border-[#ccff00]" 
                                    icon={Target} 
                                    onClick={() => handleStatButtonClick('shotsOn')}
                                    onDecrement={() => handleStatButtonDecrement('shotsOn')}
                                    value={currentEntry?.shotsOn || 0}
                                />
                                
                                {/* Desarme com Posse */}
                                <StatButton 
                                    label="DESARME (POSSE)" 
                                    color="bg-emerald-500 text-white border-emerald-500" 
                                    icon={Shield} 
                                    onClick={() => handleStatButtonClick('tacklesPossession')}
                                    onDecrement={() => handleStatButtonDecrement('tacklesPossession')}
                                    value={currentEntry?.tacklesPossession || 0}
                                />
                                
                                {/* Desarme sem Posse */}
                                <StatButton 
                                    label="DESARME (S/POSSE)" 
                                    color="bg-yellow-500 text-black border-yellow-500" 
                                    icon={Shield} 
                                    onClick={() => handleStatButtonClick('tacklesNoPossession')}
                                    onDecrement={() => handleStatButtonDecrement('tacklesNoPossession')}
                                    value={currentEntry?.tacklesNoPossession || 0}
                                />
                                
                                {/* Desarme Contra-Ataque */}
                                <StatButton 
                                    label="DESARME (C/A)" 
                                    color="bg-green-600 text-white border-green-600" 
                                    icon={Zap} 
                                    onClick={() => handleStatButtonClick('tacklesCounter')}
                                    onDecrement={() => handleStatButtonDecrement('tacklesCounter')}
                                    value={currentEntry?.tacklesCounter || 0}
                                />
                                
                                {/* Passes Errados */}
                                <StatButton 
                                    label="PASSE ERRADO" 
                                    color="bg-red-600 text-white border-red-600" 
                                    icon={AlertTriangle} 
                                    onClick={() => handleStatButtonClick('passesWrong')}
                                    onDecrement={() => handleStatButtonDecrement('passesWrong')}
                                    value={currentEntry?.passesWrong || 0}
                                />
                                
                                {/* Chutes para Fora */}
                                <StatButton 
                                    label="CHUTE P/ FORA" 
                                    color="bg-orange-600 text-white border-orange-600" 
                                    icon={Target} 
                                    onClick={() => handleStatButtonClick('shotsOff')}
                                    onDecrement={() => handleStatButtonDecrement('shotsOff')}
                                    value={currentEntry?.shotsOff || 0}
                                />
                                
                                {/* Erro de Transição */}
                                <StatButton 
                                    label="ERRO TRANSIÇÃO" 
                                    color="bg-red-700 text-white border-red-700" 
                                    icon={ArrowRightLeft} 
                                    onClick={() => handleStatButtonClick('transitionError')}
                                    onDecrement={() => handleStatButtonDecrement('transitionError')}
                                    value={currentEntry?.transitionError || 0}
                                />
                                
                                {/* RPE - Percepção Subjetiva de Esforço */}
                                <StatButton 
                                    label="RPE (0-10)" 
                                    color="bg-purple-600 text-white border-purple-600" 
                                    icon={Activity} 
                                    onClick={() => handleStatButtonClick('rpe')}
                                    onDecrement={() => handleStatButtonDecrement('rpe')}
                                    value={currentEntry?.rpe || 5}
                                />
                                
                                {/* Cartão Amarelo */}
                                <button 
                                    onClick={() => handleCardClick('Amarelo')}
                                    className={`bg-yellow-500 text-black border-yellow-500 border p-4 font-bold uppercase tracking-tight text-xs hover:opacity-90 active:scale-95 transition-all shadow-lg flex flex-col items-center justify-center gap-2 rounded-xl min-h-[100px] ${
                                        currentEntry?.card?.includes('Amarelo') ? 'ring-4 ring-yellow-300' : ''
                                    }`}
                                >
                                    <Square size={24} strokeWidth={3} />
                                    <span>CARTÃO AMARELO</span>
                                    <span className="text-2xl font-black">
                                        {currentEntry?.card === 'Amarelo' ? '1' : 
                                         currentEntry?.card === 'Amarelo/Vermelho' || currentEntry?.card === 'Amarelo/Amarelo/Vermelho' ? '2' : '0'}
                                    </span>
                                </button>
                                
                                {/* Cartão Vermelho */}
                                <button 
                                    onClick={() => handleCardClick('Vermelho')}
                                    className={`bg-red-600 text-white border-red-600 border p-4 font-bold uppercase tracking-tight text-xs hover:opacity-90 active:scale-95 transition-all shadow-lg flex flex-col items-center justify-center gap-2 rounded-xl min-h-[100px] ${
                                        currentEntry?.card?.includes('Vermelho') ? 'ring-4 ring-red-400' : ''
                                    }`}
                                >
                                    <Square size={24} strokeWidth={3} />
                                    <span>CARTÃO VERMELHO</span>
                                    <span className="text-2xl font-black">
                                        {currentEntry?.card?.includes('Vermelho') ? '1' : '0'}
                                    </span>
                                </button>
                            </div>

                        </>
                        );
                    })()}
                </div>
            </div>

            {/* Bottom Row - Goals Conceded Input for Match Record */}
            <div className="mt-4 print:border border-zinc-800 p-4 rounded-3xl bg-black">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-white font-bold uppercase text-xs">Gols Tomados:</h3>
                        {goalsConcededSaved && goalsConceded.length > 0 && (
                            <span className="text-[#00f0ff] text-[10px] font-bold uppercase flex items-center gap-1">
                                ✓ Salvos
                            </span>
                        )}
                    </div>
                <div className="flex items-center gap-4">
                        <span className="text-zinc-400 text-[10px] font-bold uppercase">Total:</span>
                        <span className="text-white text-lg font-black">{goalsConceded.length}</span>
                        <button 
                            onClick={addGoalConceded}
                            className="text-[#ff0055] hover:text-[#ff3377] text-xs font-black px-2 py-1 border border-[#ff0055]/30 rounded hover:border-[#ff0055] transition-colors"
                            title="Adicionar gol tomado"
                        >
                            + Adicionar Gol
                        </button>
                    </div>
                </div>
                
                {goalsConceded.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {goalsConceded.map((goalConceded, idx) => (
                            <div key={goalConceded.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex flex-col gap-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Gol {idx + 1}</span>
                                    {goalsConceded.length > 1 && (
                                        <button 
                                            onClick={() => removeGoalConceded(goalConceded.id)}
                                            className="text-red-400 hover:text-red-300 text-xs font-black"
                                            title="Remover gol"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[9px] text-zinc-500 font-bold uppercase">Minuto:</label>
                                        <select
                                            value={goalConceded.time || ''}
                                            onChange={e => updateGoalConcededTime(goalConceded.id, e.target.value)}
                                            className="bg-black border border-zinc-700 rounded-lg p-2 text-white outline-none focus:border-[#ff0055] text-xs"
                                        >
                                            <option value="">Selecione...</option>
                                            {TIME_PERIODS.map(period => (
                                                <option key={period.value} value={period.value}>{period.label}</option>
                                            ))}
                                        </select>
                                        {goalConceded.time && (
                                            <span className="text-[9px] text-red-400 font-bold">
                                                {getGoalPeriod(goalConceded.time)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[9px] text-zinc-500 font-bold uppercase">Método:</label>
                                        <select
                                            value={goalConceded.method || ''}
                                            onChange={e => updateGoalConcededMethod(goalConceded.id, e.target.value)}
                                            className="bg-black border border-zinc-700 rounded-lg p-2 text-white outline-none focus:border-[#ff0055] text-xs"
                                        >
                                            <option value="">Selecione...</option>
                                            {GOAL_METHODS.map(method => (
                                                <option key={method} value={method}>{method}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-zinc-600 text-sm">
                        <p>Nenhum gol tomado registrado.</p>
                        <p className="text-[10px] mt-2">Clique em "+ Adicionar Gol" para começar.</p>
                    </div>
                )}
                
                {goalsConceded.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-end">
                        <button 
                            onClick={handleSaveGoalsConceded}
                            className={`flex items-center gap-2 px-4 py-2 font-bold uppercase text-xs rounded-xl transition-colors ${
                                goalsConcededSaved 
                                    ? 'bg-[#00f0ff] hover:bg-[#60a5fa] text-black' 
                                    : 'bg-[#ff0055] hover:bg-[#ff3377] text-white'
                            }`}
                        >
                            <Save size={16} /> 
                            {goalsConcededSaved ? 'Gols Tomados Salvos ✓' : 'Salvar Gols Tomados'}
                        </button>
                </div>
                )}
            </div>
                </>
            )}

            {/* Seção de Entradas e Saídas */}
            {currentMatchId && (
                <div className="mt-6 bg-black rounded-3xl border border-zinc-900 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <ArrowUpDown className="text-[#00f0ff]" size={20} />
                            <h3 className="text-white font-bold uppercase text-sm">Entradas e Saídas</h3>
                        </div>
                        <button
                            onClick={handleSaveTimeControls}
                            className="flex items-center gap-2 bg-[#00f0ff] hover:bg-[#60a5fa] text-black px-4 py-2 font-bold uppercase text-xs rounded-xl transition-colors"
                        >
                            <Save size={16} /> Salvar Tempos
                        </button>
                    </div>

                    {isLoadingTimeControls ? (
                        <div className="text-center py-8 text-zinc-500">
                            <p>Carregando controles de tempo...</p>
                        </div>
                    ) : timeControls.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500">
                            <p className="text-sm">Nenhum controle de tempo registrado.</p>
                            <p className="text-xs mt-2">Use os botões ENTRADA/SAÍDA acima para registrar tempos.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-950 text-[10px] text-zinc-400 uppercase tracking-wider font-bold border-b border-zinc-800">
                                        <th className="p-3 border-r border-zinc-900">Jogador</th>
                                        <th className="p-3 border-r border-zinc-900">Entradas/Saídas</th>
                                        <th className="p-3 text-center">Tempo Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {timeControls.map((tc) => {
                                        const player = players.find(p => String(p.id).trim() === tc.playerId);
                                        const parseTime = (timeStr: string): number => {
                                            if (!timeStr) return 0;
                                            const parts = timeStr.split(':');
                                            if (parts.length !== 2) return 0;
                                            const minutes = parseInt(parts[0], 10) || 0;
                                            const seconds = parseInt(parts[1], 10) || 0;
                                            return minutes + (seconds / 60);
                                        };
                                        
                                        const calculateTotal = () => {
                                            let total = 0;
                                            tc.timeEntries.forEach(entry => {
                                                if (entry.entryTime && entry.exitTime) {
                                                    const entryMin = parseTime(entry.entryTime);
                                                    const exitMin = parseTime(entry.exitTime);
                                                    if (exitMin > entryMin) {
                                                        total += exitMin - entryMin;
                                                    }
                                                }
                                            });
                                            return total;
                                        };
                                        
                                        const totalTime = calculateTotal();
                                        const formatTime = (minutes: number): string => {
                                            const mins = Math.floor(minutes);
                                            const secs = Math.round((minutes - mins) * 60);
                                            return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                                        };

                                        return (
                                            <tr key={tc.id} className="border-b border-zinc-900 hover:bg-zinc-950">
                                                <td className="p-3 border-r border-zinc-900 text-white text-xs font-bold">
                                                    {player?.name || 'Jogador não encontrado'}
                                                </td>
                                                <td className="p-3 border-r border-zinc-900">
                                                    <div className="flex flex-col gap-1">
                                                        {tc.timeEntries.map((entry, idx) => (
                                                            <div key={idx} className="text-xs text-zinc-400">
                                                                {entry.entryTime || '--'} → {entry.exitTime || '--'}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center text-white text-xs font-bold">
                                                    {formatTime(totalTime)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Seleção de Tempo */}
            <TimeSelectionModal
                isOpen={showTimeModal}
                onClose={() => setShowTimeModal(false)}
                onConfirm={handleTimeModalConfirm}
                title={timeModalType === 'entry' ? 'Registrar Entrada' : 'Registrar Saída'}
            />
        </div>
    );
};
