import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import { Loader2, Upload, Trash2, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MUSIC_STYLES } from '@/lib/constants';
import UserProfileHeader from '@/components/profile/UserProfileHeader';
import UserAboutSection from '@/components/profile/UserAboutSection';
import UserTags from '@/components/profile/UserTags';
import SocialLinks from '@/components/profile/SocialLinks';
import UserPortfolio from '@/components/profile/UserPortfolio';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LocationFilter } from '@/components/ui/LocationFilter';
import AccountTabs from '@/components/profile/AccountTabs';
import ConversationList from '@/components/profile/ConversationList';

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  subCategory?: string | null;
  location?: string | null;
  bio?: string | null;
  profilepicture?: string | null;
  galleryimages?: string[] | null;
  portfolio_url?: string | null;
  social_links?: (string | null)[] | null;
  createdat: string;
  musicStyle?: string | null;
  verified: number;
  disabled: number;
}

const ArtistAccount = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfileData>>({});
  const [filesToUpload, setFilesToUpload] = useState<{ [key: string]: File }>({});
  const [activeTab, setActiveTab] = useState<'profil' | 'activite' | 'messages'>('profil');

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = localStorage.getItem('musiclinks_user');
      if (!storedUser) {
        navigate('/login');
        return;
      }

      const { id, role } = JSON.parse(storedUser);
      if (role !== 'artist') {
        navigate('/');
        return;
      }

      try {
        const { data: userData, error } = await supabase
          .from('User')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setFormData(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        toast({ title: "Erreur", description: "Impossible de charger les données du profil.", variant: "destructive" });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (location: string) => {
    setFormData(prev => ({ ...prev, location }));
    setIsLocationOpen(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;
    setIsSaving(true);

    try {
      const formUpdates = { ...formData };
      
      // 1. Handle File Uploads
      for (const key in filesToUpload) {
        const file = filesToUpload[key];
        const isGalleryUpload = key.startsWith('gallery');
        
        const bucket = isGalleryUpload ? 'gallery' : 'avatars';
        
        // Construct the file path based on RLS policies
        const filePath = isGalleryUpload 
          ? `gallery_0/${formData.id}/${file.name}` // Path for gallery: gallery_0/user_id/file_name
          : `${formData.id}/${Date.now()}_${file.name}`; // Path for avatars: user_id/timestamp_file_name

        console.log(`[Upload] Attempting to upload to bucket: "${bucket}", path: "${filePath}"`);

        const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
            cacheControl: '3600',
            upsert: true, // Allows overwriting if file name is the same
        });

        if (uploadError) throw new Error(`Erreur d'upload (${key}): ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);

        if (isGalleryUpload) {
          const index = parseInt(key.split('_')[1]);
          if (!formUpdates.galleryimages) formUpdates.galleryimages = [];
          formUpdates.galleryimages[index] = publicUrl;
        } else {
          formUpdates.profilepicture = publicUrl;
        }
      }

      // 2. Clean up data for submission
      const { id, createdat, email, role, verified, disabled, ...updateData } = formUpdates;

      // 3. Update the user profile in the DB
      const { data: updatedUser, error: updateError } = await supabase
        .from('User')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // 4. Update local state and notify
      setFormData(updatedUser);
      localStorage.setItem('musiclinks_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('auth-change'));
      setFilesToUpload({}); // Clear upload queue
      toast({ title: "Profil mis à jour !", description: "Vos modifications ont été enregistrées." });

    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSocialLinkChange = (index: number, value: string) => {
    const newLinks = [...(formData.social_links || [])];
    newLinks[index] = value;
    setFormData(prev => ({ ...prev, social_links: newLinks }));
  };

  const addSocialLink = () => {
    const newLinks = [...(formData.social_links || []), ''];
    setFormData(prev => ({ ...prev, social_links: newLinks }));
  };

  const removeSocialLink = (index: number) => {
    const newLinks = formData.social_links?.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, social_links: newLinks }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, galleryIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { name } = e.target;
    // For gallery images, we create a unique key like 'gallery_0', 'gallery_1', etc.
    const key = galleryIndex !== undefined ? `gallery_${galleryIndex}` : 'profile';
    
    setFilesToUpload(prev => ({ ...prev, [key]: file }));

    // Optional: Preview the image locally before upload
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      if (galleryIndex !== undefined) {
        const newGallery = [...(formData.galleryimages || [])];
        newGallery[galleryIndex] = imageUrl;
        setFormData(prev => ({ ...prev, galleryimages: newGallery }));
      } else {
        setFormData(prev => ({ ...prev, profilepicture: imageUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const locationTrigger = (
     <Button 
        type="button"
        variant="outline" 
        className="w-full justify-start text-left font-normal"
    >
        {formData.location || "Sélectionnez votre localisation"}
    </Button>
  );

  const locationContent = (
    <LocationFilter 
        selectedLocation={formData.location || null}
        onLocationChange={handleLocationSelect}
    />
  );

  if (isLoading || !formData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <Header />
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 mt-20" />
          <p className="mt-4">Chargement de votre compte...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-gray-100 min-h-screen py-8 sm:py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <AccountTabs activeTab={activeTab} setActiveTab={(tab) => setActiveTab(tab as 'profil' | 'activite' | 'messages')}>
            {activeTab === 'profil' && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl flex flex-col p-6 gap-8">
                <h1 className="text-2xl font-bold text-gray-800">Mon Compte</h1>
                
                {/* --- General Information --- */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold border-b pb-2">Informations Générales</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">Nom / Nom de scène</Label>
                        <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} />
                    </div>
                    <div>
                        <Label htmlFor="location">Ville</Label>
                        {isMobile ? (
                          <Drawer open={isLocationOpen} onOpenChange={setIsLocationOpen}>
                              <DrawerTrigger asChild>{locationTrigger}</DrawerTrigger>
                              <DrawerContent className="h-[95vh] top-0 mt-0">
                                  <DrawerHeader className="text-left">
                                      <DrawerTitle className="text-2xl font-bold">Où êtes-vous basé ?</DrawerTitle>
                                  </DrawerHeader>
                                  <div className="px-2 overflow-y-auto">
                                      {locationContent}
                                  </div>
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
                  </div>
                   <div>
                      <Label htmlFor="bio">Biographie</Label>
                      <Textarea id="bio" name="bio" value={formData.bio || ''} onChange={handleInputChange} placeholder="Parlez de vous, de votre musique..." rows={5}/>
                  </div>
                   <div>
                      <Label htmlFor="musicStyle">Style musical principal</Label>
                      <Select name="musicStyle" onValueChange={(value) => handleSelectChange('musicStyle', value)} value={formData.musicStyle || ''}>
                        <SelectTrigger><SelectValue placeholder="Sélectionnez votre style..." /></SelectTrigger>
                        <SelectContent>
                          {MUSIC_STYLES.map((style) => (
                            <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>
                </div>

                {/* --- Skills & Links --- */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold border-b pb-2">Liens</h2>
                  <div>
                    <Label htmlFor="portfolio_url">Lien Portfolio / Site web</Label>
                    <Input id="portfolio_url" name="portfolio_url" value={formData.portfolio_url || ''} onChange={handleInputChange} placeholder="https://votresite.com"/>
                  </div>
                </div>

                {/* --- Images --- */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold border-b pb-2">Images du Profil</h2>
                  {/* Profile Picture */}
                  <div className="space-y-2">
                    <Label>Photo de profil</Label>
                    <div className="flex items-center gap-4">
                      <img src={formData.profilepicture || '/placeholder.svg'} alt="Avatar" className="w-20 h-20 rounded-full object-cover bg-gray-200"/>
                      <Input id="profilepicture_file" name="profilepicture_file" type="file" onChange={handleFileChange} className="max-w-xs"/>
                    </div>
                  </div>
                  {/* Gallery Images */}
                  <div className="space-y-2">
                    <Label>Images de la galerie (utilisées dans le carrousel)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[0, 1, 2, 3].map(index => (
                        <div key={index} className="space-y-2">
                          <img src={formData.galleryimages?.[index] || '/placeholder.svg'} alt={`Gallery image ${index + 1}`} className="w-full h-24 rounded-md object-cover bg-gray-200"/>
                          <Input id={`gallery_file_${index}`} name={`gallery_file_${index}`} type="file" onChange={(e) => handleFileChange(e, index)} className="text-sm"/>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* --- Social Links --- */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold border-b pb-2">Réseaux Sociaux</h2>
                  {formData.social_links?.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input 
                        value={link || ''} 
                        onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                        placeholder="https://soundcloud.com/artiste"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeSocialLink(index)} className="hover:bg-red-100">
                        <Trash2 className="h-4 w-4 text-red-500"/>
                      </Button>
                    </div>
                  ))}
                  {(!formData.social_links || formData.social_links.length < 5) && (
                    <Button variant="outline" size="sm" onClick={addSocialLink} type="button">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Ajouter un lien
                    </Button>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        Enregistrer les modifications
                    </Button>
                </div>
              </form>
            )}
            {activeTab === 'activite' && (
              <div className="bg-white rounded-2xl shadow-xl p-6 text-center text-gray-400">Historique d'activité à venir…</div>
            )}
            {activeTab === 'messages' && (
              <ConversationList />
            )}
          </AccountTabs>
        </div>
      </div>
    </>
  );
};

export default ArtistAccount; 