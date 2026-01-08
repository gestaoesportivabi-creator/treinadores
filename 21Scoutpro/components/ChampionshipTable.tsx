import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Trophy, Plus, Save, Trash2, Edit2, RefreshCw } from 'lucide-react';

export interface ChampionshipMatch {
    id: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    opponent: string;
    competition: string;
}

interface ChampionshipTableProps {
    matches?: ChampionshipMatch[];
    competitions?: string[]; // Competições disponíveis
    onSave?: (match: ChampionshipMatch) => void;
    onDelete?: (id: string) => void;
    onUseForInput?: (match: ChampionshipMatch) => void; // Callback para usar na aba Input de Dados
    onRefresh?: () => void; // Callback para recarregar dados da API
}

export const ChampionshipTable: React.FC<ChampionshipTableProps> = ({ 
    matches = [], 
    competitions = [],
    onSave, 
    onDelete,
    onUseForInput,
    onRefresh
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
    const [formData, setFormData] = useState<ChampionshipMatch>({
        id: '',
        date: new Date().toISOString().split('T')[0],
        time: '20:00',
        opponent: '',
        competition: competitions.length > 0 ? competitions[0] : ''
    });

    const handleSave = () => {
        if (!formData.opponent.trim()) {
            alert('Por favor, preencha o adversário.');
            return;
        }

        const matchToSave: ChampionshipMatch = {
            ...formData,
            id: editingId || formData.id || Date.now().toString()
        };

        if (onSave) {
            onSave(matchToSave);
        }

        // Reset form
        setFormData({
            id: '',
            date: new Date().toISOString().split('T')[0],
            time: '20:00',
            opponent: '',
            competition: 'Copa Santa Catarina'
        });
        setIsCreating(false);
        setEditingId(null);
    };

    const handleEdit = (match: ChampionshipMatch) => {
        setFormData(match);
        setEditingId(match.id);
        setIsCreating(true);
    };

    const handleCancel = () => {
        setFormData({
            id: '',
            date: new Date().toISOString().split('T')[0],
            time: '20:00',
            opponent: '',
            competition: competitions.length > 0 ? competitions[0] : ''
        });
        setIsCreating(false);
        setEditingId(null);
    };

    const handleUseForInput = (match: ChampionshipMatch) => {
        if (onUseForInput) {
            onUseForInput(match);
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
                        <div className="flex items-center gap-2">
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
                                onClick={() => setIsCreating(true)}
                                className="flex items-center gap-2 bg-[#10b981] hover:bg-[#34d399] text-white px-4 py-2 font-bold uppercase text-xs rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            >
                                <Plus size={16} /> Nova Partida
                            </button>
                        </div>
                    )}
                </div>

                {/* Formulário de criação/edição */}
                {isCreating && (
                    <div className="mb-6 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                        <h3 className="text-white font-bold text-sm mb-4 uppercase">
                            {editingId ? 'Editar Partida' : 'Nova Partida'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Data</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-[#10b981]"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Hora</label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-[#10b981]"
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
                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Competição</label>
                                <select
                                    value={formData.competition}
                                    onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-[#10b981]"
                                >
                                    {competitions.map(comp => (
                                        <option key={comp} value={comp}>{comp}</option>
                                    ))}
                                </select>
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
        </div>
    );
};

