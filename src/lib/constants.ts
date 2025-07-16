export const MUSIC_STYLES = [
  { value: "french_chanson", label: "Variété / Chanson française" },
  { value: "pop_folk", label: "Pop / Folk" },
  { value: "rock_punk", label: "Rock / Punk" },
  { value: "rap_hiphop", label: "Rap / Hip-Hop" },
  { value: "rnb_soul", label: "R&B / Soul" },
  { value: "funk_disco", label: "Funk / Disco" },
  { value: "electronic", label: "Musiques électroniques" },
  { value: "jazz_blues", label: "Jazz / Blues" },
  { value: "classical", label: "Musique classique" },
  { value: "metal_hardrock", label: "Metal / Hard Rock" },
  { value: "latin", label: "Musique latine" },
  { value: "reggae_dub", label: "Reggae / Dub" },
  { value: "dancehall_zouk", label: "Dancehall / Zouk" },
  { value: "kpop", label: "K-Pop" },
  { value: "other", label: "Autre" },
];

export const REGIONS_DEPARTMENTS = [
  {
    name: 'Alsace',
    departments: ['Bas-Rhin', 'Haut-Rhin', 'Toute la région'],
  },
  {
    name: 'Aquitaine',
    departments: ['Dordogne', 'Gironde', 'Landes', 'Lot-et-Garonne', 'Pyrénées-Atlantiques', 'Toute la région'],
  },
  {
    name: 'Auvergne',
    departments: ['Allier', 'Cantal', 'Haute-Loire', 'Puy-de-Dôme', 'Toute la région'],
  },
  {
    name: 'Basse-Normandie',
    departments: ['Calvados', 'Manche', 'Orne', 'Toute la région'],
  },
  {
    name: 'Bourgogne',
    departments: ['Côte-d\'Or', 'Nièvre', 'Saône-et-Loire', 'Yonne', 'Toute la région'],
  },
  {
    name: 'Bretagne',
    departments: ['Côtes-d\'Armor', 'Finistère', 'Ille-et-Vilaine', 'Morbihan', 'Toute la région'],
  },
  {
    name: 'Centre',
    departments: ['Cher', 'Eure-et-Loir', 'Indre', 'Indre-et-Loire', 'Loir-et-Cher', 'Loiret', 'Toute la région'],
  },
  {
    name: 'Champagne-Ardenne',
    departments: ['Ardennes', 'Aube', 'Haute-Marne', 'Marne', 'Toute la région'],
  },
  {
    name: 'Corse',
    departments: ['Corse-du-Sud', 'Haute-Corse', 'Toute la région'],
  },
  {
    name: 'Franche-Comté',
    departments: ['Doubs', 'Jura', 'Haute-Saône', 'Territoire de Belfort', 'Toute la région'],
  },
  {
    name: 'Haute-Normandie',
    departments: ['Eure', 'Seine-Maritime', 'Toute la région'],
  },
  {
    name: 'Île-de-France',
    departments: ['Paris', 'Seine-et-Marne', 'Yvelines', 'Essonne', 'Hauts-de-Seine', 'Seine-Saint-Denis', 'Val-de-Marne', 'Val-d\'Oise', 'Toute la région'],
  },
  {
    name: 'Languedoc-Roussillon',
    departments: ['Aude', 'Gard', 'Hérault', 'Lozère', 'Pyrénées-Orientales', 'Toute la région'],
  },
  {
    name: 'Limousin',
    departments: ['Corrèze', 'Creuse', 'Haute-Vienne', 'Toute la région'],
  },
  {
    name: 'Lorraine',
    departments: ['Meurthe-et-Moselle', 'Meuse', 'Moselle', 'Vosges', 'Toute la région'],
  },
  {
    name: 'Midi-Pyrénées',
    departments: ['Ariège', 'Aveyron', 'Haute-Garonne', 'Gers', 'Lot', 'Hautes-Pyrénées', 'Tarn', 'Tarn-et-Garonne', 'Toute la région'],
  },
  {
    name: 'Nord-Pas-de-Calais',
    departments: ['Nord', 'Pas-de-Calais', 'Toute la région'],
  },
  {
    name: 'Pays de la Loire',
    departments: ['Loire-Atlantique', 'Maine-et-Loire', 'Mayenne', 'Sarthe', 'Vendée', 'Toute la région'],
  },
  {
    name: 'Picardie',
    departments: ['Aisne', 'Oise', 'Somme', 'Toute la région'],
  },
  {
    name: 'Poitou-Charentes',
    departments: ['Charente', 'Charente-Maritime', 'Deux-Sèvres', 'Vienne', 'Toute la région'],
  },
  {
    name: 'Provence-Alpes-Côte d\'Azur (PACA)',
    departments: ['Alpes-de-Haute-Provence', 'Hautes-Alpes', 'Alpes-Maritimes', 'Bouches-du-Rhône', 'Var', 'Vaucluse', 'Toute la région'],
  },
  {
    name: 'Rhône-Alpes',
    departments: ['Ain', 'Ardèche', 'Drôme', 'Isère', 'Loire', 'Rhône', 'Savoie', 'Haute-Savoie', 'Toute la région'],
  },
];

export const DEPARTMENTS_OUTRE_MER = [
  { name: 'Guadeloupe' },
  { name: 'Martinique' },
  { name: 'Guyane' },
  { name: 'La Réunion' },
  { name: 'Mayotte' },
];

// Traduction des catégories de la base de données vers le français
export const CATEGORY_TRANSLATIONS: Record<string, string> = {
  // Artistes
  'singer': 'Chanteur',
  'rapper': 'Rappeur',
  'musician': 'Musicien',
  'composer': 'Compositeur',
  'producer': 'Producteur',
  'dj': 'DJ',
  
  // Prestataires - Professionnels de l'enregistrement
  'studio': 'Studio d\'enregistrement',
  'beatmaker': 'Beatmaker',
  'engineer': 'Ingénieur du son',
  
  // Prestataires - Promotion et marketing
  'radio_curator': 'Programmateur radio/playlist',
  'community_manager': 'Community manager',
  'media': 'Médias',
  
  // Prestataires - Visuel
  'clipmaker': 'Clipmaker',
  'video_editor': 'Monteur vidéo',
  'monteur': 'Monteur',
  'photographer': 'Photographe',
  'photographe': 'Photographe',
  'graphic_designer': 'Graphiste',
  'graphiste': 'Graphiste',
  
  // Prestataires - Distribution
  'distributor': 'Distributeur de musique',
  
  // Prestataires - Droits
  'music_lawyer': 'Avocat spécialisé',
  
  // Prestataires - Formation
  'vocal_coach': 'Coach vocal',
  'music_workshop': 'Ateliers de musique',
  'danseur': 'Chorégraphe',
  
  // Partenaires
  'label': 'Label / Maison de disque',
  'manager': 'Manager / Directeur artistique',
  'directeur artistique': 'Directeur artistique',
};

// Fonction utilitaire pour traduire une catégorie
export const translateCategory = (category: string | null | undefined): string => {
  if (!category) return '';
  
  // Nettoyer la catégorie (enlever les espaces, mettre en minuscules)
  const cleanCategory = category.toLowerCase().trim();
  
  // Chercher la traduction
  const translation = CATEGORY_TRANSLATIONS[cleanCategory];
  
  // Si pas de traduction trouvée, retourner la catégorie originale
  return translation || category;
}; 