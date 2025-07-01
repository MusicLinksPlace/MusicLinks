import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '@/App';

// Mock pour les composants qui utilisent des hooks externes
vi.mock('@/components/Header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock('@/components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

// Mock pour les pages qui utilisent des hooks externes
vi.mock('@/pages/Index', () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}));

const renderApp = () => {
  return render(
    <App />
  );
};

describe('App Component', () => {
  it('renders without crashing', () => {
    renderApp();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders the main app structure', () => {
    renderApp();
    // Vérifie que l'app se rend sans erreur
    expect(document.body).toBeInTheDocument();
  });
}); 