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
    
    // Check main heading - use getAllByText since there are multiple RachaAI elements
    const rachaaiElements = screen.getAllByText('RachaAI');
    expect(rachaaiElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Divisão Inteligente de Contas')).toBeInTheDocument();
    
    // Check hero section
    expect(screen.getByText('Divisão Inteligente')).toBeInTheDocument();
    expect(screen.getByText(/Divida contas de forma inteligente/)).toBeInTheDocument();
  });

  test('should display all feature cards', () => {
    render(<HomePage />);
    
    // Check feature cards by their headings - filter out the testimonials section
    const featureHeadings = screen.getAllByRole('heading', { level: 4 });
    const featureCardHeadings = featureHeadings.filter(heading => 
      heading.textContent === 'Conversa Inteligente' ||
      heading.textContent === 'Contexto Brasileiro' ||
      heading.textContent === 'LGPD Compliant' ||
      heading.textContent === 'Otimização de Custos'
    );
    expect(featureCardHeadings).toHaveLength(4);
    
    const headingTexts = featureCardHeadings.map(heading => heading.textContent);
    expect(headingTexts).toContain('Conversa Inteligente');
    expect(headingTexts).toContain('Contexto Brasileiro');
    expect(headingTexts).toContain('LGPD Compliant');
    expect(headingTexts).toContain('Otimização de Custos');
  });

  test('should display testimonials section', () => {
    render(<HomePage />);
    
    // Check testimonials section
    expect(screen.getByText('O que dizem sobre nós')).toBeInTheDocument();
    expect(screen.getByText('Usuários reais, resultados reais')).toBeInTheDocument();
  });

  test('should display action buttons', () => {
    render(<HomePage />);
    
    // Check action buttons
    expect(screen.getByText('Conversa (IA)')).toBeInTheDocument();
    expect(screen.getByText('Gerenciar Grupos')).toBeInTheDocument();
  });

  test('should display compliance badges', () => {
    render(<HomePage />);
    
    // Check compliance badges - use getAllByText since there are multiple LGPD elements
    const lgpdElements = screen.getAllByText('LGPD Compliant');
    expect(lgpdElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Made in Brazil')).toBeInTheDocument();
  });

  test('should display footer information', () => {
    render(<HomePage />);
    
    // Check footer - use more specific text
    expect(screen.getByText(/© 2024 RachaAI/)).toBeInTheDocument();
    expect(screen.getByText(/Divisão Inteligente de Contas com IA Brasileira/)).toBeInTheDocument();
  });
}); 