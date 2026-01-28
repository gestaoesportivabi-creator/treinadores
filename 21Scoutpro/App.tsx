import React, { useMemo, useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { LandingPage } from './components/LandingPage';
import { GeneralScout } from './components/GeneralScout';
import { IndividualScout } from './components/IndividualScout';
import { PhysicalScout } from './components/PhysicalScout';
import { PhysicalAssessmentTab } from './components/PhysicalAssessment'; 
import { VideoScout } from './components/VideoScout';
import { Settings } from './components/Settings';
import { ScoutTable } from './components/ScoutTable';
import { TeamManagement } from './components/TeamManagement';
import { StatsRanking } from './components/StatsRanking';
import { Schedule } from './components/Schedule';
import { Academia } from './components/Academia';
import { LoadingMessage } from './components/LoadingMessage';
import { ChampionshipTable, ChampionshipMatch } from './components/ChampionshipTable';
import { ScheduleAlerts } from './components/ScheduleAlerts';
import { TabBackgroundWrapper } from './components/TabBackgroundWrapper';
import { ManagementReport } from './components/ManagementReport';
import { NextMatchAlert } from './components/NextMatchAlert';
import { RealtimeScoutPage } from './components/RealtimeScoutPage';
import { SPORT_CONFIGS } from './constants';
import { BarChart3, FileText } from 'lucide-react';
import { User, MatchRecord, Player, PhysicalAssessment, WeeklySchedule, StatTargets, PlayerTimeControl, Team, Championship } from './types';
import { playersApi, matchesApi, assessmentsApi, schedulesApi, competitionsApi, statTargetsApi, timeControlsApi, championshipMatchesApi, teamsApi } from './services/api';

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  helper?: string;
  highlight?: boolean;
};


