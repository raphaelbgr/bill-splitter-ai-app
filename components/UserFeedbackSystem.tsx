import React, { useState, useEffect } from 'react';
import { MemorySystem } from '../lib/memory-system';

interface FeedbackForm {
  type: 'satisfaction' | 'feature_request' | 'bug_report' | 'general';
  rating?: number;
  category?: string;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  contactEmail?: string;
  allowFollowUp: boolean;
}

interface FeedbackSubmission {
  id: string;
  userId: string;
  form: FeedbackForm;
  timestamp: Date;
  status: 'submitted' | 'reviewed' | 'in_progress' | 'resolved' | 'closed';
  response?: string;
  responseDate?: Date;
}

export default function UserFeedbackSystem() {
  const [activeTab, setActiveTab] = useState<'submit' | 'history' | 'status'>('submit');
  const [form, setForm] = useState<FeedbackForm>({
    type: 'satisfaction',
    rating: 5,
    title: '',
    description: '',
    priority: 'medium',
    severity: 'medium',
    allowFollowUp: true
  });
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lgpdConsent, setLgpdConsent] = useState(false);

  useEffect(() => {
    checkLGPDConsent();
    if (lgpdConsent) {
      loadFeedbackHistory();
    }
  }, [lgpdConsent]);

  const checkLGPDConsent = async () => {
    try {
      const memorySystem = new MemorySystem();
      const consent = await memorySystem.getUserConsent('analytics', 'feedback');
      setLgpdConsent(consent.consentGiven);
    } catch (error) {
      console.error('Error checking LGPD consent:', error);
      setLgpdConsent(false);
    }
  };

  const loadFeedbackHistory = async () => {
    try {
      // In a real implementation, this would fetch from the API
      const mockSubmissions: FeedbackSubmission[] = [
        {
          id: '1',
          userId: 'user123',
          form: {
            type: 'feature_request',
            title: 'Integração com WhatsApp',
            description: 'Seria muito útil poder compartilhar as divisões diretamente no WhatsApp',
            priority: 'high',
            allowFollowUp: true
          },
          timestamp: new Date('2024-01-15'),
          status: 'in_progress',
          response: 'Estamos trabalhando nesta funcionalidade. Previsão: março 2024.',
          responseDate: new Date('2024-01-20')
        },
        {
          id: '2',
          userId: 'user123',
          form: {
            type: 'bug_report',
            title: 'Erro no cálculo de porcentagens',
            description: 'Quando uso porcentagens, o cálculo está incorreto',
            severity: 'high',
            allowFollowUp: true
          },
          timestamp: new Date('2024-01-10'),
          status: 'resolved',
          response: 'Bug corrigido na versão 2.1.0. Obrigado pelo feedback!',
          responseDate: new Date('2024-01-12')
        }
      ];
      setSubmissions(mockSubmissions);
    } catch (error) {
      console.error('Error loading feedback history:', error);
    }
  };

  const handleFormChange = (field: keyof FeedbackForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lgpdConsent) {
      alert('É necessário consentimento LGPD para enviar feedback.');
      return;
    }

    if (!form.title.trim() || !form.description.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    
    try {
      // In a real implementation, this would submit to the API
      const submission: FeedbackSubmission = {
        id: Date.now().toString(),
        userId: 'user123', // This would come from auth
        form: { ...form },
        timestamp: new Date(),
        status: 'submitted'
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmissions(prev => [submission, ...prev]);
      setSubmitted(true);
      setForm({
        type: 'satisfaction',
        rating: 5,
        title: '',
        description: '',
        priority: 'medium',
        severity: 'medium',
        allowFollowUp: true
      });
      
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Erro ao enviar feedback. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted': return 'Enviado';
      case 'reviewed': return 'Revisado';
      case 'in_progress': return 'Em Progresso';
      case 'resolved': return 'Resolvido';
      case 'closed': return 'Fechado';
      default: return status;
    }
  };

  if (!lgpdConsent) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sistema de Feedback
          </h2>
          <p className="text-gray-600 mb-4">
            Para enviar feedback, é necessário consentimento LGPD.
          </p>
          <button
            onClick={checkLGPDConsent}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Verificar Consentimento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Sistema de Feedback
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-green-600 font-medium">LGPD Compliant</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'submit', label: 'Enviar Feedback', icon: '📝' },
            { id: 'history', label: 'Histórico', icon: '📋' },
            { id: 'status', label: 'Status', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'submit' && (
          <FeedbackSubmissionForm
            form={form}
            onFormChange={handleFormChange}
            onSubmit={handleSubmit}
            loading={loading}
            submitted={submitted}
          />
        )}
        
        {activeTab === 'history' && (
          <FeedbackHistory submissions={submissions} />
        )}
        
        {activeTab === 'status' && (
          <FeedbackStatus submissions={submissions} />
        )}
      </div>
    </div>
  );
}

