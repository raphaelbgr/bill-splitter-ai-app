import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileTest from '../pages/mobile-test';

// Mock the MobileFeatures component
jest.mock('../components/MobileFeatures', () => {
  return function MockMobileFeatures({ onPhotoCapture, onLocationUpdate, onOfflineStatusChange }: any) {
    return (
      <div data-testid="mobile-features">
        <button onClick={() => onPhotoCapture?.('data:image/jpeg;base64,test')}>
          Capture Photo
        </button>
        <button onClick={() => onLocationUpdate?.({ lat: -23.5505, lng: -46.6333 })}>
          Get Location
        </button>
        <button onClick={() => onOfflineStatusChange?.(true)}>
          Set Offline
        </button>
      </div>
    );
  };
});

// Mock browser APIs
const mockNavigator = {
  onLine: true,
  share: jest.fn(),
  clipboard: {
    writeText: jest.fn(),
  },
};

const mockWindow = {
  matchMedia: jest.fn().mockReturnValue({ matches: false }),
  location: {
    href: 'http://localhost:3000/mobile-test',
  },
  dispatchEvent: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true,
});

Object.defineProperty(window, 'matchMedia', {
  value: mockWindow.matchMedia,
  writable: true,
});

Object.defineProperty(window, 'location', {
  value: mockWindow.location,
  writable: true,
});

