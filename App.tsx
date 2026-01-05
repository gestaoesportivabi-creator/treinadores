import React, { useState, useEffect } from 'react';
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
import { TimeControl } from './components/TimeControl'; 
import { Schedule } from './components/Schedule';
import { LoadingMessage } from './components/LoadingMessage';
import { ChampionshipTable, ChampionshipMatch } from './components/ChampionshipTable';
import { ScheduleAlerts } from './components/ScheduleAlerts';
import { TabBackgroundWrapper } from './components/TabBackgroundWrapper';
import { SPORT_CONFIGS, MATCHES as INITIAL_MATCHES, PLAYERS as INITIAL_PLAYERS, ASSESSMENTS as INITIAL_ASSESSMENTS } from './constants';
import { Activity, BarChart3, Clock, Database, PlayCircle, ArrowRight, User as UserIcon, Quote, Trophy } from 'lucide-react';
import { User, MatchRecord, Player, PhysicalAssessment, WeeklySchedule, StatTargets, PlayerTimeControl } from './types';
import { playersApi, matchesApi, assessmentsApi, schedulesApi, competitionsApi, statTargetsApi, timeControlsApi, championshipMatchesApi } from './services/api';

const SLIDES = [
    {
        img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2070&auto=format&fit=crop",
        quote: "A força do time está em cada membro. A força de cada membro é o time.",
        author: "Phil Jackson"
    },
    {
        img: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2070&auto=format&fit=crop",
        quote: "A disciplina é a ponte entre metas e realizações.",
        author: "Jim Rohn"
    },
    {
        img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop",
        quote: "Concentre-se em onde você quer chegar, não no que você teme.",
        author: "Tony Robbins"
    },
    {
        img: "https://images.unsplash.com/photo-1517466787929-bc90951d0528?q=80&w=2070&auto=format&fit=crop",
        quote: "Não diminua a meta. Aumente o esforço.",
        author: "Mentalidade de Elite"
    },
    {
        img: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2070&auto=format&fit=crop",
        quote: "Os vencedores nunca desistem, e os que desistem nunca vencem.",
        author: "Vince Lombardi"
    },
    {
        img: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=2070&auto=format&fit=crop",
        quote: "O sucesso não é final, o fracasso não é fatal: é a coragem de continuar que conta.",
        author: "Winston Churchill"
    },
    {
        img: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=2070&auto=format&fit=crop",
        quote: "O trabalho em equipe faz o sonho funcionar.",
        author: "Michael Jordan"
    },
    {
        img: "https://images.unsplash.com/photo-1594736797933-d0cbc3dc5bdb?q=80&w=2070&auto=format&fit=crop",
        quote: "A excelência não é um ato, mas um hábito.",
        author: "Aristóteles"
    }
];