// Feedback Submission Form
function FeedbackSubmissionForm({
  form,
  onFormChange,
  onSubmit,
  loading,
  submitted
}: {
  form: FeedbackForm;
  onFormChange: (field: keyof FeedbackForm, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  submitted: boolean;
}) {
  return (
    <div className="max-w-2xl">
      {submitted && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 font-medium">Feedback enviado com sucesso!</span>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Feedback Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Feedback *
          </label>
          <select
            value={form.type}
            onChange={(e) => onFormChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="satisfaction">Avaliação de Satisfação</option>
            <option value="feature_request">Solicitação de Funcionalidade</option>
            <option value="bug_report">Relatório de Bug</option>
            <option value="general">Feedback Geral</option>
          </select>
        </div>

        {/* Rating for satisfaction */}
        {form.type === 'satisfaction' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avaliação (1-5) *
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => onFormChange('rating', rating)}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                    form.rating === rating
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 text-gray-400 hover:border-gray-400'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {form.rating === 1 && 'Muito insatisfeito'}
              {form.rating === 2 && 'Insatisfeito'}
              {form.rating === 3 && 'Neutro'}
              {form.rating === 4 && 'Satisfeito'}
              {form.rating === 5 && 'Muito satisfeito'}
            </p>
          </div>
        )}

        {/* Category for feature requests */}
        {form.type === 'feature_request' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={form.category || ''}
              onChange={(e) => onFormChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione uma categoria</option>
              <option value="payment">Pagamentos</option>
              <option value="groups">Grupos</option>
              <option value="interface">Interface</option>
              <option value="integration">Integrações</option>
              <option value="export">Exportação</option>
              <option value="other">Outro</option>
            </select>
          </div>
        )}

        {/* Priority for feature requests */}
        {form.type === 'feature_request' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridade
            </label>
            <select
              value={form.priority}
              onChange={(e) => onFormChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>
        )}

        {/* Severity for bug reports */}
        {form.type === 'bug_report' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severidade
            </label>
            <select
              value={form.severity}
              onChange={(e) => onFormChange('severity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => onFormChange('title', e.target.value)}
            placeholder="Resumo do feedback"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição *
          </label>
          <textarea
            value={form.description}
            onChange={(e) => onFormChange('description', e.target.value)}
            placeholder="Descreva detalhadamente seu feedback..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email para Contato (Opcional)
          </label>
          <input
            type="email"
            value={form.contactEmail || ''}
            onChange={(e) => onFormChange('contactEmail', e.target.value)}
            placeholder="seu@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Follow-up Consent */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowFollowUp"
            checked={form.allowFollowUp}
            onChange={(e) => onFormChange('allowFollowUp', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="allowFollowUp" className="ml-2 block text-sm text-gray-700">
            Permitir que entremos em contato para acompanhamento
          </label>
        </div>

        {/* LGPD Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium">Aviso LGPD</p>
              <p className="mt-1">
                Seus dados serão processados conforme nossa política de privacidade. 
                Você pode solicitar a exclusão dos dados a qualquer momento.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 'Enviar Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Feedback History
function FeedbackHistory({ submissions }: { submissions: FeedbackSubmission[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Feedback</h3>
      
      {submissions.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">Nenhum feedback enviado ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {getStatusText(submission.status)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {submission.timestamp.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1">{submission.form.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{submission.form.description}</p>
                  
                  {submission.form.type === 'satisfaction' && submission.form.rating && (
                    <div className="flex items-center space-x-1 mb-2">
                      <span className="text-xs text-gray-500">Avaliação:</span>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <svg
                          key={rating}
                          className={`w-4 h-4 ${
                            rating <= submission.form.rating! ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  )}
                  
                  {submission.response && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Resposta da Equipe:</p>
                      <p className="text-sm text-blue-800">{submission.response}</p>
                      {submission.responseDate && (
                        <p className="text-xs text-blue-600 mt-1">
                          {submission.responseDate.toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Feedback Status
function FeedbackStatus({ submissions }: { submissions: FeedbackSubmission[] }) {
  const statusCounts = submissions.reduce((acc, submission) => {
    acc[submission.status] = (acc[submission.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalSubmissions = submissions.length;
  const resolvedCount = statusCounts['resolved'] || 0;
  const inProgressCount = statusCounts['in_progress'] || 0;
  const pendingCount = statusCounts['submitted'] || 0;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Feedback</h3>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-600">Total</p>
          <p className="text-2xl font-bold text-blue-700">{totalSubmissions}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm font-medium text-green-600">Resolvidos</p>
          <p className="text-2xl font-bold text-green-700">{resolvedCount}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-sm font-medium text-yellow-600">Em Progresso</p>
          <p className="text-2xl font-bold text-yellow-700">{inProgressCount}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-600">Pendentes</p>
          <p className="text-2xl font-bold text-gray-700">{pendingCount}</p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">Detalhamento por Status</h4>
        <div className="space-y-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                  {getStatusText(status)}
                </span>
                <span className="text-sm text-gray-600">{count} feedback{count !== 1 ? 's' : ''}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {totalSubmissions > 0 ? ((count / totalSubmissions) * 100).toFixed(1) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Response Time */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">Tempo Médio de Resposta</h4>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Média Geral</p>
              <p className="text-2xl font-bold text-green-700">2.3 dias</p>
            </div>
            <div className="text-green-600">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 