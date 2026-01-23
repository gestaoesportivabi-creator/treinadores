import React, { useState, useEffect, useMemo } from 'react';
import { Player, Position, SportConfig, InjuryRecord, MaxLoad, LoadType } from '../types';
import { EXERCISES, EXERCISE_CATEGORIES } from '../constants';
import { Shirt, Save, Plus, User, FileText, Edit2, ShieldAlert, Activity, ArrowRightLeft, Calendar, Clock, Upload, AlertTriangle, X, Trash2, Dumbbell } from 'lucide-react';

interface TeamManagementProps {
    players: Player[];
    onAddPlayer: (player: Player) => void;
    onUpdatePlayer: (player: Player) => void;
    config: SportConfig;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ players, onAddPlayer, onUpdatePlayer, config }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editPlayerId, setEditPlayerId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'status' | 'medical' | 'maxLoad'>('profile');
    
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
    const [birthDate, setBirthDate] = useState('');
    const [cpf, setCpf] = useState('');
    
    // Status (Edit Only)
    const [isTransferred, setIsTransferred] = useState(false);
    const [transferDate, setTransferDate] = useState('');
    const [severanceValue, setSeveranceValue] = useState('');
    const [severanceEndDate, setSeveranceEndDate] = useState('');
    
    // Salary Fields
    const [salary, setSalary] = useState('');
    const [salaryStartDate, setSalaryStartDate] = useState('');
    const [salaryEndDate, setSalaryEndDate] = useState('');

    // Medical (Edit Only)
    const [injuryHistory, setInjuryHistory] = useState<InjuryRecord[]>([]);
    
    // New Injury Form
    const [newInjuryType, setNewInjuryType] = useState('Muscular');
    const [newInjuryLocation, setNewInjuryLocation] = useState('Coxa Posterior');
    const [newInjurySide, setNewInjurySide] = useState<'Direito' | 'Esquerdo' | 'Bilateral' | 'N/A'>('Direito');
    const [newInjurySeverity, setNewInjurySeverity] = useState('Leve');
    const [newInjuryOrigin, setNewInjuryOrigin] = useState<'Treino' | 'Jogo' | 'Outros'>('Treino');
    const [newInjuryStart, setNewInjuryStart] = useState('');
    const [newInjuryEnd, setNewInjuryEnd] = useState('');
    const [newInjuryReturnDate, setNewInjuryReturnDate] = useState(''); // Data retorno prevista
    const [newInjuryReturnDateActual, setNewInjuryReturnDateActual] = useState(''); // Data retorno real

    // Max Load States
    const [maxLoads, setMaxLoads] = useState<MaxLoad[]>([]);
    const [isAddingMaxLoad, setIsAddingMaxLoad] = useState(false);
    const [editingMaxLoadId, setEditingMaxLoadId] = useState<string | null>(null);
    const [newMaxLoadCategory, setNewMaxLoadCategory] = useState('');
    const [newMaxLoadExercise, setNewMaxLoadExercise] = useState('');
    const [newMaxLoadType, setNewMaxLoadType] = useState<'Kg' | 'Repetições'>('Kg');
    const [newMaxLoadValue, setNewMaxLoadValue] = useState('');

    // Mapeamento de tipos de lesão para locais possíveis
    const INJURY_LOCATIONS_BY_TYPE: Record<string, string[]> = {
        'Muscular': [
            'Coxa Posterior', 'Coxa Anterior', 'Quadríceps', 'Isquiostibiais',
            'Panturrilha', 'Glúteo', 'Adutor', 'Bíceps Braquial', 'Tríceps',
            'Tendão de Aquiles', 'Tendão Patelar'
        ],
        'Trauma': [
            'Tornozelo', 'Joelho', 'Pé', 'Dedos do Pé', 'Calcâneo', 'Metatarso',
            'Fêmur', 'Tíbia', 'Fíbula', 'Ombro', 'Braço', 'Antebraço', 'Punho',
            'Mão', 'Dedos da Mão', 'Úmero', 'Rádio', 'Ulna', 'Clavícula',
            'Escápula', 'Esternão', 'Costelas', 'Cabeça', 'Face', 'Mandíbula',
            'Dentes', 'Nariz', 'Olho', 'Orelha'
        ],
        'Articular': [
            'Joelho', 'Tornozelo', 'Ombro', 'Punho', 'Quadril', 'Cotovelo',
            'Ligamento Cruzado Anterior', 'Ligamento Cruzado Posterior',
            'Ligamento Colateral Medial', 'Ligamento Colateral Lateral',
            'Menisco', 'Coluna Cervical', 'Coluna Torácica', 'Coluna Lombar'
        ],
        'Outros': [
            'Coxa Posterior', 'Coxa Anterior', 'Quadríceps', 'Isquiostibiais',
            'Panturrilha', 'Tornozelo', 'Joelho', 'Pé', 'Dedos do Pé', 'Calcâneo',
            'Metatarso', 'Fêmur', 'Tíbia', 'Fíbula', 'Glúteo', 'Adutor',
            'Ombro', 'Braço', 'Bíceps Braquial', 'Tríceps', 'Antebraço', 'Punho',
            'Mão', 'Dedos da Mão', 'Úmero', 'Rádio', 'Ulna', 'Clavícula',
            'Escápula', 'Tórax', 'Costas', 'Lombar', 'Coluna Cervical',
            'Coluna Torácica', 'Coluna Lombar', 'Pescoço', 'Esternão', 'Costelas',
            'Pelve', 'Sacro', 'Cabeça', 'Face', 'Mandíbula', 'Dentes', 'Nariz',
            'Olho', 'Orelha', 'Ligamento Cruzado Anterior', 'Ligamento Cruzado Posterior',
            'Ligamento Colateral Medial', 'Ligamento Colateral Lateral', 'Menisco',
            'Tendão de Aquiles', 'Tendão Patelar', 'Outros'
        ]
    };
    
    // Obter locais disponíveis baseado no tipo selecionado
    const getAvailableLocations = (type: string): string[] => {
        return INJURY_LOCATIONS_BY_TYPE[type] || INJURY_LOCATIONS_BY_TYPE['Outros'];
    };


    // Função para validar CPF
    const validateCPF = (cpf: string): boolean => {
        // Remove formatação
        const cleanCPF = cpf.replace(/\D/g, '');
        
        // Verifica se tem 11 dígitos
        if (cleanCPF.length !== 11) return false;
        
        // Verifica se todos os dígitos são iguais (CPF inválido)
        if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
        
        // Validação dos dígitos verificadores
        let sum = 0;
        let remainder;
        
        // Valida primeiro dígito
        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
        
        // Valida segundo dígito
        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
        
        return true;
    };

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
        setSeveranceValue('');
        setSeveranceEndDate('');
        setSalary('');
        setSalaryStartDate('');
        setSalaryEndDate('');
        setInjuryHistory([]);
        setNewInjuryType('Muscular');
        setNewInjuryLocation('Coxa Posterior');
        setNewInjurySide('Direito');
        setNewInjurySeverity('Leve');
        setNewInjuryOrigin('Treino');
        setNewInjuryStart('');
        setNewInjuryEnd('');
        setNewInjuryReturnDate('');
        setNewInjuryReturnDateActual('');
        setBirthDate('');
        setCpf('');
        setMaxLoads([]);
        setIsAddingMaxLoad(false);
        setEditingMaxLoadId(null);
        setNewMaxLoadCategory('');
        setNewMaxLoadExercise('');
        setNewMaxLoadType('Kg');
        setNewMaxLoadValue('');
        setEditPlayerId(null);
        setEditMode(false);
        setActiveTab('profile');
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
        setSeveranceValue((player as any).severanceValue?.toString() || '');
        setSeveranceEndDate((player as any).severanceEndDate || '');
        setSalary((player as any).salary?.toString() || '');
        setSalaryStartDate((player as any).salaryStartDate || '');
        setSalaryEndDate((player as any).salaryEndDate || '');
        setInjuryHistory(player.injuryHistory || []);
        setBirthDate(player.birthDate || '');
        setCpf(player.cpf || '');
        setMaxLoads(player.maxLoads || []);
        
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
        
        // Calcular dias baseado na data de retorno real (se houver) ou prevista (se houver) ou fim
        const endDate = newInjuryReturnDateActual || newInjuryReturnDateActual || newInjuryEnd;
        if (endDate) {
            const end = new Date(endDate);
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
            returnDate: newInjuryReturnDate || undefined,
            returnDateActual: newInjuryReturnDateActual || undefined,
            type: newInjuryType as any,
            location: newInjuryLocation as any,
            side: newInjurySide,
            severity: newInjurySeverity as any,
            origin: newInjuryOrigin,
            startDate: newInjuryStart,
            daysOut: daysOut
        };

        setInjuryHistory([...injuryHistory, newRecord]);
        
        // Reset injury form
        setNewInjuryStart('');
        setNewInjuryEnd('');
        setNewInjuryReturnDate('');
        setNewInjuryReturnDateActual('');
        setNewInjuryType('Muscular');
        setNewInjuryLocation('Coxa Posterior');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validar CPF se preenchido
        if (cpf && cpf.trim() !== '') {
            if (!validateCPF(cpf)) {
                alert('CPF inválido. Verifique os dígitos e tente novamente.');
                return;
            }
        }
        
        
        // Recalculate days out for all injuries before saving
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const updatedInjuryHistory = injuryHistory.map(inj => {
            const start = new Date(inj.startDate || inj.date || '');
            start.setHours(0, 0, 0, 0);
            let daysOut = 0;
            
            // Priorizar: retorno real > retorno prevista > fim (alta)
            const endDate = inj.returnDateActual || inj.returnDate || inj.endDate;
            if (endDate) {
                const end = new Date(endDate);
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
            severanceValue: isTransferred && severanceValue ? parseFloat(severanceValue.replace(/[^\d,.-]/g, '').replace(',', '.')) : undefined,
            severanceEndDate: isTransferred ? severanceEndDate : undefined,
            salary: salary ? parseFloat(salary.replace(/[^\d,.-]/g, '').replace(',', '.')) : undefined,
            salaryStartDate: salaryStartDate || undefined,
            salaryEndDate: salaryEndDate || undefined,
            injuryHistory: updatedInjuryHistory,
            birthDate: birthDate || undefined,
            cpf: cpf || undefined,
            maxLoads: maxLoads.length > 0 ? maxLoads : undefined
        };

        // Salvar localmente
        try {
            const savedPlayers = JSON.parse(localStorage.getItem('scout21pro:local:players') || '[]');
            const existingIndex = savedPlayers.findIndex((p: any) => p.id === playerData.id);
            if (existingIndex >= 0) {
                savedPlayers[existingIndex] = playerData;
            } else {
                savedPlayers.push(playerData);
            }
            localStorage.setItem('scout21pro:local:players', JSON.stringify(savedPlayers));
        } catch (e) {
            console.warn('Erro ao salvar localmente:', e);
        }

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
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calcular dias de afastamento ativo (lesão sem retorno real)
        const activeInjuries = player.injuryHistory?.filter(inj => !inj.returnDateActual && !inj.endDate) || [];
        let activeDaysOut = 0;
        let activeDaysColor = 'text-green-400';
        
        if (activeInjuries.length > 0) {
            const activeInjury = activeInjuries[0]; // Pegar a primeira lesão ativa
            const startDate = new Date(activeInjury.startDate || activeInjury.date || '');
            startDate.setHours(0, 0, 0, 0);
            const diffTime = Math.abs(today.getTime() - startDate.getTime());
            activeDaysOut = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Verificar se passou da data prevista
            if (activeInjury.returnDate) {
                const returnDate = new Date(activeInjury.returnDate);
                returnDate.setHours(0, 0, 0, 0);
                if (today > returnDate) {
                    activeDaysColor = 'text-red-400';
                } else {
                    activeDaysColor = 'text-green-400';
                }
            }
        }
        
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
                                {activeInjuries.length > 0 && (
                                    <div className="flex items-center gap-2 border-t border-zinc-900 pt-1 mt-1">
                                        <AlertTriangle size={14} className={activeDaysColor === 'text-red-400' ? 'text-red-500' : 'text-green-500'} />
                                        <span className={`text-[10px] font-bold uppercase ${activeDaysColor}`}>
                                            {activeDaysOut} Dias em Afastamento {activeDaysColor === 'text-red-400' ? '(Atrasado)' : '(No Prazo)'}
                                        </span>
                                    </div>
                                )}
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
                        <Shirt className="text-[#10b981]" /> Cadastro de Atletas
                    </h2>
                    <p className="text-zinc-500 text-xs font-bold mt-1">Cadastro, edição e status dos atletas.</p>
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
                                <button onClick={() => setActiveTab('maxLoad')} className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${activeTab === 'maxLoad' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Carga Máxima</button>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* TAB: PROFILE (Default) */}
                        {activeTab === 'profile' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
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
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Data de Nascimento</label>
                                    <input 
                                        type="date" 
                                        value={birthDate} 
                                        onChange={e => {
                                            setBirthDate(e.target.value);
                                            // Calcular idade automaticamente se data fornecida
                                            if (e.target.value) {
                                                const birth = new Date(e.target.value);
                                                const today = new Date();
                                                let calculatedAge = today.getFullYear() - birth.getFullYear();
                                                const monthDiff = today.getMonth() - birth.getMonth();
                                                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                                                    calculatedAge--;
                                                }
                                                if (calculatedAge > 0 && calculatedAge < 100) {
                                                    setAge(calculatedAge.toString());
                                                }
                                            }
                                        }} 
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#10b981]" 
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">CPF</label>
                                    <input 
                                        type="text" 
                                        value={cpf} 
                                        onChange={e => {
                                            // Aplicar máscara de CPF
                                            let value = e.target.value.replace(/\D/g, '');
                                            if (value.length <= 11) {
                                                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                                                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                                                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                                                setCpf(value);
                                            }
                                        }}
                                        placeholder="000.000.000-00"
                                        maxLength={14}
                                        className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#10b981]" 
                                    />
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

                                {/* Campos de Salário */}
                                <div className="col-span-1 md:col-span-2 lg:col-span-4 border-t border-zinc-800 pt-4 mt-4">
                                    <h4 className="text-white font-bold uppercase text-xs mb-4 flex items-center gap-2">
                                        <Activity size={16} className="text-[#10b981]" /> Informações Financeiras
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Salário Negociado (R$)</label>
                                            <input 
                                                type="text" 
                                                value={salary} 
                                                onChange={e => {
                                                    let value = e.target.value.replace(/[^\d,.-]/g, '');
                                                    if (value) {
                                                        value = value.replace(/(\d)(\d{2})$/, '$1,$2');
                                                        value = value.replace(/(?=(\d{3})+(\D))\B/g, '.');
                                                    }
                                                    setSalary(value);
                                                }}
                                                className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#10b981]" 
                                                placeholder="0,00"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Data Início Recebimento</label>
                                            <input 
                                                type="date" 
                                                value={salaryStartDate} 
                                                onChange={e => setSalaryStartDate(e.target.value)} 
                                                className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#10b981]" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Data Término Recebimento</label>
                                            <input 
                                                type="date" 
                                                value={salaryEndDate} 
                                                onChange={e => setSalaryEndDate(e.target.value)} 
                                                className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#10b981]" 
                                            />
                                        </div>
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
                                    <div className="flex items-center gap-4 mb-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={isTransferred} onChange={e => setIsTransferred(e.target.checked)} className="w-5 h-5 accent-[#10b981]" />
                                            <span className="text-white text-sm font-bold">Transferido (Saiu do Clube)</span>
                                        </label>
                                    </div>
                                    {isTransferred && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Data da Saída</label>
                                                <input type="date" value={transferDate} onChange={e => setTransferDate(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Valor de Recisão (R$)</label>
                                                <input 
                                                    type="text" 
                                                    value={severanceValue} 
                                                    onChange={e => {
                                                        let value = e.target.value.replace(/[^\d,.-]/g, '');
                                                        if (value) {
                                                            value = value.replace(/(\d)(\d{2})$/, '$1,$2');
                                                            value = value.replace(/(?=(\d{3})+(\D))\B/g, '.');
                                                        }
                                                        setSeveranceValue(value);
                                                    }}
                                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white" 
                                                    placeholder="0,00"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Data até Receber do Clube</label>
                                                <input type="date" value={severanceEndDate} onChange={e => setSeveranceEndDate(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white" />
                                                <p className="text-[10px] text-zinc-500 mt-2">Data até quando o atleta irá receber do clube algum valor (mesmo após recisão).</p>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 mt-2">Nota: As estatísticas deste atleta permanecerão salvas no sistema.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB: MEDICAL (Injury History) */}
                        {activeTab === 'medical' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                                    <div>
                                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Tipo</label>
                                        <select 
                                            value={newInjuryType} 
                                            onChange={e => {
                                                setNewInjuryType(e.target.value);
                                                const availableLocations = getAvailableLocations(e.target.value);
                                                if (availableLocations.length > 0) {
                                                    setNewInjuryLocation(availableLocations[0]);
                                                }
                                            }} 
                                            className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs"
                                        >
                                            <option value="Muscular">Muscular</option>
                                            <option value="Trauma">Trauma</option>
                                            <option value="Articular">Articular</option>
                                            <option value="Outros">Outros</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Local</label>
                                        <select 
                                            value={newInjuryLocation} 
                                            onChange={e => setNewInjuryLocation(e.target.value)} 
                                            className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs"
                                        >
                                            {getAvailableLocations(newInjuryType).map(loc => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Lado do Corpo</label>
                                        <select value={newInjurySide} onChange={e => setNewInjurySide(e.target.value as 'Direito' | 'Esquerdo' | 'Bilateral' | 'N/A')} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs">
                                            <option value="Direito">Direito</option>
                                            <option value="Esquerdo">Esquerdo</option>
                                            <option value="Bilateral">Bilateral</option>
                                            <option value="N/A">N/A</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Origem</label>
                                        <select value={newInjuryOrigin} onChange={e => setNewInjuryOrigin(e.target.value as 'Treino' | 'Jogo' | 'Outros')} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs">
                                            <option value="Treino">Treino</option>
                                            <option value="Jogo">Jogo</option>
                                            <option value="Outros">Outros</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Data Início</label>
                                        <input type="date" value={newInjuryStart} onChange={e => setNewInjuryStart(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Data Retorno Prevista</label>
                                        <input type="date" value={newInjuryReturnDate} onChange={e => setNewInjuryReturnDate(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Data Retorno Real</label>
                                        <input type="date" value={newInjuryReturnDateActual} onChange={e => setNewInjuryReturnDateActual(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Fim (Alta)</label>
                                        <input type="date" value={newInjuryEnd} onChange={e => setNewInjuryEnd(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs" />
                                    </div>
                                    <div className="md:col-span-2 lg:col-span-4">
                                        <button onClick={handleAddInjury} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 border border-zinc-600">
                                            <Plus size={14} /> Adicionar Lesão
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
                                                    <th className="p-3">Retorno Prevista</th>
                                                    <th className="p-3">Retorno Real</th>
                                                    <th className="p-3">Fim (Alta)</th>
                                                    <th className="p-3">Tipo</th>
                                                    <th className="p-3">Local</th>
                                                    <th className="p-3">Lado</th>
                                                    <th className="p-3">Origem</th>
                                                    <th className="p-3 text-right">Dias Afastado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-xs text-zinc-300 divide-y divide-zinc-900">
                                                {injuryHistory.map((inj) => {
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0);
                                                    const startDate = new Date(inj.startDate || inj.date || '');
                                                    startDate.setHours(0, 0, 0, 0);
                                                    
                                                    // Calcular dias de afastamento atual
                                                    let currentDaysOut = 0;
                                                    const endDate = inj.returnDateActual || inj.returnDate || inj.endDate;
                                                    if (endDate) {
                                                        const end = new Date(endDate);
                                                        end.setHours(0, 0, 0, 0);
                                                        const diffTime = Math.abs(end.getTime() - startDate.getTime());
                                                        currentDaysOut = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                    } else {
                                                        // Lesão ativa - calcular até hoje
                                                        const diffTime = Math.abs(today.getTime() - startDate.getTime());
                                                        currentDaysOut = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                    }
                                                    
                                                    // Determinar cor: verde se dentro do previsto, vermelho se passou
                                                    let daysColor = 'text-red-400';
                                                    if (inj.returnDate) {
                                                        const returnDate = new Date(inj.returnDate);
                                                        returnDate.setHours(0, 0, 0, 0);
                                                        if (today <= returnDate) {
                                                            daysColor = 'text-green-400';
                                                        } else {
                                                            daysColor = 'text-red-400';
                                                        }
                                                    }
                                                    
                                                    return (
                                                        <tr key={inj.id || `inj-${inj.date}-${inj.type}`}>
                                                            <td className="p-3">{new Date(inj.startDate || inj.date || '').toLocaleDateString('pt-BR')}</td>
                                                            <td className="p-3">{inj.returnDate ? new Date(inj.returnDate).toLocaleDateString('pt-BR') : '-'}</td>
                                                            <td className="p-3">{inj.returnDateActual ? new Date(inj.returnDateActual).toLocaleDateString('pt-BR') : '-'}</td>
                                                            <td className="p-3">{inj.endDate ? new Date(inj.endDate).toLocaleDateString('pt-BR') : '-'}</td>
                                                            <td className="p-3">{inj.type}</td>
                                                            <td className="p-3">{inj.location}</td>
                                                            <td className="p-3">{inj.side}</td>
                                                            <td className="p-3">{inj.origin || '-'}</td>
                                                            <td className={`p-3 text-right font-bold ${daysColor}`}>
                                                                {currentDaysOut} dias
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

                        {/* TAB: MAX LOAD */}
                        {activeTab === 'maxLoad' && (
                            <div className="space-y-6 animate-fade-in">
                                {/* Botão Adicionar Exercício */}
                                {!isAddingMaxLoad && !editingMaxLoadId && (
                                    <div className="flex justify-start">
                                        <button
                                            onClick={() => setIsAddingMaxLoad(true)}
                                            className="flex items-center gap-2 bg-[#10b981] hover:bg-[#34d399] text-white px-6 py-3 font-bold uppercase text-xs rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                        >
                                            <Plus size={16} /> Adicionar Exercício
                                        </button>
                                    </div>
                                )}

                                {/* Formulário de Adicionar/Editar Carga Máxima */}
                                {(isAddingMaxLoad || editingMaxLoadId) && (
                                    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
                                                <Dumbbell size={18} className="text-[#10b981]" />
                                                {editingMaxLoadId ? 'Editar Carga Máxima' : 'Nova Carga Máxima'}
                                            </h4>
                                            <button
                                                onClick={() => {
                                                    setIsAddingMaxLoad(false);
                                                    setEditingMaxLoadId(null);
                                                    setNewMaxLoadCategory('');
                                                    setNewMaxLoadExercise('');
                                                    setNewMaxLoadType('Kg');
                                                    setNewMaxLoadValue('');
                                                }}
                                                className="text-zinc-500 hover:text-white transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Categoria</label>
                                                <select
                                                    value={newMaxLoadCategory}
                                                    onChange={(e) => {
                                                        setNewMaxLoadCategory(e.target.value);
                                                        setNewMaxLoadExercise(''); // Reset exercício ao mudar categoria
                                                    }}
                                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs"
                                                >
                                                    <option value="">Selecione...</option>
                                                    {EXERCISE_CATEGORIES.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            <div>
                                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Exercício</label>
                                                <select
                                                    value={newMaxLoadExercise}
                                                    onChange={(e) => {
                                                        const exerciseId = e.target.value;
                                                        const exercise = EXERCISES.find(ex => ex.id === exerciseId);
                                                        if (exercise) {
                                                            setNewMaxLoadExercise(exerciseId);
                                                            setNewMaxLoadType(exercise.defaultLoadType);
                                                        }
                                                    }}
                                                    disabled={!newMaxLoadCategory}
                                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <option value="">Selecione...</option>
                                                    {newMaxLoadCategory && EXERCISES
                                                        .filter(ex => ex.category === newMaxLoadCategory)
                                                        .sort((a, b) => a.name.localeCompare(b.name))
                                                        .map(ex => (
                                                            <option key={ex.id} value={ex.id}>{ex.name}</option>
                                                        ))}
                                                </select>
                                            </div>
                                            
                                            <div>
                                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Tipo de Carga</label>
                                                <select
                                                    value={newMaxLoadType}
                                                    onChange={(e) => setNewMaxLoadType(e.target.value as LoadType)}
                                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs"
                                                >
                                                    <option value="Kg">Kg</option>
                                                    <option value="Repetições">Repetições</option>
                                                </select>
                                            </div>
                                            
                                            <div>
                                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Valor</label>
                                                <input
                                                    type="number"
                                                    value={newMaxLoadValue}
                                                    onChange={(e) => setNewMaxLoadValue(e.target.value)}
                                                    placeholder={newMaxLoadType === 'Kg' ? 'Ex: 100' : 'Ex: 12'}
                                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-xs"
                                                    min="0"
                                                    step={newMaxLoadType === 'Kg' ? '0.5' : '1'}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={() => {
                                                    if (!newMaxLoadCategory || !newMaxLoadExercise || !newMaxLoadValue) {
                                                        alert('Preencha todos os campos');
                                                        return;
                                                    }
                                                    
                                                    const exercise = EXERCISES.find(ex => ex.id === newMaxLoadExercise);
                                                    if (!exercise) return;
                                                    
                                                    const value = parseFloat(newMaxLoadValue);
                                                    if (isNaN(value) || value <= 0) {
                                                        alert('Valor inválido');
                                                        return;
                                                    }
                                                    
                                                    if (editingMaxLoadId) {
                                                        // Editar carga existente
                                                        setMaxLoads(prev => prev.map(load => 
                                                            load.id === editingMaxLoadId
                                                                ? {
                                                                    ...load,
                                                                    exerciseId: newMaxLoadExercise,
                                                                    exerciseName: exercise.name,
                                                                    category: newMaxLoadCategory,
                                                                    loadType: newMaxLoadType,
                                                                    value: value,
                                                                    date: new Date().toISOString().split('T')[0]
                                                                }
                                                                : load
                                                        ));
                                                        setEditingMaxLoadId(null);
                                                    } else {
                                                        // Adicionar nova carga
                                                        const newLoad: MaxLoad = {
                                                            id: `ml${Date.now()}`,
                                                            exerciseId: newMaxLoadExercise,
                                                            exerciseName: exercise.name,
                                                            category: newMaxLoadCategory,
                                                            loadType: newMaxLoadType,
                                                            value: value,
                                                            date: new Date().toISOString().split('T')[0]
                                                        };
                                                        setMaxLoads([...maxLoads, newLoad]);
                                                    }
                                                    
                                                    // Reset form
                                                    setIsAddingMaxLoad(false);
                                                    setNewMaxLoadCategory('');
                                                    setNewMaxLoadExercise('');
                                                    setNewMaxLoadType('Kg');
                                                    setNewMaxLoadValue('');
                                                }}
                                                className="flex-1 bg-[#10b981] hover:bg-[#34d399] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors"
                                            >
                                                {editingMaxLoadId ? 'Salvar Alterações' : 'Adicionar'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsAddingMaxLoad(false);
                                                    setEditingMaxLoadId(null);
                                                    setNewMaxLoadCategory('');
                                                    setNewMaxLoadExercise('');
                                                    setNewMaxLoadType('Kg');
                                                    setNewMaxLoadValue('');
                                                }}
                                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold uppercase transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Lista de Cargas Máximas */}
                                {maxLoads.length > 0 && (
                                    <div className="bg-black border border-zinc-900 rounded-2xl overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-zinc-900 text-[10px] text-zinc-500 uppercase">
                                                <tr>
                                                    <th className="p-3">Categoria</th>
                                                    <th className="p-3">Exercício</th>
                                                    <th className="p-3">Tipo</th>
                                                    <th className="p-3">Valor</th>
                                                    <th className="p-3">Data</th>
                                                    <th className="p-3 text-right">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-xs text-zinc-300 divide-y divide-zinc-900">
                                                {maxLoads.map((load) => {
                                                    const exercise = EXERCISES.find(ex => ex.id === load.exerciseId);
                                                    return (
                                                        <tr key={load.id}>
                                                            <td className="p-3">{load.category}</td>
                                                            <td className="p-3 font-bold">{load.exerciseName}</td>
                                                            <td className="p-3">{load.loadType}</td>
                                                            <td className="p-3 font-bold text-[#10b981]">
                                                                {load.value} {load.loadType === 'Kg' ? 'kg' : 'rep'}
                                                            </td>
                                                            <td className="p-3 text-zinc-500">
                                                                {load.date ? new Date(load.date).toLocaleDateString('pt-BR') : '-'}
                                                            </td>
                                                            <td className="p-3 text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingMaxLoadId(load.id);
                                                                            setIsAddingMaxLoad(false);
                                                                            setNewMaxLoadCategory(load.category);
                                                                            setNewMaxLoadExercise(load.exerciseId);
                                                                            setNewMaxLoadType(load.loadType);
                                                                            setNewMaxLoadValue(load.value.toString());
                                                                        }}
                                                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                                                        title="Editar"
                                                                    >
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (confirm('Tem certeza que deseja remover esta carga máxima?')) {
                                                                                setMaxLoads(prev => prev.filter(l => l.id !== load.id));
                                                                            }
                                                                        }}
                                                                        className="text-red-400 hover:text-red-300 transition-colors"
                                                                        title="Remover"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {maxLoads.length === 0 && !isAddingMaxLoad && !editingMaxLoadId && (
                                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-12 text-center">
                                        <Dumbbell size={48} className="text-zinc-700 mx-auto mb-4" />
                                        <p className="text-zinc-500 font-bold uppercase text-sm mb-2">Nenhuma carga máxima registrada</p>
                                        <p className="text-zinc-600 text-xs mb-6">Adicione exercícios para registrar as cargas máximas do atleta</p>
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