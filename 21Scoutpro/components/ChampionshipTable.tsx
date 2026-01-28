import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Users, Trophy, Plus, Save, Trash2, Edit2, RefreshCw, X, Upload, Target, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { Championship, ChampionshipMatch as ChampionshipMatchType, MatchRecord } from '../types';

export interface ChampionshipMatch {
    id: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    opponent: string;
    competition: string;
    location?: string; // Mandante/Visitante
    scoreTarget?: string; // Meta de pontuação esperada
}

interface ChampionshipTableProps {
    matches?: ChampionshipMatch[];
    competitions?: string[]; // Competições disponíveis
    onSave?: (match: ChampionshipMatch) => void;
    onDelete?: (id: string) => void;
    onUseForInput?: (match: ChampionshipMatch) => void; // Callback para usar na aba Input de Dados
    onRefresh?: () => void; // Callback para recarregar dados da API
    championships?: Championship[]; // Campeonatos cadastrados
    onSaveChampionship?: (championship: Championship) => void; // Callback para salvar campeonato
    allMatches?: MatchRecord[]; // Partidas salvas (MatchRecord) para calcular estatísticas
}

export const ChampionshipTable: React.FC<ChampionshipTableProps> = ({ 
    matches = [], 
    competitions = [],
    onSave, 
    onDelete,
    onUseForInput,
    onRefresh,
    championships = [],
    onSaveChampionship,
    allMatches = []
}) => {
    // Debug: log matches
    useEffect(() => {
        console.log('📋 ChampionshipTable - matches recebidos:', matches.length, matches);
        if (matches.length === 0) {
            console.log('⚠️ Nenhum match encontrado. Verifique se a API está retornando dados.');
        }
    }, [matches]);

    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAmistoso, setIsAmistoso] = useState(false);
    const [formData, setFormData] = useState<ChampionshipMatch>({
        id: '',
        date: new Date().toISOString().split('T')[0],
        time: '20:00',
        opponent: '',
        competition: competitions.length > 0 ? competitions[0] : '',
        location: '',
        scoreTarget: ''
    });
    
    // Estados para modal de cadastro de campeonato
    const [showChampionshipModal, setShowChampionshipModal] = useState(false);
    const [championshipForm, setChampionshipForm] = useState<Championship>({
        id: '',
        name: '',
        phase: '',
        suspensionRules: {
            yellowCardsForSuspension: 3,
            redCardSuspension: 1,
            yellowAccumulationSuspension: 1
        }
    });
    const [showChampionshipMatchesForm, setShowChampionshipMatchesForm] = useState(false);
    const [currentChampionshipId, setCurrentChampionshipId] = useState<string | null>(null);
    const [championshipMatchesForm, setChampionshipMatchesForm] = useState<ChampionshipMatch[]>([]);
    
    // Estados para importação
    const [showImportModal, setShowImportModal] = useState(false);
    const [importData, setImportData] = useState<string>('');

    const handleSave = () => {
        if (!formData.opponent.trim()) {
            alert('Por favor, preencha o adversário.');
            return;
        }

        // Se estiver editando, incluir o ID. Se for nova partida, não incluir
        const matchToSave: ChampionshipMatch = editingId 
            ? { ...formData, id: editingId }
            : {
                date: formData.date,
                time: formData.time,
                opponent: formData.opponent,
                competition: formData.competition,
                location: formData.location,
                scoreTarget: formData.scoreTarget
            } as any;

        if (onSave) {
            onSave(matchToSave);
        }

        // Reset form
        setFormData({
            id: '',
            date: new Date().toISOString().split('T')[0],
            time: '20:00',
            opponent: '',
            competition: competitions.length > 0 ? competitions[0] : '',
            location: 'Mandante',
            scoreTarget: ''
        });
        setIsCreating(false);
        setEditingId(null);
        setIsAmistoso(false);
    };

    const handleEdit = (match: ChampionshipMatch) => {
        setFormData(match);
        setEditingId(match.id);
        // Detectar se é amistoso
        setIsAmistoso(match.competition === 'Amistoso');
        setIsCreating(true);
    };

    const handleCancel = () => {
        setFormData({
            id: '',
            date: new Date().toISOString().split('T')[0],
            time: '20:00',
            opponent: '',
            competition: competitions.length > 0 ? competitions[0] : '',
            location: 'Mandante',
            scoreTarget: ''
        });
        setIsCreating(false);
        setEditingId(null);
        setIsAmistoso(false);
    };

    const handleUseForInput = (match: ChampionshipMatch) => {
        if (onUseForInput) {
            onUseForInput(match);
        }
    };
    
    // Funções para cadastro de campeonato
    const handleSaveChampionship = () => {
        if (!championshipForm.name.trim()) {
            alert('Por favor, preencha o nome da competição.');
            return;
        }
        
        const championshipToSave: Championship = {
            ...championshipForm,
            id: championshipForm.id || Date.now().toString(),
            createdAt: new Date().toISOString()
        };
        
        if (onSaveChampionship) {
            onSaveChampionship(championshipToSave);
        }
        
        // Salvar no localStorage também
        const savedChampionships = JSON.parse(localStorage.getItem('championships') || '[]');
        const updatedChampionships = savedChampionships.filter((c: Championship) => c.id !== championshipToSave.id);
        updatedChampionships.push(championshipToSave);
        localStorage.setItem('championships', JSON.stringify(updatedChampionships));
        
        // Fechar modal e abrir formulário de partidas
        setShowChampionshipModal(false);
        setCurrentChampionshipId(championshipToSave.id);
        setChampionshipMatchesForm([{
            id: '',
            date: new Date().toISOString().split('T')[0],
            time: '20:00',
            opponent: '',
            competition: championshipToSave.name,
            location: 'Mandante',
            scoreTarget: ''
        }]);
        setShowChampionshipMatchesForm(true);
    };
    
    const handleAddChampionshipMatch = () => {
        const championship = championships.find(c => c.id === currentChampionshipId);
        setChampionshipMatchesForm([...championshipMatchesForm, {
            id: '',
            date: new Date().toISOString().split('T')[0],
            time: '20:00',
            opponent: '',
            competition: championship?.name || '',
            location: 'Mandante',
            scoreTarget: ''
        }]);
    };
    
    const handleSaveChampionshipMatches = () => {
        if (championshipMatchesForm.length === 0) {
            alert('Adicione pelo menos uma partida.');
            return;
        }
        
        // Validar que todas as partidas têm adversário
        const invalidMatches = championshipMatchesForm.filter(m => !m.opponent.trim());
        if (invalidMatches.length > 0) {
            alert('Por favor, preencha o adversário em todas as partidas.');
            return;
        }
        
        // Salvar todas as partidas
        championshipMatchesForm.forEach(match => {
            if (match.opponent.trim()) {
                const matchToSave: ChampionshipMatch = {
                    ...match,
                    id: match.id || Date.now().toString() + Math.random()
                };
                if (onSave) {
                    onSave(matchToSave);
                }
            }
        });
        
        alert(`✅ ${championshipMatchesForm.length} partida(s) cadastrada(s) com sucesso!`);
        setShowChampionshipMatchesForm(false);
        setChampionshipMatchesForm([]);
        setCurrentChampionshipId(null);
    };
    
    // Funções para importação
    const handleImportData = () => {
        if (!importData.trim()) {
            alert('Por favor, cole os dados da tabela.');
            return;
        }
        
        // Parsear dados (formato TSV/CSV básico)
        const lines = importData.split('\n').filter(line => line.trim());
        const importedMatches: ChampionshipMatch[] = [];
        
        lines.forEach((line, index) => {
            if (index === 0) return; // Pular cabeçalho se houver
            
            const columns = line.split('\t').length > 1 ? line.split('\t') : line.split(',');
            
            if (columns.length >= 3) {
                // Tentar identificar colunas: Data, Hora, Adversário, Campeonato
                const date = columns[0]?.trim() || '';
                const time = columns[1]?.trim() || '20:00';
                const opponent = columns[2]?.trim() || '';
                const competition = columns[3]?.trim() || competitions[0] || '';
                
                if (date && opponent) {
                    importedMatches.push({
                        id: Date.now().toString() + index,
                        date: date,
                        time: time,
                        opponent: opponent,
                        competition: competition,
                        location: 'Mandante',
                        scoreTarget: ''
                    });
                }
            }
        });
        
        if (importedMatches.length === 0) {
            alert('Nenhuma partida válida encontrada nos dados importados. Verifique o formato.');
            return;
        }
        
        // Preview e confirmação
        const confirmMessage = `Foram encontradas ${importedMatches.length} partida(s). Deseja importar?\n\n${importedMatches.map(m => `- ${m.date} ${m.time} vs ${m.opponent}`).join('\n')}`;
        
        if (window.confirm(confirmMessage)) {
            importedMatches.forEach(match => {
                if (onSave) {
                    onSave(match);
                }
            });
            alert(`✅ ${importedMatches.length} partida(s) importada(s) com sucesso!`);
            setShowImportModal(false);
            setImportData('');
        }
    };

    // Função para formatar hora corretamente
    // Converte timestamp ISO ou formato de data/hora para HH:MM
    // Google Sheets retorna apenas hora como "1899-12-30T23:06:28.000Z" (data de referência do Excel)
    const formatTime = (timeValue: string | undefined | null): string => {
        if (!timeValue || timeValue === '-') return '-';
        
        // Se já estiver no formato HH:MM (ex: "20:00"), retorna diretamente
        if (/^\d{2}:\d{2}$/.test(timeValue)) {
            return timeValue;
        }
        
        try {
            // Tenta parsear como Date (pode ser timestamp ISO como "1899-12-30T23:06:28.000Z")
            const date = new Date(timeValue);
            
            // Verifica se a data é válida
            if (isNaN(date.getTime())) {
                return '-'; // Retorna '-' se não for uma data válida
            }
            
            // Extrai horas e minutos e formata como HH:MM
            // Usa getHours/getMinutes (não UTC) para evitar problemas de timezone
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        } catch (e) {
            // Se houver erro no parse, retorna '-'
            console.warn('Erro ao formatar hora:', timeValue, e);
            return '-';
        }
    };

    // Calcular estatísticas do campeonato
    const championshipStats = useMemo(() => {
        if (!allMatches || allMatches.length === 0 || !matches || matches.length === 0) {
            return {
                totalMatches: matches.length,
                matchesWithResult: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                pointsConquered: 0,
                pointsPossible: matches.length * 3,
                aproveitamento: 0
            };
        }

        // Agrupar matches por competição
        const matchesByCompetition = new Map<string, ChampionshipMatch[]>();
        matches.forEach(match => {
            const comp = match.competition || 'Sem Competição';
            if (!matchesByCompetition.has(comp)) {
                matchesByCompetition.set(comp, []);
            }
            matchesByCompetition.get(comp)!.push(match);
        });

        // Calcular estatísticas agregadas de todas as competições
        let totalMatches = matches.length;
        let matchesWithResult = 0;
        let wins = 0;
        let draws = 0;
        let losses = 0;

        // Para cada partida cadastrada, verificar se existe correspondência em allMatches
        matches.forEach(championshipMatch => {
            // Buscar correspondência por competition, date e opponent
            const correspondingMatch = allMatches.find(savedMatch => {
                // Normalizar datas para comparação (apenas YYYY-MM-DD)
                const championshipDate = championshipMatch.date.split('T')[0];
                const savedDate = savedMatch.date.split('T')[0];
                
                return (
                    savedMatch.competition === championshipMatch.competition &&
                    savedDate === championshipDate &&
                    savedMatch.opponent === championshipMatch.opponent
                );
            });

            if (correspondingMatch) {
                matchesWithResult++;
                // Verificar resultado (pode ser 'V'/'D'/'E' ou 'Vitória'/'Derrota'/'Empate')
                const result = correspondingMatch.result;
                if (result === 'Vitória' || result === 'V') {
                    wins++;
                } else if (result === 'Empate' || result === 'E') {
                    draws++;
                } else if (result === 'Derrota' || result === 'D') {
                    losses++;
                }
            }
        });

        // Calcular pontos (padrão: Vitória = 3, Empate = 1, Derrota = 0)
        const pointsConquered = (wins * 3) + (draws * 1) + (losses * 0);
        const pointsPossible = totalMatches * 3;
        const aproveitamento = pointsPossible > 0 
            ? ((pointsConquered / pointsPossible) * 100).toFixed(1)
            : '0.0';

        return {
            totalMatches,
            matchesWithResult,
            wins,
            draws,
            losses,
            pointsConquered,
            pointsPossible,
            aproveitamento: parseFloat(aproveitamento)
        };
    }, [matches, allMatches]);

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="bg-black p-6 rounded-3xl border border-zinc-900 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-wide">
                            <Trophy className="text-[#10b981]" /> Tabela de Campeonato
                        </h2>
                        <p className="text-zinc-500 text-xs font-bold mt-1">
                            Gerencie os jogos da temporada e use para preencher automaticamente o Input de Dados
                        </p>
                    </div>
                    {!isCreating && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {onRefresh && (
                                <button
                                    onClick={onRefresh}
                                    className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 font-bold uppercase text-xs rounded-xl transition-colors"
                                    title="Recarregar dados da planilha"
                                >
                                    <RefreshCw size={16} /> Recarregar
                                </button>
                            )}
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 font-bold uppercase text-xs rounded-xl transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                            >
                                <Upload size={16} /> Importar Tabela
                            </button>
                            <button
                                onClick={() => {
                                    setChampionshipForm({
                                        id: '',
                                        name: '',
                                        phase: '',
                                        suspensionRules: {
                                            yellowCardsForSuspension: 3,
                                            redCardSuspension: 1,
                                            yellowAccumulationSuspension: 1
                                        }
                                    });
                                    setShowChampionshipModal(true);
                                }}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 font-bold uppercase text-xs rounded-xl transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                            >
                                <Trophy size={16} /> Cadastrar Campeonato
                            </button>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="flex items-center gap-2 bg-[#10b981] hover:bg-[#34d399] text-white px-4 py-2 font-bold uppercase text-xs rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            >
                                <Plus size={16} /> Nova Partida
                            </button>
                        </div>
                    )}
                </div>

                {/* Cards de Estatísticas */}
                {matches.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Estatísticas do Campeonato</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Card: Partidas Cadastradas */}
                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Calendar className="text-blue-400" size={20} />
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Partidas Cadastradas</span>
                                </div>
                                <p className="text-3xl font-black text-white italic">{championshipStats.totalMatches}</p>
                            </div>

                            {/* Card: Jogos com Resultado */}
                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Target className="text-green-400" size={20} />
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Jogos com Resultado</span>
                                </div>
                                <p className="text-3xl font-black text-white italic">{championshipStats.matchesWithResult}</p>
                            </div>

                            {/* Card: Vitórias */}
                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Trophy className="text-yellow-400" size={20} />
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Vitórias</span>
                                </div>
                                <p className="text-3xl font-black text-green-400 italic">{championshipStats.wins}</p>
                            </div>

                            {/* Card: Empates */}
                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <BarChart3 className="text-blue-400" size={20} />
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Empates</span>
                                </div>
                                <p className="text-3xl font-black text-blue-400 italic">{championshipStats.draws}</p>
                            </div>

                            {/* Card: Derrotas */}
                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Award className="text-red-400" size={20} />
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Derrotas</span>
                                </div>
                                <p className="text-3xl font-black text-red-400 italic">{championshipStats.losses}</p>
                            </div>

                            {/* Card: Pontos Conquistados */}
                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <TrendingUp className="text-[#10b981]" size={20} />
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Pontos Conquistados</span>
                                </div>
                                <p className="text-3xl font-black text-[#10b981] italic">{championshipStats.pointsConquered}</p>
                            </div>

                            {/* Card: Pontos Possíveis */}
                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Target className="text-purple-400" size={20} />
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Pontos Possíveis</span>
                                </div>
                                <p className="text-3xl font-black text-purple-400 italic">{championshipStats.pointsPossible}</p>
                            </div>

                            {/* Card: Aproveitamento */}
                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <BarChart3 className="text-[#00f0ff]" size={20} />
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Aproveitamento</span>
                                </div>
                                <p className="text-3xl font-black text-[#00f0ff] italic">{championshipStats.aproveitamento.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Formulário de criação/edição */}
                {isCreating && (
                    <div className="mb-6 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                        <h3 className="text-white font-bold text-sm mb-4 uppercase">
                            {editingId ? 'Editar Partida' : 'Nova Partida'}
                        </h3>
                        
                        {/* Toggle Amistoso */}
                        <div className="mb-4 flex items-center gap-3 p-3 bg-black rounded-lg border border-zinc-800">
                            <input
                                type="checkbox"
                                id="amistoso-toggle"
                                checked={isAmistoso}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setIsAmistoso(checked);
                                    if (checked) {
                                        setFormData({ ...formData, competition: 'Amistoso' });
                                    } else {
                                        setFormData({ ...formData, competition: competitions.length > 0 ? competitions[0] : '' });
                                    }
                                }}
                                className="w-4 h-4 accent-[#10b981] cursor-pointer"
                            />
                            <label htmlFor="amistoso-toggle" className="text-white text-xs font-bold uppercase cursor-pointer flex items-center gap-2">
                                <Users size={14} className="text-[#10b981]" />
                                Partida Amistosa (não vinculada a campeonato)
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Data</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-[#10b981] [color-scheme:dark]"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Hora</label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-[#10b981] [color-scheme:dark]"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Adversário</label>
                                <input
                                    type="text"
                                    value={formData.opponent}
                                    onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                                    placeholder="Nome do time"
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-[#10b981]"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">
                                    Competição {isAmistoso && <span className="text-zinc-600">(desabilitado)</span>}
                                </label>
                                <select
                                    value={formData.competition}
                                    onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
                                    disabled={isAmistoso}
                                    className={`w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-[#10b981] ${isAmistoso ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isAmistoso ? (
                                        <option value="Amistoso">Amistoso</option>
                                    ) : (
                                        competitions.map(comp => (
                                            <option key={comp} value={comp}>{comp}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Local</label>
                                <select
                                    value={formData.location || 'Mandante'}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-[#10b981]"
                                >
                                    <option value="Mandante">Mandante</option>
                                    <option value="Visitante">Visitante</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Meta de Pontuação</label>
                                <input
                                    type="text"
                                    value={formData.scoreTarget || ''}
                                    onChange={(e) => setFormData({ ...formData, scoreTarget: e.target.value })}
                                    placeholder="Ex: Vencer por 2 gols"
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-[#10b981]"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-[#10b981] hover:bg-[#34d399] text-white px-4 py-2 font-bold uppercase text-xs rounded-lg transition-colors"
                            >
                                <Save size={14} /> Salvar
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 font-bold uppercase text-xs rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabela de partidas */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-950 text-[10px] text-zinc-400 uppercase tracking-wider font-bold border-b border-zinc-800">
                                <th className="p-3 border-r border-zinc-900">Data</th>
                                <th className="p-3 border-r border-zinc-900">Hora</th>
                                <th className="p-3 border-r border-zinc-900">Adversário</th>
                                <th className="p-3 border-r border-zinc-900">Competição</th>
                                <th className="p-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-zinc-500 text-sm">
                                        Nenhuma partida cadastrada. Clique em "Nova Partida" para começar.
                                    </td>
                                </tr>
                            ) : (
                                matches.map((match) => {
                                    // Tratamento seguro de data
                                    let dateDisplay = '-';
                                    try {
                                        if (match.date) {
                                            const date = new Date(match.date);
                                            if (!isNaN(date.getTime())) {
                                                dateDisplay = date.toLocaleDateString('pt-BR');
                                            }
                                        }
                                    } catch (e) {
                                        console.error('Erro ao formatar data:', match.date, e);
                                    }
                                    
                                    return (
                                        <tr key={match.id} className="border-b border-zinc-900 hover:bg-zinc-950">
                                            <td className="p-3 border-r border-zinc-900 text-white text-xs">
                                                {dateDisplay}
                                            </td>
                                            <td className="p-3 border-r border-zinc-900 text-white text-xs">
                                                {formatTime(match.time)}
                                            </td>
                                            <td className="p-3 border-r border-zinc-900 text-white text-xs font-bold">
                                                {match.opponent || '-'}
                                            </td>
                                            <td className="p-3 border-r border-zinc-900 text-white text-xs">
                                                {match.competition || '-'}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleUseForInput(match)}
                                                        className="p-2 text-[#10b981] hover:bg-zinc-900 rounded-lg transition-colors"
                                                        title="Usar no Input de Dados"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(match)}
                                                        className="p-2 text-blue-400 hover:bg-zinc-900 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    {onDelete && (
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm('Tem certeza que deseja excluir esta partida?')) {
                                                                    onDelete(match.id);
                                                                }
                                                            }}
                                                            className="p-2 text-red-400 hover:bg-zinc-900 rounded-lg transition-colors"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Modal de Cadastro de Campeonato */}
            {showChampionshipModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-black text-xl uppercase flex items-center gap-2">
                                <Trophy className="text-purple-500" size={24} /> Cadastrar Campeonato
                            </h3>
                            <button
                                onClick={() => setShowChampionshipModal(false)}
                                className="text-zinc-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Nome da Competição *</label>
                                <input
                                    type="text"
                                    value={championshipForm.name}
                                    onChange={(e) => setChampionshipForm({ ...championshipForm, name: e.target.value })}
                                    placeholder="Ex: Copa Santa Catarina"
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white text-sm outline-none focus:border-purple-500"
                                />
                            </div>
                            
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Fase da Competição</label>
                                <input
                                    type="text"
                                    value={championshipForm.phase || ''}
                                    onChange={(e) => setChampionshipForm({ ...championshipForm, phase: e.target.value })}
                                    placeholder="Ex: Fase de Grupos, Quartas de Final, etc."
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white text-sm outline-none focus:border-purple-500"
                                />
                            </div>
                            
                            <div className="border-t border-zinc-800 pt-4">
                                <h4 className="text-white font-bold text-sm mb-4 uppercase">Regras de Suspensão</h4>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">
                                            Quantidade de cartões amarelos para suspensão
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={championshipForm.suspensionRules.yellowCardsForSuspension}
                                            onChange={(e) => setChampionshipForm({
                                                ...championshipForm,
                                                suspensionRules: {
                                                    ...championshipForm.suspensionRules,
                                                    yellowCardsForSuspension: parseInt(e.target.value) || 3
                                                }
                                            })}
                                            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white text-sm outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">
                                            Jogos de suspensão por cartão vermelho
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={championshipForm.suspensionRules.redCardSuspension}
                                            onChange={(e) => setChampionshipForm({
                                                ...championshipForm,
                                                suspensionRules: {
                                                    ...championshipForm.suspensionRules,
                                                    redCardSuspension: parseInt(e.target.value) || 1
                                                }
                                            })}
                                            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white text-sm outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">
                                            Jogos de suspensão por acumulação de amarelos
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={championshipForm.suspensionRules.yellowAccumulationSuspension}
                                            onChange={(e) => setChampionshipForm({
                                                ...championshipForm,
                                                suspensionRules: {
                                                    ...championshipForm.suspensionRules,
                                                    yellowAccumulationSuspension: parseInt(e.target.value) || 1
                                                }
                                            })}
                                            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white text-sm outline-none focus:border-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleSaveChampionship}
                                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 font-bold uppercase text-xs rounded-xl transition-colors"
                            >
                                <Save size={16} /> Salvar e Abrir Tabela
                            </button>
                            <button
                                onClick={() => setShowChampionshipModal(false)}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 font-bold uppercase text-xs rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal de Formulário de Partidas do Campeonato */}
            {showChampionshipMatchesForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-black text-xl uppercase flex items-center gap-2">
                                <Trophy className="text-purple-500" size={24} /> Preencher Tabela do Campeonato
                            </h3>
                            <button
                                onClick={() => {
                                    setShowChampionshipMatchesForm(false);
                                    setChampionshipMatchesForm([]);
                                    setCurrentChampionshipId(null);
                                }}
                                className="text-zinc-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {championshipMatchesForm.map((match, index) => (
                                <div key={index} className="bg-black border border-zinc-800 rounded-xl p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                        <div>
                                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Data</label>
                                            <input
                                                type="date"
                                                value={match.date}
                                                onChange={(e) => {
                                                    const newMatches = [...championshipMatchesForm];
                                                    newMatches[index].date = e.target.value;
                                                    setChampionshipMatchesForm(newMatches);
                                                }}
                                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Hora</label>
                                            <input
                                                type="time"
                                                value={match.time}
                                                onChange={(e) => {
                                                    const newMatches = [...championshipMatchesForm];
                                                    newMatches[index].time = e.target.value;
                                                    setChampionshipMatchesForm(newMatches);
                                                }}
                                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Adversário *</label>
                                            <input
                                                type="text"
                                                value={match.opponent}
                                                onChange={(e) => {
                                                    const newMatches = [...championshipMatchesForm];
                                                    newMatches[index].opponent = e.target.value;
                                                    setChampionshipMatchesForm(newMatches);
                                                }}
                                                placeholder="Nome do time"
                                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Local</label>
                                            <select
                                                value={match.location || 'Mandante'}
                                                onChange={(e) => {
                                                    const newMatches = [...championshipMatchesForm];
                                                    newMatches[index].location = e.target.value;
                                                    setChampionshipMatchesForm(newMatches);
                                                }}
                                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-purple-500"
                                            >
                                                <option value="Mandante">Mandante</option>
                                                <option value="Visitante">Visitante</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Campeonato</label>
                                            <input
                                                type="text"
                                                value={match.competition}
                                                readOnly
                                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-500 text-xs outline-none cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Meta de Pontuação</label>
                                            <input
                                                type="text"
                                                value={match.scoreTarget || ''}
                                                onChange={(e) => {
                                                    const newMatches = [...championshipMatchesForm];
                                                    newMatches[index].scoreTarget = e.target.value;
                                                    setChampionshipMatchesForm(newMatches);
                                                }}
                                                placeholder="Ex: Vencer por 2 gols"
                                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-purple-500"
                                            />
                                        </div>
                                    </div>
                                    {championshipMatchesForm.length > 1 && (
                                        <button
                                            onClick={() => {
                                                const newMatches = championshipMatchesForm.filter((_, i) => i !== index);
                                                setChampionshipMatchesForm(newMatches);
                                            }}
                                            className="mt-2 text-red-400 hover:text-red-300 text-xs font-bold uppercase"
                                        >
                                            Remover
                                        </button>
                                    )}
                                </div>
                            ))}
                            
                            <button
                                onClick={handleAddChampionshipMatch}
                                className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 font-bold uppercase text-xs rounded-xl transition-colors border border-zinc-700"
                            >
                                <Plus size={16} /> Adicionar Partida
                            </button>
                        </div>
                        
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleSaveChampionshipMatches}
                                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 font-bold uppercase text-xs rounded-xl transition-colors"
                            >
                                <Save size={16} /> Salvar Todas as Partidas
                            </button>
                            <button
                                onClick={() => {
                                    setShowChampionshipMatchesForm(false);
                                    setChampionshipMatchesForm([]);
                                    setCurrentChampionshipId(null);
                                }}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 font-bold uppercase text-xs rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal de Importação */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-black text-xl uppercase flex items-center gap-2">
                                <Upload className="text-blue-500" size={24} /> Importar Tabela
                            </h3>
                            <button
                                onClick={() => {
                                    setShowImportModal(false);
                                    setImportData('');
                                }}
                                className="text-zinc-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">
                                    Cole os dados da tabela (formato TSV/CSV)
                                </label>
                                <p className="text-zinc-400 text-xs mb-2">
                                    Formato esperado: Data | Hora | Adversário | Campeonato (separados por tabulação ou vírgula)
                                </p>
                                <textarea
                                    value={importData}
                                    onChange={(e) => setImportData(e.target.value)}
                                    placeholder="Exemplo:&#10;2024-01-15	20:00	Time A	Copa Santa Catarina&#10;2024-01-22	20:00	Time B	Copa Santa Catarina"
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white text-sm outline-none focus:border-blue-500 font-mono h-48"
                                />
                            </div>
                            
                            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                                <p className="text-zinc-400 text-xs">
                                    <strong className="text-white">Dica:</strong> Você pode copiar dados de uma planilha Excel e colar aqui. 
                                    O sistema tentará identificar automaticamente as colunas de Data, Hora, Adversário e Campeonato.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleImportData}
                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 font-bold uppercase text-xs rounded-xl transition-colors"
                            >
                                <Upload size={16} /> Importar Dados
                            </button>
                            <button
                                onClick={() => {
                                    setShowImportModal(false);
                                    setImportData('');
                                }}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 font-bold uppercase text-xs rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