export default function App() {
  // Route state: 'landing' | 'login' | 'register' | 'app'
  const [currentRoute, setCurrentRoute] = useState<'landing' | 'login' | 'register' | 'app'>('landing');
  
  // User Session (Not persisted for security in this demo, but could be)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Persisted States - Inicializados vazios, serão carregados da API
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [assessments, setAssessments] = useState<PhysicalAssessment[]>([]);
  const [schedules, setSchedules] = useState<WeeklySchedule[]>([]);
  const [competitions, setCompetitions] = useState<string[]>(['Copa Santa Catarina', 'Série Prata', 'JASC']);
  const [timeControls, setTimeControls] = useState<PlayerTimeControl[]>([]);
  const [championshipMatches, setChampionshipMatches] = useState<ChampionshipMatch[]>([]);
  
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

  // Carregar dados da API quando o componente monta
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsInitializing(true);
        console.log('🔄 Carregando dados da API...');
        
        // Carregar todos os dados em paralelo
        const [playersData, matchesData, assessmentsData, schedulesData, competitionsData, statTargetsData, timeControlsData, championshipMatchesData] = await Promise.all([
          playersApi.getAll(),
          matchesApi.getAll(),
          assessmentsApi.getAll(),
          schedulesApi.getAll(),
          competitionsApi.getAll(),
          statTargetsApi.getAll(),
          timeControlsApi.getAll(),
          championshipMatchesApi.getAll()
        ]);

        // Se não houver dados na API, usar dados iniciais
        setPlayers(playersData.length > 0 ? playersData : INITIAL_PLAYERS);
        
        // Validar matches antes de definir - garantir que todos tenham teamStats válido
        const validMatches = (matchesData.length > 0 ? matchesData : INITIAL_MATCHES).filter(m => {
          if (!m || !m.teamStats) {
            console.warn('⚠️ Match inválido removido ao carregar:', m);
            return false;
          }
          return true;
        });
        setMatches(validMatches);
        
        setAssessments(assessmentsData.length > 0 ? assessmentsData : INITIAL_ASSESSMENTS);
        // Garantir que schedules tenham days como array válido
        // Remover duplicatas baseado no ID (manter apenas o mais recente ou o que está ativo)
        const scheduleMap = new Map<string, WeeklySchedule>();
        schedulesData.forEach(schedule => {
          if (schedule && schedule.id) {
            const validSchedule = {
              ...schedule,
              days: Array.isArray(schedule.days) ? schedule.days : (schedule.days ? [schedule.days] : []),
              isActive: schedule.isActive === true || schedule.isActive === 'TRUE' || schedule.isActive === 'true'
            };
            // Se já existe, manter o que tem isActive=true ou o mais recente
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
        // Ordenar: ativos primeiro, depois por data de criação (mais recente primeiro)
        const validSchedules = Array.from(scheduleMap.values()).sort((a, b) => {
          if (a.isActive && !b.isActive) return -1;
          if (!a.isActive && b.isActive) return 1;
          const aCreated = a.createdAt || 0;
          const bCreated = b.createdAt || 0;
          return bCreated - aCreated;
        });
        console.log('📋 Schedules carregados (após remover duplicatas):', validSchedules.length, '| Ativos:', validSchedules.filter(s => s.isActive).length);
        setSchedules(validSchedules);
        setTimeControls(timeControlsData);
        console.log('📋 Championship Matches carregados:', championshipMatchesData?.length || 0, championshipMatchesData);
        console.log('📋 Tipo de championshipMatchesData:', typeof championshipMatchesData, Array.isArray(championshipMatchesData));
        if (championshipMatchesData && championshipMatchesData.length > 0) {
          console.log('✅ Dados encontrados! Primeiro item:', championshipMatchesData[0]);
        } else {
          console.warn('⚠️ Nenhum dado encontrado ou array vazio');
        }
        setChampionshipMatches(championshipMatchesData && championshipMatchesData.length > 0 ? championshipMatchesData : []);
        setCompetitions(competitionsData.length > 0 ? competitionsData : ['Copa Santa Catarina', 'Série Prata', 'JASC']);
        
        // Stat targets (pegar o primeiro ou usar default)
        if (statTargetsData.length > 0 && statTargetsData[0]) {
          setStatTargets(statTargetsData[0]);
        }
        
        console.log('✅ Dados carregados com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao carregar dados da API:', error);
        // Fallback para dados iniciais em caso de erro
        setPlayers(INITIAL_PLAYERS);
        setMatches(INITIAL_MATCHES);
        setAssessments(INITIAL_ASSESSMENTS);
        alert('⚠️ Erro ao carregar dados da API. Usando dados locais. Verifique sua conexão.');
      } finally {
        setIsInitializing(false);
      }
    };

    loadData();
  }, []); // Executar apenas uma vez quando o componente monta

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

  // Carousel Timer
  useEffect(() => {
    if (activeTab === 'dashboard') {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 10000); // 10 seconds
        return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleLogin = (user: User) => {
      setCurrentUser(user);
      setActiveTab('dashboard'); 
  };

  const handleTabChange = (tab: string) => {
      setIsLoading(true);
      setActiveTab(tab);
      // Simulate loading time
      setTimeout(() => {
          setIsLoading(false);
      }, 500);
  };

  const handleUpdateUser = (updatedData: Partial<User>) => {
      if (currentUser) {
          setCurrentUser({ ...currentUser, ...updatedData });
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

  // Handle login with route change
  const handleLoginWithRoute = (user: User) => {
    handleLogin(user);
    setCurrentRoute('app');
  };

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
    return <LoadingMessage activeTab={activeTab} />;
  }

  if (!currentUser) {
    setCurrentRoute('login');
    return null;
  }

  // Handlers para Settings
  const handleUpdateCompetitions = async (newCompetitions: string[]) => {
    try {
      // Deletar todas e recriar (simplificado - pode melhorar depois)
      const existing = await competitionsApi.getAll();
      
      // Salvar novas competições
      for (const comp of newCompetitions) {
        if (!existing.includes(comp)) {
          await competitionsApi.create(comp);
        }
      }
      
      setCompetitions(newCompetitions);
    } catch (error) {
      console.error('Erro ao atualizar competições:', error);
      setCompetitions(newCompetitions); // Atualizar localmente mesmo com erro
    }
  };

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
            <TeamManagement players={players} onAddPlayer={handleAddPlayer} onUpdatePlayer={handleUpdatePlayer} config={config} />
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
            onSave={async (match) => {
              try {
                if (match.id && championshipMatches.find(m => m.id === match.id)) {
                  // Atualizar
                  const updated = await championshipMatchesApi.update(match.id, match);
                  if (updated) {
                    setChampionshipMatches(prev => prev.map(m => m.id === match.id ? updated : m));
                  }
                } else {
                  // Criar
                  const saved = await championshipMatchesApi.create(match);
                  if (saved) {
                    setChampionshipMatches(prev => [...prev, saved]);
                  }
                }
              } catch (error) {
                console.error('Erro ao salvar partida do campeonato:', error);
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
              // Armazenar o match selecionado para uso no ScoutTable
              (window as any).selectedChampionshipMatch = match;
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
            />
          </TabBackgroundWrapper>
        );
      case 'time-control':
        // Mostrar controle de tempo para a partida mais recente ou permitir seleção
        const latestMatch = matches.length > 0 ? matches[matches.length - 1] : null;
        if (!latestMatch) {
          return (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-zinc-500 text-lg mb-4">Nenhuma partida encontrada</p>
                <p className="text-zinc-600 text-sm">Salve uma partida na aba "Input de Dados" para começar o controle de tempo.</p>
              </div>
            </div>
          );
        }
        return (
          <TabBackgroundWrapper>
            <TimeControl match={latestMatch} players={players} />
          </TabBackgroundWrapper>
        );
      case 'settings':
        return (
          <TabBackgroundWrapper>
            <Settings 
              currentUser={currentUser} 
              onUpdateUser={handleUpdateUser} 
              competitions={competitions} 
              onUpdateCompetitions={setCompetitions}
              statTargets={statTargets}
              onUpdateTargets={setStatTargets}
            />
          </TabBackgroundWrapper>
        );
      case 'dashboard':
      default:
        return (
          <div className="h-full w-full relative rounded-3xl overflow-hidden flex flex-col p-8 md:p-16 group shadow-2xl border border-zinc-900 bg-black animate-fade-in">
            {/* Background Carousel */}
            {SLIDES.map((slide, index) => (
                <div 
                    key={index}
                    className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-50' : 'opacity-0'}`}
                >
                    <img 
                        src={slide.img}
                        alt="Background" 
                        className="w-full h-full object-cover"
                    />
                     {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                </div>
            ))}

            {/* Content Content */}
            <div className="relative z-10 max-w-5xl h-full flex flex-col justify-between">
                
                {/* Schedule Alerts - Top Section */}
                <div className="flex-1 overflow-y-auto">
                    <ScheduleAlerts schedules={schedules} />
                </div>
                
                {/* Bottom Content */}
                <div className="flex flex-col justify-end">
                
                {/* User Greeting */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-[2px] w-16 bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]"></div>
                    <span className="text-[#00f0ff] font-bold tracking-[0.3em] uppercase text-xs">
                        Bem-vindo, {currentUser.name}
                    </span>
                </div>

                {/* Quote Carousel Text */}
                <div className="mb-8 min-h-[200px] flex flex-col justify-end">
                     <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter drop-shadow-2xl italic uppercase mb-6 animate-fade-in-up transition-all duration-700">
                        "{SLIDES[currentSlide].quote}"
                    </h1>
                    <p className="text-zinc-400 font-bold text-lg uppercase tracking-widest flex items-center gap-2 animate-fade-in">
                        — {SLIDES[currentSlide].author}
                    </p>
                </div>
                
                {/* Carousel Indicators */}
                <div className="flex gap-2 mb-12">
                    {SLIDES.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`h-1 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-12 bg-[#00f0ff]' : 'w-4 bg-zinc-800'}`}
                        ></div>
                    ))}
                </div>

                {/* Quick Navigation - Modern Design with New Palette (65% opacity) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button 
                        onClick={() => handleTabChange('general')}
                        className="relative bg-[#00f0ff]/65 border border-[#00f0ff]/40 p-6 rounded-2xl text-left hover:bg-[#00f0ff]/75 hover:border-[#00f0ff]/60 transition-all group/btn overflow-hidden shadow-lg hover:shadow-xl hover:shadow-[#00f0ff]/40 backdrop-blur-sm"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/65 via-[#00f0ff]/50 to-[#00f0ff]/80 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <BarChart3 className="text-black mb-4 group-hover/btn:scale-110 group-hover/btn:rotate-3 transition-all duration-300 drop-shadow-lg" size={32} />
                            <h3 className="text-black font-black uppercase text-sm tracking-wider drop-shadow-md">Scout Coletivo</h3>
                            <div className="flex items-center gap-2 text-[10px] text-black/80 font-bold uppercase mt-2">
                                Análise Tática <ArrowRight size={12} className="group-hover/btn:translate-x-2 transition-transform duration-300" />
                            </div>
                        </div>
                    </button>

                    <button 
                        onClick={() => handleTabChange('ranking')}
                        className="relative bg-[#3b82f6]/65 border border-[#3b82f6]/40 p-6 rounded-2xl text-left hover:bg-[#3b82f6]/75 hover:border-[#3b82f6]/60 transition-all group/btn overflow-hidden shadow-lg hover:shadow-xl hover:shadow-[#3b82f6]/40 backdrop-blur-sm"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/65 via-[#3b82f6]/50 to-[#3b82f6]/80 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <Trophy className="text-white mb-4 group-hover/btn:scale-110 group-hover/btn:rotate-3 transition-all duration-300 drop-shadow-lg" size={32} />
                            <h3 className="text-white font-black uppercase text-sm tracking-wider drop-shadow-md">Ranking</h3>
                            <div className="flex items-center gap-2 text-[10px] text-white/90 font-bold uppercase mt-2">
                                Destaques da Equipe <ArrowRight size={12} className="group-hover/btn:translate-x-2 transition-transform duration-300" />
                            </div>
                        </div>
                    </button>

                    <button 
                         onClick={() => handleTabChange('individual')}
                        className="relative bg-[#60a5fa]/65 border border-[#60a5fa]/40 p-6 rounded-2xl text-left hover:bg-[#60a5fa]/75 hover:border-[#60a5fa]/60 transition-all group/btn overflow-hidden shadow-lg hover:shadow-xl hover:shadow-[#60a5fa]/40 backdrop-blur-sm"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#60a5fa]/65 via-[#60a5fa]/50 to-[#60a5fa]/80 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <UserIcon className="text-white mb-4 group-hover/btn:scale-110 group-hover/btn:rotate-3 transition-all duration-300 drop-shadow-lg" size={32} />
                            <h3 className="text-white font-black uppercase text-sm tracking-wider drop-shadow-md">Performance Atletas</h3>
                            <div className="flex items-center gap-2 text-[10px] text-white/90 font-bold uppercase mt-2">
                                Dados Individuais <ArrowRight size={12} className="group-hover/btn:translate-x-2 transition-transform duration-300" />
                            </div>
                        </div>
                    </button>
                </div>
                
                </div>
            </div>
          </div>
        );
    }
  };

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