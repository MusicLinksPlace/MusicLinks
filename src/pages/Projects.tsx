import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, MapPin, Calendar, User, Filter, Music, Video, TrendingUp, Package, Shield, GraduationCap, X, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger as DrawerTriggerMobile } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LocationFilter } from '@/components/ui/LocationFilter';
import { useNavigate } from 'react-router-dom';

type Project = Database['public']['Tables']['Project']['Row'];

// Mapping des catégories français → anglais (base de données)
const categoryMapping = {
  'Enregistrement': 'Recording',
  'Visuel': 'Visuals',
  'Promotion / Marketing': 'Marketing',
  'Distribution': 'Distribution',
  'Droits': 'RightsManagement',
  'Formation': 'Training'
};

// Mapping inverse pour l'affichage
const categoryDisplayMapping = {
  'Recording': 'Enregistrement',
  'Visuals': 'Visuel',
  'Marketing': 'Promotion / Marketing',
  'Distribution': 'Distribution',
  'RightsManagement': 'Droits',
  'Training': 'Formation'
};

const categoryIcons = {
  'Recording': Music,
  'Visuals': Video,
  'Marketing': TrendingUp,
  'Distribution': Package,
  'RightsManagement': Shield,
  'Training': GraduationCap
};

const Projects = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('Tous');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    category: '',
    location: ''
  });
  const [users, setUsers] = useState<Record<string, string>>({});

  useEffect(() => {
    const user = localStorage.getItem('musiclinks_user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedFilter === 'Tous') {
      setFilteredProjects(projects);
    } else {
      const dbCategory = categoryMapping[selectedFilter as keyof typeof categoryMapping];
      setFilteredProjects(projects.filter(project => project.category === dbCategory));
    }
  }, [selectedFilter, projects]);

  const handleLocationSelect = (location: string) => {
    setProjectData(prev => ({ ...prev, location }));
    setIsLocationOpen(false);
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('Project')
        .select('id, title, description, category, location, status, authorId, createdAt, applicantCount, verified')
        .eq('verified', 1)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      
      setProjects(data || []);
      const authorIds = Array.from(new Set((data || []).map((p: Project) => p.authorId).filter(Boolean)));
      if (authorIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('id, name')
          .in('id', authorIds);
        if (!userError && userData) {
          const userMap: Record<string, string> = {};
          userData.forEach((u: { id: string; name: string }) => {
            userMap[u.id] = u.name;
          });
          setUsers(userMap);
        }
      }
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue: " + error.message,
      });
    }
  };

  const locationTrigger = (
    <Button 
        type="button"
        variant="outline" 
        className="w-full justify-start text-left font-normal"
    >
        {projectData.location || "Sélectionnez une localisation"}
    </Button>
  );

  const locationContent = (
    <LocationFilter 
        selectedLocation={projectData.location}
        onLocationChange={handleLocationSelect}
    />
  );

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour créer un projet",
      });
      return;
    }

    setIsLoading(true);
    try {
      const newProject = {
        title: projectData.title,
        description: projectData.description,
        category: projectData.category,
        location: projectData.location,
        status: 'Ouvert',
        authorId: currentUser.id,
        applicantCount: 0,
        verified: 0 
      };

      const { data, error } = await supabase
        .from('Project')
        .insert([newProject])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre projet a été publié avec succès et est en attente de validation.",
      });

      setIsCreateDialogOpen(false);
      setProjectData({ title: '', description: '', category: '', location: '' });
      fetchProjects();
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue: " + error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinProject = async (project: Project) => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour rejoindre un projet",
      });
      return;
    }

    if (project.authorId === currentUser.id) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous ne pouvez pas rejoindre votre propre projet",
      });
      return;
    }

    try {
      // Créer un message initial avec le contexte du projet
      const projectMessage = `Bonjour ! Je suis intéressé(e) par votre projet "${project.title}". Pouvons-nous en discuter ?`;
      
      const { error } = await supabase
        .from('Message')
        .insert({
          senderId: currentUser.id,
          receiverId: project.authorId,
          content: projectMessage
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre demande a été envoyée avec succès !",
      });

      setIsProjectDetailOpen(false);
      
      // Rediriger vers la conversation
      navigate(`/chat?userId=${project.authorId}`);
    } catch (error: any) {
      console.error('Error joining project:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre demande",
      });
    }
  };

  const openProjectDetail = (project: Project) => {
    setSelectedProject(project);
    setIsProjectDetailOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    return `Il y a ${Math.floor(diffDays / 30)} mois`;
  };

  const filterOptions = ['Tous', ...Object.keys(categoryMapping)];

  // Composant Modal de détail du projet
  const ProjectDetailModal = () => {
    if (!selectedProject) return null;

    const IconComponent = categoryIcons[selectedProject.category as keyof typeof categoryIcons] || Music;
    const displayCategory = categoryDisplayMapping[selectedProject.category as keyof typeof categoryDisplayMapping] || selectedProject.category;
    const authorName = users[selectedProject.authorId] || 'Auteur inconnu';

    const content = (
      <div className="relative">
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div>
                  <span className="text-sm font-medium text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">
                    {displayCategory}
                  </span>
                  <span className="ml-3 text-sm font-medium text-white bg-green-500 px-3 py-1 rounded-full">
                    {selectedProject.status}
                  </span>
                </div>
              </div>
              {!isMobile && (
                <Button
                  onClick={() => setIsProjectDetailOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {selectedProject.title}
            </h2>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{authorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{selectedProject.location || 'À distance'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(selectedProject.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-4">Description du projet</h3>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
              {selectedProject.description}
            </p>
          </div>
        </div>

        {/* CTA */}
        {currentUser && selectedProject.authorId !== currentUser.id && (
          <div className="text-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <Button
                onClick={() => handleJoinProject(selectedProject)}
                size="lg"
                className="relative group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl py-6 px-12 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-0"
              >
                <MessageCircle className="w-6 h-6" />
                Rejoindre ce projet
              </Button>
            </div>
          </div>
        )}
      </div>
    );

    if (isMobile) {
      return (
        <Drawer open={isProjectDetailOpen} onOpenChange={setIsProjectDetailOpen}>
          <DrawerContent className="h-[95vh] bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <DrawerHeader className="text-left border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <DrawerTitle className="text-2xl font-bold text-white">Détails du projet</DrawerTitle>
                <Button
                  onClick={() => setIsProjectDetailOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </DrawerHeader>
            <div className="px-4 py-6 overflow-y-auto">
              {content}
            </div>
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Dialog open={isProjectDetailOpen} onOpenChange={setIsProjectDetailOpen}>
        <DialogContent className="max-w-4xl mx-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700/50 text-white max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {content}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section 
          className="relative bg-center bg-cover flex-1 min-h-screen flex items-center justify-center"
          style={{ backgroundImage: "url('/background/disque5.png')" }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          
          {/* Musical background elements avec glow effects */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-blue-500 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 md:py-24">
            <div className="mb-8 animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
                PROJETS
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 leading-relaxed max-w-4xl mx-auto mb-8">
                Bienvenue dans ce noyau d'opportunités d'affaires. Participez à des projets passionnants ou publiez le vôtre pour trouver les collaborateurs idéaux !
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="mb-12">
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {filterOptions.map((filter) => {
                  const isSelected = selectedFilter === filter;
                  const IconComponent = filter !== 'Tous' ? categoryIcons[categoryMapping[filter as keyof typeof categoryMapping] as keyof typeof categoryIcons] : Filter;
                  
                  return (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`group relative inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                        isSelected
                          ? 'bg-white/20 backdrop-blur-md border border-white/30 text-white scale-105'
                          : 'bg-white/10 backdrop-blur-md border border-white/20 text-gray-200 hover:bg-white/20 hover:scale-105'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl blur-lg"></div>
                      )}
                      <div className="relative flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        <span>{filter}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Create Project Button */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="relative group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl py-6 px-12 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-0"
                  >
                    <Plus className="w-6 h-6" />
                    Publier un projet
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md mx-4">
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau projet</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateProject} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titre du projet</Label>
                      <Input
                        id="title"
                        value={projectData.title}
                        onChange={(e) => setProjectData({...projectData, title: e.target.value})}
                        placeholder="Ex: Recherche beatmaker pour EP"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Catégorie</Label>
                      <Select value={projectData.category} onValueChange={(value) => setProjectData({...projectData, category: value})} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="Recording">Enregistrement</SelectItem>
                          <SelectItem value="Visuals">Visuel</SelectItem>
                          <SelectItem value="Marketing">Promotion / Marketing</SelectItem>
                          <SelectItem value="Distribution">Distribution</SelectItem>
                          <SelectItem value="RightsManagement">Droits</SelectItem>
                          <SelectItem value="Training">Formation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={projectData.description}
                        onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                        placeholder="Décrivez votre projet en détail..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Localisation (optionnel)</Label>
                      {isMobile ? (
                          <Drawer open={isLocationOpen} onOpenChange={setIsLocationOpen}>
                              <DrawerTriggerMobile asChild>{locationTrigger}</DrawerTriggerMobile>
                              <DrawerContent className="h-[95vh] top-0 mt-0">
                                  <DrawerHeader className="text-left"><DrawerTitle className="text-2xl font-bold">Où se situe le projet ?</DrawerTitle></DrawerHeader>
                                  <div className="px-2 overflow-y-auto">{locationContent}</div>
                              </DrawerContent>
                          </Drawer>
                      ) : (
                          <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
                              <PopoverTrigger asChild>{locationTrigger}</PopoverTrigger>
                              <PopoverContent className="w-[340px] p-0">
                                  {locationContent}
                              </PopoverContent>
                          </Popover>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Publication...' : 'Publier le projet'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Projets {selectedFilter !== 'Tous' ? `- ${selectedFilter}` : 'récents'}
              </h2>
              <p className="text-gray-300 text-lg">
                {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''} disponible{filteredProjects.length > 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid gap-8 md:gap-12">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => {
                  const IconComponent = categoryIcons[project.category as keyof typeof categoryIcons] || Music;
                  const displayCategory = categoryDisplayMapping[project.category as keyof typeof categoryDisplayMapping] || project.category;
                  
                  return (
                    <div 
                      key={project.id} 
                      className="group relative cursor-pointer"
                      onClick={() => openProjectDetail(project)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 hover:bg-gray-800/90 transition-all duration-300 hover:scale-[1.02]">
                        <div className="flex flex-col lg:flex-row justify-between items-start mb-6">
                          <div className="flex-1 mb-4 lg:mb-0">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                                <IconComponent className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-sm font-medium text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">
                                {displayCategory}
                              </span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                              {project.title}
                            </h3>
                          </div>
                          <span className="text-sm font-medium text-white bg-green-500 px-4 py-2 rounded-full shadow-lg">
                            {project.status}
                          </span>
                        </div>
                        
                        <div className="space-y-6">
                          <p className="text-gray-300 leading-relaxed text-lg line-clamp-3">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                              <User className="h-5 w-5" />
                              <span>{users[project.authorId] || 'Auteur inconnu'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-5 w-5" />
                              <span>{project.location || 'À distance'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-5 w-5" />
                              <span>{formatDate(project.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16">
                  <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-300 text-lg font-medium mb-2">
                      Aucun projet {selectedFilter !== 'Tous' ? `dans la catégorie "${selectedFilter}"` : 'disponible'}
                    </p>
                    <p className="text-gray-400">
                      {selectedFilter !== 'Tous' ? 'Essayez un autre filtre ou' : ''} Soyez le premier à publier un projet !
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <ProjectDetailModal />
      <Footer />
    </div>
  );
};

export default Projects;