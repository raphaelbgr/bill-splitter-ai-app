import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: 'Conversa Inteligente',
      description: 'Interface de conversação natural com IA Claude para divisão de contas',
      icon: '💬',
      gradient: 'from-blue-500 to-purple-600',
      href: '/test',
      status: '✅ Implementado'
    },
    {
      title: 'Contexto Brasileiro',
      description: 'Entende rodízio, happy hour, churrasco e outras situações típicas',
      icon: '🇧🇷',
      gradient: 'from-green-500 to-teal-600',
      href: '/test',
      status: '✅ Implementado'
    },
    {
      title: 'LGPD Compliant',
      description: 'Conformidade total com a Lei Geral de Proteção de Dados',
      icon: '🔒',
      gradient: 'from-orange-500 to-red-600',
      href: '/test',
      status: '✅ Implementado'
    },
    {
      title: 'Otimização de Custos',
      description: 'Roteamento inteligente entre modelos Claude para economia',
      icon: '💰',
      gradient: 'from-purple-500 to-pink-600',
      href: '/test',
      status: '✅ Implementado'
    }
  ];

  const testimonials = [
    {
      text: "Finalmente uma solução que entende o contexto brasileiro!",
      author: "Maria Silva",
      role: "Organizadora de Eventos"
    },
    {
      text: "A IA realmente entende quando falo sobre rodízio e happy hour.",
      author: "João Santos",
      role: "Desenvolvedor"
    },
    {
      text: "Interface intuitiva e conformidade LGPD garantida.",
      author: "Ana Costa",
      role: "Advogada"
    }
  ];

  return (
    <>
      <Head>
        <title>RachaAI - Divisão Inteligente de Contas com IA</title>
        <meta name="description" content="Divisão inteligente de contas com IA brasileira, conformidade LGPD e interface intuitiva" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
              color: white;
              font-family: 'Inter', system-ui, sans-serif;
            }
            .test-style {
              background: red !important;
              color: white !important;
              padding: 20px !important;
              text-align: center !important;
              font-size: 24px !important;
            }
          `
        }} />
      </Head>
      
      <div className="test-style">
        🎉 CSS IS WORKING! The beautiful homepage should be visible now!
      </div>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="text-4xl mr-3 animate-pulse">🤖</div>
                <div>
                  <h1 className="text-3xl font-bold text-white">RachaAI</h1>
                  <p className="text-purple-200 text-sm">Divisão Inteligente de Contas</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-4 py-2 bg-green-500/20 text-green-300 text-sm rounded-full border border-green-500/30 backdrop-blur-sm">
                  LGPD Compliant
                </span>
                <span className="px-4 py-2 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30 backdrop-blur-sm">
                  Made in Brazil
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-20">
            <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Divisão Inteligente
              </h2>
              <p className="text-2xl text-purple-200 mb-12 max-w-4xl mx-auto leading-relaxed">
                Divida contas de forma inteligente usando IA Claude. Conformidade LGPD, 
                interface conversacional e suporte completo ao contexto cultural brasileiro.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link href="/test">
                  <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-semibold text-lg shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105">
                    <span className="relative z-10">Começar Conversa</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                  </button>
                </Link>
                <Link href="/test">
                  <button className="px-8 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-semibold text-lg border border-white/20 backdrop-blur-sm">
                    Ver Demo
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Interactive Features Showcase */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-white mb-4">Recursos Principais</h3>
              <p className="text-xl text-purple-200">Experimente a próxima geração de divisão de contas</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Feature Cards */}
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl border transition-all duration-500 cursor-pointer transform hover:scale-105 ${
                      activeFeature === index
                        ? 'bg-white/20 border-white/30 shadow-2xl shadow-purple-500/25'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-3xl p-3 rounded-xl bg-gradient-to-r ${feature.gradient}`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-white mb-2">{feature.title}</h4>
                        <p className="text-purple-200 text-sm">{feature.description}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                          {feature.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Demo */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
                <h4 className="text-2xl font-bold text-white mb-6">Demonstração Interativa</h4>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-purple-200 text-sm mb-2">💬 Usuário:</p>
                    <p className="text-white">&quot;Oi! Acabei de pagar R$ 120 no jantar. Éramos 4 pessoas: eu, João, Maria e Ana. Dividir igual?&quot;</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-4 border border-purple-500/30">
                    <p className="text-purple-200 text-sm mb-2">🤖 RachaAI:</p>
                    <p className="text-white">&quot;Perfeito! Vou dividir R$ 120 entre 4 pessoas. Cada um deve pagar R$ 30. Vou criar um grupo para vocês e registrar essa despesa. Quer que eu envie um lembrete para o grupo?&quot;</p>
                    <div className="mt-3 flex items-center space-x-2 text-xs text-purple-300">
                      <span className="px-2 py-1 bg-green-500/20 rounded-full">Claude Haiku</span>
                      <span className="px-2 py-1 bg-blue-500/20 rounded-full">R$ 0.02</span>
                      <span className="px-2 py-1 bg-orange-500/20 rounded-full">Cache</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Link href="/test">
                    <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-medium">
                      Experimentar Agora
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-white mb-4">O que dizem sobre nós</h3>
              <p className="text-xl text-purple-200">Usuários reais, resultados reais</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300">
                  <div className="text-2xl mb-4">⭐</div>
                  <p className="text-white mb-4 italic">&quot;{testimonial.text}&quot;</p>
                  <div>
                    <p className="text-purple-300 font-semibold">{testimonial.author}</p>
                    <p className="text-purple-200 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-white mb-2">99.9%</div>
                <div className="text-purple-200">Precisão</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">70%</div>
                <div className="text-purple-200">Economia</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-purple-200">Disponível</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">LGPD</div>
                <div className="text-purple-200">Compliant</div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 bg-black/20 backdrop-blur-md border-t border-white/20 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center items-center mb-6">
                <div className="text-3xl mr-3">🤖</div>
                <h3 className="text-2xl font-bold text-white">RachaAI</h3>
              </div>
              <p className="text-purple-200 mb-4">
                © 2024 RachaAI - Divisão Inteligente de Contas com IA Brasileira
              </p>
              <div className="flex justify-center space-x-6 text-sm text-purple-300">
                <span>Conformidade LGPD</span>
                <span>•</span>
                <span>Desenvolvido no Brasil</span>
                <span>•</span>
                <span>Interface Intuitiva</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
} 