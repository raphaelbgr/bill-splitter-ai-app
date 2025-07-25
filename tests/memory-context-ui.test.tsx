import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemoryContextUI from '../components/MemoryContextUI';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/memory-test',
    query: {},
  }),
}));

describe('MemoryContextUI Component - Story 5.3', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Acceptance Criteria Tests', () => {
    test('should display memory and context transparently', async () => {
      render(<MemoryContextUI />);
      
      // Check if main heading is displayed
      expect(screen.getByText('Memória e Contexto')).toBeInTheDocument();
      expect(screen.getByText(/Gerencie seus dados e preferências/)).toBeInTheDocument();
      
      // Check if memory items are displayed
      expect(screen.getByText('Conversa sobre Churrasco')).toBeInTheDocument();
      expect(screen.getByText('Preferências de Pagamento')).toBeInTheDocument();
      expect(screen.getByText('Contexto Cultural Brasileiro')).toBeInTheDocument();
    });

    test('should show LGPD compliance controls clearly', async () => {
      render(<MemoryContextUI />);
      
      // Check LGPD compliance banner
      expect(screen.getByText('Conformidade LGPD')).toBeInTheDocument();
      expect(screen.getByText(/Lei Geral de Proteção de Dados/)).toBeInTheDocument();
      
      // Check privacy tab
      fireEvent.click(screen.getByText('Privacidade'));
      expect(screen.getByText('Configurações de Privacidade')).toBeInTheDocument();
    });

    test('should implement user consent management interface', async () => {
      render(<MemoryContextUI />);
      
      // Navigate to consent tab
      fireEvent.click(screen.getByText('Consentimento'));
      
      // Check consent items
      expect(screen.getByText('Coleta de Dados Pessoais')).toBeInTheDocument();
      expect(screen.getByText('Análise de Uso')).toBeInTheDocument();
      expect(screen.getByText('Personalização')).toBeInTheDocument();
      expect(screen.getByText('Compartilhamento com Terceiros')).toBeInTheDocument();
    });

    test('should provide data export and deletion features', async () => {
      render(<MemoryContextUI />);
      
      // Check export tab
      fireEvent.click(screen.getByText('Exportar'));
      expect(screen.getByText('Exportar Dados')).toBeInTheDocument();
      expect(screen.getByText('Exportar Todos os Dados')).toBeInTheDocument();
      
      // Check delete functionality in memory tab
      fireEvent.click(screen.getByText('Memória'));
      const deleteButtons = screen.getAllByText('Deletar');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    test('should make privacy settings easily configurable', async () => {
      render(<MemoryContextUI />);
      
      // Navigate to privacy tab
      fireEvent.click(screen.getByText('Privacidade'));
      
      // Check privacy settings
      expect(screen.getByText('Retenção de Dados')).toBeInTheDocument();
      expect(screen.getByText('Análise de Uso')).toBeInTheDocument();
      expect(screen.getByText('Personalização')).toBeInTheDocument();
      expect(screen.getByText('Compartilhamento')).toBeInTheDocument();
      expect(screen.getByText('Exportação')).toBeInTheDocument();
      expect(screen.getByText('Exclusão Automática')).toBeInTheDocument();
    });

    test('should explain memory retention policies clearly', async () => {
      render(<MemoryContextUI />);
      
      // Navigate to privacy tab
      fireEvent.click(screen.getByText('Privacidade'));
      
      // Check retention policy explanation
      expect(screen.getByText(/Seus dados serão automaticamente excluídos/)).toBeInTheDocument();
      
      // Check retention options
      const retentionSelect = screen.getByDisplayValue('90 dias');
      expect(retentionSelect).toBeInTheDocument();
    });

    test('should indicate context-aware features visually', async () => {
      render(<MemoryContextUI />);
      
      // Check memory items with context indicators
      expect(screen.getByText('🌍')).toBeInTheDocument(); // Context icon
      expect(screen.getByText('Contexto')).toBeInTheDocument();
      expect(screen.getByText('Cultural')).toBeInTheDocument();
    });

    test('should allow easy management of user preferences', async () => {
      render(<MemoryContextUI />);
      
      // Navigate to privacy tab
      fireEvent.click(screen.getByText('Privacidade'));
      
      // Check preference toggles
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
      
      // Test preference toggle - use the checkbox by ID
      const personalizationCheckbox = document.getElementById('allowPersonalization');
      expect(personalizationCheckbox).toBeInTheDocument();
      if (personalizationCheckbox) {
        fireEvent.click(personalizationCheckbox);
        expect(personalizationCheckbox).not.toBeChecked();
      }
    });

    test('should meet Brazilian privacy requirements', async () => {
      render(<MemoryContextUI />);
      
      // Check LGPD compliance
      expect(screen.getByText('Conformidade LGPD')).toBeInTheDocument();
      
      // Navigate to export tab to check data portability rights
      fireEvent.click(screen.getByText('Exportar'));
      expect(screen.getByText('Direito de Portabilidade')).toBeInTheDocument();
      expect(screen.getByText(/Conforme a LGPD, você tem o direito/)).toBeInTheDocument();
    });

    test('should implement accessibility features correctly', async () => {
      render(<MemoryContextUI />);
      
      // Check form labels
      fireEvent.click(screen.getByText('Privacidade'));
      const retentionLabel = screen.getByLabelText('Retenção de Dados');
      expect(retentionLabel).toBeInTheDocument();
      
      // Check button accessibility
      const exportButton = screen.getByText('Exportar');
      fireEvent.click(exportButton);
      expect(screen.getByText('Exportar Todos os Dados')).toBeInTheDocument();
    });
  });

  describe('Brazilian Market Requirements Tests', () => {
    test('should respect LGPD retention policies', async () => {
      render(<MemoryContextUI />);
      
      fireEvent.click(screen.getByText('Privacidade'));
      
      // Check retention options
      const retentionSelect = screen.getByDisplayValue('90 dias');
      expect(retentionSelect).toBeInTheDocument();
      
      // Check retention explanation
      expect(screen.getByText(/Seus dados serão automaticamente excluídos/)).toBeInTheDocument();
    });

    test('should support Brazilian privacy preferences', async () => {
      render(<MemoryContextUI />);
      
      fireEvent.click(screen.getByText('Consentimento'));
      
      // Check Brazilian-specific consent items
      expect(screen.getByText('Coleta de Dados Pessoais')).toBeInTheDocument();
      expect(screen.getByText(/conforme LGPD/)).toBeInTheDocument();
    });

    test('should manage user consent clearly', async () => {
      render(<MemoryContextUI />);
      
      fireEvent.click(screen.getByText('Consentimento'));
      
      // Check consent management
      const consentItems = screen.getAllByText(/Concedido|Negado/);
      expect(consentItems.length).toBeGreaterThan(0);
      
      // Test consent toggle - use the checkbox by ID
      const personalizationCheckbox = document.getElementById('consent-3');
      expect(personalizationCheckbox).toBeInTheDocument();
      if (personalizationCheckbox) {
        fireEvent.click(personalizationCheckbox);
        expect(personalizationCheckbox).not.toBeChecked();
      }
    });

    test('should meet data sovereignty requirements', async () => {
      render(<MemoryContextUI />);
      
      // Check data export functionality
      fireEvent.click(screen.getByText('Exportar'));
      expect(screen.getByText('Direito de Portabilidade')).toBeInTheDocument();
      expect(screen.getByText(/formato estruturado e legível por máquina/)).toBeInTheDocument();
    });

    test('should have intuitive privacy controls for Brazilian users', async () => {
      render(<MemoryContextUI />);
      
      // Check Portuguese language interface
      expect(screen.getByText('Memória e Contexto')).toBeInTheDocument();
      
      // Navigate to privacy tab to check privacy settings
      fireEvent.click(screen.getByText('Privacidade'));
      expect(screen.getByText('Configurações de Privacidade')).toBeInTheDocument();
      
      // Navigate to consent tab to check consent management
      fireEvent.click(screen.getByText('Consentimento'));
      expect(screen.getByText('Gerenciamento de Consentimento')).toBeInTheDocument();
    });

    test('should preserve cultural context appropriately', async () => {
      render(<MemoryContextUI />);
      
      // Check cultural context preservation
      expect(screen.getByText('Contexto Cultural Brasileiro')).toBeInTheDocument();
      expect(screen.getByText('Cultural')).toBeInTheDocument();
    });

    test('should display regional preferences clearly', async () => {
      render(<MemoryContextUI />);
      
      // Check regional preference display - the text is in the memory item description
      expect(screen.getByText('Preferências regionais e culturais do usuário')).toBeInTheDocument();
    });

    test('should follow Brazilian legal requirements', async () => {
      render(<MemoryContextUI />);
      
      // Check LGPD compliance
      expect(screen.getByText('Conformidade LGPD')).toBeInTheDocument();
      expect(screen.getByText(/Lei Geral de Proteção de Dados/)).toBeInTheDocument();
    });
  });

  describe('Technical Requirements Tests', () => {
    test('should create memory and context display interface', async () => {
      render(<MemoryContextUI />);
      
      // Check memory display
      expect(screen.getByText('Dados Armazenados')).toBeInTheDocument();
      expect(screen.getByText(/Total: 3 itens/)).toBeInTheDocument();
      
      // Check memory items
      expect(screen.getByText('Conversa sobre Churrasco')).toBeInTheDocument();
      expect(screen.getByText('Preferências de Pagamento')).toBeInTheDocument();
      expect(screen.getByText('Contexto Cultural Brasileiro')).toBeInTheDocument();
    });

    test('should implement LGPD compliance control UI', async () => {
      render(<MemoryContextUI />);
      
      // Check LGPD banner
      expect(screen.getByText('Conformidade LGPD')).toBeInTheDocument();
      
      // Check privacy controls
      fireEvent.click(screen.getByText('Privacidade'));
      expect(screen.getByText('Configurações de Privacidade')).toBeInTheDocument();
    });

    test('should build user consent management interface', async () => {
      render(<MemoryContextUI />);
      
      fireEvent.click(screen.getByText('Consentimento'));
      
      // Check consent interface
      expect(screen.getByText('Gerenciamento de Consentimento')).toBeInTheDocument();
      expect(screen.getByText('Obrigatório')).toBeInTheDocument();
    });

    test('should add data export and deletion UI components', async () => {
      render(<MemoryContextUI />);
      
      // Check export functionality
      fireEvent.click(screen.getByText('Exportar'));
      expect(screen.getByText('Exportar Dados')).toBeInTheDocument();
      
      // Check deletion functionality
      fireEvent.click(screen.getByText('Memória'));
      const deleteButtons = screen.getAllByText('Deletar');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    test('should create privacy settings management interface', async () => {
      render(<MemoryContextUI />);
      
      fireEvent.click(screen.getByText('Privacidade'));
      
      // Check privacy settings
      expect(screen.getByText('Retenção de Dados')).toBeInTheDocument();
      expect(screen.getByText('Análise de Uso')).toBeInTheDocument();
      expect(screen.getByText('Personalização')).toBeInTheDocument();
    });

    test('should implement memory retention policy display', async () => {
      render(<MemoryContextUI />);
      
      fireEvent.click(screen.getByText('Privacidade'));
      
      // Check retention policy
      expect(screen.getByText('Retenção de Dados')).toBeInTheDocument();
      expect(screen.getByText(/automaticamente excluídos/)).toBeInTheDocument();
    });

    test('should build context-aware feature indicators', async () => {
      render(<MemoryContextUI />);
      
      // Check context indicators
      expect(screen.getByText('🌍')).toBeInTheDocument();
      expect(screen.getByText('Contexto')).toBeInTheDocument();
      expect(screen.getByText('Cultural')).toBeInTheDocument();
    });

    test('should create user preference management UI', async () => {
      render(<MemoryContextUI />);
      
      fireEvent.click(screen.getByText('Privacidade'));
      
      // Check preference management
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
      
      // Test preference change - use the checkbox by ID
      const personalizationCheckbox = document.getElementById('allowPersonalization');
      expect(personalizationCheckbox).toBeInTheDocument();
      if (personalizationCheckbox) {
        fireEvent.click(personalizationCheckbox);
        expect(personalizationCheckbox).not.toBeChecked();
      }
    });

    test('should add Brazilian privacy requirement compliance', async () => {
      render(<MemoryContextUI />);
      
      // Check LGPD compliance
      expect(screen.getByText('Conformidade LGPD')).toBeInTheDocument();
      
      // Check data portability
      fireEvent.click(screen.getByText('Exportar'));
      expect(screen.getByText('Direito de Portabilidade')).toBeInTheDocument();
    });

    test('should implement accessibility features (WCAG 2.1)', async () => {
      render(<MemoryContextUI />);
      
      // Check form accessibility
      fireEvent.click(screen.getByText('Privacidade'));
      const retentionLabel = screen.getByLabelText('Retenção de Dados');
      expect(retentionLabel).toBeInTheDocument();
      
      // Check button accessibility
      const exportButton = screen.getByText('Exportar');
      fireEvent.click(exportButton);
      const exportDataButton = screen.getByText('Exportar Todos os Dados');
      expect(exportDataButton).toBeInTheDocument();
    });
  });

  describe('Interactive Functionality Tests', () => {
    test('should handle memory deletion with confirmation', async () => {
      render(<MemoryContextUI />);
      
      // Click delete button
      const deleteButtons = screen.getAllByText('Deletar');
      fireEvent.click(deleteButtons[0]);
      
      // Check confirmation modal
      expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
      expect(screen.getByText(/Tem certeza que deseja excluir/)).toBeInTheDocument();
      
      // Cancel deletion
      fireEvent.click(screen.getByText('Cancelar'));
      expect(screen.queryByText('Confirmar Exclusão')).not.toBeInTheDocument();
    });

    test('should handle data export functionality', async () => {
      render(<MemoryContextUI />);
      
      fireEvent.click(screen.getByText('Exportar'));
      
      // Click export button
      const exportButton = screen.getByText('Exportar Todos os Dados');
      fireEvent.click(exportButton);
      
      // Check loading state
      await waitFor(() => {
        expect(screen.getByText('Exportando...')).toBeInTheDocument();
      });
    });

    test('should handle consent toggle functionality', async () => {
      render(<MemoryContextUI />);
      
      fireEvent.click(screen.getByText('Consentimento'));
      
      // Toggle consent - use the checkbox by ID
      const personalizationCheckbox = document.getElementById('consent-3');
      expect(personalizationCheckbox).toBeInTheDocument();
      if (personalizationCheckbox) {
        fireEvent.click(personalizationCheckbox);
        expect(personalizationCheckbox).not.toBeChecked();
      }
    });

    test('should handle privacy settings changes', async () => {
      render(<MemoryContextUI />);
      
      fireEvent.click(screen.getByText('Privacidade'));
      
      // Change retention setting
      const retentionSelect = screen.getByDisplayValue('90 dias');
      fireEvent.change(retentionSelect, { target: { value: '30days' } });
      
      // Check change
      expect(retentionSelect).toHaveValue('30days');
    });

    test('should handle tab navigation', async () => {
      render(<MemoryContextUI />);
      
      // Navigate through tabs
      fireEvent.click(screen.getByText('Privacidade'));
      expect(screen.getByText('Configurações de Privacidade')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Consentimento'));
      expect(screen.getByText('Gerenciamento de Consentimento')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Exportar'));
      expect(screen.getByText('Exportar Dados')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Memória'));
      expect(screen.getByText('Dados Armazenados')).toBeInTheDocument();
    });
  });
}); 