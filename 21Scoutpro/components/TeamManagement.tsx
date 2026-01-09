import React, { useState, useEffect, useMemo } from 'react';
import { Player, Position, SportConfig, InjuryRecord, Team } from '../types';
import { Shirt, Save, Plus, User, FileText, Edit2, ShieldAlert, Activity, ArrowRightLeft, Calendar, Clock, Upload, AlertTriangle, X, Users, Trash2 } from 'lucide-react';

interface TeamManagementProps {
    players: Player[];
    teams: Team[];
    onAddPlayer: (player: Player) => void;
    onUpdatePlayer: (player: Player) => void;
    onAddTeam: (team: Omit<Team, 'id' | 'createdAt'>) => Promise<Team | null>;
    onUpdateTeam: (team: Team) => Promise<Team | null>;
    onDeleteTeam: (teamId: string) => Promise<boolean>;
    config: SportConfig;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ players, teams, onAddPlayer, onUpdatePlayer, onAddTeam, onUpdateTeam, onDeleteTeam, config }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editPlayerId, setEditPlayerId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'status' | 'medical'>('profile');
    
    // Team States
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');
    const [isCreatingTeam, setIsCreatingTeam] = useState(false);
    const [isEditingTeam, setIsEditingTeam] = useState(false);
    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
    const [teamName, setTeamName] = useState('');
    const [teamCategory, setTeamCategory] = useState('');
    
    // Form State
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [position, setPosition] = useState<Position>('Ala');
    const [jerseyNumber, setJerseyNumber] = useState('');
    const [dominantFoot, setDominantFoot] = useState<'Destro' | 'Canhoto' | 'Ambidestro'>('Destro');
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [lastClub, setLastClub] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    
    // Status (Edit Only)
    const [isTransferred, setIsTransferred] = useState(false);
    const [transferDate, setTransferDate] = useState('');

    // Medical (Edit Only)
    const [injuryHistory, setInjuryHistory] = useState<InjuryRecord[]>([]);
    
    // New Injury Form
    const [newInjuryType, setNewInjuryType] = useState('Muscular');
    const [newInjuryLocation, setNewInjuryLocation] = useState('Coxa Posterior Direita');
    const [newInjurySide, setNewInjurySide] = useState<'Direito' | 'Esquerdo' | 'Bilateral' | 'N/A'>('Direito');
    const [newInjurySeverity, setNewInjurySeverity] = useState('Leve');
    const [newInjuryOrigin, setNewInjuryOrigin] = useState<'Treino' | 'Jogo' | 'Outros'>('Treino');
    const [newInjuryStart, setNewInjuryStart] = useState('');
    const [newInjuryEnd, setNewInjuryEnd] = useState('');

    // Complete list of injury locations
    const INJURY_LOCATIONS = [
        // Membros Inferiores - Direita
        'Coxa Posterior Direita', 'Coxa Anterior Direita', 'Quadríceps Direito', 'Isquiostibiais Direito',
        'Panturrilha Direita', 'Tornozelo Direito', 'Joelho Direito', 'Pé Direito', 
        'Dedos Pé Direito', 'Calcâneo Direito', 'Metatarso Direito', 'Fêmur Direito',
        'Tíbia Direita', 'Fíbula Direita', 'Glúteo Direito', 'Adutor Direito',
        // Membros Inferiores - Esquerda
        'Coxa Posterior Esquerda', 'Coxa Anterior Esquerda', 'Quadríceps Esquerdo', 'Isquiostibiais Esquerdo',
        'Panturrilha Esquerda', 'Tornozelo Esquerdo', 'Joelho Esquerdo', 'Pé Esquerdo',
        'Dedos Pé Esquerdo', 'Calcâneo Esquerdo', 'Metatarso Esquerdo', 'Fêmur Esquerdo',
        'Tíbia Esquerda', 'Fíbula Esquerda', 'Glúteo Esquerdo', 'Adutor Esquerdo',
        // Membros Superiores - Direita
        'Ombro Direito', 'Braço Direito', 'Bíceps Braquial Direito', 'Tríceps Direito',
        'Antebraço Direito', 'Punho Direito', 'Mão Direita', 'Dedos Mão Direita',
        'Úmero Direito', 'Rádio Direito', 'Ulna Direita', 'Clavícula Direita',
        'Escápula Direita',
        // Membros Superiores - Esquerda
        'Ombro Esquerdo', 'Braço Esquerdo', 'Bíceps Braquial Esquerdo', 'Tríceps Esquerdo',
        'Antebraço Esquerdo', 'Punho Esquerdo', 'Mão Esquerda', 'Dedos Mão Esquerda',
        'Úmero Esquerdo', 'Rádio Esquerdo', 'Ulna Esquerda', 'Clavícula Esquerda',
        'Escápula Esquerda',
        // Tronco e Coluna
        'Tórax', 'Costas', 'Lombar', 'Coluna Cervical', 'Coluna Torácica',
        'Coluna Lombar', 'Pescoço', 'Esternão', 'Costelas Direitas', 'Costelas Esquerda',
        'Pelve', 'Sacro',
        // Cabeça e Face
        'Cabeça', 'Face', 'Mandíbula', 'Dentes', 'Nariz',
        'Olho Direito', 'Olho Esquerdo', 'Orelha Direita', 'Orelha Esquerda',
        // Ligamentos e Tendões - Joelho Direito
        'Ligamento Cruzado Anterior Direito', 'Ligamento Cruzado Posterior Direito',
        'Ligamento Colateral Medial Direito', 'Ligamento Colateral Lateral Direito',
        'Menisco Direito',
        // Ligamentos e Tendões - Joelho Esquerdo
        'Ligamento Cruzado Anterior Esquerdo', 'Ligamento Cruzado Posterior Esquerdo',
        'Ligamento Colateral Medial Esquerdo', 'Ligamento Colateral Lateral Esquerdo',
        'Menisco Esquerdo',
        // Tendões
        'Tendão de Aquiles Direito', 'Tendão de Aquiles Esquerdo',
        'Tendão Patelar Direito', 'Tendão Patelar Esquerdo',
        // Outros
        'Outros'
    ];

    // Selecionar automaticamente se houver apenas 1 equipe
    useEffect(() => {
        if (teams.length === 1) {
            setSelectedTeamId(teams[0].id);
        } else if (teams.length === 0) {
            setIsCreatingTeam(true);
        }
    }, [teams]);

    const resetForm = () => {
        setName('');
        setNickname('');
        setPosition('Ala');
        setJerseyNumber('');
        setDominantFoot('Destro');
        setAge('');
        setHeight('');
        setLastClub('');
        setPhotoUrl('');
        setIsTransferred(false);
        setTransferDate('');
        setInjuryHistory([]);
        setNewInjuryType('Muscular');
        setNewInjuryLocation('Coxa Posterior Direita');
        setNewInjurySide('Direito');
        setNewInjurySeverity('Leve');
        setNewInjuryOrigin('Treino');
        setNewInjuryStart('');
        setNewInjuryEnd('');
        setEditPlayerId(null);
        setEditMode(false);
        setActiveTab('profile');
    };

    const resetTeamForm = () => {
        setTeamName('');
        setTeamCategory('');
        setIsCreatingTeam(false);
        setIsEditingTeam(false);
        setEditingTeamId(null);
    };

    const handleEditTeam = (team: Team) => {
        setTeamName(team.nome);
        setTeamCategory(team.categoria || '');
        setEditingTeamId(team.id);
        setIsEditingTeam(true);
        setIsCreatingTeam(false);
    };

    const handleDeleteTeamClick = async (teamId: string) => {
        if (!confirm('Tem certeza que deseja deletar esta equipe? Todos os jogadores vinculados serão desvinculados.')) {
            return;
        }
        const success = await onDeleteTeam(teamId);
        if (success) {
            alert('Equipe deletada com sucesso!');
            if (selectedTeamId === teamId) {
                setSelectedTeamId('');
            }
        } else {
            alert('Erro ao deletar equipe. Tente novamente.');
        }
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!teamName || teamName.trim().length === 0) {
            alert('Nome da equipe é obrigatório');
            return;
        }

        try {
            const newTeam = await onAddTeam({
                nome: teamName.trim(),
                categoria: teamCategory.trim() || undefined,
            });

            if (newTeam) {
                alert('Equipe criada com sucesso!');
                resetTeamForm();
                // Selecionar automaticamente a equipe criada
                setSelectedTeamId(newTeam.id);
            } else {
                alert('Erro ao criar equipe. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao criar equipe:', error);
            alert('Erro ao criar equipe. Tente novamente.');
        }
    };

    const handleEditClick = (player: Player) => {
        setEditMode(true);
        setEditPlayerId(player.id);
        
        // Populate fields
        setName(player.name);
        setNickname(player.nickname || '');
        setPosition(player.position);
        setJerseyNumber(player.jerseyNumber.toString());
        setDominantFoot(player.dominantFoot || 'Destro');
        setAge(player.age?.toString() || '');
        setHeight(player.height?.toString() || '');
        setLastClub(player.lastClub || '');
        setPhotoUrl(player.photoUrl || '');
        setIsTransferred(player.isTransferred || false);
        setTransferDate(player.transferDate || '');
        setInjuryHistory(player.injuryHistory || []);
        
        setIsFormOpen(true);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file type (JPEG, PNG, TIFF, BMP) - Browsers generally support JPEG/PNG/BMP well. TIFF support is limited in browsers but we allow upload.
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddInjury = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!newInjuryStart) {
            alert("Informe a data de início da lesão.");
            return;
        }

        let daysOut = 0;
        const start = new Date(newInjuryStart);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (newInjuryEnd) {
            const end = new Date(newInjuryEnd);
            end.setHours(0, 0, 0, 0);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            daysOut = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } else {
            // Se não tem data final, calcular dias desde o início até hoje
            start.setHours(0, 0, 0, 0);
            const diffTime = Math.abs(today.getTime() - start.getTime());
            daysOut = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        const newRecord: InjuryRecord = {
            id: Date.now().toString(),
            playerId: editPlayerId || '',
            date: newInjuryStart,
            endDate: newInjuryEnd || undefined,
            type: newInjuryType as any,
            location: newInjuryLocation as any,
            side: newInjurySide,
            severity: newInjurySeverity as any,
            origin: newInjuryOrigin,
            daysOut: daysOut
        };

        setInjuryHistory([...injuryHistory, newRecord]);
        
        // Reset injury form
        setNewInjuryStart('');
        setNewInjuryEnd('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validar equipe selecionada (apenas ao criar, não ao editar)
        if (!editMode && !selectedTeamId) {
            if (teams.length === 0) {
                alert('É necessário criar uma equipe antes de cadastrar atletas.');
                return;
            } else {
                alert('Selecione uma equipe para vincular o atleta.');
                return;
            }
        }
        
        // Recalculate days out for all injuries before saving
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const updatedInjuryHistory = injuryHistory.map(inj => {
            const start = new Date(inj.date);
            start.setHours(0, 0, 0, 0);
            let daysOut = 0;
            
            if (inj.endDate) {
                const end = new Date(inj.endDate);
                end.setHours(0, 0, 0, 0);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                daysOut = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            } else {
                // Active injury - calculate from start to today
                const diffTime = Math.abs(today.getTime() - start.getTime());
                daysOut = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
            
            return { ...inj, daysOut };
        });
        
        const playerData: Player & { equipeId?: string } = {
            id: editMode && editPlayerId ? editPlayerId : `p${Date.now()}`,
            name,
            nickname: nickname || name.split(' ')[0],
            position,
            jerseyNumber: parseInt(jerseyNumber) || 0,
            dominantFoot,
            age: parseInt(age) || 0,
            height: parseInt(height) || 0,
            lastClub: lastClub || 'Não informado',
            photoUrl: photoUrl || '',
            isTransferred: isTransferred,
            transferDate: isTransferred ? transferDate : undefined,
            injuryHistory: updatedInjuryHistory,
            equipeId: !editMode ? selectedTeamId : undefined
        };

        if (editMode) {
            onUpdatePlayer(playerData);
            alert("Atleta atualizado com sucesso!");
        } else {
            onAddPlayer(playerData);
            alert("Atleta cadastrado com sucesso!");
        }

        setIsFormOpen(false);
        resetForm();
    };

    // Group players by position
    const playersByPosition = useMemo(() => {
        const grouped: Record<string, Player[]> = {};
        players.forEach(player => {
            const position = player.position || 'Outros';
            if (!grouped[position]) {
                grouped[position] = [];
            }
            grouped[position].push(player);
        });
        
        // Sort positions according to config order
        const orderedPositions = config.positions.filter(pos => grouped[pos]?.length > 0);
        const remainingPositions = Object.keys(grouped).filter(pos => !orderedPositions.includes(pos as Position));
        
        return { orderedPositions, remainingPositions, grouped };
    }, [players, config.positions]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const PlayerCard = ({ player }: { player: Player }) => {
        const totalDaysOut = player.injuryHistory ? player.injuryHistory.reduce((acc, curr) => acc + (curr.daysOut || 0), 0) : 0;
        return (
            <div className={`bg-black rounded-3xl overflow-hidden border transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] group ${player.isTransferred ? 'border-red-900/50 opacity-70' : 'border-zinc-800 hover:border-zinc-600'}`}>
                {/* Card Header/Image */}
                <div className="h-48 relative bg-zinc-900">
                     {player.photoUrl && player.photoUrl.trim() !== '' ? (
                         <img 
                             src={player.photoUrl} 
                             alt={player.name} 
                             className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                             onError={(e) => {
                                 (e.target as HTMLImageElement).style.display = 'none';
                             }}
                         />
                     ) : (
                         <div className="w-full h-full flex items-center justify-center text-zinc-700">
                             <span className="text-4xl font-black">#{player.jerseyNumber}</span>
                         </div>
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                     
                     <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                         <span className="text-2xl font-black text-white italic">#{player.jerseyNumber}</span>
                     </div>
                     
                     {/* Transferred Badge */}
                     {player.isTransferred && (
                         <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded-lg shadow-lg">
                             <span className="text-xs font-black text-white uppercase tracking-widest">Transferido</span>
                         </div>
                     )}

                     {/* Edit Button */}
                     <button 
                        onClick={() => handleEditClick(player)}
                        className="absolute bottom-4 right-4 bg-white text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                        title="Editar Atleta"
                     >
                         <Edit2 size={16} />
                     </button>
                     
                     <div className="absolute bottom-4 left-4">
                         <h3 className="text-xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg">{player.nickname || player.name}</h3>
                         <p className="text-[#10b981] font-bold text-xs uppercase tracking-widest">{player.position}</p>
                     </div>
                </div>

                {/* Card Details */}
                <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Idade</span>
                        <span className="text-white font-bold text-sm">{player.age} anos</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Pé Dominante</span>
                        <span className="text-white font-bold text-sm">{player.dominantFoot}</span>
                    </div>
                     <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Último Clube</span>
                        <span className="text-zinc-300 font-bold text-xs truncate max-w-[150px]">{player.lastClub}</span>
                    </div>
                    
                    {/* Injury Status Preview */}
                    <div className="flex flex-col gap-1 pt-1">
                        {player.injuryHistory && player.injuryHistory.length > 0 ? (
                            <div>
                                <div className="flex items-center gap-2">
                                    <Activity size={14} className="text-orange-500" />
                                    <span className="text-[10px] text-orange-500 font-bold uppercase">{player.injuryHistory.length} Lesões Reg.</span>
                                </div>
                                <div className="flex items-center gap-2 border-t border-zinc-900 pt-1 mt-1">
                                    <Clock size={14} className="text-red-500" />
                                    <span className="text-[10px] text-red-500 font-bold uppercase">{totalDaysOut} Dias Afastado (Total)</span>
                                </div>
                                {(() => {
                                    // Calculate active injury days (injury without endDate)
                                    const activeInjuries = player.injuryHistory.filter(inj => !inj.endDate);
                                    if (activeInjuries.length > 0) {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const activeDays = activeInjuries.map(inj => {
                                            const start = new Date(inj.date);
                                            start.setHours(0, 0, 0, 0);
                                            const diffTime = Math.abs(today.getTime() - start.getTime());
                                            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        });
                                        const maxActiveDays = Math.max(...activeDays);
                                        return (
                                            <div className="flex items-center gap-2 border-t border-zinc-900 pt-1 mt-1">
                                                <AlertTriangle size={14} className="text-yellow-500" />
                                                <span className="text-[10px] text-yellow-500 font-bold uppercase">{maxActiveDays} Dias em Afastamento Atual</span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Activity size={14} className="text-green-500" />
                                <span className="text-[10px] text-green-500 font-bold uppercase">Histórico Limpo</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
        <div className="space-y-6 animate-fade-in pb-12">
            
            {/* Header */}
            <div className="bg-black p-6 rounded-3xl border border-zinc-800 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-wide">
                        <Shirt className="text-[#10b981]" /> Gestão de Equipe
                    </h2>
                    <p className="text-zinc-500 text-xs font-bold mt-1">Cadastro, edição e status do elenco.</p>
                </div>
                <button 
                    onClick={() => {
                        if(isFormOpen) resetForm(); 
                        setIsFormOpen(!isFormOpen);
                    }}
                    className="flex items-center gap-2 bg-[#10b981] hover:bg-[#34d399] text-white px-6 py-3 font-bold uppercase text-xs rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                >
                    {isFormOpen ? 'Cancelar' : (
                        <>
                            <Plus size={16} /> Novo Atleta
                        </>
                    )}
                </button>
            </div>

            {/* Teams List Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-blue-500 to-transparent"></div>
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                            <Users className="text-blue-500" size={24} />
                            Equipes
                            <span className="text-sm text-zinc-500 font-bold normal-case">({teams.length})</span>
                        </h2>
                        <div className="h-[2px] flex-1 bg-gradient-to-l from-blue-500 to-transparent"></div>
                    </div>
                    <button
                        onClick={() => {
                            resetTeamForm();
                            setIsCreatingTeam(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-bold uppercase text-xs rounded-xl transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                    >
                        <Plus size={16} /> Nova Equipe
                    </button>
                </div>

                {/* Teams Grid */}
                {teams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {teams.map(team => (
                            <div key={team.id} className="bg-black rounded-3xl overflow-hidden border border-zinc-800 hover:border-blue-500 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] group">
                                <div className="h-32 relative bg-gradient-to-br from-blue-900/20 to-zinc-900">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                    <div className="absolute top-4 left-4 right-4">
                                        <h3 className="text-xl font-black text-white mb-1">{team.nome}</h3>
                                        {team.categoria && (
                                            <p className="text-xs text-blue-400 font-bold uppercase">{team.categoria}</p>
                                        )}
                                    </div>
                                    <div className="absolute bottom-4 right-4 flex gap-2">
                                        <button
                                            onClick={() => handleEditTeam(team)}
                                            className="bg-zinc-800/80 hover:bg-blue-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            title="Editar Equipe"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTeamClick(team.id)}
                                            className="bg-zinc-800/80 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            title="Deletar Equipe"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 bg-zinc-950">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-500 font-bold">Jogadores:</span>
                                        <span className="text-white font-black">
                                            {players.filter(p => (p as any).equipeId === team.id).length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-12 text-center">
                        <Users size={48} className="text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500 font-bold uppercase text-sm mb-2">Nenhuma equipe cadastrada</p>
                        <p className="text-zinc-600 text-xs mb-6">Crie sua primeira equipe para começar a cadastrar atletas</p>
                        <button
                            onClick={() => setIsCreatingTeam(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-bold uppercase text-xs rounded-xl transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                        >
                            <Plus size={16} className="inline mr-2" /> Criar Primeira Equipe
                        </button>
                    </div>
                )}
            </div>

            {/* Team Creation/Edit Form */}
            {(isCreatingTeam || isEditingTeam) && (
                <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 mb-6 animate-slide-down">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
                            <Users size={18} className={isEditingTeam ? "text-orange-500" : "text-[#10b981]"} />
                            {isEditingTeam ? 'Editar Equipe' : 'Criar Equipe'}
                        </h3>
                        <button
                            onClick={resetTeamForm}
                            className="text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <form onSubmit={isEditingTeam ? handleUpdateTeamSubmit : handleCreateTeam} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Nome da Equipe *</label>
                            <input
                                required
                                type="text"
                                value={teamName}
                                onChange={e => setTeamName(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#10b981]"
                                placeholder="Ex: Equipe Principal"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Categoria</label>
                            <input
                                type="text"
                                value={teamCategory}
                                onChange={e => setTeamCategory(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#10b981]"
                                placeholder="Ex: Adulto, Sub-15"
                            />
                        </div>
                        <div className="md:col-span-3 flex gap-2">
                            <button
                                type="submit"
                                className={`flex-1 ${isEditingTeam ? 'bg-orange-600 hover:bg-orange-700' : 'bg-[#10b981] hover:bg-[#34d399]'} text-white px-6 py-3 font-bold uppercase text-xs rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)]`}
                            >
                                {isEditingTeam ? 'Salvar Alterações' : 'Criar Equipe'}
                            </button>
                            <button
                                type="button"
                                onClick={resetTeamForm}
                                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-xs rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Registration/Edit Form */}
            {isFormOpen && (
                <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800 animate-slide-down">
                    <div className="flex flex-col md:flex-row justify-between border-b border-zinc-900 pb-4 mb-6 gap-4">
                        <h3 className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
                            {editMode ? <Edit2 size={18} className="text-orange-500" /> : <FileText size={18} className="text-[#10b981]" />} 
                            {editMode ? 'Editar Atleta' : 'Ficha de Cadastro'}
                        </h3>
                        
                        {editMode && (
                            <div className="flex gap-2">
                                <button onClick={() => setActiveTab('profile')} className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${activeTab === 'profile' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Perfil</button>
                                <button onClick={() => setActiveTab('status')} className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${activeTab === 'status' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Status</button>
                                <button onClick={() => setActiveTab('medical')} className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${activeTab === 'medical' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Médico</button>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* TAB: PROFILE (Default) */}
                        {activeTab === 'profile' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                                {/* Team Selection Field (only show if more than 1 team, or if 0 teams show message) */}
                                {!editMode && (
                                    <div className="col-span-1 md:col-span-2 lg:col-span-4">
                                        {teams.length === 0 ? (
                                            <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-4">
                                                <p className="text-yellow-400 text-sm font-bold">
                                                    ⚠️ Crie uma equipe primeiro antes de cadastrar atletas.
                                                </p>
                                            </div>
                                        ) : teams.length > 1 ? (
                                            <>
                                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Vincular à Equipe *</label>
                                                <select
                                                    required
                                                    value={selectedTeamId}
                                                    onChange={e => setSelectedTeamId(e.target.value)}
                                                    className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#10b981]"
                                                >
                                                    <option value="">Selecione uma equipe</option>
                                                    {teams.map(team => (
                                                        <option key={team.id} value={team.id}>
                                                            {team.nome} {team.categoria ? `(${team.categoria})` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </>
                                        ) : (
                                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
                                                <p className="text-zinc-400 text-xs font-bold">
                                                    ✓ Atleta será vinculado automaticamente à equipe: <span className="text-white">{teams[0].nome}</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="col-span-1 md:col-span-2">
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Nome Completo</label>
                                    <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#10b981]" placeholder="Ex: João da Silva" />
                                </div>

                                <div>
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Apelido</label>
                                    <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#10b981]" placeholder="Ex: Joãozinho" />
                                </div>

                                <div>
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Posição</label>
                                    <select value={position} onChange={e => setPosition(e.target.value as Position)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#10b981]">
                                        {config.positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Nº Camisa</label>
                                    <input required type="number" value={jerseyNumber} onChange={e => setJerseyNumber(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#10b981]" placeholder="10" />
                                </div>

                                <div>
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Pé Dominante</label>
                                    <select value={dominantFoot} onChange={e => setDominantFoot(e.target.value as any)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#10b981]">
                                        <option value="Destro">Destro</option>
                                        <option value="Canhoto">Canhoto</option>
                                        <option value="Ambidestro">Ambidestro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Idade</label>
                                    <input required type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#10b981]" placeholder="Anos" />
                                </div>

                                <div>
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Altura (cm)</label>
                                    <input required type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#10b981]" placeholder="175" />
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Último Clube</label>
                                    <input type="text" value={lastClub} onChange={e => setLastClub(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#10b981]" placeholder="Clube Anterior" />
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Foto (Upload)</label>
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            accept=".jpg, .jpeg, .png, .tiff, .bmp"
                                            onChange={handlePhotoUpload}
                                            className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#10b981] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
                                        />
                                        {photoUrl && photoUrl.trim() !== '' && (
                                            <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-zinc-700">
                                                <img 
                                                    src={photoUrl} 
                                                    alt="Preview" 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: STATUS (Transfer) */}
                        {activeTab === 'status' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                                    <div className="flex items-center gap-4 mb-4">
                                        <ArrowRightLeft size={24} className="text-zinc-400" />
                                        <h4 className="text-white font-bold uppercase">Transferência</h4>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={isTransferred} onChange={e => setIsTransferred(e.target.checked)} className="w-5 h-5 accent-[#10b981]" />
                                            <span className="text-white text-sm font-bold">Transferido (Saiu do Clube)</span>
                                        </label>
                                    </div>
                                    {isTransferred && (
                                        <div className="mt-4">
                                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Data da Saída</label>
                                            <input type="date" value={transferDate} onChange={e => setTransferDate(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white" />
                                            <p className="text-[10px] text-zinc-500 mt-2">Nota: As estatísticas deste atleta permanecerão salvas no sistema.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB: MEDICAL (Injury History) */}
                        {activeTab === 'medical' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                                    <div className="md:col-span-1">
                                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Tipo</label>
                                        <select value={newInjuryType} onChange={e => setNewInjuryType(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs">
                                            <option value="Muscular">Muscular</option>
                                            <option value="Trauma">Trauma</option>
                                            <option value="Articular">Articular</option>
                                            <option value="Outros">Outros</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Local</label>
                                        <select value={newInjuryLocation} onChange={e => setNewInjuryLocation(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs">
                                            {INJURY_LOCATIONS.map(loc => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Lado do Corpo</label>
                                        <select value={newInjurySide} onChange={e => setNewInjurySide(e.target.value as 'Direito' | 'Esquerdo' | 'Bilateral' | 'N/A')} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs">
                                            <option value="Direito">Direito</option>
                                            <option value="Esquerdo">Esquerdo</option>
                                            <option value="Bilateral">Bilateral</option>
                                            <option value="N/A">N/A</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Origem</label>
                                        <select value={newInjuryOrigin} onChange={e => setNewInjuryOrigin(e.target.value as 'Treino' | 'Jogo' | 'Outros')} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs">
                                            <option value="Treino">Treino</option>
                                            <option value="Jogo">Jogo</option>
                                            <option value="Outros">Outros</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Início</label>
                                        <input type="date" value={newInjuryStart} onChange={e => setNewInjuryStart(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Fim (Alta)</label>
                                        <input type="date" value={newInjuryEnd} onChange={e => setNewInjuryEnd(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <button onClick={handleAddInjury} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 border border-zinc-600">
                                            <Plus size={14} /> Adicionar
                                        </button>
                                    </div>
                                </div>

                                {/* History List */}
                                {injuryHistory.length > 0 && (
                                    <div className="bg-black border border-zinc-900 rounded-2xl overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-zinc-900 text-[10px] text-zinc-500 uppercase">
                                                <tr>
                                                    <th className="p-3">Data Início</th>
                                                    <th className="p-3">Fim</th>
                                                    <th className="p-3">Tipo</th>
                                                    <th className="p-3">Local</th>
                                                    <th className="p-3">Origem</th>
                                                    <th className="p-3 text-right">Dias Afastado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-xs text-zinc-300 divide-y divide-zinc-900">
                                                {injuryHistory.map((inj) => (
                                                    <tr key={inj.id || `inj-${inj.date}-${inj.type}`}>
                                                        <td className="p-3">{new Date(inj.date).toLocaleDateString()}</td>
                                                        <td className="p-3">{inj.endDate ? new Date(inj.endDate).toLocaleDateString() : '-'}</td>
                                                        <td className="p-3">{inj.type}</td>
                                                        <td className="p-3">{inj.location}</td>
                                                        <td className="p-3">{inj.origin || '-'}</td>
                                                        <td className="p-3 text-right font-bold text-red-400">{inj.daysOut} dias</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="col-span-1 md:col-span-4 flex justify-end mt-4 pt-4 border-t border-zinc-900">
                            <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-wide flex items-center gap-2 transition-colors">
                                <Save size={18} /> {editMode ? 'Salvar Alterações' : 'Salvar Atleta'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Players List - Grouped by Position */}
            <div className="space-y-12">
                {/* Render ordered positions first */}
                {playersByPosition.orderedPositions.map(position => (
                    <div key={position} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-[2px] flex-1 bg-gradient-to-r from-[#10b981] to-transparent"></div>
                            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                                <Shirt className="text-[#10b981]" size={24} />
                                {position}
                                <span className="text-sm text-zinc-500 font-bold normal-case">({playersByPosition.grouped[position].length})</span>
                            </h2>
                            <div className="h-[2px] flex-1 bg-gradient-to-l from-[#10b981] to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {playersByPosition.grouped[position]
                                .filter(player => player && player.id) // Garantir que tem ID válido
                                .map(player => (
                                    <PlayerCard key={player.id} player={player} />
                                ))}
                        </div>
                    </div>
                ))}
                
                {/* Render remaining positions (if any) */}
                {playersByPosition.remainingPositions.length > 0 && (
                    <>
                        {playersByPosition.remainingPositions.map(position => (
                            <div key={position} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-[2px] flex-1 bg-gradient-to-r from-[#10b981] to-transparent"></div>
                                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                                        <Shirt className="text-[#10b981]" size={24} />
                                        {position}
                                        <span className="text-sm text-zinc-500 font-bold normal-case">({playersByPosition.grouped[position].length})</span>
                                    </h2>
                                    <div className="h-[2px] flex-1 bg-gradient-to-l from-[#10b981] to-transparent"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {playersByPosition.grouped[position]
                                        .filter(player => player && player.id) // Garantir que tem ID válido
                                        .map(player => (
                                            <PlayerCard key={player.id} player={player} />
                                        ))}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
        </>
    );
};