import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAdmin } from '@/hooks/use-admin';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Edit, CheckCircle, XCircle, Loader2, ExternalLink, Users, Briefcase, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  location?: string | null;
  bio?: string | null;
  profilepicture?: string | null;
  createdat: string;
  verified: number;
  disabled: number;
  isAdmin: boolean;
}

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  location?: string | null;
  status: string;
  authorId: string;
  createdAt: string;
  verified: number;
  applicantCount: number;
  authorName?: string;
}

// Mapping des catégories pour l'affichage
const categoryDisplayMapping = {
  'Recording': 'Enregistrement',
  'Visuals': 'Visuel',
  'Marketing': 'Promotion / Marketing',
  'Distribution': 'Distribution',
  'RightsManagement': 'Droits',
  'Training': 'Formation'
};

const AdminUsers = () => {
  const { isAdmin, loading, requireAdmin } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortByDate, setSortByDate] = useState<'asc' | 'desc'>('desc');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortByRole, setSortByRole] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState<'users' | 'projects'>('users');

  const ROLE_OPTIONS = [
    { label: 'Tous', value: 'all' },
    { label: 'Artiste', value: 'artist' },
    { label: 'Prestataire', value: 'provider' },
    { label: 'Partenaire', value: 'partner' },
  ];

  const CATEGORY_OPTIONS = [
    { label: 'Toutes', value: 'all' },
    { label: 'Enregistrement', value: 'Recording' },
    { label: 'Visuel', value: 'Visuals' },
    { label: 'Promotion / Marketing', value: 'Marketing' },
    { label: 'Distribution', value: 'Distribution' },
    { label: 'Droits', value: 'RightsManagement' },
    { label: 'Formation', value: 'Training' },
  ];

  // Vérifier les droits admin
  useEffect(() => {
    if (!loading && !requireAdmin()) return;
  }, [loading, requireAdmin]);

  // Charger les utilisateurs
  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('User')
          .select('*')
          .order('createdat', { ascending: false });

        if (error) throw error;
        
        setUsers(data || []);
        setFilteredUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les utilisateurs",
          variant: "destructive",
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [isAdmin, toast]);

  // Charger les projets
  useEffect(() => {
    if (!isAdmin || activeTab !== 'projects') return;
    
    const fetchProjects = async () => {
      try {
        const { data: projectsData, error } = await supabase
          .from('Project')
          .select('*')
          .order('createdAt', { ascending: false });

        if (error) throw error;

        // Récupérer les noms des auteurs
        if (projectsData && projectsData.length > 0) {
          const authorIds = [...new Set(projectsData.map(p => p.authorId))];
          const { data: authorsData, error: authorsError } = await supabase
            .from('User')
            .select('id, name')
            .in('id', authorIds);

          if (!authorsError && authorsData) {
            const authorsMap = new Map(authorsData.map(author => [author.id, author.name]));
            const projectsWithAuthors = projectsData.map(project => ({
              ...project,
              authorName: authorsMap.get(project.authorId) || 'Auteur inconnu'
            }));
            setProjects(projectsWithAuthors);
            setFilteredProjects(projectsWithAuthors);
          } else {
            setProjects(projectsData);
            setFilteredProjects(projectsData);
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les projets",
          variant: "destructive",
        });
      } finally {
        setLoadingProjects(false);
      }
    };

    if (activeTab === 'projects') {
      fetchProjects();
    }
  }, [isAdmin, toast, activeTab]);

  // Filtrer et trier les utilisateurs
  useEffect(() => {
    let filtered = users.filter(user =>
      (roleFilter === 'all' || user.role === roleFilter) &&
      (
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    // Tri par rôle
    filtered = filtered.sort((a, b) => {
      if (sortByRole !== undefined) {
        const roleA = a.role || '';
        const roleB = b.role || '';
        if (roleA < roleB) return sortByRole === 'asc' ? -1 : 1;
        if (roleA > roleB) return sortByRole === 'asc' ? 1 : -1;
      }
      // Sinon, tri par date
      const dateA = new Date(a.createdat).getTime();
      const dateB = new Date(b.createdat).getTime();
      return sortByDate === 'asc' ? dateA - dateB : dateB - dateA;
    });
    setFilteredUsers(filtered);
  }, [users, searchTerm, sortByDate, roleFilter, sortByRole]);

  // Filtrer et trier les projets
  useEffect(() => {
    let filtered = projects.filter(project =>
      (categoryFilter === 'all' || project.category === categoryFilter) &&
      (
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.authorName && project.authorName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
    // Tri par date
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortByDate === 'asc' ? dateA - dateB : dateB - dateA;
    });
    setFilteredProjects(filtered);
  }, [projects, searchTerm, sortByDate, categoryFilter]);

  // Activer/Désactiver un utilisateur
  const toggleUserStatus = async (userId: string, currentStatus: number) => {
    try {
      // Logique corrigée : 0 = actif, 1 = désactivé
      const newStatus = currentStatus === 0 ? 1 : 0;
      const action = newStatus === 0 ? 'activé' : 'désactivé';
      
      console.log(`Toggling user ${userId} from ${currentStatus} to ${newStatus}`);
      
      const { error } = await supabase
        .from('User')
        .update({ disabled: newStatus })
        .eq('id', userId);

      if (error) throw error;

      // Mettre à jour l'état local
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, disabled: newStatus } : user
      ));
      
      // Mettre à jour aussi les utilisateurs filtrés
      setFilteredUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, disabled: newStatus } : user
      ));

      toast({
        title: "Succès",
        description: `Utilisateur ${action} avec succès`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'utilisateur",
        variant: "destructive",
      });
    }
  };

  // Valider/Invalider un projet
  const toggleProjectVerification = async (projectId: string, currentStatus: number) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      const action = newStatus === 1 ? 'validé' : 'invalidé';
      
      const { error } = await supabase
        .from('Project')
        .update({ verified: newStatus })
        .eq('id', projectId);

      if (error) throw error;

      // Mettre à jour l'état local
      setProjects(prev => prev.map(project => 
        project.id === projectId ? { ...project, verified: newStatus } : project
      ));
      
      setFilteredProjects(prev => prev.map(project => 
        project.id === projectId ? { ...project, verified: newStatus } : project
      ));

      toast({
        title: "Succès",
        description: `Projet ${action} avec succès`,
      });
    } catch (error) {
      console.error('Error updating project verification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du projet",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Administration
          </h1>
          <p className="text-gray-600">
            Gérez les utilisateurs et les projets de la plateforme
          </p>
        </div>

        {/* Toggle Users/Projects */}
        <div className="mb-8">
          <div className="bg-white p-1 rounded-lg border inline-flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5" />
              Utilisateurs
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'projects'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              Projets
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={`Rechercher ${activeTab === 'users' ? 'par nom, email ou rôle' : 'par titre, description ou auteur'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex-1" />
          <div className="flex gap-4">
            {activeTab === 'users' ? (
              <div>
                <label htmlFor="roleFilter" className="mr-2 text-sm text-gray-600">Filtrer par rôle :</label>
                <select
                  id="roleFilter"
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {ROLE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label htmlFor="categoryFilter" className="mr-2 text-sm text-gray-600">Filtrer par catégorie :</label>
                <select
                  id="categoryFilter"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="sortByDate" className="mr-2 text-sm text-gray-600">Trier par date :</label>
              <select
                id="sortByDate"
                value={sortByDate}
                onChange={e => setSortByDate(e.target.value as 'asc' | 'desc')}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="desc">Plus récent</option>
                <option value="asc">Plus ancien</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'users' ? (
          /* Table des utilisateurs */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Utilisateurs ({filteredUsers.length})
              </h2>
            </div>
            
            {loadingUsers ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date d'inscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.profilepicture || '/lovable-uploads/logo2.png'}
                              alt=""
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(user.createdat), 'dd/MM/yyyy', { locale: fr })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.disabled === 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.disabled === 0 ? 'Actif' : 'Désactivé'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link to={`/profile/${user.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              onClick={() => toggleUserStatus(user.id, user.disabled)}
                              variant={user.disabled === 0 ? "destructive" : "default"}
                              size="sm"
                            >
                              {user.disabled === 0 ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Table des projets */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Projets ({filteredProjects.length})
              </h2>
            </div>
            
            {loadingProjects ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Projet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Auteur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date de création
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {project.title}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-2">
                              {project.description.length > 100 
                                ? `${project.description.substring(0, 100)}...` 
                                : project.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            {categoryDisplayMapping[project.category as keyof typeof categoryDisplayMapping] || project.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {project.authorName || 'Auteur inconnu'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(project.createdAt), 'dd/MM/yyyy', { locale: fr })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            project.verified === 1 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.verified === 1 ? 'Validé' : 'En attente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              onClick={() => navigate(`/projects?highlight=${project.id}`)}
                              variant="outline"
                              size="sm"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => toggleProjectVerification(project.id, project.verified)}
                              variant={project.verified === 1 ? "destructive" : "default"}
                              size="sm"
                            >
                              {project.verified === 1 ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminUsers; 