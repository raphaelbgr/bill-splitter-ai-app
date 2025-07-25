import Head from 'next/head';
import ChatTest from '../components/ChatTest';

export default function TestPage() {
  return (
    <>
      <Head>
        <title>RachaAI - Teste da Interface Conversacional</title>
        <meta name="description" content="Teste a interface conversacional do RachaAI com IA Claude para divisão de contas brasileiras" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
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
                  <p className="text-purple-200 text-sm">Interface Conversacional</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-4 py-2 bg-green-500/20 text-green-300 text-sm rounded-full border border-green-500/30 backdrop-blur-sm">
                  Claude AI
                </span>
                <span className="px-4 py-2 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30 backdrop-blur-sm">
                  LGPD Compliant
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 py-8">
          <ChatTest />
        </main>

        {/* Footer */}
        <footer className="relative z-10 bg-black/20 backdrop-blur-md border-t border-white/20 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-purple-200">
                © 2024 RachaAI - Divisão Inteligente de Contas com IA Brasileira
              </p>
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