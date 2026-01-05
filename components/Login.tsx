import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { ShieldCheck } from 'lucide-react';

// Importação explícita da logo oficial
const LOGO_IMAGE = '/public-logo.png.png';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Treinador');
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSuccessMsg('');
    
    // Simulação de envio de e-mail
    setResetSuccessMsg('Instruções para redefinição de senha foram enviadas.');
    setTimeout(() => {
      setIsResettingPassword(false);
      setResetEmail('');
      setResetSuccessMsg('');
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isRegistering) {
        if (password.length < 5) {
            setError('A senha deve ter no mínimo 5 caracteres.');
            return;
        }
        setSuccessMsg(`Solicitação enviada. Aguarde aprovação.`);
        setTimeout(() => {
             const newUser: User = {
                name: name || email.split('@')[0],
                email: email,
                role: role,
                linkedPlayerId: role === 'Atleta' ? 'p1' : undefined
            };
            onLogin(newUser);
        }, 1500);
    } else {
        // Login admin/admin
        if (email === 'admin' && password === 'admin') {
            const adminUser: User = {
                name: 'Administrador',
                email: 'admin@admin.com',
                role: 'Treinador',
                photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop'
            };
            onLogin(adminUser);
            return;
        }
        
        if (password === 'afc25') {
             let userRole: UserRole = 'Treinador';
             let linkedId = undefined;
             let userName = 'Head Coach';

             if (email.includes('atleta')) {
                 userRole = 'Atleta';
                 linkedId = 'p1';
                 userName = 'Ricardinho';
             } else if (email.includes('fisico')) {
                 userRole = 'Preparador Físico';
                 userName = 'Prep. Staff';
             } else if (email.includes('diretor')) {
                 userRole = 'Diretor';
                 userName = 'Diretoria';
             }

             const user: User = {
                 name: userName,
                 email: email,
                 role: userRole,
                 linkedPlayerId: linkedId
             };
             onLogin(user);
        } else {
            setError('Credenciais inválidas.');
        }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-black overflow-hidden font-sans text-white">
      
      {/* Background - Crowded Arena / Emotion */}
      <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=2069&auto=format&fit=crop" 
            alt="Arena Lotada Emoção" 
            className="w-full h-full object-cover opacity-60"
          />
          {/* Gradient Overlay for Text Readability and Mood */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black"></div>
      </div>

      {/* Auth Card - Black Piano Aesthetic - EXTRA TRANSPARENT (20%) */}
      <div className="z-20 bg-black/20 backdrop-blur-lg border border-white/10 p-12 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] w-full max-w-sm relative animate-fade-in ring-1 ring-white/5 mb-24">
        
        <div className="mb-10 text-center">
            {/* Logo Oficial */}
            <div className="flex justify-center mb-8">
                <div className={`relative w-40 h-40 flex items-center justify-center border-[3px] ${isRegistering ? 'border-[#00f0ff]' : 'border-white'} bg-black/60 shadow-[0_0_40px_rgba(0,240,255,0.3)] rounded-2xl transform rotate-3 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(0,240,255,0.5)] overflow-hidden`}>
                    <img 
                        src={LOGO_IMAGE} 
                        alt="SCOUT21PRO" 
                        className="w-full h-full object-contain p-4"
                    />
                </div>
            </div>

            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">
                SCOUT21PRO
            </h1>
            <p className="text-[10px] text-zinc-200 font-light uppercase tracking-[0.3em] mt-2 drop-shadow-md">
                {isRegistering ? 'Credenciamento Oficial' : 'Performance Data Intelligence e Gestão'}
            </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegistering && (
             <div className="space-y-1.5">
                <label className="text-[10px] font-light text-zinc-300 uppercase tracking-wider pl-1">Nome Completo</label>
                <input
                    type="text"
                    required={isRegistering}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00f0ff] focus:bg-black/60 transition-all placeholder-zinc-400 font-light text-sm backdrop-blur-sm"
                    placeholder="Seu nome"
                />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-light text-zinc-300 uppercase tracking-wider pl-1">Usuário</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00f0ff] focus:bg-black/60 transition-all placeholder-zinc-400 font-light text-sm backdrop-blur-sm"
              placeholder="admin"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-light text-zinc-300 uppercase tracking-wider pl-1">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00f0ff] focus:bg-black/60 transition-all placeholder-zinc-400 font-light text-sm backdrop-blur-sm"
              placeholder="•••••"
            />
            <p className="text-[10px] text-zinc-400 font-light text-center pt-1">Acesso restrito</p>
          </div>
          
          {!isRegistering && (
            <button
              type="button"
              onClick={() => setIsResettingPassword(true)}
              className="w-full text-[10px] text-zinc-400 hover:text-[#00f0ff] font-light underline transition-colors text-center"
            >
              Esqueci minha senha
            </button>
          )}

          {isRegistering && (
            <div className="space-y-1.5 animate-fade-in">
                <label className="text-[10px] font-light text-zinc-300 uppercase tracking-wider pl-1">Função</label>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00f0ff] text-sm font-light uppercase backdrop-blur-sm"
                >
                    <option value="Treinador">Treinador</option>
                    <option value="Preparador Físico">Preparador Físico</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Diretor">Diretor</option>
                    <option value="Atleta">Atleta</option>
                </select>
            </div>
          )}

          {error && <div className="text-red-400 text-xs bg-red-950/60 p-3 rounded-xl border border-red-900/50 flex items-center gap-2 justify-center font-light backdrop-blur-sm"><ShieldCheck size={14}/> {error}</div>}
          {successMsg && <div className="text-[#00f0ff] text-xs bg-cyan-950/60 p-3 rounded-xl border border-cyan-900/50 text-center font-light backdrop-blur-sm">{successMsg}</div>}

          {isResettingPassword ? (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-light text-zinc-300 uppercase tracking-wider pl-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00f0ff] focus:bg-black/60 transition-all placeholder-zinc-400 font-light text-sm backdrop-blur-sm"
                  placeholder="Digite seu e-mail"
                />
              </div>
              
              {resetSuccessMsg && (
                <div className="bg-green-500/20 border border-green-500/50 text-green-400 text-xs py-2 px-4 rounded-lg text-center">
                  {resetSuccessMsg}
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsResettingPassword(false);
                    setResetEmail('');
                    setError('');
                    setResetSuccessMsg('');
                  }}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-4 font-bold uppercase text-xs rounded-xl transition-all border border-white/10"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  onClick={handleResetPassword}
                  className="flex-1 bg-[#00f0ff] hover:bg-[#33f5ff] text-black py-4 font-bold uppercase text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)]"
                >
                  Enviar
                </button>
              </div>
            </>
          ) : (
            <button
              type="submit"
              className="w-full py-4 px-4 bg-white/90 hover:bg-[#00f0ff] text-black font-semibold text-sm rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(255,255,255,0.1)] mt-4 uppercase tracking-wider backdrop-blur-sm flex items-center justify-center gap-3"
            >
              {isRegistering ? 'Solicitar Acesso' : 'Entrar em Quadra'}
            </button>
          )}
        </form>
        
        <div className="mt-8 text-center pt-6 border-t border-white/10">
             <button 
                onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                }}
                className="text-xs text-zinc-300 hover:text-white font-light transition-colors uppercase tracking-widest"
             >
                 {isRegistering ? 'Já possui conta? Fazer Login' : 'Novo no clube? Criar Conta'}
             </button>
        </div>
      </div>

      {/* Welcome Banner Footer - Updated Text & Transparency & Color */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center px-6 animate-fade-in-up">
        <div className="flex flex-col items-center gap-2.5">
            {/* Decorative Line */}
            <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-zinc-600 to-transparent"></div>
            
            {/* Welcome Message - Compact Background (almost text size) */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-700/70 backdrop-blur-sm rounded-md">
                <span className="text-zinc-300 font-light text-xs md:text-sm tracking-wide">
                    Bem-vindo ao <span className="text-[#00f0ff] font-bold italic">SCOUT21PRO</span> — gestão esportiva baseada em dados para decisões vencedoras.
                </span>
                {/* Logo oficial no rodapé */}
                <div className="w-5 h-5 border border-zinc-600/50 rounded flex items-center justify-center bg-black/90 shrink-0 ml-1 overflow-hidden">
                    <img 
                        src={LOGO_IMAGE} 
                        alt="SCOUT21PRO" 
                        className="w-full h-full object-contain p-0.5"
                    />
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};