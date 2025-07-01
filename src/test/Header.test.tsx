import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '@/components/Header';

// Mock pour useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock pour useToast
const mockToast = vi.fn();
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock pour supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}));

// Mock pour providerGroupsConfig
vi.mock('@/pages/Providers', () => ({
  providerGroupsConfig: [],
}));

const renderHeader = () => {
  return render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage pour simuler un utilisateur non connecté
    (localStorage.getItem as any).mockReturnValue(null);
  });

  it('renders without crashing', () => {
    renderHeader();
    // Vérifie qu'au moins un header est présent
    const headers = screen.getAllByRole('banner');
    expect(headers.length).toBeGreaterThan(0);
  });

  it('displays the logo', () => {
    renderHeader();
    // Utilise getAllByAltText pour éviter l'erreur de doublon
    const logos = screen.getAllByAltText('MusicLinks');
    expect(logos.length).toBeGreaterThan(0);
    // Vérifie le premier logo trouvé
    expect(logos[0]).toHaveAttribute('src', '/lovable-uploads/952112ae-fc5d-48cc-ade8-53267f24bc4d.png');
  });

  it('displays navigation links', () => {
    renderHeader();
    // Utilise getAllByText pour éviter l'erreur de doublon
    const artistesLinks = screen.getAllByText('Artistes');
    const prestatairesLinks = screen.getAllByText('Prestataires');
    const partenairesLinks = screen.getAllByText('Partenaires');
    const decouvrirLinks = screen.getAllByText('Découvrir');
    
    expect(artistesLinks.length).toBeGreaterThan(0);
    expect(prestatairesLinks.length).toBeGreaterThan(0);
    expect(partenairesLinks.length).toBeGreaterThan(0);
    expect(decouvrirLinks.length).toBeGreaterThan(0);
  });

  it('displays login and signup buttons when user is not logged in', () => {
    renderHeader();
    // Utilise getAllByText pour éviter l'erreur de doublon
    const connexionButtons = screen.getAllByText('Connexion');
    const inscrireButtons = screen.getAllByText('S\'inscrire');
    
    expect(connexionButtons.length).toBeGreaterThan(0);
    expect(inscrireButtons.length).toBeGreaterThan(0);
  });

  it('displays messages icon', () => {
    renderHeader();
    // Utilise getAllByAltText pour éviter l'erreur de doublon
    const messagesIcons = screen.getAllByAltText('Messages');
    expect(messagesIcons.length).toBeGreaterThan(0);
  });

  it('logo links to home page', () => {
    renderHeader();
    // Utilise getAllByRole pour éviter l'erreur de doublon
    const logoLinks = screen.getAllByRole('link', { name: /musiclinks/i });
    expect(logoLinks.length).toBeGreaterThan(0);
    // Vérifie le premier lien trouvé
    expect(logoLinks[0]).toHaveAttribute('href', '/');
  });
}); 