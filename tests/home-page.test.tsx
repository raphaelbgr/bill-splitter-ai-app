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

describe('HomePage Component', () => {
  test('should display the main heading and description', () => {
    render(<HomePage />);
    
    // Check main heading
    expect(screen.getByText('RachaAI')).toBeInTheDocument();
    expect(screen.getByText('Divisão Inteligente de Contas')).toBeInTheDocument();
    
    // Check hero section
    expect(screen.getByText('Divisão Inteligente de Contas com IA')).toBeInTheDocument();
    expect(screen.getByText(/Divida contas de forma inteligente/)).toBeInTheDocument();
  });

  test('should display all feature cards', () => {
    render(<HomePage />);
    
    // Check feature cards by their headings - filter out the progress section
    const featureHeadings = screen.getAllByRole('heading', { level: 3 });
    const featureCardHeadings = featureHeadings.filter(heading => 
      heading.textContent !== 'Progresso do Desenvolvimento'
    );
    expect(featureCardHeadings).toHaveLength(4);
    
    const headingTexts = featureCardHeadings.map(heading => heading.textContent);
    expect(headingTexts).toContain('Conversa Inteligente');
    expect(headingTexts).toContain('Gerenciamento de Grupos');
    expect(headingTexts).toContain('Memória e Contexto');
    expect(headingTexts).toContain('Autenticação');
  });

  test('should display story progress section', () => {
    render(<HomePage />);
    
    // Check story progress
    expect(screen.getByText('Progresso do Desenvolvimento')).toBeInTheDocument();
    expect(screen.getByText('Story 5.1')).toBeInTheDocument();
    expect(screen.getByText('Story 5.2')).toBeInTheDocument();
    expect(screen.getByText('Story 5.3')).toBeInTheDocument();
  });

  test('should display action buttons', () => {
    render(<HomePage />);
    
    // Check action buttons
    expect(screen.getByText('Começar Conversa')).toBeInTheDocument();
    expect(screen.getByText('Criar Conta')).toBeInTheDocument();
  });

  test('should display compliance badges', () => {
    render(<HomePage />);
    
    // Check compliance badges
    expect(screen.getByText('LGPD Compliant')).toBeInTheDocument();
    expect(screen.getByText('Made in Brazil')).toBeInTheDocument();
  });

  test('should display footer information', () => {
    render(<HomePage />);
    
    // Check footer - use more specific text
    expect(screen.getByText(/© 2024 RachaAI/)).toBeInTheDocument();
    expect(screen.getByText(/Divisão Inteligente de Contas com IA Brasileira/)).toBeInTheDocument();
  });
}); 