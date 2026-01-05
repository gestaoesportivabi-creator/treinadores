import React, { useState, useEffect } from 'react';
import { User, StatTargets } from '../types';
import { Save, User as UserIcon, Lock, Image as ImageIcon, CheckCircle, Trophy, Plus, Trash2, Target } from 'lucide-react';

interface SettingsProps {
  currentUser: User | null;
  onUpdateUser: (updatedData: Partial<User>) => void;
  competitions: string[];
  onUpdateCompetitions: (newCompetitions: string[]) => void;
  statTargets: StatTargets;
  onUpdateTargets: (targets: StatTargets) => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentUser, onUpdateUser, competitions, onUpdateCompetitions, statTargets, onUpdateTargets }) => {
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');

  // Competition State
  const [newCompetitionName, setNewCompetitionName] = useState('');

  // Targets State
  const [localTargets, setLocalTargets] = useState<StatTargets>(statTargets);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhotoUrl(currentUser.photoUrl || '');
    }
  }, [currentUser]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setPhotoUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');

    if (password && password !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    const updates: Partial<User> = {
      name,
      photoUrl
    };
    
    onUpdateUser(updates);
    
    // Save Targets
    onUpdateTargets(localTargets);

    setSuccess('Configurações atualizadas com sucesso!');
    
    // Clear password fields
    setPassword('');
    setConfirmPassword('');
    
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAddCompetition = () => {
      if (newCompetitionName.trim()) {
          onUpdateCompetitions([...competitions, newCompetitionName.trim()]);
          setNewCompetitionName('');
      }
  };

  const handleRemoveCompetition = (index: number) => {
      if (window.confirm('Tem certeza que deseja remover esta competição?')) {
          const updated = competitions.filter((_, i) => i !== index);
          onUpdateCompetitions(updated);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Header - Black Piano */}
      <div className="bg-black p-6 rounded-3xl border border-zinc-800 shadow-lg flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-wide">
              <UserIcon className="text-[#10b981]" /> Configurações Gerais
            </h2>
            <p className="text-zinc-500 text-sm mt-1 font-medium">Gerencie perfil, metas e definições do sistema.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Card Preview */}
        <div className="md:col-span-1">
            <div className="bg-black p-6 rounded-3xl border border-zinc-800 shadow-xl flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full bg-zinc-900 border-4 border-[#10b981] mb-4 overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    {photoUrl ? (
                        <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold text-3xl">
                            {name.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-wide">{name || 'Usuário'}</h3>
                <span className="text-xs font-bold text-[#10b981] bg-[#10b981]/10 px-3 py-1 rounded-full mt-2 uppercase tracking-widest border border-[#10b981]/20">
                    {currentUser?.role}
                </span>
                <p className="text-zinc-500 text-xs mt-4 truncate max-w-full px-4">{currentUser?.email}</p>
            </div>
        </div>

        {/* Settings Forms */}
        <div className="md:col-span-2 space-y-8">
            
            {/* 1. Profile Form */}
            <form onSubmit={handleSubmit} className="bg-black p-8 rounded-3xl border border-zinc-800 shadow-xl space-y-6">
                
                <div className="space-y-4">
                    <h3 className="text-white font-bold uppercase text-sm tracking-widest border-b border-zinc-800 pb-2 flex items-center gap-2">
                        <UserIcon size={16} className="text-[#10b981]" /> Informações Básicas
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Nome de Exibição</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl text-white p-3 outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all font-medium"
                                placeholder="Seu nome"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Foto de Perfil (Upload)</label>
                            <input 
                                type="file" 
                                accept=".jpg, .jpeg, .png, .tiff, .bmp"
                                onChange={handlePhotoUpload}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#10b981] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <h3 className="text-white font-bold uppercase text-sm tracking-widest border-b border-zinc-800 pb-2 flex items-center gap-2">
                        <Lock size={16} className="text-[#10b981]" /> Segurança
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Nova Senha</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl text-white p-3 outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all font-medium"
                                placeholder="••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Confirmar Senha</label>
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl text-white p-3 outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all font-medium"
                                placeholder="••••••"
                            />
                        </div>
                    </div>
                </div>

                {/* Stat Targets Section */}
                <div className="space-y-4 pt-4">
                    <h3 className="text-white font-bold uppercase text-sm tracking-widest border-b border-zinc-800 pb-2 flex items-center gap-2">
                        <Target size={16} className="text-[#10b981]" /> Metas de Performance (Por Jogo)
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-medium">Defina os valores alvo para as estatísticas que serão monitoradas nos gráficos.</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Gols</label>
                            <input type="number" value={localTargets.goals} onChange={(e) => setLocalTargets({...localTargets, goals: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Assistências</label>
                            <input type="number" value={localTargets.assists} onChange={(e) => setLocalTargets({...localTargets, assists: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Passes Certos</label>
                            <input type="number" value={localTargets.passesCorrect} onChange={(e) => setLocalTargets({...localTargets, passesCorrect: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Passes Errados (Max)</label>
                            <input type="number" value={localTargets.passesWrong} onChange={(e) => setLocalTargets({...localTargets, passesWrong: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-bold" />
                        </div>
                         <div>
                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Chutes no Gol</label>
                            <input type="number" value={localTargets.shotsOn} onChange={(e) => setLocalTargets({...localTargets, shotsOn: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-bold" />
                        </div>
                         <div>
                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Chutes Fora (Max)</label>
                            <input type="number" value={localTargets.shotsOff} onChange={(e) => setLocalTargets({...localTargets, shotsOff: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Desarmes (Posse)</label>
                            <input type="number" value={localTargets.tacklesPossession} onChange={(e) => setLocalTargets({...localTargets, tacklesPossession: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Desarmes (S/ Posse)</label>
                            <input type="number" value={localTargets.tacklesNoPossession} onChange={(e) => setLocalTargets({...localTargets, tacklesNoPossession: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Des. Contra-Atq</label>
                            <input type="number" value={localTargets.tacklesCounter} onChange={(e) => setLocalTargets({...localTargets, tacklesCounter: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Erro Transição (Max)</label>
                            <input type="number" value={localTargets.transitionError} onChange={(e) => setLocalTargets({...localTargets, transitionError: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-bold" />
                        </div>
                    </div>
                </div>

                {success && (
                    <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-xl flex items-center gap-2 text-sm font-bold animate-pulse">
                        <CheckCircle size={16} /> {success}
                    </div>
                )}

                <div className="pt-4 flex justify-end">
                    <button 
                        type="submit"
                        className="bg-[#10b981] hover:bg-[#34d399] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-purple-500/20"
                    >
                        <Save size={18} /> Salvar Alterações
                    </button>
                </div>
            </form>

            {/* 2. Competition Management Form */}
            <div className="bg-black p-8 rounded-3xl border border-zinc-800 shadow-xl space-y-6">
                <h3 className="text-white font-bold uppercase text-sm tracking-widest border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <Trophy size={16} className="text-[#10b981]" /> Gestão de Competições da Temporada
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Quantidade Atual</label>
                        <div className="text-3xl font-black text-white">{competitions.length}</div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Adicionar Nova Competição</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={newCompetitionName}
                                onChange={(e) => setNewCompetitionName(e.target.value)}
                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl text-white p-3 outline-none focus:border-[#10b981] uppercase font-bold text-sm"
                                placeholder="NOME DO CAMPEONATO"
                            />
                            <button 
                                onClick={handleAddCompetition}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white p-3 rounded-xl transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Competições Ativas</label>
                        {competitions.map((comp, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-zinc-950 border border-zinc-800 p-3 rounded-xl group hover:border-zinc-700 transition-colors">
                                <span className="text-white font-bold text-sm uppercase">{comp}</span>
                                <button 
                                    onClick={() => handleRemoveCompetition(idx)}
                                    className="text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};