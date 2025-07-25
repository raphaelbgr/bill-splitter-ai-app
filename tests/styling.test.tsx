import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../pages/index';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
  }),
}));

describe('HomePage Styling', () => {
  test('should have proper HTML structure for styling', () => {
    render(<HomePage />);
    
    // Check that the page has proper semantic structure
    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('main')).toBeInTheDocument(); // main content
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
    
    // Check that buttons are properly structured
    const startButton = screen.getByText('Começar Conversa');
    expect(startButton.tagName).toBe('BUTTON');
    
    const createAccountButton = screen.getByText('Criar Conta');
    expect(createAccountButton.tagName).toBe('BUTTON');
  });

  test('should have proper spacing and layout structure', () => {
    render(<HomePage />);
    
    // Check main content structure
    const mainContent = screen.getByText('Divisão Inteligente de Contas com IA').closest('main');
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveAttribute('class');
  });

  test('should have proper card structure', () => {
    render(<HomePage />);
    
    // Check that cards have proper content structure
    expect(screen.getByText('💬')).toBeInTheDocument(); // icon
    expect(screen.getAllByText('✅ Implementado')).toHaveLength(4); // status badges
  });

  test('should have proper badge structure', () => {
    render(<HomePage />);
    
    // Check compliance badges
    const lgpdBadge = screen.getByText('LGPD Compliant');
    expect(lgpdBadge).toBeInTheDocument();
    expect(lgpdBadge).toHaveAttribute('class');
    
    const brazilBadge = screen.getByText('Made in Brazil');
    expect(brazilBadge).toBeInTheDocument();
    expect(brazilBadge).toHaveAttribute('class');
  });

  test('should have all feature cards present', () => {
    render(<HomePage />);
    
    // Check that all feature cards are present using getAllByText
    const conversationElements = screen.getAllByText('Conversa Inteligente');
    expect(conversationElements.length).toBeGreaterThan(0);
    
    const authElements = screen.getAllByText('Autenticação');
    expect(authElements.length).toBeGreaterThan(0);
    
    const memoryElements = screen.getAllByText('Memória e Contexto');
    expect(memoryElements.length).toBeGreaterThan(0);
    
    const groupManagementElements = screen.getAllByText('Gerenciamento de Grupos');
    expect(groupManagementElements.length).toBeGreaterThan(0);
  });
}); 