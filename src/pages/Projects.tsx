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

type Project = Database['public']['Tables']['Project']['Row'];

const Projects = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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
  const [users, setUsers] = useState<Record<string, string>>({}); // authorId -> name

  useEffect(() => {
    const user = localStorage.getItem('musiclinks_user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('Project')
        .select('id, title, description, category, location, status, authorId, createdAt, applicantCount, verified')
        .eq('verified', 1)
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les projets: " + error.message,
        });
        return;
      }
      
      console.log('[DEBUG] Supabase query: .eq(\'verified\', 1)');
      console.log('[DEBUG] Raw data returned from Supabase:', data);
      if (Array.isArray(data)) {
        data.forEach((proj, idx) => {
          console.log(`[DEBUG] Project #${idx} - id: ${proj.id}, verified:`, proj.verified);
        });
      }
      setProjects(data || []);
      // Fetch user names for all authorIds
      const authorIds = Array.from(new Set((data || []).map((p: Project) => p.authorId)));
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
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des projets",
      });
    }
  };

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

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Succès",
        description: "Votre projet a été publié avec succès",
      });

      setIsCreateDialogOpen(false);
      setProjectData({ title: '', description: '', category: '', location: '' });
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du projet",
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
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-8">
        {/* Hero Section */}
        <section className="bg-gradient-ml-primary/5 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-ml-charcoal mb-4">
                Projets musicaux
              </h1>
              <p className="text-lg md:text-xl text-ml-charcoal/70 max-w-2xl mx-auto px-4">
                Découvrez des projets passionnants ou publiez le vôtre pour trouver les collaborateurs parfaits
              </p>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-ml-teal hover:bg-ml-navy text-white font-semibold px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
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
                      <Input
                        id="location"
                        value={projectData.location}
                        onChange={(e) => setProjectData({...projectData, location: e.target.value})}
                        placeholder="Ex: Paris, France"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-ml-teal hover:bg-ml-navy"
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

        {/* Projects List */}
        <section className="py-8 md:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 md:mb-8 gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-ml-charcoal">
                {projects.length} projets disponibles
              </h2>
            </div>

            <div className="space-y-4 md:space-y-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 md:p-6 border border-ml-blue/20">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                          <h3 className="text-lg md:text-xl font-bold text-ml-charcoal">{project.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                            project.status === 'Ouvert' 
                              ? 'bg-ml-teal/10 text-ml-teal' 
                              : 'bg-ml-navy/10 text-ml-navy'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-ml-charcoal/60 mb-3">
                          <div className="flex items-center">
                            <User className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            {users[project.authorId] || project.authorId}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            {formatDate(project.createdAt)}
                          </div>
                          {project.location && (
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              {project.location}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <span className="bg-ml-teal/10 text-ml-teal px-3 py-1 rounded-full text-xs md:text-sm font-medium w-fit">
                        {project.category}
                      </span>
                    </div>

                    <p className="text-sm md:text-base text-ml-charcoal/80 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex justify-between items-center pt-4 border-t border-ml-blue/20">
                      <span className="text-xs md:text-sm text-ml-charcoal/60">
                        {project.applicantCount} candidature{project.applicantCount !== 1 ? 's' : ''}
                      </span>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="rounded-full"
                      >
                        Voir le projet
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Projects; 