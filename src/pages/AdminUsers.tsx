import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAdmin } from '@/hooks/use-admin';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Edit, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
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

const AdminUsers = () => {
  const { isAdmin, loading, requireAdmin } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortByDate, setSortByDate] = useState<'asc' | 'desc'>('desc');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortByRole, setSortByRole] = useState<'asc' | 'desc'>('asc');

  const ROLE_OPTIONS = [
    { label: 'Tous', value: 'all' },
    { label: 'Artiste', value: 'artist' },
    { label: 'Prestataire', value: 'provider' },
    { label: 'Partenaire', value: 'partner' },
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
            Administration des Utilisateurs
          </h1>
          <p className="text-gray-600">
            Gérez les comptes utilisateurs et leurs statuts
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, email ou rôle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filtre par rôle */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex-1" />
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
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.disabled === 0).length}
            </div>
            <div className="text-sm text-gray-600">Utilisateurs actifs</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.disabled === 1).length}
            </div>
            <div className="text-sm text-gray-600">Utilisateurs désactivés</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.verified === 1).length}
            </div>
            <div className="text-sm text-gray-600">Comptes vérifiés</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.isAdmin).length}
            </div>
            <div className="text-sm text-gray-600">Administrateurs</div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Liste des utilisateurs</h2>
            {/* En-tête du tableau */}
            <div className="hidden md:grid grid-cols-3 gap-4 px-2 pb-2 text-xs font-semibold text-gray-500 border-b">
              <div className="col-span-1">Nom</div>
              <div className="flex items-center cursor-pointer select-none" onClick={() => setSortByDate(sortByDate === 'asc' ? 'desc' : 'asc')}>
                Créé le
                <span className="ml-1">{sortByDate === 'asc' ? '▲' : '▼'}</span>
              </div>
              <div className="text-right">Actions</div>
            </div>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="border rounded-lg p-4 flex flex-col md:grid md:grid-cols-3 md:gap-4 md:items-center hover:bg-gray-50 transition-colors"
                >
                  {/* Nom + avatar + email + rôle */}
                  <div className="flex items-center space-x-4 md:col-span-1">
                    <img
                      src={user.profilepicture || '/lovable-uploads/logo2.png'}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400 italic">{user.role}</div>
                    </div>
                  </div>
                  {/* Date de création */}
                  <div className="hidden md:block">
                    {user.createdat ? format(new Date(user.createdat), 'dd/MM/yyyy', { locale: fr }) : '-'}
                  </div>
                  {/* Actions */}
                  <div className="flex flex-row gap-2 mt-4 md:mt-0 md:ml-4 justify-center md:justify-end md:text-right">
                    <Link
                      to={`/profile/${user.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      Voir profil
                    </Link>
                    <Button
                      variant={user.disabled === 0 ? 'destructive' : 'default'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleUserStatus(user.id, user.disabled);
                      }}
                    >
                      {user.disabled === 0 ? 'Désactiver' : 'Activer'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminUsers; 