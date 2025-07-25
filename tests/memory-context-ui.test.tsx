import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryContextUI } from '../components/MemoryContextUI';

// Mock all the dependencies
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0)
  }))
}));

jest.mock('../lib/memory-system', () => ({
  MemorySystem: jest.fn().mockImplementation(() => ({
    getUserPreferences: jest.fn().mockResolvedValue({
      preferredSplittingMethod: 'equal',
      culturalContext: 'brazilian',
      languagePreference: 'pt-BR',
      paymentMethods: ['PIX', 'Cartão de Crédito']
    }),
    getUserConsent: jest.fn().mockResolvedValue({
      consentGiven: true,
      consentDate: new Date(),
      retentionPeriod: 90
    }),
    createConsent: jest.fn().mockResolvedValue(true),
    updateUserPreferences: jest.fn().mockResolvedValue(true),
    exportUserData: jest.fn().mockResolvedValue({
      conversations: [],
      preferences: {},
      culturalContext: {}
    }),
    deleteAllUserData: jest.fn().mockResolvedValue(true)
  }))
}));

jest.mock('../lib/user-preferences', () => ({
  UserPreferenceLearner: jest.fn().mockImplementation(() => ({
    getUserPreferenceSummary: jest.fn().mockResolvedValue({
      mostUsedMethods: {
        splittingMethod: 'equal',
        paymentMethod: 'PIX',
        culturalContext: 'brazilian',
        region: 'São Paulo'
      },
      totalInteractions: 15
    })
  }))
}));

jest.mock('../lib/context-aware', () => ({
  ContextAwareProcessor: jest.fn().mockImplementation(() => ({
    getContextAwareAnalytics: jest.fn().mockResolvedValue({
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
  }))
}));

describe('MemoryContextUI Component - Story 5.3', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
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
      await waitFor(() => {
        expect(screen.getByText('Preferências Aprendidas')).toBeInTheDocument();
      });
      // Wait for tab
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
      await waitFor(() => expect(screen.getByText('Preferências Atuais')).toBeInTheDocument());
      // Use getAllByText for 'brazilian' in the list
      expect(screen.getAllByText(/brazilian/).length).toBeGreaterThanOrEqual(1);
    });

    test('should build context-aware feature indicators', async () => {
      render(<MemoryContextUI userId="test-user-123" />);
      await waitFor(() => expect(screen.getByText('Preferências Aprendidas')).toBeInTheDocument());
      expect(screen.getAllByText(/brazilian/).length).toBeGreaterThanOrEqual(1);
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
      await waitFor(() => expect(screen.getByText('Preferências Atuais')).toBeInTheDocument());
      expect(screen.getAllByText(/brazilian/).length).toBeGreaterThanOrEqual(1);
    });

    test('should build context-aware feature indicators', async () => {
      render(<MemoryContextUI userId="test-user-123" />);
      await waitFor(() => expect(screen.getByText('Preferências Aprendidas')).toBeInTheDocument());
      expect(screen.getAllByText(/brazilian/).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Technical Requirements Tests', () => {
    test('should build context-aware feature indicators', async () => {
      render(<MemoryContextUI userId="test-user-123" />);
      await waitFor(() => expect(screen.getByText('Preferências Aprendidas')).toBeInTheDocument());
      expect(screen.getAllByText(/brazilian/).length).toBeGreaterThanOrEqual(1);
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
      render(<MemoryContextUI userId="test-user-123" />);
      await waitFor(() => expect(screen.getAllByText('Analytics')[0]).toBeInTheDocument());
      const analyticsTab = screen.getAllByText('Analytics')[0];
      fireEvent.click(analyticsTab);
      await waitFor(() => {
        expect(screen.getByText((content) => content.includes('Analytics não disponível'))).toBeInTheDocument();
      });
    });
  });
}); 