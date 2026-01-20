import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Users, Target, TrendingUp, Clock, BarChart3, Shield, CheckCircle, Building2, Trophy, Sparkles, Brain, Calendar } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onGoToLogin?: () => void;
}

// Hook para animações ao scroll
const useInView = (threshold = 0.1) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return [ref, isInView] as const;
};

// Componente de Carrossel
const ImageCarousel: React.FC = () => {
  const images = [
    '/ChatGPT Image 20 de jan. de 2026, 15_18_24.png',
    '/ChatGPT Image 20 de jan. de 2026, 15_20_07.png',
    '/ChatGPT Image 20 de jan. de 2026, 15_21_34.png',
    '/ChatGPT Image 20 de jan. de 2026, 15_23_12.png',
    '/ChatGPT Image 20 de jan. de 2026, 15_25_30.png',
    '/ChatGPT Image 20 de jan. de 2026, 15_28_11.png',
    '/ChatGPT Image 20 de jan. de 2026, 15_31_43.png',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
    if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <div 
      className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden rounded-2xl"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={img}
            alt={`SCOUT21PRO - ${idx + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
      ))}
      
      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'w-8 bg-[#00f0ff]'
                : 'w-1.5 bg-zinc-600 hover:bg-zinc-500'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onGoToLogin }) => {
  const handleClick = () => {
    console.log('🚀 Botão Começar Agora clicado!');
    onGetStarted();
  };

  // Refs para animações
  const [refParaQuem, inViewParaQuem] = useInView(0.1);
  const [refDesafio, inViewDesafio] = useInView(0.1);
  const [refSolucao, inViewSolucao] = useInView(0.1);
  const [refDiferenciais, inViewDiferenciais] = useInView(0.1);
  const [refVestiario, inViewVestiario] = useInView(0.1);
  const [refDNA, inViewDNA] = useInView(0.1);
  const [refComoFunciona, inViewComoFunciona] = useInView(0.1);
  const [refCarousel, inViewCarousel] = useInView(0.1);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <img 
                src="/public-logo.png.png" 
                alt="SCOUT21PRO Logo" 
                className="h-10 w-auto"
              />
            </div>
            
            {/* Right side - Login and Instagram */}
            <div className="flex flex-col items-end gap-2">
              <button 
                onClick={onGoToLogin}
                className="px-4 md:px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 hover:border-[#00f0ff] rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-all"
              >
                Login
              </button>
              <a 
                href="https://instagram.com/scout21pro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#00f0ff] hover:text-[#00d4e6] text-[10px] md:text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <svg 
                  className="w-4 h-4" 
                  fill="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @scout21pro
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-20 pt-24">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black"></div>
        
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="inline-flex items-center justify-center mb-8">
            <img 
              src="/public-logo.png.png" 
              alt="SCOUT21PRO Logo" 
              className="h-24 md:h-32 w-auto max-w-full"
            />
          </div>

          {/* Eyebrow Headline - Tom Institucional */}
          <p className="text-sm md:text-base font-bold text-[#00f0ff] uppercase tracking-widest mb-4">
            Análises baseadas em dados para decisões vencedoras
          </p>

          {/* Headline Principal - Tom Institucional e Técnico */}
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-white">
            Transforme informação em vantagem competitiva<br />
            <span className="text-[#00f0ff]">no futsal</span>
          </h1>
          
          {/* Subheadline - Método e Confiança */}
          <p className="text-xl md:text-2xl text-zinc-300 font-semibold max-w-3xl mx-auto leading-relaxed">
            Indicadores, scout e análise de performance<br />
            <span className="text-zinc-400">para transformar dados em insights poderosos para o dia a dia do clube.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <button 
              onClick={handleClick}
              type="button"
              className="group px-8 py-4 bg-[#00f0ff] hover:bg-[#00d4e6] active:scale-[0.98] text-black font-black text-lg uppercase tracking-wider rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:shadow-[0_0_50px_rgba(0,240,255,0.6)] hover:scale-[1.02] flex items-center gap-3 cursor-pointer"
            >
              Começar Agora - É Grátis
              <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300" size={24} />
            </button>
            <button 
              onClick={() => window.open('https://wa.me/?text=Olá,%20gostaria%20de%20agendar%20uma%20apresentação', '_blank')}
              type="button"
              className="group px-6 md:px-8 py-4 bg-transparent hover:bg-zinc-900 active:scale-[0.98] text-white border-2 border-[#00f0ff] hover:border-[#00d4e6] font-black text-sm md:text-lg uppercase tracking-wider rounded-xl transition-all duration-300 hover:scale-[1.02] flex items-center gap-2 md:gap-3 cursor-pointer"
            >
              <Calendar size={18} className="md:w-5 md:h-5 shrink-0" />
              <span className="hidden sm:inline">Entre em contato e agende uma apresentação</span>
              <span className="sm:hidden">Agende apresentação</span>
            </button>
          </div>

          <p className="text-sm text-zinc-600 font-medium pt-2">
            ✓ Sem cartão de crédito &nbsp;&nbsp; ✓ Acesso imediato &nbsp;&nbsp; ✓ Teste grátis
          </p>

          {/* Frase de Fechamento */}
          <p className="text-lg md:text-xl text-zinc-300 font-bold max-w-3xl mx-auto pt-8 border-t border-zinc-800">
            Largue na frente. Ganhe pontos onde seus adversários ainda não estão olhando. 🚀🧠
          </p>
        </div>
      </header>

      {/* Para Quem É */}
      <section ref={refParaQuem} className={`py-24 px-4 sm:px-6 bg-zinc-900/50 border-y border-zinc-800 transition-all duration-700 ${inViewParaQuem ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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
              <div 
                key={idx} 
                className={`bg-black border border-zinc-800 rounded-2xl p-8 hover:border-[#00f0ff] transition-all duration-300 hover:scale-[1.02] ${inViewParaQuem ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <item.icon className="text-[#00f0ff] mb-4" size={48} />
                <h3 className="text-xl font-black text-white mb-3 uppercase">{item.title}</h3>
                <p className="text-zinc-400 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O Problema Atual */}
      <section ref={refDesafio} className={`py-24 px-4 sm:px-6 transition-all duration-700 ${inViewDesafio ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-4">O Desafio Atual</h2>
            <div className="w-24 h-1 bg-[#00f0ff] mx-auto mb-6"></div>
            <p className="text-xl text-zinc-400 font-medium">Gestão informal prejudica o desenvolvimento da equipe</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {[
              'Planilhas desorganizadas e dados perdidos',
              'Falta de histórico completo dos atletas',
              'Dificuldade em acompanhar evolução real',
              'Sistemas caros ou complexos demais',
              'Avaliações subjetivas sem base de dados',
              'Falta de profissionalização na gestão técnica'
            ].map((problem, idx) => (
              <div 
                key={idx} 
                className={`flex items-start gap-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 transition-all duration-300 ${inViewDesafio ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0"></div>
                <p className="text-zinc-300 font-medium text-lg">{problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A Solução */}
      <section ref={refSolucao} className={`py-24 px-4 sm:px-6 bg-zinc-900/30 transition-all duration-700 ${inViewSolucao ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-4">A Solução</h2>
            <div className="w-24 h-1 bg-[#00f0ff] mx-auto mb-6"></div>
            <p className="text-xl text-zinc-400 font-medium">Gestão profissional, simples e completa</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {[
              { icon: Users, title: 'Gestão de Equipe', desc: 'Cadastro completo de atletas, comissão técnica e histórico' },
              { icon: Clock, title: 'Programação', desc: 'Organize treinos, jogos e convocações em um só lugar' },
              { icon: BarChart3, title: 'Scout de Jogo', desc: 'Registre dados individuais e coletivos de cada partida' },
              { icon: TrendingUp, title: 'Evolução e Ranking', desc: 'Acompanhe performance e compare atletas com dados reais' }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className={`bg-black border border-zinc-800 rounded-2xl p-8 hover:border-[#00f0ff] transition-all duration-300 hover:scale-[1.02] ${inViewSolucao ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <feature.icon className="text-[#00f0ff] mb-4" size={40} />
                <h3 className="text-2xl font-black text-white mb-3 uppercase">{feature.title}</h3>
                <p className="text-zinc-400 font-medium text-lg leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Carrossel de Imagens */}
      <section ref={refCarousel} className={`py-24 px-4 sm:px-6 transition-all duration-700 ${inViewCarousel ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black uppercase text-white mb-4">Gestão de Alta Performance</h2>
            <div className="w-24 h-1 bg-[#00f0ff] mx-auto"></div>
          </div>
          <ImageCarousel />
        </div>
      </section>

      {/* Diferenciais */}
      <section ref={refDiferenciais} className={`py-24 px-4 sm:px-6 transition-all duration-700 ${inViewDiferenciais ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-4">Por Que SCOUT21PRO?</h2>
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
              <div 
                key={idx} 
                className={`flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-[#00f0ff] transition-all duration-300 hover:scale-[1.01] ${inViewDiferenciais ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <CheckCircle className="text-[#00f0ff] shrink-0" size={32} />
                <p className="text-white font-bold text-xl">{diff}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Do Vestiário ao Escritório */}
      <section ref={refVestiario} className={`py-24 px-4 sm:px-6 bg-zinc-900/30 transition-all duration-700 ${inViewVestiario ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-4">Do Vestiário ao Escritório</h2>
            <div className="w-24 h-1 bg-[#00f0ff] mx-auto mb-8"></div>
            <p className="text-xl text-zinc-400 font-medium max-w-3xl mx-auto">
              Trazer a frieza dos números para a emoção do campo.<br />
              Transformar dados em legado vencedor.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              { 
                icon: Brain, 
                title: 'Lógica', 
                desc: 'Trazer a frieza dos números para a emoção do campo.',
                emoji: '🏛️'
              },
              { 
                icon: Trophy, 
                title: 'Prática', 
                desc: 'Transformar dados em legado vencedor.',
                emoji: '⚽'
              },
              { 
                icon: BarChart3, 
                title: 'Método', 
                desc: 'Gestão Esportiva de Alta Performance.',
                emoji: '📊'
              }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className={`bg-black border border-zinc-800 rounded-2xl p-8 hover:border-[#00f0ff] transition-all duration-300 hover:scale-[1.02] text-center ${inViewVestiario ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="text-4xl mb-4">{item.emoji}</div>
                <item.icon className="text-[#00f0ff] mb-4 mx-auto" size={40} />
                <h3 className="text-xl font-black text-white mb-4 uppercase">{item.title}</h3>
                <p className="text-zinc-400 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O DNA do Idealizador */}
      <section ref={refDNA} className={`py-24 px-4 sm:px-6 transition-all duration-700 ${inViewDNA ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-4">O DNA do Idealizador</h2>
            <div className="w-24 h-1 bg-[#00f0ff] mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { 
                icon: Trophy, 
                title: 'Atleta (Vestiário)', 
                desc: 'Vivência da dor real: falta de profissionalismo e gestão.',
                emoji: '⚽'
              },
              { 
                icon: Building2, 
                title: 'Executivo (Logística)', 
                desc: 'Gestão baseada em KPIs, SLA e Nível de Serviço ao Cliente.',
                emoji: '🏢'
              },
              { 
                icon: Sparkles, 
                title: 'Alta Performance', 
                desc: 'A aplicação de indicadores de alta performance com metodologia corporativa.',
                emoji: '🚀'
              },
              { 
                icon: Brain, 
                title: 'Expertise em BI', 
                desc: 'Expertise em transformar dados brutos de 20.000 linhas de excel em insights poderosos.',
                emoji: '📊'
              }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className={`bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-[#00f0ff] transition-all duration-300 hover:scale-[1.01] ${inViewDNA ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl shrink-0">{item.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <item.icon className="text-[#00f0ff]" size={32} />
                      <h3 className="text-2xl font-black text-white uppercase">{item.title}</h3>
                    </div>
                    <p className="text-zinc-300 font-medium text-lg leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section ref={refComoFunciona} className={`py-24 px-4 sm:px-6 bg-zinc-900/30 transition-all duration-700 ${inViewComoFunciona ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-4">Como Funciona</h2>
            <div className="w-24 h-1 bg-[#00f0ff] mx-auto mb-6"></div>
            <p className="text-xl text-zinc-400 font-medium">Simples e direto ao ponto</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {[
              { num: '1', title: 'Crie sua conta', desc: 'Cadastro rápido e gratuito' },
              { num: '2', title: 'Monte sua equipe', desc: 'Adicione atletas e comissão' },
              { num: '3', title: 'Registre jogos', desc: 'Scout simples e eficiente' },
              { num: '4', title: 'Acompanhe evolução', desc: 'Dados e ranking em tempo real' },
              { num: '5', title: 'Tome decisões', desc: 'Base sólida para escolhas técnicas' }
            ].map((step, idx) => (
              <div 
                key={idx} 
                className={`text-center transition-all duration-300 ${inViewComoFunciona ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="w-16 h-16 bg-[#00f0ff] rounded-full flex items-center justify-center mx-auto mb-4 text-black font-black text-2xl transition-transform duration-300 hover:scale-110">
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
      <section className="py-32 px-4 sm:px-6 bg-gradient-to-br from-zinc-900 to-black border-y border-zinc-800">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-6xl font-black uppercase text-white leading-tight">
            Pronto para profissionalizar<br />
            <span className="text-[#00f0ff]">sua equipe?</span>
          </h2>
          
          <button 
            onClick={handleClick}
            type="button"
            className="group px-10 py-5 bg-[#00f0ff] hover:bg-[#00d4e6] active:scale-[0.98] text-black font-black text-xl uppercase tracking-wider rounded-xl transition-all duration-300 shadow-[0_0_40px_rgba(0,240,255,0.5)] hover:shadow-[0_0_60px_rgba(0,240,255,0.7)] hover:scale-[1.02] flex items-center gap-3 mx-auto cursor-pointer"
          >
            Criar Conta Grátis
            <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300" size={28} />
          </button>

          <p className="text-sm text-zinc-600 font-medium">
            ✓ Sem compromisso &nbsp;&nbsp; ✓ Cancele quando quiser &nbsp;&nbsp; ✓ Suporte em português
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 bg-black border-t border-zinc-800">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center justify-center">
            <img 
              src="/public-logo.png.png" 
              alt="SCOUT21PRO Logo" 
              className="h-12 w-auto"
            />
          </div>
          
          <p className="text-zinc-500 font-medium">
            Plataforma brasileira de gestão e performance para futsal
          </p>
          
          <p className="text-zinc-600 text-sm">
            Focado em profissionalizar clubes de pequeno e médio porte
          </p>
          
          <div className="pt-8 border-t border-zinc-900">
            <p className="text-zinc-700 text-xs">
              © 2026 SCOUT21PRO. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