export default function App() {
  // Route state: 'landing' | 'login' | 'register' | 'app'
  const [currentRoute, setCurrentRoute] = useState<'landing' | 'login' | 'register' | 'app'>('landing');
  
  // User Session (Not persisted for security in this demo, but could be)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Persisted States - Inicializados vazios, serão carregados da API
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [assessments, setAssessments] = useState<PhysicalAssessment[]>([]);
  const [schedules, setSchedules] = useState<WeeklySchedule[]>([]);
  const [competitions, setCompetitions] = useState<string[]>([]);
  const [timeControls, setTimeControls] = useState<PlayerTimeControl[]>([]);
  const [championshipMatches, setChampionshipMatches] = useState<ChampionshipMatch[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  
  // Stats Targets State
  const [statTargets, setStatTargets] = useState<StatTargets>({
      goals: 3,
      assists: 3,
      passesCorrect: 30,
      passesWrong: 5,
      shotsOn: 8,
      shotsOff: 5,
      tacklesPossession: 10,
      tacklesNoPossession: 10,
      tacklesCounter: 5,
      transitionError: 2
  });
  
  const config = SPORT_CONFIGS['futsal'];

  const normalizeResult = (result: MatchRecord['result'] | string | undefined) => {
    if (result === 'Vitória' || result === 'V') return 'V';
    if (result === 'Derrota' || result === 'D') return 'D';
    if (result === 'Empate' || result === 'E') return 'E';
    return undefined;
  };

  const overviewStats = useMemo(() => {
    const totals = matches.reduce(
      (acc, match) => {
        const normalizedResult = normalizeResult(match.result);
        acc.totalGames += 1;
        if (normalizedResult === 'V') acc.wins += 1;
        if (normalizedResult === 'D') acc.losses += 1;
        if (normalizedResult === 'E') acc.draws += 1;

        if (match.playerStats) {
          Object.entries(match.playerStats).forEach(([playerId, stats]) => {
            if (!stats) return;
            const goals = stats.goals || 0;
            if (goals <= 0) return;
            acc.goalsByPlayer.set(playerId, (acc.goalsByPlayer.get(playerId) || 0) + goals);
          });
        }

        return acc;
      },
      {
        totalGames: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        goalsByPlayer: new Map<string, number>()
      }
    );

    let topScorerId: string | null = null;
    let topScorerGoals = 0;
    totals.goalsByPlayer.forEach((goals, playerId) => {
      if (goals > topScorerGoals) {
        topScorerGoals = goals;
        topScorerId = playerId;
      }
    });

    const topScorerName =
      topScorerId ? players.find(player => player.id === topScorerId)?.name || 'Atleta' : '—';

    const now = new Date();
    const year = now.getFullYear();
    const injuriesThisYear = players.reduce((acc, player) => {
      const injuries = player.injuryHistory || [];
      injuries.forEach(injury => {
        const dateValue =
          injury.startDate || injury.date || injury.endDate || injury.returnDate || injury.returnDateActual;
        if (!dateValue) return;
        const injuryDate = new Date(dateValue);
        if (!Number.isNaN(injuryDate.getTime()) && injuryDate.getFullYear() === year) {
          acc += 1;
        }
      });
      return acc;
    }, 0);

    const upcomingMatches = championshipMatches
      .map(match => ({
        ...match,
        dateTime: new Date(`${match.date}T${match.time || '00:00'}`)
      }))
      .filter(match => !Number.isNaN(match.dateTime.getTime()) && match.dateTime >= now)
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    const nextMatch = upcomingMatches[0];

    return {
      totalAthletes: players.length,
      totalGames: totals.totalGames,
      wins: totals.wins,
      losses: totals.losses,
      draws: totals.draws,
      topScorerName,
      topScorerGoals,
      injuriesThisYear,
      currentYear: year,
      nextMatch
    };
  }, [matches, players, championshipMatches]);

  const StatCard = ({ label, value, helper, highlight = false }: StatCardProps) => (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${highlight ? 'text-[#00f0ff]' : 'text-white'}`}>
        {value}
      </p>
      {helper && <p className="mt-1 text-xs text-zinc-500">{helper}</p>}
    </div>
  );

  const formatMatchDate = (dateTime?: Date) => {
    if (!dateTime || Number.isNaN(dateTime.getTime())) return 'Sem data definida';
    const dateLabel = dateTime.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
    const timeLabel = dateTime.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${dateLabel} • ${timeLabel}`;
  };

  // Carregar dados da API quando o componente monta E quando o usuário faz login
  useEffect(() => {
    // Só carregar dados se o usuário estiver logado
    if (!currentUser) {
      console.log('⏸️ Usuário não logado, pulando carregamento de dados');
      setIsInitializing(false);
      return;
    }
    
    const loadData = async () => {
      try {
        setIsInitializing(true);
        
        // Pequeno delay para garantir que o token foi salvo
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const token = localStorage.getItem('token');
        console.log('🔄 Carregando dados da API...');
        console.log('👤 Usuário logado:', currentUser?.email);
        console.log('🔑 Token presente:', token ? 'SIM' : 'NÃO');
        
        if (!token) {
          console.error('❌ Token não encontrado no localStorage!');
          setIsInitializing(false);
          return;
        }
        
        // FASE 1: Carregar dados críticos primeiro (players, matches, teams)
        console.log('🚀 Fase 1: Carregando dados críticos...');
        const [playersData, matchesData, teamsData] = await Promise.allSettled([
          playersApi.getAll().catch(err => { console.error('❌ Erro ao carregar players:', err); return []; }),
          matchesApi.getAll().catch(err => { console.error('❌ Erro ao carregar matches:', err); return []; }),
          teamsApi.getAll().catch(err => { console.error('❌ Erro ao carregar teams:', err); return []; })
        ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : []));

        // Atualizar UI imediatamente com dados críticos
        setPlayers(playersData as Player[]);
        
        // Validar matches antes de definir - garantir que todos tenham teamStats válido
        const validMatches = (matchesData as MatchRecord[]).filter(m => {
          if (!m || !m.teamStats) {
            console.warn('⚠️ Match inválido removido ao carregar:', m);
            return false;
          }
          return true;
        });
        setMatches(validMatches);
        setTeams(teamsData as Team[]);
        
        console.log('✅ Fase 1 concluída:', {
          players: playersData.length,
          matches: validMatches.length,
          teams: teamsData.length,
        });

        // FASE 2: Carregar dados importantes em background (não bloqueia UI)
        setTimeout(async () => {
          console.log('🚀 Fase 2: Carregando dados importantes...');
          const [schedulesData, competitionsData, championshipMatchesData] = await Promise.allSettled([
            schedulesApi.getAll().catch(err => { console.error('❌ Erro ao carregar schedules:', err); return []; }),
            competitionsApi.getAll().catch(err => { console.error('❌ Erro ao carregar competitions:', err); return []; }),
            championshipMatchesApi.getAll().catch(err => { console.error('❌ Erro ao carregar championshipMatches:', err); return []; })
          ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : []));

          // Processar schedules
          const scheduleMap = new Map<string, WeeklySchedule>();
          (schedulesData as WeeklySchedule[]).forEach(schedule => {
            if (schedule && schedule.id) {
              const validSchedule = {
                ...schedule,
                days: Array.isArray(schedule.days) ? schedule.days : (schedule.days ? [schedule.days] : []),
                isActive: schedule.isActive === true || schedule.isActive === 'TRUE' || schedule.isActive === 'true'
              };
              if (scheduleMap.has(schedule.id)) {
                const existing = scheduleMap.get(schedule.id)!;
                if (validSchedule.isActive && !existing.isActive) {
                  scheduleMap.set(schedule.id, validSchedule);
                } else if (!validSchedule.isActive && existing.isActive) {
                  // Manter o existente que está ativo
                } else if (validSchedule.createdAt && existing.createdAt && validSchedule.createdAt > existing.createdAt) {
                  scheduleMap.set(schedule.id, validSchedule);
                }
              } else {
                scheduleMap.set(schedule.id, validSchedule);
              }
            }
          });
          const validSchedules = Array.from(scheduleMap.values()).sort((a, b) => {
            if (a.isActive && !b.isActive) return -1;
            if (!a.isActive && b.isActive) return 1;
            const aCreated = a.createdAt || 0;
            const bCreated = b.createdAt || 0;
            return bCreated - aCreated;
          });
          setSchedules(validSchedules);
          
          setCompetitions((competitionsData as string[]).length > 0 ? (competitionsData as string[]) : []);
          setChampionshipMatches((championshipMatchesData as ChampionshipMatch[]).length > 0 ? (championshipMatchesData as ChampionshipMatch[]) : []);
          
          console.log('✅ Fase 2 concluída:', {
            schedules: validSchedules.length,
            competitions: competitionsData.length,
            championshipMatches: championshipMatchesData.length,
          });
        }, 100);

        // FASE 3: Carregar dados secundários em background
        setTimeout(async () => {
          console.log('🚀 Fase 3: Carregando dados secundários...');
          const [assessmentsData, statTargetsData] = await Promise.allSettled([
            assessmentsApi.getAll().catch(err => { console.error('❌ Erro ao carregar assessments:', err); return []; }),
            statTargetsApi.getAll().catch(err => { console.error('❌ Erro ao carregar statTargets:', err); return []; })
          ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : []));

          setAssessments(assessmentsData as PhysicalAssessment[]);
          
          if ((statTargetsData as StatTargets[]).length > 0 && (statTargetsData as StatTargets[])[0]) {
            setStatTargets((statTargetsData as StatTargets[])[0]);
          }
          
          console.log('✅ Fase 3 concluída:', {
            assessments: assessmentsData.length,
            statTargets: statTargetsData.length,
          });
        }, 300);
        
        // TimeControls não tem getAll(), será carregado por jogo quando necessário
        setTimeControls([]);
        
        // Campeonatos: carregar do localStorage
        const savedChampionships = JSON.parse(localStorage.getItem('championships') || '[]');
        setChampionships(savedChampionships);
        
        console.log('✅ Dados críticos carregados com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao carregar dados da API:', error);
        // Manter arrays vazios em caso de erro (sem fallback para dados iniciais)
        setPlayers([]);
        setMatches([]);
        setAssessments([]);
        setSchedules([]);
        setCompetitions([]);
        setChampionshipMatches([]);
        console.warn('⚠️ Erro ao carregar dados da API. Sistema iniciado sem dados.');
      } finally {
        setIsInitializing(false);
      }
    };

    loadData();
  }, [currentUser]); // Executar quando o usuário fizer login ou mudar

  // Clean up old schedules (older than 30 days) on mount
  useEffect(() => {
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    setSchedules(prev => {
        const validSchedules = prev.filter(s => {
            // If legacy schedule without createdAt, keep it or default to now (let's keep it to be safe)
            const created = s.createdAt || now; 
            return (now - created) < thirtyDaysInMs;
        });
        
        // Update local storage if items were removed
        if (validSchedules.length !== prev.length) {
            console.log("Auto-deleted expired schedules");
        }
        return validSchedules;
    });
  }, []);

  const handleLogin = (user: User) => {
      console.log('🔐 handleLogin chamado com usuário:', user);
      console.log('🔑 Token no localStorage:', localStorage.getItem('token') ? 'PRESENTE' : 'AUSENTE');
      setCurrentUser(user);
      setActiveTab('dashboard'); 
      console.log('✅ currentUser atualizado, useEffect deve ser disparado');
  };

  const handleTabChange = (tab: string) => {
      setIsLoading(true);
      setActiveTab(tab);
      // Simulate loading time
      setTimeout(() => {
          setIsLoading(false);
      }, 500);
  };

  const handleUpdateUser = async (updatedData: Partial<User>) => {
      try {
          const token = localStorage.getItem('token');
          if (!token) {
              alert('Você precisa estar autenticado para atualizar o perfil.');
              return;
          }

          const { getApiUrl } = await import('./config');
          
          const response = await fetch(`${getApiUrl()}/auth/profile`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(updatedData),
          });

          const result = await response.json();

          if (result.success && result.data) {
              // Atualizar estado local com dados retornados
              if (currentUser) {
                  const updatedUser: User = {
                      ...currentUser,
                      name: result.data.name,
                      email: result.data.email,
                      photoUrl: result.data.photoUrl,
                      role: result.data.role === 'TECNICO' ? 'Treinador' : result.data.role,
                  };
                  setCurrentUser(updatedUser);
              }
          } else {
              alert(result.error || 'Erro ao atualizar perfil. Tente novamente.');
          }
      } catch (error) {
          console.error('Erro ao atualizar perfil:', error);
          alert('Erro de conexão ao atualizar perfil. Verifique se o backend está rodando.');
      }
  };

  const handleSaveMatch = async (newMatch: MatchRecord) => {
      try {
        // Validar match antes de salvar
        if (!newMatch || !newMatch.teamStats) {
          console.error('❌ Erro: Match inválido ao salvar:', newMatch);
          alert("Erro: Dados da partida incompletos. Verifique o console para mais detalhes.");
          return;
        }

        console.log('💾 Iniciando salvamento da partida:', {
          id: newMatch.id,
          competition: newMatch.competition,
          opponent: newMatch.opponent,
          date: newMatch.date,
          hasTeamStats: !!newMatch.teamStats,
          playerStatsCount: Object.keys(newMatch.playerStats || {}).length
        });

        const saved = await matchesApi.create(newMatch);
        console.log('💾 Resposta do salvamento:', saved);
        
        if (saved) {
          // Validar match salvo antes de adicionar à lista
          if (saved.teamStats) {
            setMatches(prev => [...prev, saved]);
            console.log('✅ Partida salva e adicionada à lista local');
            alert("Partida salva com sucesso! Os dados foram atualizados no sistema.");
            setActiveTab('general');
          } else {
            console.error('❌ Erro: Match salvo sem teamStats:', saved);
            alert("Partida salva, mas com dados incompletos. Verifique o console.");
          }
        } else {
          console.error('❌ Erro: Resposta do salvamento foi null/undefined');
          alert("Erro ao salvar partida. Verifique o console (F12) para mais detalhes.");
        }
      } catch (error) {
        console.error('❌ Erro ao salvar partida:', error);
        if (error instanceof Error) {
          console.error('Detalhes do erro:', error.message, error.stack);
        }
        alert("Erro ao salvar partida. Verifique o console (F12) para mais detalhes.");
      }
  };

  const handleAddPlayer = async (newPlayer: Player) => {
      try {
        const saved = await playersApi.create(newPlayer);
        if (saved) {
          setPlayers(prev => [...prev, saved]);
          alert("Atleta cadastrado com sucesso!");
        } else {
          alert("Erro ao cadastrar atleta. Tente novamente.");
        }
      } catch (error) {
        console.error('Erro ao cadastrar atleta:', error);
        alert("Erro ao cadastrar atleta. Tente novamente.");
      }
  };

  // Function to handle updates (edit, transfer, injury)
  const handleUpdatePlayer = async (updatedPlayer: Player) => {
      try {
        const saved = await playersApi.update(updatedPlayer.id, updatedPlayer);
        if (saved) {
          setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? saved : p));
          alert("Dados do atleta atualizados com sucesso!");
        } else {
          alert("Erro ao atualizar atleta. Tente novamente.");
        }
      } catch (error) {
        console.error('Erro ao atualizar atleta:', error);
        alert("Erro ao atualizar atleta. Tente novamente.");
      }
  };

  const handleSaveAssessment = async (newAssessment: PhysicalAssessment) => {
      try {
        const saved = await assessmentsApi.create(newAssessment);
        if (saved) {
          setAssessments(prev => [...prev, saved]);
        }
      } catch (error) {
        console.error('Erro ao salvar avaliação:', error);
      }
  };

  const handleAddTeam = async (newTeam: Omit<Team, 'id' | 'createdAt'>) => {
    try {
      const saved = await teamsApi.create(newTeam);
      if (saved) {
        setTeams(prev => [...prev, saved]);
        return saved;
      }
      return null;
    } catch (error) {
      console.error('Erro ao criar equipe:', error);
      return null;
    }
  };

  const handleUpdateTeam = async (updatedTeam: Team) => {
    try {
      const saved = await teamsApi.update(updatedTeam.id, updatedTeam);
      if (saved) {
        setTeams(prev => prev.map(t => t.id === updatedTeam.id ? saved : t));
        return saved;
      }
      return null;
    } catch (error) {
      console.error('Erro ao atualizar equipe:', error);
      return null;
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const success = await teamsApi.delete(teamId);
      if (success) {
        setTeams(prev => prev.filter(t => t.id !== teamId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao deletar equipe:', error);
      return false;
    }
  };

  const handleSaveSchedule = async (newSchedule: WeeklySchedule) => {
      try {
        // Garantir que days seja um array válido
        if (!newSchedule.days || !Array.isArray(newSchedule.days)) {
          alert('Erro: A programação não possui dias configurados.');
          return;
        }
        
        // Normalizar datas para formato YYYY-MM-DD (sem hora/timezone)
        const normalizeDate = (dateStr: string): string => {
          if (!dateStr) return dateStr;
          // Se já está no formato YYYY-MM-DD, retornar como está
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
          }
          // Se tem timestamp (T ou espaço), extrair apenas a data
          const datePart = dateStr.split('T')[0].split(' ')[0];
          if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
            return datePart;
          }
          // Tentar parsear como Date e converter para YYYY-MM-DD
          try {
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          } catch {
            return dateStr;
          }
        };
        
        const normalizedSchedule = {
          ...newSchedule,
          startDate: normalizeDate(newSchedule.startDate),
          endDate: normalizeDate(newSchedule.endDate)
        };
        
        console.log('💾 Salvando programação:', {
          id: normalizedSchedule.id,
          title: normalizedSchedule.title,
          startDate: normalizedSchedule.startDate,
          endDate: normalizedSchedule.endDate,
          daysCount: normalizedSchedule.days.length
        });
        
        const exists = schedules.find(s => s.id === normalizedSchedule.id);
        let saved;
        
        if (exists) {
          saved = await schedulesApi.update(normalizedSchedule.id, normalizedSchedule);
          if (saved) {
            setSchedules(prev => prev.map(s => s.id === normalizedSchedule.id ? saved! : s));
            alert('Programação atualizada com sucesso!');
          } else {
            alert('Erro ao atualizar programação. Verifique o console para mais detalhes.');
          }
        } else {
          const scheduleWithTimestamp = { ...normalizedSchedule, createdAt: Date.now() };
          saved = await schedulesApi.create(scheduleWithTimestamp);
          if (saved) {
            setSchedules(prev => [saved!, ...prev]);
            alert('Programação salva com sucesso!');
          } else {
            alert('Erro ao salvar programação. Verifique o console para mais detalhes.');
          }
        }
        
        console.log('✅ Programação salva:', saved);
      } catch (error) {
        console.error('❌ Erro ao salvar programação:', error);
        alert('Erro ao salvar programação. Verifique o console para mais detalhes.');
      }
  };

  const handleDeleteSchedule = async (id: string) => {
      const schedule = schedules.find(s => s.id === id);
      if (!schedule) return;
      
      const confirmDelete = window.confirm(`Tem certeza que deseja deletar a programação "${schedule.title}"?\n\nEsta ação não pode ser desfeita.`);
      if (!confirmDelete) return;
      
      try {
        const success = await schedulesApi.delete(id);
        if (success) {
          setSchedules(prev => prev.filter(s => s.id !== id));
          alert('Programação deletada com sucesso!');
        } else {
          alert('Erro ao deletar programação. Tente novamente.');
        }
      } catch (error) {
        console.error('Erro ao deletar programação:', error);
        alert('Erro ao deletar programação. Tente novamente.');
      }
  };

  const handleToggleScheduleActive = async (id: string) => {
      try {
        const schedule = schedules.find(s => s.id === id);
        if (!schedule) return;
        
        const newActiveState = !schedule.isActive;
        
        // Preservar todos os dados do schedule, especialmente o array 'days'
        const updateData = {
          isActive: newActiveState,
          ...schedule
        };
        
        const updated = await schedulesApi.update(id, updateData);
        if (updated) {
          setSchedules(prev => prev.map(s => ({
            ...s,
            isActive: s.id === id ? (updated.isActive ?? newActiveState) : false,
            // Garantir que days seja preservado
            days: s.id === id ? (updated.days ?? s.days) : s.days
          })));
          
          // Mostrar mensagem informativa
          if (newActiveState) {
            alert(`✅ Programação "${schedule.title}" marcada como ATIVA!\n\nEsta programação será considerada para exibir alertas na Visão Geral.`);
          } else {
            alert(`Programação "${schedule.title}" desativada.`);
          }
        } else {
          alert('Erro ao atualizar programação. Tente novamente.');
        }
      } catch (error) {
        console.error('Erro ao atualizar programação:', error);
        alert('Erro ao atualizar programação. Tente novamente.');
      }
  };

  // Sync URL with route on mount
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/registro' || path === '/register') {
      setCurrentRoute('register');
    } else if (path === '/login') {
      setCurrentRoute('login');
    } else if (path === '/' || path === '') {
      setCurrentRoute('landing');
    }
  }, []);

  // Update URL when route changes
  useEffect(() => {
    if (currentRoute === 'register') {
      window.history.pushState({}, '', '/registro');
    } else if (currentRoute === 'login') {
      window.history.pushState({}, '', '/login');
    } else if (currentRoute === 'landing') {
      window.history.pushState({}, '', '/');
    } else if (currentRoute === 'app') {
      window.history.pushState({}, '', '/dashboard');
    }
  }, [currentRoute]);

  // Redirecionar para login se estiver na rota 'app' mas não tiver usuário
  useEffect(() => {
    if (currentRoute === 'app' && !currentUser) {
      setCurrentRoute('login');
    }
  }, [currentRoute, currentUser]);

  // Handle login with route change
  const handleLoginWithRoute = (user: User) => {
    handleLogin(user);
    setCurrentRoute('app');
  };

  // Verificar se está na rota de coleta em tempo real
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/scout-realtime') {
      setCurrentRoute('realtime-scout' as any);
    }
  }, []);

  // Mostrar página de coleta em tempo real (standalone)
  if (window.location.pathname === '/scout-realtime') {
    return <RealtimeScoutPage />;
  }

  // Mostrar landing page
  if (currentRoute === 'landing') {
    return <LandingPage 
      onGetStarted={() => {
        console.log('🚀 Redirecionando para /registro');
        setCurrentRoute('register');
      }}
      onGoToLogin={() => {
        console.log('🔑 Redirecionando para /login');
        setCurrentRoute('login');
      }}
    />;
  }

  // Mostrar página de registro
  if (currentRoute === 'register') {
    return <Login 
      onLogin={handleLoginWithRoute} 
      initialMode="register"
      onSwitchToLogin={() => setCurrentRoute('login')}
    />;
  }

  // Mostrar página de login
  if (currentRoute === 'login') {
    return <Login 
      onLogin={handleLoginWithRoute}
      initialMode="login"
      onSwitchToRegister={() => setCurrentRoute('register')}
    />;
  }

  // Mostrar loading enquanto inicializa
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00f0ff] mx-auto mb-4"></div>
          <p className="text-zinc-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se estiver na rota 'app' mas não tiver usuário, mostrar loading
  if (currentRoute === 'app' && !currentUser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">Redirecionando...</p>
        </div>
      </div>
    );
  }

  // Handlers para Settings
  const handleUpdateTargets = async (targets: StatTargets) => {
    try {
      const existing = await statTargetsApi.getAll();
      const targetId = existing.length > 0 ? existing[0].id || 'default' : 'default';
      
      await statTargetsApi.update(targetId, targets);
      setStatTargets(targets);
    } catch (error) {
      console.error('Erro ao atualizar metas:', error);
      setStatTargets(targets); // Atualizar localmente mesmo com erro
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'team':
        return (
          <TabBackgroundWrapper>
            <TeamManagement 
              players={players} 
              onAddPlayer={handleAddPlayer} 
              onUpdatePlayer={handleUpdatePlayer}
              config={config} 
            />
          </TabBackgroundWrapper>
        );
      case 'ranking': 
        return (
          <TabBackgroundWrapper>
            <StatsRanking players={players} matches={matches} />
          </TabBackgroundWrapper>
        ); 
      case 'general':
        return <GeneralScout config={config} matches={matches} players={players} />; 
      case 'individual':
        return (
          <TabBackgroundWrapper>
            <IndividualScout config={config} currentUser={currentUser} matches={matches} players={players} timeControls={timeControls} />
          </TabBackgroundWrapper>
        );
      case 'physical':
        return (
          <TabBackgroundWrapper>
            <PhysicalScout matches={matches} players={players} />
          </TabBackgroundWrapper>
        );
      case 'assessment': 
        return (
          <TabBackgroundWrapper>
            <PhysicalAssessmentTab players={players} assessments={assessments} onSaveAssessment={handleSaveAssessment} />
          </TabBackgroundWrapper>
        );
      case 'video':
        return (
          <TabBackgroundWrapper>
            <VideoScout config={config} matches={matches} players={players} />
          </TabBackgroundWrapper>
        );
      case 'schedule': // New Case
        return (
          <TabBackgroundWrapper>
            <Schedule 
              schedules={schedules} 
              onSaveSchedule={handleSaveSchedule} 
              onDeleteSchedule={handleDeleteSchedule}
              onToggleActive={handleToggleScheduleActive}
            />
          </TabBackgroundWrapper>
        );
      case 'championship':
        return (
          <TabBackgroundWrapper>
            <ChampionshipTable
            matches={championshipMatches}
            competitions={competitions}
            championships={championships}
            onSaveChampionship={(championship) => {
              setChampionships(prev => {
                const updated = prev.filter(c => c.id !== championship.id);
                updated.push(championship);
                localStorage.setItem('championships', JSON.stringify(updated));
                return updated;
              });
            }}
            onSave={async (match) => {
              try {
                console.log('💾 Salvando partida:', match);
                console.log('📋 Partidas atuais na lista:', championshipMatches.length);
                
                if (match.id && championshipMatches.find(m => m.id === match.id)) {
                  // Atualizar
                  console.log('🔄 Atualizando partida existente:', match.id);
                  const updated = await championshipMatchesApi.update(match.id, match);
                  console.log('📥 API retornou (update):', updated);
                  if (updated) {
                    setChampionshipMatches(prev => prev.map(m => m.id === match.id ? updated : m));
                    console.log('✅ Partida atualizada com sucesso');
                  } else {
                    console.error('❌ API retornou null ao atualizar');
                    alert('Erro: A API não retornou a partida atualizada. Verifique o console.');
                  }
                } else {
                  // Criar
                  console.log('➕ Criando nova partida (sem ID ou ID não encontrado)');
                  const saved = await championshipMatchesApi.create(match);
                  console.log('📥 API retornou (create):', saved);
                  if (saved) {
                    setChampionshipMatches(prev => {
                      const newList = [...prev, saved];
                      console.log('✅ Partida criada e adicionada à lista. Total:', newList.length);
                      return newList;
                    });
                  } else {
                    console.error('❌ API retornou null ao criar');
                    alert('Erro: A API não retornou a partida criada. Verifique o console do navegador e do backend.');
                  }
                }
              } catch (error) {
                console.error('❌ Erro ao salvar partida do campeonato:', error);
                alert('Erro ao salvar partida. Verifique o console.');
              }
            }}
            onDelete={async (id) => {
              try {
                const success = await championshipMatchesApi.delete(id);
                if (success) {
                  setChampionshipMatches(prev => prev.filter(m => m.id !== id));
                }
              } catch (error) {
                console.error('Erro ao deletar partida do campeonato:', error);
                alert('Erro ao deletar partida. Verifique o console.');
              }
            }}
            onUseForInput={(match) => {
              // Navegar para Input de Dados e preencher automaticamente
              setActiveTab('table');
              // Armazenar o match selecionado para uso no ScoutTable com todos os dados
              (window as any).selectedChampionshipMatch = {
                date: match.date,
                opponent: match.opponent,
                competition: match.competition,
                location: match.location,
                scoreTarget: match.scoreTarget,
                time: match.time
              };
            }}
            onRefresh={async () => {
              try {
                console.log('🔄 Recarregando dados da planilha...');
                const data = await championshipMatchesApi.getAll();
                setChampionshipMatches(data);
                console.log('✅ Dados recarregados da planilha:', data.length, 'partidas');
                alert(`Dados recarregados! ${data.length} partida(s) encontrada(s).`);
              } catch (error) {
                console.error('❌ Erro ao recarregar dados:', error);
                alert('Erro ao recarregar dados. Verifique o console para mais detalhes.');
              }
            }}
            />
          </TabBackgroundWrapper>
        );
      case 'table':
        return (
          <TabBackgroundWrapper>
            <ScoutTable 
          onSave={handleSaveMatch} 
          players={players} 
          competitions={competitions} 
          matches={matches}
          initialData={(window as any).selectedChampionshipMatch}
          onInitialDataUsed={() => {
            delete (window as any).selectedChampionshipMatch;
          }}
          championshipMatches={championshipMatches}
          teams={teams}
            />
          </TabBackgroundWrapper>
        );
      case 'academia':
        return (
          <TabBackgroundWrapper>
            <Academia />
          </TabBackgroundWrapper>
        );
      case 'management-report':
        return (
          <TabBackgroundWrapper>
            <ManagementReport 
              players={players} 
              matches={matches} 
              assessments={assessments}
              timeControls={timeControls}
            />
          </TabBackgroundWrapper>
        );
      case 'settings':
        return (
          <TabBackgroundWrapper>
            <Settings 
              currentUser={currentUser} 
              onUpdateUser={handleUpdateUser}
              statTargets={statTargets}
              onUpdateTargets={handleUpdateTargets}
            />
          </TabBackgroundWrapper>
        );
      case 'dashboard':
      default:
        return (
          <div className="h-full w-full rounded-3xl border border-zinc-900 bg-black p-6 md:p-10 shadow-2xl animate-fade-in">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Visão Geral</span>
                  <h1 className="text-3xl md:text-4xl font-semibold text-white">Primeira impressão</h1>
                  <p className="text-sm text-zinc-400 max-w-2xl">
                    Insights essenciais do scout coletivo, resultados e participações recentes.
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <NextMatchAlert matches={championshipMatches} />
                  <ScheduleAlerts schedules={schedules} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                <StatCard
                  label="Quantidade de atletas"
                  value={overviewStats.totalAthletes}
                  helper={overviewStats.totalAthletes > 0 ? 'Cadastros ativos' : 'Sem atletas cadastrados'}
                />
                <StatCard
                  label="Próximo jogo"
                  value={overviewStats.nextMatch ? `${overviewStats.nextMatch.team} x ${overviewStats.nextMatch.opponent}` : '—'}
                  helper={
                    overviewStats.nextMatch
                      ? `${formatMatchDate(overviewStats.nextMatch.dateTime)} • ${overviewStats.nextMatch.competition}`
                      : 'Sem partidas agendadas'
                  }
                />
                <StatCard
                  label="Quantidade de jogos"
                  value={overviewStats.totalGames}
                  helper={`Vitórias ${overviewStats.wins} • Derrotas ${overviewStats.losses}`}
                  highlight={overviewStats.totalGames > 0}
                />
                <StatCard
                  label="Artilheiro do time"
                  value={overviewStats.topScorerName}
                  helper={
                    overviewStats.topScorerGoals > 0
                      ? `${overviewStats.topScorerGoals} gols`
                      : 'Sem gols registrados'
                  }
                />
                <StatCard
                  label="Lesões no ano"
                  value={overviewStats.injuriesThisYear}
                  helper={`Ano ${overviewStats.currentYear}`}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleTabChange('general')}
                  className="flex items-center gap-2 rounded-full border border-zinc-800 bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-200 transition-colors hover:border-[#00f0ff]/60 hover:text-white"
                >
                  <BarChart3 size={14} />
                  Scout Coletivo
                </button>
                <button
                  onClick={() => handleTabChange('management-report')}
                  className="flex items-center gap-2 rounded-full border border-zinc-800 bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-200 transition-colors hover:border-[#00f0ff]/60 hover:text-white"
                >
                  <FileText size={14} />
                  Relatório Gerencial
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  // Se não estiver na rota 'app', renderizar sem Sidebar
  if (currentRoute !== 'app') {
    // Landing, login ou register - já renderizado acima
    return null; // Os returns acima já cobrem esses casos
  }

  // Rota 'app' - renderizar com Sidebar
  return (
    <div className="flex min-h-screen bg-black text-zinc-100 font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        onLogout={() => {
          console.log('👋 Logout - Voltando para home');
          setCurrentUser(null);
          setCurrentRoute('landing');
        }}
        currentUser={currentUser}
      />
      <main className="flex-1 ml-64 p-6 overflow-y-auto h-screen scroll-smooth print:ml-0 print:p-0">
        {isLoading ? <LoadingMessage activeTab={activeTab} /> : renderContent()}
      </main>
    </div>
  );
}