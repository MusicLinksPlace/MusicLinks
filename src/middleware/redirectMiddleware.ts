// Middleware pour gérer les redirections avec hash
export const handleHashRedirects = () => {
  // Vérifier si on est sur une URL avec hash
  if (window.location.hash && window.location.pathname.includes('/signup/continue')) {
    console.log('🚨 Hash detected in URL, redirecting to clean URL');
    
    // Rediriger immédiatement vers l'URL propre
    const cleanUrl = window.location.origin + '/signup/continue';
    window.location.replace(cleanUrl);
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
}; 