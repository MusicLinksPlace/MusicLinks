// Middleware pour gérer les redirections avec hash
export const handleHashRedirects = () => {
  console.log('🛡️ MIDDLEWARE - handleHashRedirects appelé');
  console.log('🛡️ MIDDLEWARE - Hash:', window.location.hash);
  console.log('🛡️ MIDDLEWARE - Pathname:', window.location.pathname);
  
  // Vérifier si on est sur une URL avec hash
  if (window.location.hash && window.location.pathname.includes('/signup/continue')) {
    console.log('🚨 MIDDLEWARE - Hash detected in URL, redirecting to clean URL');
    
    // Rediriger immédiatement vers l'URL propre
    const cleanUrl = window.location.origin + '/signup/continue';
    window.location.replace(cleanUrl);
    return true;
  }
  
  // Gérer les erreurs 404 pour les routes inexistantes
  const validRoutes = [
    '/', '/signup', '/login', '/forgot-password', '/update-password',
    '/providers', '/artists', '/partners', '/Project', '/about',
    '/how-it-works', '/legal', '/profile/artist-setup', '/profile/artist',
    '/profile/partner', '/provider-settings', '/confirm', '/mon-compte',
    '/partner-account', '/chat', '/admin/users', '/auth/callback'
  ];
  
  const currentPath = window.location.pathname;
  const isProfileRoute = currentPath.startsWith('/profile/') && currentPath !== '/profile/artist-setup' && currentPath !== '/profile/artist' && currentPath !== '/profile/partner';
  
  if (!validRoutes.includes(currentPath) && !isProfileRoute && !currentPath.startsWith('/signup/continue')) {
    console.log('🚨 MIDDLEWARE - Invalid route detected, redirecting to 404');
    window.location.replace('/404');
    return true;
  }
  
  return false;
};

// Fonction pour nettoyer les URLs avec hash
export const cleanHashFromUrl = () => {
  if (window.location.hash) {
    console.log('🧹 Cleaning hash from URL');
    const cleanUrl = window.location.origin + window.location.pathname + window.location.search;
    window.history.replaceState({}, document.title, cleanUrl);
  }
};

// Intercepter les changements d'URL
export const setupUrlInterceptor = () => {
  // Intercepter pushState
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    if (args[2] && typeof args[2] === 'string' && args[2].includes('#')) {
      console.log('🧹 Intercepting pushState with hash');
      const cleanUrl = args[2].split('#')[0];
      return originalPushState.call(this, args[0], args[1], cleanUrl);
    }
    return originalPushState.apply(this, args);
  };

  // Intercepter replaceState
  const originalReplaceState = history.replaceState;
  history.replaceState = function(...args) {
    if (args[2] && typeof args[2] === 'string' && args[2].includes('#')) {
      console.log('🧹 Intercepting replaceState with hash');
      const cleanUrl = args[2].split('#')[0];
      return originalReplaceState.call(this, args[0], args[1], cleanUrl);
    }
    return originalReplaceState.apply(this, args);
  };

  // Gérer les erreurs de navigation
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message.includes('Cannot assign to read only property')) {
      console.warn('🛡️ Suppressing FIDO2 error:', event.error.message);
      event.preventDefault();
    }
  });

  // Gérer les erreurs de ressources non trouvées
  window.addEventListener('error', (event) => {
    if (event.target && (event.target as HTMLElement).tagName === 'LINK') {
      console.warn('🛡️ Resource not found:', (event.target as HTMLLinkElement).href);
      event.preventDefault();
    }
  }, true);
}; 