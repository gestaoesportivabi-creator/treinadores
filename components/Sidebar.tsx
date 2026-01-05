import React from 'react';
import { LayoutDashboard, Users, User as UserIcon, LogOut, HeartPulse, MonitorPlay, Settings, Table2, Shirt, Trophy, Ruler, CalendarClock, ArrowUpDown } from 'lucide-react';
import { User } from '../types';

// Importação explícita da logo oficial
const LOGO_IMAGE = '/public-logo.png.png';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  currentUser: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, currentUser }) => {
  
  const isAthlete = currentUser?.role === 'Atleta';

  // Hierarquia solicitada:
  // Visão Geral -> Gestão -> Tabela -> Scout -> Performance -> Fisiologia -> Avaliação -> Ranking -> Video -> Config
  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, restricted: false },
    { id: 'team', label: 'Gestão de Equipe', icon: Shirt, restricted: isAthlete },
    { id: 'schedule', label: 'Programação', icon: CalendarClock, restricted: isAthlete }, // New Tab
    { id: 'championship', label: 'Tabela de Campeonato', icon: Trophy, restricted: isAthlete },
    { id: 'table', label: 'Input de Dados', icon: Table2, restricted: isAthlete }, // Renamed
    { id: 'time-control', label: 'Entradas e Saídas', icon: ArrowUpDown, restricted: isAthlete },
    { id: 'general', label: 'Scout Coletivo', icon: Users, restricted: isAthlete },
    { id: 'individual', label: 'Performance', icon: UserIcon, restricted: false }, 
    { id: 'physical', label: 'Fisiologia', icon: HeartPulse, restricted: isAthlete },
    { id: 'assessment', label: 'Avaliação Física', icon: Ruler, restricted: isAthlete },
    { id: 'ranking', label: 'Ranking', icon: Trophy, restricted: false },
    { id: 'video', label: 'Vídeo Análise', icon: MonitorPlay, restricted: isAthlete },
    { id: 'settings', label: 'Configurações', icon: Settings, restricted: false },
  ];

  const visibleMenuItems = menuItems.filter(item => !item.restricted);

  return (
    <div className="w-64 bg-black h-screen fixed left-0 top-0 text-zinc-400 flex flex-col border-r border-zinc-900 z-50 shadow-2xl font-sans print:hidden">
      {/* Brand Header com Logo Oficial */}
      <div className="h-24 flex items-center gap-4 px-6 border-b border-zinc-900 bg-black">
        <div className="w-12 h-12 border-2 border-white rounded-xl flex items-center justify-center bg-black shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.1)] overflow-hidden">
             <img 
                src={LOGO_IMAGE} 
                alt="SCOUT21PRO" 
                className="w-full h-full object-contain p-1.5"
             />
        </div>
        <div className="flex flex-col">
            <h2 className="text-lg font-black text-white tracking-tighter italic leading-none whitespace-nowrap">SCOUT 21</h2>
            <p className="text-[10px] font-bold text-[#00f0ff] uppercase tracking-[0.2em] mt-1 glow-text whitespace-nowrap">Pro Analytics</p>
        </div>
      </div>

      <div className="px-6 pt-8 pb-2">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold whitespace-nowrap">Menu Principal</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pb-4">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden ${
                    isActive
                      ? 'bg-[#00f0ff] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                      : 'text-zinc-500 hover:bg-zinc-900 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon size={20} className={`shrink-0 ${isActive ? 'text-black' : 'text-zinc-600 group-hover:text-[#00f0ff]'}`} />
                  <span className={`text-xs uppercase tracking-wider whitespace-nowrap text-ellipsis overflow-hidden ${isActive ? 'font-black' : 'font-bold'}`}>{item.label}</span>
                </button>
            );
          })}
      </nav>

      {/* User Footer */}
      <div className="p-6 border-t border-zinc-900 bg-black">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-zinc-900 rounded-full shrink-0 overflow-hidden border-2 border-[#00f0ff]">
               {currentUser?.photoUrl ? (
                   <img src={currentUser.photoUrl} alt="User" className="w-full h-full object-cover" />
               ) : (
                   <span className="text-xs font-bold text-white flex items-center justify-center h-full w-full">{currentUser?.name?.substring(0, 2)}</span>
               )}
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate whitespace-nowrap">
                    {currentUser?.name || 'Usuário'}
                </p>
                <p className="text-[10px] text-[#00f0ff] font-bold uppercase tracking-wider truncate whitespace-nowrap">
                    {currentUser?.role || 'Visitante'}
                </p>
            </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-zinc-500 hover:bg-zinc-900 hover:text-red-500 transition-colors border border-zinc-900 hover:border-red-900/30 text-xs font-bold rounded-lg uppercase tracking-wide whitespace-nowrap"
        >
          <LogOut size={14} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};