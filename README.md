# MusicLinks

MusicLinks est une plateforme de mise en relation pour les professionnels de la musique. Elle permet aux artistes de trouver et de collaborer avec des prestataires de services musicaux qualifiés.

## Technologies utilisées

- React
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- React Router
- React Query

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/votre-username/musiclinks.git
cd musiclinks
```

2. Installez les dépendances :
```bash
npm install
```

3. Lancez le serveur de développement :
```bash
npm run dev
```

## Structure du projet

```
src/
  ├── components/    # Composants réutilisables
  ├── pages/         # Pages de l'application
  ├── hooks/         # Hooks personnalisés
  ├── lib/           # Utilitaires et configurations
  └── App.tsx        # Point d'entrée de l'application
```

## Fonctionnalités principales

- Inscription et connexion des utilisateurs
- Profils artistes et prestataires
- Recherche de prestataires
- Système de messagerie
- Gestion des projets
- Système de paiement sécurisé

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🧪 Tests

Ce projet utilise **Vitest** pour les tests unitaires et **Testing Library** pour les tests de composants React.

### Commandes de test

```bash
# Lancer les tests en mode watch (développement)
npm run test

# Lancer l'interface graphique des tests
npm run test:ui

# Exécuter tous les tests une fois
npm run test:run

# Exécuter les tests avec couverture
npm run test:coverage
```

### Structure des tests

```
src/
├── test/
│   ├── setup.ts              # Configuration globale des tests
│   ├── Header.test.tsx       # Tests du composant Header
│   ├── App.test.tsx          # Tests du composant App
│   ├── utils.test.ts         # Tests des utilitaires
│   └── template.test.tsx     # Template pour nouveaux tests
```

### Écrire de nouveaux tests

1. **Utilise le template** : `src/test/template.test.tsx`
2. **Nomme tes fichiers** : `ComponentName.test.tsx`
3. **Place-les** dans `src/test/` ou à côté du composant

### Exemple de test simple

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Hooks Git

Le projet utilise **Husky** pour exécuter automatiquement les tests avant chaque push :

- **Pre-push** : Exécute `npm run test:run` et `npm run lint`
- **Blocage** : Le push est bloqué si les tests ou le lint échouent

### Bonnes pratiques

1. **Teste le comportement** plutôt que l'implémentation
2. **Utilise des mocks** pour les dépendances externes
3. **Écris des tests lisibles** avec des descriptions claires
4. **Garde les tests simples** et maintenables