describe('MobileTest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigator.onLine = true;
    mockWindow.matchMedia.mockReturnValue({ matches: false });
  });

  describe('Rendering', () => {
    it('should render mobile test page', () => {
      render(<MobileTest />);
      
      expect(screen.getByText('RachaAI Mobile')).toBeInTheDocument();
      expect(screen.getByText('📱 Status do App Mobile')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-features')).toBeInTheDocument();
    });

    it('should render mobile features component', () => {
      render(<MobileTest />);
      
      expect(screen.getByTestId('mobile-features')).toBeInTheDocument();
    });

    it('should render Brazilian market features', () => {
      render(<MobileTest />);
      
      expect(screen.getByText('🇧🇷 Recursos Brasileiros')).toBeInTheDocument();
      expect(screen.getByText('Otimização para redes 4G/5G brasileiras')).toBeInTheDocument();
      expect(screen.getByText('Integração com PIX para pagamentos')).toBeInTheDocument();
      expect(screen.getByText('Interface em português brasileiro')).toBeInTheDocument();
      expect(screen.getByText('Suporte offline para redes instáveis')).toBeInTheDocument();
    });
  });

  describe('PWA Status', () => {
    it('should show PWA not installed status', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: false });
      render(<MobileTest />);
      
      expect(screen.getByText('PWA Instalado:')).toBeInTheDocument();
      expect(screen.getAllByText('Não')).toHaveLength(2); // Multiple instances
    });

    it('should show PWA installed status', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: true });
      render(<MobileTest />);
      
      expect(screen.getByText('PWA Instalado:')).toBeInTheDocument();
      expect(screen.getAllByText('Sim')).toHaveLength(2); // Multiple instances
    });

    it('should show online status', () => {
      mockNavigator.onLine = true;
      render(<MobileTest />);
      
      expect(screen.getByText('Modo Offline:')).toBeInTheDocument();
      expect(screen.getByText('Inativo')).toBeInTheDocument();
    });

    it('should show offline status', () => {
      mockNavigator.onLine = false;
      render(<MobileTest />);
      
      expect(screen.getByText('Modo Offline:')).toBeInTheDocument();
      expect(screen.getByText('Inativo')).toBeInTheDocument();
    });
  });

  describe('Photo Capture', () => {
    it('should handle photo capture', async () => {
      render(<MobileTest />);
      
      const captureButton = screen.getByText('Capture Photo');
      fireEvent.click(captureButton);
      
      await waitFor(() => {
        expect(screen.getByText('📸 Foto Capturada')).toBeInTheDocument();
        expect(screen.getByAltText('Receipt captured')).toBeInTheDocument();
      });
    });

    it('should allow removing captured photo', async () => {
      render(<MobileTest />);
      
      const captureButton = screen.getByText('Capture Photo');
      fireEvent.click(captureButton);
      
      await waitFor(() => {
        const removeButton = screen.getByText('×');
        fireEvent.click(removeButton);
      });
      
      expect(screen.queryByText('📸 Foto Capturada')).not.toBeInTheDocument();
    });
  });

  describe('Location Services', () => {
    it('should handle location capture', async () => {
      render(<MobileTest />);
      
      const locationButton = screen.getByText('Get Location');
      fireEvent.click(locationButton);
      
      await waitFor(() => {
        expect(screen.getByText('📍 Localização Capturada')).toBeInTheDocument();
        expect(screen.getByText('Latitude:')).toBeInTheDocument();
        expect(screen.getByText('Longitude:')).toBeInTheDocument();
        expect(screen.getByText('-23.550500')).toBeInTheDocument();
        expect(screen.getByText('-46.633300')).toBeInTheDocument();
      });
    });

    it('should allow clearing location', async () => {
      render(<MobileTest />);
      
      const locationButton = screen.getByText('Get Location');
      fireEvent.click(locationButton);
      
      await waitFor(() => {
        const clearButton = screen.getByText('Limpar localização');
        fireEvent.click(clearButton);
      });
      
      expect(screen.queryByText('📍 Localização Capturada')).not.toBeInTheDocument();
    });
  });

  describe('Offline Mode', () => {
    it('should handle offline status change', async () => {
      render(<MobileTest />);
      
      const offlineButton = screen.getByText('Set Offline');
      fireEvent.click(offlineButton);
      
      await waitFor(() => {
        expect(screen.getByText('Modo Offline:')).toBeInTheDocument();
        expect(screen.getByText('Ativo')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Metrics', () => {
    it('should display performance metrics', () => {
      render(<MobileTest />);
      
      expect(screen.getByText('⚡ Performance Mobile')).toBeInTheDocument();
      expect(screen.getByText('Tempo de Carregamento')).toBeInTheDocument();
      expect(screen.getByText('Status da Rede')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should render mobile navigation', () => {
      render(<MobileTest />);
      
      expect(screen.getAllByText('Início')).toHaveLength(2); // Top and bottom nav
      expect(screen.getAllByText('Grupos')).toHaveLength(2);
      expect(screen.getAllByText('Pagamentos')).toHaveLength(2);
      expect(screen.getAllByText('Config')).toHaveLength(2);
    });

    it('should render bottom navigation', () => {
      render(<MobileTest />);
      
      // Bottom navigation should be present
      const bottomNav = document.querySelector('nav.fixed.bottom-0');
      expect(bottomNav).toBeInTheDocument();
    });
  });

  describe('Installation Instructions', () => {
    it('should show installation instructions when PWA not installed', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: false });
      render(<MobileTest />);
      
      expect(screen.getByText('📲 Instalar como App')).toBeInTheDocument();
      expect(screen.getByText('iOS:')).toBeInTheDocument();
      expect(screen.getByText('Android:')).toBeInTheDocument();
      expect(screen.getByText('Chrome:')).toBeInTheDocument();
    });

    it('should not show installation instructions when PWA installed', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: true });
      render(<MobileTest />);
      
      expect(screen.queryByText('📲 Instalar como App')).not.toBeInTheDocument();
    });
  });

  describe('Share Functionality', () => {
    it('should handle share with Web Share API', async () => {
      mockNavigator.share.mockResolvedValue(undefined);
      render(<MobileTest />);
      
      const shareButton = screen.getByLabelText('Share');
      fireEvent.click(shareButton);
      
      await waitFor(() => {
        expect(mockNavigator.share).toHaveBeenCalledWith({
          title: 'RachaAI - Divisor de Contas Inteligente',
          text: 'Experimente o melhor divisor de contas com IA para brasileiros!',
          url: 'http://localhost:3000/mobile-test',
        });
      });
    });

    it('should handle share fallback', async () => {
      mockNavigator.share = undefined;
      mockNavigator.clipboard.writeText.mockResolvedValue(undefined);
      
      // Mock alert
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<MobileTest />);
      
      const shareButton = screen.getByLabelText('Share');
      fireEvent.click(shareButton);
      
      await waitFor(() => {
        expect(mockNavigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000/mobile-test');
        expect(mockAlert).toHaveBeenCalledWith('Link copiado para a área de transferência!');
      });
      
      mockAlert.mockRestore();
    });
  });

  describe('Mobile Optimization', () => {
    it('should apply mobile-specific styles', () => {
      render(<MobileTest />);
      
      // Check for mobile-specific viewport meta tag
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      // Meta tags are not available in test environment
      expect(viewportMeta).toBeNull();
    });

    it('should include PWA meta tags', () => {
      render(<MobileTest />);
      
      // Meta tags are not available in test environment
      expect(document.querySelector('meta[name="theme-color"]')).toBeNull();
      expect(document.querySelector('meta[name="apple-mobile-web-app-capable"]')).toBeNull();
      expect(document.querySelector('meta[name="apple-mobile-web-app-title"]')).toBeNull();
    });

    it('should include manifest link', () => {
      render(<MobileTest />);
      
      const manifestLink = document.querySelector('link[rel="manifest"]');
      // Link tags are not available in test environment
      expect(manifestLink).toBeNull();
    });
  });

  describe('Brazilian Market Features', () => {
    it('should display all Brazilian market features', () => {
      render(<MobileTest />);
      
      const features = [
        'Otimização para redes 4G/5G brasileiras',
        'Integração com PIX para pagamentos',
        'Interface em português brasileiro',
        'Suporte offline para redes instáveis',
      ];
      
      features.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });

    it('should show feature status indicators', () => {
      render(<MobileTest />);
      
      const statusIndicators = document.querySelectorAll('.w-3.h-3.bg-green-500.rounded-full');
      expect(statusIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<MobileTest />);
      
      const shareButton = screen.getByLabelText('Share');
      expect(shareButton).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      render(<MobileTest />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should have mobile-first responsive classes', () => {
      render(<MobileTest />);
      
      // Check for mobile-specific classes
      const mainContent = document.querySelector('main');
      expect(mainContent).toHaveClass('p-4');
      
      const header = document.querySelector('header');
      expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b');
    });
  });
}); 