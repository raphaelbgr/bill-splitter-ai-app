import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryContextUI } from '../components/MemoryContextUI';

// Mock fetch API
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('MemoryContextUI Component - Story 6', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Default mock responses
    mockFetch.mockImplementation((url) => {
      if (url.includes('/api/memory/user-preferences')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            preferredSplittingMethod: 'equal',
            culturalContext: 'brazilian',
            languagePreference: 'pt-BR',
            paymentMethods: ['PIX', 'Cartão de Crédito']
          })
        });
      }
      
      if (url.includes('/api/memory/consent')) {
        const consentType = url.includes('analytics') ? 'analytics' : 'memory_retention';
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            consentGiven: consentType === 'analytics' ? false : true,
            consentDate: new Date(),
            retentionPeriod: consentType === 'analytics' ? 0 : 90
          })
        });
      }
      
      if (url.includes('/api/memory/analytics')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            contextAwareFeatures: {
              totalSuggestions: 25,
              averageConfidence: 0.85,
              culturalRelevance: 0.92,
              preferenceAccuracy: 0.88
            },
            culturalProfile: {
              preferredFormalityLevel: 'informal',
              regionalPreferences: [{ region: 'São Paulo' }],
              culturalPatterns: [{ context: 'brazilian' }]
            }
          })
        });
      }
      
      if (url.includes('/api/memory/export')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            conversations: [],
            preferences: {},
            culturalContext: {}
          })
        });
      }
      
      if (url.includes('/api/memory/delete')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      
      return Promise.resolve({
        ok: false,
        status: 404
      });
    });
  });

  describe('Basic Functionality Tests', () => {
    test('should render the component with all tabs', async () => {
      render(<MemoryContextUI userId="test-user-123" />);
      await waitFor(() => {
        expect(screen.getByText('Configurações de Memória e Privacidade')).toBeInTheDocument();
      });
      expect(screen.getByText('Preferências')).toBeInTheDocument();
      expect(screen.getByText('Privacidade')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Exportar/Deletar')).toBeInTheDocument();
    });

    test('should display user preferences correctly', async () => {
      render(<MemoryContextUI userId="test-user-123" />);
      await waitFor(() => {
        expect(screen.getByText('Preferências Aprendidas')).toBeInTheDocument();
      });
      expect(screen.getByText('Métodos Mais Usados')).toBeInTheDocument();
      expect(screen.getByText('Interações Totais')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    test('should handle tab navigation', async () => {
      render(<MemoryContextUI userId="test-user-123" />);
      await waitFor(() => expect(screen.getByText('Preferências')).toBeInTheDocument());
      
      // Preferences tab (default)
      await waitFor(() => expect(screen.getByText('Preferências Aprendidas')).toBeInTheDocument());
      
      // Privacy tab
      await waitFor(() => expect(screen.getByText('Privacidade')).toBeInTheDocument());
      const privacyTab = screen.getByText('Privacidade');
      fireEvent.click(privacyTab);
      await waitFor(() => {
        expect(screen.getByText('Configurações de Consentimento (LGPD)')).toBeInTheDocument();
      });
      
      // Analytics tab
      await waitFor(() => expect(screen.getAllByText('Analytics')[0]).toBeInTheDocument());
      const analyticsTab = screen.getAllByText('Analytics')[0];
      fireEvent.click(analyticsTab);
      await waitFor(() => {
        expect(screen.getByText((content) => content.includes('Analytics não disponível'))).toBeInTheDocument();
      });
      
      // Export/Delete tab
      await waitFor(() => expect(screen.getByText('Exportar/Deletar')).toBeInTheDocument());
      const exportTab = screen.getByText('Exportar/Deletar');
      fireEvent.click(exportTab);
      await waitFor(() => {
        expect(screen.getByText('Exportar Dados (LGPD - Direito à Portabilidade)')).toBeInTheDocument();
        expect(screen.getByText('Deletar Dados (LGPD - Direito ao Esquecimento)')).toBeInTheDocument();
      });
    });
  });

  describe('Acceptance Criteria Tests', () => {
    test('should provide data export and deletion features', async () => {
      render(<MemoryContextUI userId="test-user-123" />);
      await waitFor(() => expect(screen.getByText('Exportar/Deletar')).toBeInTheDocument());
      const exportTab = screen.getByText('Exportar/Deletar');
      fireEvent.click(exportTab);
      await waitFor(() => {
        expect(screen.getByText('Exportar Dados (LGPD - Direito à Portabilidade)')).toBeInTheDocument();
        expect(screen.getByText('Deletar Dados (LGPD - Direito ao Esquecimento)')).toBeInTheDocument();
      });
      expect(screen.getByText('Exportar Dados')).toBeInTheDocument();
      expect(screen.getByText('Deletar Todos os Dados')).toBeInTheDocument();
    });

    test('should manage user consent clearly', async () => {
      render(<MemoryContextUI userId="test-user-123" />);
      await waitFor(() => expect(screen.getByText('Privacidade')).toBeInTheDocument());
      const privacyTab = screen.getByText('Privacidade');
      fireEvent.click(privacyTab);
      await waitFor(() => {
        expect(screen.getByText('Configurações de Consentimento (LGPD)')).toBeInTheDocument();
      });
      expect(screen.getByText('Retenção de Memória')).toBeInTheDocument();
      expect(screen.getByText('Aprendizado de Preferências')).toBeInTheDocument();
      expect(screen.getAllByText('Analytics')[1]).toBeInTheDocument();
    });

    test('should preserve cultural context appropriately', async () => {
      render(<MemoryContextUI userId="test-user-123" />);
      await waitFor(() => expect(screen.getByText('Preferências Aprendidas')).toBeInTheDocument());
      // The component now shows mock data with brazilian context
      expect(screen.getAllByText((content) => content.includes('brazilian')).length).toBeGreaterThan(0);
    });

    test('should build context-aware feature indicators', async () => {
      render(<MemoryContextUI userId="test-user-123" />);
      await waitFor(() => expect(screen.getByText('Preferências Aprendidas')).toBeInTheDocument());
      expect(screen.getAllByText((content) => content.includes('brazilian')).length).toBeGreaterThan(0);
    });
  });

  describe('Brazilian Market Requirements Tests', () => {
    test('should manage user consent clearly', async () => {
      render(<MemoryContextUI userId="test-user-123" />);
      await waitFor(() => expect(screen.getByText('Privacidade')).toBeInTheDocument());
      const privacyTab = screen.getByText('Privacidade');
      fireEvent.click(privacyTab);
      await waitFor(() => {
        expect(screen.getByText('Configurações de Consentimento (LGPD)')).toBeInTheDocument();
      });
      expect(screen.getByText('Retenção de Memória')).toBeInTheDocument();
      expect(screen.getByText('Aprendizado de Preferências')).toBeInTheDocument();
      expect(screen.getAllByText('Analytics')[1]).toBeInTheDocument();
    });

    test('should preserve cultural context appropriately', async () => {
      render(<MemoryContextUI userId="test-user-123" />);
      await waitFor(() => expect(screen.getByText('Preferências Aprendidas')).toBeInTheDocument());
      expect(screen.getAllByText((content) => content.includes('brazilian')).length).toBeGreaterThan(0);
    });

    test('should build context-aware feature indicators', async () => {
      render(<MemoryContextUI userId="test-user-123" />);
      await waitFor(() => expect(screen.getByText('Preferências Aprendidas')).toBeInTheDocument());
      expect(screen.getAllByText((content) => content.includes('brazilian')).length).toBeGreaterThan(0);
    });
  });

  describe('Technical Requirements Tests', () => {
    test('should build context-aware feature indicators', async () => {
      render(<MemoryContextUI userId="test-user-123" />);
      await waitFor(() => expect(screen.getByText('Preferências Aprendidas')).toBeInTheDocument());
      expect(screen.getAllByText((content) => content.includes('brazilian')).length).toBeGreaterThan(0);
    });

    test('should handle privacy settings changes', async () => {
      render(<MemoryContextUI userId="test-user-123" />);
      await waitFor(() => expect(screen.getByText('Privacidade')).toBeInTheDocument());
      const privacyTab = screen.getByText('Privacidade');
      fireEvent.click(privacyTab);
      await waitFor(() => {
        expect(screen.getByText('Configurações de Privacidade')).toBeInTheDocument();
      });
      const retentionInput = screen.getByDisplayValue(90);
      expect(retentionInput).toHaveValue(90);
    });

    test('should display analytics when consent is given', async () => {
      // Mock analytics consent as true for this test
      mockFetch.mockImplementation((url) => {
        if (url.includes('/api/memory/consent') && url.includes('analytics')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              consentGiven: true,
              consentDate: new Date(),
              retentionPeriod: 90
            })
          });
        }
        if (url.includes('/api/memory/consent')) {
          const consentType = url.includes('analytics') ? 'analytics' : 'memory_retention';
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              consentGiven: consentType === 'analytics' ? true : true,
              consentDate: new Date(),
              retentionPeriod: consentType === 'analytics' ? 90 : 90
            })
          });
        }
        if (url.includes('/api/memory/analytics')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              contextAwareFeatures: {
                totalSuggestions: 25,
                averageConfidence: 0.85,
                culturalRelevance: 0.92,
                preferenceAccuracy: 0.88
              },
              culturalProfile: {
                preferredFormalityLevel: 'informal',
                regionalPreferences: [{ region: 'São Paulo' }],
                culturalPatterns: [{ context: 'brazilian' }]
              }
            })
          });
        }
        if (url.includes('/api/memory/user-preferences')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              preferredSplittingMethod: 'equal',
              culturalContext: 'brazilian',
              languagePreference: 'pt-BR',
              paymentMethods: ['PIX', 'Cartão de Crédito']
            })
          });
        }
        return Promise.resolve({
          ok: false,
          status: 404
        });
      });

      render(<MemoryContextUI userId="test-user-123" />);
      await waitFor(() => expect(screen.getAllByText('Analytics')[0]).toBeInTheDocument());
      const analyticsTab = screen.getAllByText('Analytics')[0];
      fireEvent.click(analyticsTab);
      await waitFor(() => {
        expect(screen.getByText('Estatísticas de Uso')).toBeInTheDocument();
      });
    });
  });
}); 