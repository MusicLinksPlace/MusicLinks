import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, MapPin, Calendar, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger as DrawerTriggerMobile } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LocationFilter } from '@/components/ui/LocationFilter';

type Project = Database['public']['Tables']['Project']['Row'];

const Projects = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="relative bg-center bg-cover" style={{ backgroundImage: "url('/background/disque5.png')" }}>
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="relative max-w-7xl mx-auto px-4 w-full py-16 md:py-24 z-10">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                        PROJETS
                    </h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg sm:text-xl text-gray-200">
                        Bienvenue dans ce noyau d'opportunités d'affaires. Participez à des projets passionnants ou publiez le vôtre pour trouver les collaborateurs idéaux !
                    </p>
                </div>

                <div className="text-center">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                    <Button size="lg" className="font-semibold rounded-full px-8 py-3 text-base md:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <Plus className="mr-2 h-5 w-5" />
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
                              <SelectItem value="Audio">Audio & Son</SelectItem>
                              <SelectItem value="Vidéo">Vidéo & Clips</SelectItem>
                              <SelectItem value="Marketing">Marketing Musical</SelectItem>
                              <SelectItem value="Formation">Formation & Coaching</SelectItem>
                              <SelectItem value="Juridique">Juridique & Business</SelectItem>
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
        </div>

        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
              Projets récents
            </h2>
            <div className="space-y-6">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <div key={project.id} className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 sm:mb-0">
                        {project.title}
                      </h3>
                      <span className="text-sm font-medium text-white bg-green-500 px-3 py-1 rounded-full">
                        {project.status}
                      </span>
                    </div>
                    <div className="space-y-4">
                      <p className="text-gray-600 leading-relaxed">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{users[project.authorId] || 'Auteur inconnu'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{project.location || 'À distance'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(project.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">Aucun projet disponible pour le moment.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Projects;