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
    
    // Check that buttons are properly structured - they're wrapped in spans
    const startButton = screen.getByText('Começar Conversa').closest('button');
    expect(startButton).toBeInTheDocument();
    expect(startButton?.tagName).toBe('BUTTON');
    
    const demoButton = screen.getByText('Ver Demo').closest('button');
    expect(demoButton).toBeInTheDocument();
    expect(demoButton?.tagName).toBe('BUTTON');
  });

  test('should have proper spacing and layout structure', () => {
    render(<HomePage />);
    
    // Check main content structure - look for the main element
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveAttribute('class');
  });

  test('should have proper card structure', () => {
    render(<HomePage />);
    
    // Check that cards have proper content structure
    expect(screen.getByText('💬')).toBeInTheDocument(); // icon
    expect(screen.getAllByText('✅ Implementado')).toHaveLength(4); // status badges
  });

  test('should have proper badge structure', () => {
    render(<HomePage />);
    
    // Check compliance badges - use getAllByText since there are multiple LGPD elements
    const lgpdElements = screen.getAllByText('LGPD Compliant');
    expect(lgpdElements.length).toBeGreaterThan(0);
    expect(lgpdElements[0]).toHaveAttribute('class');
    
    const brazilBadge = screen.getByText('Made in Brazil');
    expect(brazilBadge).toBeInTheDocument();
    expect(brazilBadge).toHaveAttribute('class');
  });

  test('should have all feature cards present', () => {
    render(<HomePage />);
    
    // Check that all feature cards are present using getAllByText
    const conversationElements = screen.getAllByText('Conversa Inteligente');
    expect(conversationElements.length).toBeGreaterThan(0);
    
    const contextElements = screen.getAllByText('Contexto Brasileiro');
    expect(contextElements.length).toBeGreaterThan(0);
    
    const lgpdElements = screen.getAllByText('LGPD Compliant');
    expect(lgpdElements.length).toBeGreaterThan(0);
    
    const costElements = screen.getAllByText('Otimização de Custos');
    expect(costElements.length).toBeGreaterThan(0);
  });
}); 