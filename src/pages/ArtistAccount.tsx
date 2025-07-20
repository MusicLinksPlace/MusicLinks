import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import AccountTabs from '@/components/profile/AccountTabs';
import ConversationList from '@/components/profile/ConversationList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { LocationFilter } from '@/components/ui/LocationFilter';
import ImageCropper from '@/components/ui/ImageCropper';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { MUSIC_STYLES } from '@/lib/constants';
import UserProfileHeader from '@/components/profile/UserProfileHeader';
import UserAboutSection from '@/components/profile/UserAboutSection';
import UserTags from '@/components/profile/UserTags';
import SocialLinks from '@/components/profile/SocialLinks';
import UserPortfolio from '@/components/profile/UserPortfolio';
import { getImageUrlWithCacheBust } from '@/lib/utils';

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
  price?: number | null;
  serviceDescription?: string | null;
  galleryVideo?: string | null;
}

const ArtistAccount = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [cropperConfig, setCropperConfig] = useState<{
    file: File;
    type: 'profile' | 'gallery';
    index?: number;
  } | null>(null);
  const [formData, setFormData] = useState<UserProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<'profil' | 'activite' | 'messages'>('profil');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        console.log('[LOAD] User data loaded:', userData);
        console.log('[LOAD] galleryVideo from DB:', userData.galleryVideo);
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
    console.log('[SUBMIT] Form submitted');
    console.log('[SUBMIT] formData.id:', formData?.id);
    
    if (!formData?.id) {
      console.log('[SUBMIT] No formData.id, returning');
      return;
    }
    
    setIsSaving(true);
    try {
      const formUpdates = { ...formData };
      console.log('[SUBMIT] Starting form update...');
      
      // Clean up data for submission - garder galleryVideo
      const { id, createdat, email, role, verified, disabled, ...updateData } = formUpdates;
      console.log('[SUBMIT] Data to update in DB:', updateData);
      console.log('[SUBMIT] galleryVideo in updateData:', updateData.galleryVideo);
      
      // Update the user profile in the DB
      console.log('[DB UPDATE] Starting database update...');
      console.log('[DB UPDATE] User ID:', id);
      console.log('[DB UPDATE] Update data:', updateData);
      
      const { data: updatedUser, error: updateError } = await supabase
        .from('User')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('[DB UPDATE] Database update error:', updateError);
        throw updateError;
      }
      
      console.log('[DB UPDATE] Database updated successfully');
      console.log('[DB UPDATE] Updated user data:', updatedUser);
      console.log('[DB UPDATE] galleryVideo in updated user:', updatedUser?.galleryVideo);
      
      setFormData(updatedUser);
      localStorage.setItem('musiclinks_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('auth-change'));
      toast({ title: "Profil mis à jour !", description: "Vos modifications ont été enregistrées." });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSocialLinkChange = (index: number, value: string) => {
    const newLinks = [...(formData?.social_links || [])];
    newLinks[index] = value;
    setFormData(prev => ({ ...prev, social_links: newLinks }));
  };

  const addSocialLink = () => {
    const newLinks = [...(formData?.social_links || []), ''];
    setFormData(prev => ({ ...prev, social_links: newLinks }));
  };

  const removeSocialLink = (index: number) => {
    const newLinks = formData?.social_links?.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, social_links: newLinks }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, galleryIndex?: number) => {
    const file = e.target.files?.[0];
    console.log('[FILE CHANGE] File selected:', file);
    console.log('[FILE CHANGE] File type:', file?.type);
    console.log('[FILE CHANGE] File name:', file?.name);
    console.log('[FILE CHANGE] Gallery index:', galleryIndex);
    
    if (!file) {
      console.log('[FILE CHANGE] No file selected');
      return;
    }

    // Si c'est une vidéo, utiliser le bucket user-videos
    if (file.type.startsWith('video/')) {
      console.log('[FILE CHANGE] Video detected, setting galleryVideo_file');
      setFormData(prev => ({ ...prev, galleryVideo_file: file }));
      return;
    }

    // Pour les images, utiliser le bucket avatars
    if (galleryIndex !== undefined) {
      console.log('[FILE CHANGE] Gallery image detected, setting gallery_file_' + galleryIndex);
      setFormData(prev => ({ ...prev, [`gallery_file_${galleryIndex}`]: file }));
    } else {
      console.log('[FILE CHANGE] Profile picture detected');
      setFormData(prev => ({ ...prev, profilepicture_file: file }));
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!cropperConfig) return;
    
    // Créer un nouveau fichier avec le blob recadré
    const croppedFile = new File([croppedBlob], cropperConfig.file.name, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
    
    const key = cropperConfig.type === 'gallery' && cropperConfig.index !== undefined 
      ? `gallery_${cropperConfig.index}` 
      : 'profile';
    
    // Preview immédiat
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      if (cropperConfig.type === 'gallery' && cropperConfig.index !== undefined) {
        const newGallery = [...(formData?.galleryimages || [])];
        newGallery[cropperConfig.index] = imageUrl;
        setFormData((prev: any) => ({ ...prev, galleryimages: newGallery }));
      } else {
        setFormData((prev: any) => ({ ...prev, profilepicture: imageUrl }));
      }
    };
    reader.readAsDataURL(croppedFile);
    
    // Fermer le cropper
    setShowCropper(false);
    setCropperConfig(null);
    
    // Si c'est une photo de profil, sauvegarder immédiatement
    if (cropperConfig.type === 'profile') {
      setIsSaving(true);
      try {
        console.log('[UPLOAD PROFILE] Starting immediate profile picture upload...');
        
        // Utiliser le bucket 'avatars'
        const bucket = 'avatars';
        
        // Sanitize filename
        const sanitizedFileName = croppedFile.name
          .replace(/[^a-zA-Z0-9.-]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');
        
        const filePath = `${formData?.id}/${Date.now()}_${sanitizedFileName}`;
        
        console.log(`[UPLOAD PROFILE] Uploading to bucket: ${bucket}, path: ${filePath}`);
        
        const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, croppedFile, {
            cacheControl: '3600',
            upsert: true,
        });
        
        if (uploadError) {
          console.error('[UPLOAD PROFILE] Upload error:', uploadError);
          throw new Error(`Erreur d'upload: ${uploadError.message}`);
        }
        
        console.log('[UPLOAD PROFILE] Upload successful');
        
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
        console.log('[UPLOAD PROFILE] Public URL:', publicUrl);
        
        // Mettre à jour la base de données
        const { data: updatedUser, error: updateError } = await supabase
          .from('User')
          .update({ profilepicture: publicUrl })
          .eq('id', formData?.id)
          .select()
          .single();
          
        if (updateError) {
          console.error('[UPLOAD PROFILE] Database update error:', updateError);
          throw updateError;
        }
        
        console.log('[UPLOAD PROFILE] Database updated successfully');
        
        // Mettre à jour le state et le localStorage
        setFormData(updatedUser);
        localStorage.setItem('musiclinks_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('auth-change'));
        
        toast({ title: "Photo de profil mise à jour !", description: "Votre nouvelle photo a été sauvegardée." });
      } catch (error: any) {
        console.error("Error updating profile picture:", error);
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      } finally {
        setIsSaving(false);
      }
    } else {
      // Pour les images de galerie, ajouter au filesToUpload pour sauvegarde lors du submit
      setFormData(prev => ({ ...prev, [key]: croppedFile }));
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCropperConfig(null);
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('[VIDEO CHANGE] File selected:', file);
    console.log('[VIDEO CHANGE] File type:', file?.type);
    console.log('[VIDEO CHANGE] File name:', file?.name);
    console.log('[VIDEO CHANGE] File size:', file?.size);
    console.log('[VIDEO CHANGE] User ID:', formData?.id);
    
    if (!file) {
      console.log('[VIDEO CHANGE] No file selected');
      return;
    }

    if (!file.type.startsWith('video/')) {
      console.log('[VIDEO CHANGE] Not a video file');
      toast({ title: "Erreur", description: "Veuillez sélectionner un fichier vidéo", variant: "destructive" });
      return;
    }

    if (!formData?.id) {
      console.log('[VIDEO CHANGE] No user ID available');
      toast({ title: "Erreur", description: "ID utilisateur non disponible", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      console.log('[VIDEO UPLOAD] Starting video upload...');
      
      // Utiliser le bucket 'user-videos'
      const bucket = 'user-videos';
      
      // Créer le nom de fichier
      const fileExt = file.name.split('.').pop();
      const filePath = `video_${formData?.id}_${Date.now()}.${fileExt}`;
      
      console.log(`[VIDEO UPLOAD] Uploading to bucket: ${bucket}, path: ${filePath}`);
      console.log(`[VIDEO UPLOAD] File size: ${file.size} bytes`);
      
      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
      });
      
      if (uploadError) {
        console.error('[VIDEO UPLOAD] Upload error:', uploadError);
        throw new Error(`Erreur d'upload: ${uploadError.message}`);
      }
      
      console.log('[VIDEO UPLOAD] Upload to bucket successful');
      
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      console.log('[VIDEO UPLOAD] Public URL:', publicUrl);
      
      // Mettre à jour la base de données
      console.log('[VIDEO DB UPDATE] Starting database update...');
      console.log('[VIDEO DB UPDATE] User ID:', formData?.id);
      console.log('[VIDEO DB UPDATE] Video URL to save:', publicUrl);
      
      const { data: updatedUser, error: updateError } = await supabase
        .from('User')
        .update({ galleryVideo: publicUrl })
        .eq('id', formData?.id)
        .select()
        .single();
        
      if (updateError) {
        console.error('[VIDEO DB UPDATE] Database update error:', updateError);
        throw updateError;
      }
      
      console.log('[VIDEO DB UPDATE] Database updated successfully');
      console.log('[VIDEO DB UPDATE] Updated user data:', updatedUser);
      console.log('[VIDEO DB UPDATE] galleryVideo in updated user:', updatedUser?.galleryVideo);
      
      // Vérifier que la mise à jour a bien eu lieu
      if (updatedUser?.galleryVideo !== publicUrl) {
        console.error('[VIDEO DB UPDATE] galleryVideo not properly updated!');
        console.error('[VIDEO DB UPDATE] Expected:', publicUrl);
        console.error('[VIDEO DB UPDATE] Got:', updatedUser?.galleryVideo);
        throw new Error('La mise à jour de la base de données a échoué');
      }
      
      console.log('[VIDEO DB UPDATE] Video URL successfully saved to database');
      
      // Mettre à jour le state et le localStorage
      setFormData(updatedUser);
      localStorage.setItem('musiclinks_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('auth-change'));
      
      toast({ title: "Vidéo mise à jour !", description: "Votre vidéo a été sauvegardée." });
    } catch (error: any) {
      console.error("[VIDEO UPLOAD] Error uploading video:", error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const locationTrigger = (
     <Button 
        type="button"
        variant="outline" 
        className="w-full justify-start text-left font-normal"
    >
        {formData?.location || "Sélectionnez votre localisation"}
    </Button>
  );

  const locationContent = (
    <LocationFilter 
        selectedLocation={formData?.location || null}
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
                      <Label htmlFor="price">Prix (à partir de)</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="price" 
                          name="price" 
                          type="number" 
                          min="0" 
                          step="100"
                          value={formData.price || ''} 
                          onChange={handleInputChange} 
                          placeholder="0" 
                        />
                        <span className="text-gray-600 font-medium">€</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Indiquez votre tarif de base pour vos prestations</p>
                  </div>
                   <div>
                      <Label htmlFor="serviceDescription">Description du service proposé</Label>
                      <Textarea 
                        id="serviceDescription" 
                        name="serviceDescription" 
                        value={formData.serviceDescription || ''} 
                        onChange={handleInputChange} 
                        placeholder="Décrivez en détail les services que vous proposez, vos conditions, votre approche..." 
                        rows={4} 
                      />
                      <p className="text-sm text-gray-500 mt-1">Précisez ce que vous offrez et comment vous travaillez</p>
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
                      <img src={getImageUrlWithCacheBust(formData.profilepicture)} alt="Avatar" className="w-20 h-20 rounded-full object-cover bg-gray-200"/>
                      <Input id="profilepicture_file" name="profilepicture_file" type="file" onChange={handleFileChange} className="max-w-xs"/>
                    </div>
                  </div>
                  {/* Gallery Images */}
                  <div className="space-y-2">
                    <Label>Images de présentation</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[0, 1, 2, 3].map(index => (
                        <div key={index} className="space-y-2">
                          <img src={getImageUrlWithCacheBust(formData.galleryimages?.[index])} alt={`Gallery image ${index + 1}`} className="w-full h-24 rounded-md object-cover bg-gray-200"/>
                          <Input id={`gallery_file_${index}`} name={`gallery_file_${index}`} type="file" onChange={(e) => handleFileChange(e, index)} className="text-sm"/>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* --- Vidéo --- */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold border-b pb-2">Vidéo de présentation</h2>
                  <div className="space-y-2">
                    <Label>Vidéo (MP4, WebM, MOV)</Label>
                    <div className="flex items-center gap-4">
                      {formData.galleryVideo ? (
                        <div className="flex items-center gap-2">
                          <video 
                            src={formData.galleryVideo} 
                            className="w-32 h-20 object-cover rounded bg-gray-200"
                            controls
                          />
                          <span className="text-sm text-gray-600">Vidéo actuelle</span>
                        </div>
                      ) : (
                        <div className="w-32 h-20 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-sm text-gray-500">Aucune vidéo</span>
                        </div>
                      )}
                      <Input 
                        id="galleryVideo_file" 
                        name="galleryVideo_file" 
                        type="file" 
                        accept="video/*"
                        onChange={handleVideoChange} 
                        className="max-w-xs"
                        disabled={isSaving}
                      />
                    </div>
                    <p className="text-sm text-gray-500">Ajoutez une vidéo de présentation pour votre profil</p>
                    {isSaving && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Upload en cours...
                      </div>
                    )}
                  </div>
                </div>

                {/* --- Social Links --- */}
                {(formData.social_links && formData.social_links.length > 0) && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold border-b pb-2">Réseaux Sociaux</h2>
                    {formData.social_links.map((link, index) => (
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
                    {formData.social_links.length < 5 && (
                    <Button variant="outline" size="sm" onClick={addSocialLink} type="button">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Ajouter un lien
                    </Button>
                  )}
                </div>
                )}

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
      
      {/* Image Cropper Modal - Only for profile pictures */}
      {showCropper && cropperConfig && cropperConfig.type === 'profile' && (
        <ImageCropper
          imageFile={cropperConfig.file}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          title="Recadrer votre photo de profil"
        />
      )}
    </>
  );
};

export default ArtistAccount; 