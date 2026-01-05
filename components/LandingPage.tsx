import React from 'react';
import { ArrowRight, Users, Target, TrendingUp, Clock, BarChart3, Shield, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onGoToLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onGoToLogin }) => {
  const handleClick = () => {
    console.log('🚀 Botão Começar Agora clicado!');
    onGetStarted();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 border-2 border-[#00f0ff] rounded-lg flex items-center justify-center bg-black shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              <span className="text-lg font-black text-[#00f0ff]">21</span>
            </div>
            <div className="text-left">
              <h2 className="text-base font-black text-white tracking-tighter italic leading-none">SCOUT 21</h2>
              <p className="text-[8px] font-bold text-[#00f0ff] uppercase tracking-[0.2em]">Pro Analytics</p>
            </div>
          </div>
          
          {/* Login Button */}
          <button 
            onClick={onGoToLogin}
            className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 hover:border-[#00f0ff] rounded-lg text-sm font-bold uppercase tracking-wider transition-all"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center px-6 py-20 pt-24">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black"></div>
        
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-16 h-16 border-2 border-[#00f0ff] rounded-xl flex items-center justify-center bg-black shadow-[0_0_30px_rgba(0,240,255,0.3)]">
              <span className="text-2xl font-black text-[#00f0ff]">21</span>
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-black text-white tracking-tighter italic leading-none">SCOUT 21</h2>
              <p className="text-xs font-bold text-[#00f0ff] uppercase tracking-[0.2em]">Pro Analytics</p>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-white">
            Profissionalize a gestão<br />
            <span className="text-[#00f0ff]">do seu time de futsal</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 font-medium max-w-3xl mx-auto leading-relaxed">
            Chega de planilhas soltas e anotações perdidas.<br />
            Tenha controle real da sua equipe com dados organizados e acessíveis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <button 
              onClick={handleClick}
              type="button"
              className="group px-8 py-4 bg-[#00f0ff] hover:bg-[#00d4e6] text-black font-black text-lg uppercase tracking-wider rounded-xl transition-all shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:shadow-[0_0_50px_rgba(0,240,255,0.6)] flex items-center gap-3 cursor-pointer"
            >
              Começar Agora - É Grátis
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
            </button>
          </div>

          <p className="text-sm text-zinc-600 font-medium">
            ✓ Sem cartão de crédito &nbsp;&nbsp; ✓ Acesso imediato &nbsp;&nbsp; ✓ Teste grátis
          </p>
        </div>
      </header>

      {/* Para Quem É */}
      <section className="py-20 px-6 bg-zinc-900/50 border-y border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-4">Para Quem É</h2>
            <div className="w-24 h-1 bg-[#00f0ff] mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Clubes de Futsal', desc: 'Equipes adultas e de base que buscam profissionalização' },
              { icon: Target, title: 'Times Universitários', desc: 'Projetos esportivos acadêmicos e competitivos' },
              { icon: Shield, title: 'Comissões Técnicas', desc: 'Treinadores que querem dados organizados para decisões' }
            ].map((item, idx) => (
              <div key={idx} className="bg-black border border-zinc-800 rounded-2xl p-8 hover:border-[#00f0ff] transition-all">
                <item.icon className="text-[#00f0ff] mb-4" size={48} />
                <h3 className="text-xl font-black text-white mb-3 uppercase">{item.title}</h3>
                <p className="text-zinc-400 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O Problema Atual */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-4">O Desafio Atual</h2>
            <div className="w-24 h-1 bg-[#00f0ff] mx-auto mb-6"></div>
            <p className="text-xl text-zinc-400 font-medium">Gestão informal prejudica o desenvolvimento da equipe</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              'Planilhas desorganizadas e dados perdidos',
              'Falta de histórico completo dos atletas',
              'Dificuldade em acompanhar evolução real',
              'Sistemas caros ou complexos demais',
              'Avaliações subjetivas sem base de dados',
              'Falta de profissionalização na gestão técnica'
            ].map((problem, idx) => (
              <div key={idx} className="flex items-start gap-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0"></div>
                <p className="text-zinc-300 font-medium text-lg">{problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A Solução */}
      <section className="py-20 px-6 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-4">A Solução</h2>
            <div className="w-24 h-1 bg-[#00f0ff] mx-auto mb-6"></div>
            <p className="text-xl text-zinc-400 font-medium">Gestão profissional, simples e completa</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Users, title: 'Gestão de Equipe', desc: 'Cadastro completo de atletas, comissão técnica e histórico' },
              { icon: Clock, title: 'Programação', desc: 'Organize treinos, jogos e convocações em um só lugar' },
              { icon: BarChart3, title: 'Scout de Jogo', desc: 'Registre dados individuais e coletivos de cada partida' },
              { icon: TrendingUp, title: 'Evolução e Ranking', desc: 'Acompanhe performance e compare atletas com dados reais' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-black border border-zinc-800 rounded-2xl p-8 hover:border-[#00f0ff] transition-all">
                <feature.icon className="text-[#00f0ff] mb-4" size={40} />
                <h3 className="text-2xl font-black text-white mb-3 uppercase">{feature.title}</h3>
                <p className="text-zinc-400 font-medium text-lg leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-4">Por Que Scout 21?</h2>
            <div className="w-24 h-1 bg-[#00f0ff] mx-auto"></div>
          </div>
          
          <div className="space-y-6">
            {[
              'Foco exclusivo em esportes de quadra (futsal)',
              'Pensado para clubes pequenos e médios do Brasil',
              'Interface simples, sem complexidade desnecessária',
              'Personalizável conforme a realidade do seu clube',
              'Plataforma brasileira, próxima da sua realidade'
            ].map((diff, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-[#00f0ff] transition-all">
                <CheckCircle className="text-[#00f0ff] shrink-0" size={32} />
                <p className="text-white font-bold text-xl">{diff}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 px-6 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-4">Como Funciona</h2>
            <div className="w-24 h-1 bg-[#00f0ff] mx-auto mb-6"></div>
            <p className="text-xl text-zinc-400 font-medium">Simples e direto ao ponto</p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { num: '1', title: 'Crie sua conta', desc: 'Cadastro rápido e gratuito' },
              { num: '2', title: 'Monte sua equipe', desc: 'Adicione atletas e comissão' },
              { num: '3', title: 'Registre jogos', desc: 'Scout simples e eficiente' },
              { num: '4', title: 'Acompanhe evolução', desc: 'Dados e ranking em tempo real' },
              { num: '5', title: 'Tome decisões', desc: 'Base sólida para escolhas técnicas' }
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-[#00f0ff] rounded-full flex items-center justify-center mx-auto mb-4 text-black font-black text-2xl">
                  {step.num}
                </div>
                <h3 className="text-lg font-black text-white mb-2 uppercase">{step.title}</h3>
                <p className="text-sm text-zinc-400 font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 px-6 bg-gradient-to-br from-zinc-900 to-black border-y border-zinc-800">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-6xl font-black uppercase text-white leading-tight">
            Pronto para profissionalizar<br />
            <span className="text-[#00f0ff]">sua equipe?</span>
          </h2>
          
          <p className="text-xl text-zinc-400 font-medium max-w-2xl mx-auto">
            Junte-se aos clubes que estão modernizando a gestão do futsal brasileiro
          </p>
          
          <button 
            onClick={handleClick}
            type="button"
            className="group px-10 py-5 bg-[#00f0ff] hover:bg-[#00d4e6] text-black font-black text-xl uppercase tracking-wider rounded-xl transition-all shadow-[0_0_40px_rgba(0,240,255,0.5)] hover:shadow-[0_0_60px_rgba(0,240,255,0.7)] flex items-center gap-3 mx-auto cursor-pointer"
          >
            Criar Conta Grátis
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={28} />
          </button>

          <p className="text-sm text-zinc-600 font-medium">
            ✓ Sem compromisso &nbsp;&nbsp; ✓ Cancele quando quiser &nbsp;&nbsp; ✓ Suporte em português
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-black border-t border-zinc-800">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 border-2 border-[#00f0ff] rounded-xl flex items-center justify-center bg-black">
              <span className="text-lg font-black text-[#00f0ff]">21</span>
            </div>
            <div className="text-left">
              <h2 className="text-lg font-black text-white tracking-tighter italic leading-none">SCOUT 21</h2>
              <p className="text-[8px] font-bold text-[#00f0ff] uppercase tracking-[0.2em]">Pro Analytics</p>
            </div>
          </div>
          
          <p className="text-zinc-500 font-medium">
            Plataforma brasileira de gestão e performance para futsal
          </p>
          
          <p className="text-zinc-600 text-sm">
            Focado em profissionalizar clubes de pequeno e médio porte
          </p>
          
          <div className="pt-8 border-t border-zinc-900">
            <p className="text-zinc-700 text-xs">
              © 2026 Scout 21 Pro Analytics. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

