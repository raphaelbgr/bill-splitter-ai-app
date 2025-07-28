import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import B2BRestaurantDashboard from '../components/B2BRestaurantDashboard';
import B2BEventOrganizer from '../components/B2BEventOrganizer';
import B2BBulkExpenseManagement from '../components/B2BBulkExpenseManagement';
import B2BPartnershipDashboard from '../components/B2BPartnershipDashboard';

// Mock Supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }))
    }))
  }
}));

describe('B2B Features - Story 15', () => {
  describe('Restaurant Dashboard', () => {
    it('should render restaurant dashboard with all tabs', () => {
      render(React.createElement(B2BRestaurantDashboard));
      
      // Check if main elements are rendered
      expect(screen.getByText('Dashboard do Restaurante')).toBeInTheDocument();
      expect(screen.getByText(/Restaurante Brasileiro/)).toBeInTheDocument(); // Use regex for split text
      
      // Check if tabs are present
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
      expect(screen.getByText('Cardápio')).toBeInTheDocument();
      expect(screen.getAllByText('Transações')).toHaveLength(2); // Tab and stat card
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should display restaurant statistics correctly', () => {
      render(React.createElement(B2BRestaurantDashboard));
      
      // Check if stats cards are displayed
      expect(screen.getByText('Receita Mensal')).toBeInTheDocument();
      expect(screen.getByText('R$ 15.420,50')).toBeInTheDocument();
      expect(screen.getByText('Clientes')).toBeInTheDocument();
      expect(screen.getByText('892')).toBeInTheDocument();
      expect(screen.getAllByText('Transações')).toHaveLength(2); // Tab and stat card
      expect(screen.getByText('1.247')).toBeInTheDocument();
    });

    it('should show menu management functionality', () => {
      render(React.createElement(B2BRestaurantDashboard));
      
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
      render(React.createElement(B2BRestaurantDashboard));
      
      // Click on transactions tab (get the button, not the stat)
      const transactionTabs = screen.getAllByText('Transações');
      const transactionTab = transactionTabs.find(el => el.tagName === 'BUTTON');
      fireEvent.click(transactionTab!);
      
      // Check if bills are displayed
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('R$ 180,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 95,50')).toBeInTheDocument();
    });
  });

  describe('Event Organizer', () => {
    it('should render event organizer with all features', () => {
      render(React.createElement(B2BEventOrganizer));
      
      // Check if main elements are rendered
      expect(screen.getByText('Organizador de Eventos')).toBeInTheDocument();
      expect(screen.getByText('Gerencie seus eventos e despesas com RachaAI')).toBeInTheDocument();
      
      // Check if tabs are present
      expect(screen.getByText('Eventos')).toBeInTheDocument();
      expect(screen.getByText('Participantes')).toBeInTheDocument();
      expect(screen.getAllByText('Despesas')[0]).toBeInTheDocument(); // Use getAllByText to handle multiple elements
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should display events correctly', () => {
      render(React.createElement(B2BEventOrganizer));
      
      // Check if events are displayed
      expect(screen.getByText('Festa de Formatura 2024')).toBeInTheDocument();
      expect(screen.getByText('Conferência Tech Brasil')).toBeInTheDocument();
      
      // Check event details
      expect(screen.getByText('150 participantes')).toBeInTheDocument(); // Participants
      expect(screen.getByText('R$ 25.000,00')).toBeInTheDocument(); // Budget
      expect(screen.getByText('R$ 45.000,00')).toBeInTheDocument(); // Budget for second event
    });

    it('should show create event functionality', () => {
      render(React.createElement(B2BEventOrganizer));
      
      // Check if create event button is present
      expect(screen.getByText('Novo Evento')).toBeInTheDocument();
    });

    it('should display event analytics', () => {
      render(React.createElement(B2BEventOrganizer));
      
      // Click on analytics tab
      fireEvent.click(screen.getByText('Analytics'));
      
      // Check if analytics are displayed
      expect(screen.getByText('Analytics do Evento')).toBeInTheDocument();
      expect(screen.getByText('Resumo Financeiro')).toBeInTheDocument();
      expect(screen.getByText('Status dos Participantes')).toBeInTheDocument();
    });
  });

  describe('Bulk Expense Management', () => {
    it('should render bulk expense management interface', () => {
      render(React.createElement(B2BBulkExpenseManagement));
      
      // Check if main elements are rendered
      expect(screen.getByText('Gerenciamento de Despesas em Lote')).toBeInTheDocument();
      expect(screen.getByText('Processe múltiplas despesas de forma eficiente')).toBeInTheDocument();
      
      // Check if tabs are present
      expect(screen.getByText('Upload')).toBeInTheDocument();
      expect(screen.getByText('Revisar')).toBeInTheDocument();
      expect(screen.getByText('Processar')).toBeInTheDocument();
      expect(screen.getByText('Histórico')).toBeInTheDocument();
    });

    it('should show file upload functionality', () => {
      render(React.createElement(B2BBulkExpenseManagement));
      
      // Check if file upload is present
      expect(screen.getByText('Arraste e solte seu arquivo aqui')).toBeInTheDocument();
      expect(screen.getByText('ou clique para selecionar')).toBeInTheDocument();
      expect(screen.getByText('Formatos Suportados')).toBeInTheDocument();
    });

    it('should display processing options', () => {
      render(React.createElement(B2BBulkExpenseManagement));
      
      // Click on process tab
      fireEvent.click(screen.getByText('Processar'));
      
      // Check if processing options are displayed
      expect(screen.getByText('Configurações de Processamento')).toBeInTheDocument();
      expect(screen.getByText('Método de Divisão Padrão')).toBeInTheDocument();
      expect(screen.getByText('Divisão Igual')).toBeInTheDocument();
    });
  });

  describe('Partnership Dashboard', () => {
    it('should render partnership dashboard', () => {
      render(React.createElement(B2BPartnershipDashboard));
      
      // Check if main elements are rendered
      expect(screen.getByText('Dashboard de Parcerias B2B')).toBeInTheDocument();
      expect(screen.getByText('Gerencie parcerias e acompanhe performance')).toBeInTheDocument();
      
      // Check if tabs are present
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
      expect(screen.getByText('Parcerias')).toBeInTheDocument();
      expect(screen.getByText('Receita')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should display partnership statistics', () => {
      render(React.createElement(B2BPartnershipDashboard));
      
      // Check if stats are displayed
      expect(screen.getByText('Total de Parcerias')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Receita Total')).toBeInTheDocument();
      expect(screen.getByText('R$ 43.871,25')).toBeInTheDocument();
    });

    it('should show partnership management features', () => {
      render(React.createElement(B2BPartnershipDashboard));
      
      // Check if partnership features are displayed
      expect(screen.getByText('Nova Parceria')).toBeInTheDocument();
      expect(screen.getByText('Parcerias')).toBeInTheDocument();
    });
  });
}); 