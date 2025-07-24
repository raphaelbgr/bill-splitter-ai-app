import Head from 'next/head';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase-pages';
import { UserService } from '../lib/user-service';
import { BrazilianUserProfile } from '../lib/supabase-pages';
import AuthForm from '../components/AuthForm';

export default function AuthTestPage() {
  const [user, setUser] = useState<BrazilianUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [userData, setUserData] = useState<any>(null);


  const userService = useMemo(() => new UserService(), []);

  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const profile = await userService.getCurrentUser();
      setUser(profile);
    }
    setLoading(false);
  }, [supabase.auth, userService]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const handleAuthSuccess = async (userProfile: BrazilianUserProfile) => {
    setUser(userProfile);
    setShowAuth(false);
    await userService.updateLastActive();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
  };

  const handleExportData = async () => {
    try {
      const data = await userService.exportUserData();
      setUserData(data);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleUpdateConsent = async (consentType: string, granted: boolean) => {
    try {
      const success = await userService.updateConsent(consentType, granted);
      if (success) {
        await checkUser(); // Refresh user data
      }
    } catch (error) {
      console.error('Error updating consent:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>RachaAI - Teste de Autenticação</title>
        <meta name="description" content="Teste de autenticação e gerenciamento de usuários" />
      </Head>
      
      <main className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-600 text-white p-6">
              <h1 className="text-2xl font-bold">RachaAI - Teste de Autenticação</h1>
              <p className="text-blue-100 mt-2">
                Testando sistema de autenticação com LGPD compliance
              </p>
            </div>

            {!user ? (
              <div className="p-6">
                {showAuth ? (
                  <AuthForm onAuthSuccess={handleAuthSuccess} />
                ) : (
                  <div className="text-center py-8">
                    <h2 className="text-xl font-semibold mb-4">Não autenticado</h2>
                    <button
                      onClick={() => setShowAuth(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Entrar / Criar Conta
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Profile */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Perfil do Usuário</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Nome:</strong> {user.display_name || 'Não informado'}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Telefone:</strong> {user.phone || 'Não informado'}</p>
                      <p><strong>CPF:</strong> {user.cpf ? '***.***.***-**' : 'Não informado'}</p>
                      <p><strong>Fuso Horário:</strong> {user.timezone}</p>
                      <p><strong>Idioma:</strong> {user.language}</p>
                      <p><strong>Moeda:</strong> {user.currency}</p>
                      <p><strong>Versão do Consentimento:</strong> {user.consent_version}</p>
                    </div>
                  </div>

                  {/* Consent Management */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Gerenciamento de Consentimento (LGPD)</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={user.ai_processing_consent}
                            onChange={(e) => handleUpdateConsent('ai_processing', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">Processamento de IA</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={user.marketing_consent}
                            onChange={(e) => handleUpdateConsent('marketing', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">Comunicações de Marketing</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleExportData}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Exportar Dados (LGPD)
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Sair
                    </button>
                  </div>

                  {/* Exported Data Display */}
                  {userData && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Dados Exportados:</h4>
                      <div className="bg-gray-100 p-4 rounded-md max-h-64 overflow-y-auto">
                        <pre className="text-xs">{JSON.stringify(userData, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
} 