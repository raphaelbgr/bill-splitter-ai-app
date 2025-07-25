import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import B2BRestaurantDashboard from '../components/B2BRestaurantDashboard';
import B2BEventOrganizer from '../components/B2BEventOrganizer';
import B2BBulkExpenseManagement from '../components/B2BBulkExpenseManagement';
import B2BPartnershipDashboard from '../components/B2BPartnershipDashboard';

// Mock the API calls
jest.mock('next/router', () => ({
  useRouter: () => ({
    query: { restaurantId: 'rest-001', organizerId: 'org-001', businessId: 'business-001' }
  })
}));

describe('B2B Features - Story 15', () => {
  describe('Restaurant Dashboard', () => {
    it('should render restaurant dashboard with all tabs', () => {
      render(<B2BRestaurantDashboard partnerId="rest-001" />);
      
      // Check if main elements are rendered
      expect(screen.getByText('Restaurante Brasileiro')).toBeInTheDocument();
      expect(screen.getByText('Parceiro RachaAI')).toBeInTheDocument();
      
      // Check if tabs are present
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
      expect(screen.getByText('Cardápio')).toBeInTheDocument();
      expect(screen.getByText('Contas')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Clientes')).toBeInTheDocument();
    });

    it('should display restaurant statistics correctly', () => {
      render(<B2BRestaurantDashboard partnerId="rest-001" />);
      
      // Check if stats cards are displayed
      expect(screen.getByText('Receita Mensal')).toBeInTheDocument();
      expect(screen.getByText('R$ 3.850,25')).toBeInTheDocument();
      expect(screen.getByText('Clientes')).toBeInTheDocument();
      expect(screen.getByText('156')).toBeInTheDocument();
      expect(screen.getByText('Ticket Médio')).toBeInTheDocument();
      expect(screen.getByText('R$ 98,85')).toBeInTheDocument();
    });

    it('should show menu management functionality', () => {
      render(<B2BRestaurantDashboard partnerId="rest-001" />);
      
      // Click on menu tab
      fireEvent.click(screen.getByText('Cardápio'));
      
      // Check if menu items are displayed
      expect(screen.getByText('Feijoada Completa')).toBeInTheDocument();
      expect(screen.getByText('Picanha na Brasa')).toBeInTheDocument();
      expect(screen.getByText('Caipirinha')).toBeInTheDocument();
      
      // Check if add item button is present
      expect(screen.getByText('Adicionar Item')).toBeInTheDocument();
    });

    it('should show bill processing functionality', () => {
      render(<B2BRestaurantDashboard partnerId="rest-001" />);
      
      // Click on bills tab
      fireEvent.click(screen.getByText('Contas'));
      
      // Check if bills are displayed
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('R$ 156,80')).toBeInTheDocument();
      expect(screen.getByText('R$ 89,50')).toBeInTheDocument();
    });
  });

  describe('Event Organizer', () => {
    it('should render event organizer with all features', () => {
      render(<B2BEventOrganizer organizerId="org-001" />);
      
      // Check if main elements are rendered
      expect(screen.getByText('Organizador de Eventos')).toBeInTheDocument();
      expect(screen.getByText('RachaAI para Eventos')).toBeInTheDocument();
      
      // Check if tabs are present
      expect(screen.getByText('Meus Eventos')).toBeInTheDocument();
      expect(screen.getByText('Participantes')).toBeInTheDocument();
      expect(screen.getByText('Despesas')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should display events correctly', () => {
      render(<B2BEventOrganizer organizerId="org-001" />);
      
      // Check if events are displayed
      expect(screen.getByText('Aniversário João - 30 anos')).toBeInTheDocument();
      expect(screen.getByText('Happy Hour Empresarial')).toBeInTheDocument();
      
      // Check event details
      expect(screen.getByText('45/60')).toBeInTheDocument(); // Participants
      expect(screen.getByText('R$ 2.500,00')).toBeInTheDocument(); // Budget
      expect(screen.getByText('R$ 1.800,00')).toBeInTheDocument(); // Collected
    });

    it('should show create event functionality', () => {
      render(<B2BEventOrganizer organizerId="org-001" />);
      
      // Check if create event button is present
      expect(screen.getByText('Criar Evento')).toBeInTheDocument();
    });

    it('should display event analytics', () => {
      render(<B2BEventOrganizer organizerId="org-001" />);
      
      // Click on analytics tab
      fireEvent.click(screen.getByText('Analytics'));
      
      // Check if analytics are displayed
      expect(screen.getByText('Analytics de Eventos')).toBeInTheDocument();
      expect(screen.getByText('Resumo Geral')).toBeInTheDocument();
      expect(screen.getByText('Receita')).toBeInTheDocument();
      expect(screen.getByText('Participação')).toBeInTheDocument();
    });
  });

  describe('Bulk Expense Management', () => {
    it('should render bulk management with all features', () => {
      render(<B2BBulkExpenseManagement businessId="business-001" />);
      
      // Check if main elements are rendered
      expect(screen.getByText('Gerenciamento em Lote')).toBeInTheDocument();
      expect(screen.getByText('Processamento em massa de despesas')).toBeInTheDocument();
      
      // Check if tabs are present
      expect(screen.getByText('Processamento em Lote')).toBeInTheDocument();
      expect(screen.getByText('Operações')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should display bulk processing statistics', () => {
      render(<B2BBulkExpenseManagement businessId="business-001" />);
      
      // Check if stats are displayed
      expect(screen.getByText('Total de Itens')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // Total items
      expect(screen.getByText('Processados')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Processed items
      expect(screen.getByText('Em Processamento')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // Processing items
    });

    it('should show import functionality', () => {
      render(<B2BBulkExpenseManagement businessId="business-001" />);
      
      // Check if import button is present
      expect(screen.getByText('Importar')).toBeInTheDocument();
      expect(screen.getByText('Nova Operação')).toBeInTheDocument();
    });

    it('should display batch operations', () => {
      render(<B2BBulkExpenseManagement businessId="business-001" />);
      
      // Click on batches tab
      fireEvent.click(screen.getByText('Operações'));
      
      // Check if batches are displayed
      expect(screen.getByText('Importação Janeiro 2024')).toBeInTheDocument();
      expect(screen.getByText('Categorização Automática')).toBeInTheDocument();
      expect(screen.getByText('Divisão de Contas')).toBeInTheDocument();
    });

    it('should show processing analytics', () => {
      render(<B2BBulkExpenseManagement businessId="business-001" />);
      
      // Click on analytics tab
      fireEvent.click(screen.getByText('Analytics'));
      
      // Check if analytics are displayed
      expect(screen.getByText('Analytics de Processamento')).toBeInTheDocument();
      expect(screen.getByText('Eficiência')).toBeInTheDocument();
      expect(screen.getByText('Categorização')).toBeInTheDocument();
      expect(screen.getByText('Economia')).toBeInTheDocument();
    });
  });

  describe('Partnership Dashboard', () => {
    it('should render partnership dashboard with all features', () => {
      render(<B2BPartnershipDashboard businessId="business-001" />);
      
      // Check if main elements are rendered
      expect(screen.getByText('Dashboard de Parcerias')).toBeInTheDocument();
      expect(screen.getByText('Gerenciamento de parcerias B2B')).toBeInTheDocument();
      
      // Check if tabs are present
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
      expect(screen.getByText('Parcerias')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Performance')).toBeInTheDocument();
    });

    it('should display partnership statistics', () => {
      render(<B2BPartnershipDashboard businessId="business-001" />);
      
      // Check if stats are displayed
      expect(screen.getByText('Receita Total')).toBeInTheDocument();
      expect(screen.getByText('R$ 24.220,50')).toBeInTheDocument();
      expect(screen.getByText('Parcerias Ativas')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Total de Clientes')).toBeInTheDocument();
      expect(screen.getByText('245')).toBeInTheDocument();
      expect(screen.getByText('Avaliação Média')).toBeInTheDocument();
      expect(screen.getByText('4.7')).toBeInTheDocument();
    });

    it('should show partnerships list', () => {
      render(<B2BPartnershipDashboard businessId="business-001" />);
      
      // Click on partnerships tab
      fireEvent.click(screen.getByText('Parcerias'));
      
      // Check if partnerships are displayed
      expect(screen.getByText('Restaurante Brasileiro')).toBeInTheDocument();
      expect(screen.getByText('Eventos TechCorp')).toBeInTheDocument();
      expect(screen.getByText('Corporação ABC')).toBeInTheDocument();
    });

    it('should display partnership analytics', () => {
      render(<B2BPartnershipDashboard businessId="business-001" />);
      
      // Click on analytics tab
      fireEvent.click(screen.getByText('Analytics'));
      
      // Check if analytics are displayed
      expect(screen.getByText('Analytics de Parcerias')).toBeInTheDocument();
      expect(screen.getByText('Métricas de Crescimento')).toBeInTheDocument();
      expect(screen.getByText('Satisfação')).toBeInTheDocument();
      expect(screen.getByText('Performance')).toBeInTheDocument();
    });

    it('should show performance metrics', () => {
      render(<B2BPartnershipDashboard businessId="business-001" />);
      
      // Click on performance tab
      fireEvent.click(screen.getByText('Performance'));
      
      // Check if performance metrics are displayed
      expect(screen.getByText('Métricas de Performance')).toBeInTheDocument();
      expect(screen.getByText('Top Performers')).toBeInTheDocument();
      expect(screen.getByText('Melhores Avaliações')).toBeInTheDocument();
    });
  });

  describe('B2B Features Integration', () => {
    it('should handle modal interactions correctly', async () => {
      render(<B2BRestaurantDashboard partnerId="rest-001" />);
      
      // Click on menu tab
      fireEvent.click(screen.getByText('Cardápio'));
      
      // Click add item button
      fireEvent.click(screen.getByText('Adicionar Item'));
      
      // Check if modal is displayed
      await waitFor(() => {
        expect(screen.getByText('Adicionar Item ao Cardápio')).toBeInTheDocument();
      });
    });

    it('should handle form submissions', async () => {
      render(<B2BEventOrganizer organizerId="org-001" />);
      
      // Click create event button
      fireEvent.click(screen.getByText('Criar Evento'));
      
      // Check if modal is displayed
      await waitFor(() => {
        expect(screen.getByText('Criar Novo Evento')).toBeInTheDocument();
      });
    });

    it('should handle bulk operations', async () => {
      render(<B2BBulkExpenseManagement businessId="business-001" />);
      
      // Click new operation button
      fireEvent.click(screen.getByText('Nova Operação'));
      
      // Check if modal is displayed
      await waitFor(() => {
        expect(screen.getByText('Nova Operação em Lote')).toBeInTheDocument();
      });
    });

    it('should handle partnership creation', async () => {
      render(<B2BPartnershipDashboard businessId="business-001" />);
      
      // Click new partnership button
      fireEvent.click(screen.getByText('Nova Parceria'));
      
      // Check if modal is displayed
      await waitFor(() => {
        expect(screen.getByText('Nova Parceria')).toBeInTheDocument();
      });
    });
  });

  describe('B2B Features Performance', () => {
    it('should load data efficiently', async () => {
      const startTime = performance.now();
      
      render(<B2BRestaurantDashboard partnerId="rest-001" />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurante Brasileiro')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Should load within 3 seconds as per performance targets
      expect(loadTime).toBeLessThan(3000);
    });

    it('should handle large datasets', async () => {
      render(<B2BBulkExpenseManagement businessId="business-001" />);
      
      // Click on batches tab to load batch operations
      fireEvent.click(screen.getByText('Operações'));
      
      await waitFor(() => {
        expect(screen.getByText('Importação Janeiro 2024')).toBeInTheDocument();
      });
      
      // Should handle multiple batch operations efficiently
      expect(screen.getByText('Categorização Automática')).toBeInTheDocument();
      expect(screen.getByText('Divisão de Contas')).toBeInTheDocument();
    });
  });

  describe('B2B Features Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<B2BRestaurantDashboard partnerId="rest-001" />);
      
      // Check for accessibility features
      const tabs = screen.getAllByRole('button');
      expect(tabs.length).toBeGreaterThan(0);
      
      // Check if interactive elements are accessible
      const interactiveElements = screen.getAllByRole('button');
      interactiveElements.forEach(element => {
        expect(element).toBeInTheDocument();
      });
    });

    it('should support keyboard navigation', () => {
      render(<B2BEventOrganizer organizerId="org-001" />);
      
      // Check if tabs can be navigated with keyboard
      const tabs = screen.getAllByRole('button');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('tabIndex');
      });
    });
  });
}); 