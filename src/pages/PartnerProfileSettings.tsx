// Page de paramètres de profil spécifique aux partenaires

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import { Loader2, Trash2, PlusCircle, Mail, Pencil, User, Music, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LocationFilter } from '@/components/ui/LocationFilter';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MUSIC_STYLES } from '@/lib/constants';
import AccountTabs from '@/components/profile/AccountTabs';
import ConversationList from '@/components/profile/ConversationList';
import ImageCropper from '@/components/ui/ImageCropper';
import MobileTabs from '@/components/ui/MobileTabs';
import { getImageUrlWithCacheBust } from '@/lib/utils';

const PARTNER_SUBCATEGORIES = [
  { id: 'label', label: 'Label / Maison de disque' },
  { id: 'manager', label: 'Manager / Directeur artistique' },
];

const PartnerProfileSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [filesToUpload, setFilesToUpload] = useState<{ [key: string]: File }>({});
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profil' | 'activite' | 'messages'>('profil');

  // Configuration des tabs pour mobile
  const tabs = [
    { id: 'profil', label: 'Profil', icon: <User className="w-4 h-4" /> },
    { id: 'activite', label: 'Activité', icon: <Music className="w-4 h-4" /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> }
  ];
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [cropperConfig, setCropperConfig] = useState<{
    file: File;
    type: 'profile' | 'gallery';
    index?: number;
  } | null>(null);

  // Ajout pour upload photo de profil depuis le header
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const handleProfilePicClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = localStorage.getItem('musiclinks_user');
      if (!storedUser) {
        navigate('/login');
        return;
      }
      const { id, role } = JSON.parse(storedUser);
      if (role !== 'partner') {
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
        // Préselectionner la sous-catégorie si déjà choisi
        if (userData.subCategory) {
          const found = PARTNER_SUBCATEGORIES.find(s => s.id === userData.subCategory);
          if (found) setSelectedSubCategory(userData.subCategory);
        }
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
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (location: string) => {
    setFormData((prev: any) => ({ ...prev, location }));
    setIsLocationOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, galleryIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Ouvrir le cropper
    setCropperConfig({
      file,
      type: galleryIndex !== undefined ? 'gallery' : 'profile',
      index: galleryIndex
    });
    setShowCropper(true);
    
    // Reset l'input
    e.target.value = '';
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    if (!cropperConfig) return;
    
    // Créer un nouveau fichier avec le blob recadré
    const croppedFile = new File([croppedBlob], cropperConfig.file.name, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
    
    const key = cropperConfig.type === 'gallery' && cropperConfig.index !== undefined 
      ? `gallery_${cropperConfig.index}` 
      : 'profile';
    
    setFilesToUpload(prev => ({ ...prev, [key]: croppedFile }));
    
    // Preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      if (cropperConfig.type === 'gallery' && cropperConfig.index !== undefined) {
        const newGallery = [...(formData.galleryimages || [])];
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
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCropperConfig(null);
  };

  const handleSocialLinkChange = (index: number, value: string) => {
    const newLinks = [...(formData.social_links || [])];
    newLinks[index] = value;
    setFormData((prev: any) => ({ ...prev, social_links: newLinks }));
  };

  const addSocialLink = () => {
    const newLinks = [...(formData.social_links || []), ''];
    setFormData((prev: any) => ({ ...prev, social_links: newLinks }));
  };

  const removeSocialLink = (index: number) => {
    const newLinks = formData.social_links?.filter((_: any, i: number) => i !== index);
    setFormData((prev: any) => ({ ...prev, social_links: newLinks }));
  };

  const handleSubCategorySelect = (subId: string) => {
    setFormData((prev: any) => ({ ...prev, subCategory: subId }));
    setSelectedSubCategory(subId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;
    setIsSaving(true);
    try {
      const formUpdates = { ...formData };
      console.log('[UPLOAD] Starting upload process...');
      console.log('[UPLOAD] Files to upload:', Object.keys(filesToUpload));
      
      // Upload files
      for (const key in filesToUpload) {
        const file = filesToUpload[key];
        console.log(`[UPLOAD] Processing file: ${key}`, file);
        
        const isGalleryUpload = key.startsWith('gallery');
        // Utiliser le bucket 'avatars' pour tout (plus simple)
        const bucket = 'avatars';
        
        // Sanitize filename to remove spaces and special characters
        const sanitizedFileName = file.name
          .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
          .replace(/_+/g, '_') // Replace multiple underscores with single
          .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
        
        const filePath = isGalleryUpload 
          ? `gallery/${formData.id}/${Date.now()}_${sanitizedFileName}`
          : `${formData.id}/${Date.now()}_${sanitizedFileName}`;
        
        console.log(`[UPLOAD] Uploading to bucket: ${bucket}, path: ${filePath}`);
        
        const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
        });
        
        if (uploadError) {
          console.error(`[UPLOAD] Upload error for ${key}:`, uploadError);
          throw new Error(`Erreur d'upload (${key}): ${uploadError.message}`);
        }
        
        console.log(`[UPLOAD] Upload successful for ${key}`);
        
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
        console.log(`[UPLOAD] Public URL for ${key}:`, publicUrl);
        
        if (isGalleryUpload) {
          const index = parseInt(key.split('_')[1]);
          if (!formUpdates.galleryimages) formUpdates.galleryimages = [];
          formUpdates.galleryimages[index] = publicUrl;
          console.log(`[UPLOAD] Updated galleryimages[${index}] with URL`);
        } else {
          formUpdates.profilepicture = publicUrl;
          console.log('[UPLOAD] Updated profilepicture with URL');
        }
      }
      
      console.log('[UPLOAD] All files uploaded, updating database...');
      
      // Clean up data for submission
      const { id, createdat, email, role, verified, disabled, ...updateData } = formUpdates;
      // Update the user profile in the DB
      const { data: updatedUser, error: updateError } = await supabase
        .from('User')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (updateError) {
        console.error('[UPLOAD] Database update error:', updateError);
        throw updateError;
      }
      
      console.log('[UPLOAD] Database updated successfully');
      
      setFormData(updatedUser);
      localStorage.setItem('musiclinks_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('auth-change'));
      setFilesToUpload({});
      toast({ title: "Profil mis à jour !", description: "Vos modifications ont été enregistrées." });
    } catch (error: any) {
      console.error("Error updating profile:", error);
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
        {formData.location || "Sélectionnez votre localisation"}
    </Button>
  );

  const locationContent = (
    <LocationFilter 
        selectedLocation={formData.location || null}
        onLocationChange={handleLocationSelect}
    />
  );

  // Calcul "actif depuis XX mois"
  function getMonthDiff(dateString?: string) {
    if (!dateString) return 0;
    const created = new Date(dateString);
    const now = new Date();
    return (
      (now.getFullYear() - created.getFullYear()) * 12 +
      (now.getMonth() - created.getMonth())
    );
  }
  const months = getMonthDiff(formData.createdat);

  const handleGalleryVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingVideo(true);
    try {
      // Génère un nom unique
      const fileExt = file.name.split('.').pop();
      const fileName = `video_${formData.id}_${Date.now()}.${fileExt}`;
      console.log('[UPLOAD VIDEO] File:', file);
      console.log('[UPLOAD VIDEO] FileName:', fileName);
      // Upload dans le bucket user-videos
      const { data, error } = await supabase.storage.from('user-videos').upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });
      console.log('[UPLOAD VIDEO] Upload result:', { data, error });
      if (error) throw error;
      // Récupère l'URL publique
      const { data: publicUrlData } = supabase.storage.from('user-videos').getPublicUrl(fileName);
      const publicUrl = publicUrlData?.publicUrl;
      console.log('[UPLOAD VIDEO] Public URL:', publicUrl);
      if (publicUrl) {
        setFormData((prev: any) => ({ ...prev, galleryVideo: publicUrl }));
        // Mets à jour dans la DB
        await supabase.from('User').update({ galleryVideo: publicUrl }).eq('id', formData.id);
      }
    } catch (err) {
      console.error('[UPLOAD VIDEO] ERROR:', err);
      alert("Erreur lors de l'upload de la vidéo.");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!formData.galleryVideo) return;
    setIsDeletingVideo(true);
    try {
      // Récupère le nom du fichier à partir de l'URL
      const urlParts = formData.galleryVideo.split('/');
      const fileName = urlParts[urlParts.length - 1];
      // Supprime du bucket
      const { error } = await supabase.storage.from('user-videos').remove([fileName]);
      if (error) throw error;
      // Supprime l'URL dans la DB
      await supabase.from('User').update({ galleryVideo: null }).eq('id', formData.id);
      setFormData((prev: any) => ({ ...prev, galleryVideo: null }));
    } catch (err) {
      alert("Erreur lors de la suppression de la vidéo.");
    } finally {
      setIsDeletingVideo(false);
    }
  };

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
      <div className="bg-gray-100 min-h-screen pb-8">
        {/* Partie haute sur fond gris */}
        <div className="flex flex-col items-center pt-10 pb-6 md:pt-16 md:pb-8 relative">
          <div className="relative group">
            <img src={getImageUrlWithCacheBust(formData.profilepicture)} alt="Avatar" className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-blue-100 shadow" />
            <button type="button" onClick={handleProfilePicClick} className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow group-hover:scale-110 transition-transform border border-gray-200">
              <Pencil className="w-5 h-5 text-blue-600" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
          </div>
          <div className="mt-3 md:mt-5 text-xl md:text-2xl font-bold text-gray-900">{formData.name}</div>
          <div className="flex items-center gap-2 text-gray-500 text-sm md:text-base mt-1">
            <Mail className="w-4 h-4" />
            <span>{formData.email}</span>
          </div>
          <div className="mt-1 md:mt-2 text-blue-600 font-semibold text-sm md:text-base">Compte actif depuis {months} mois</div>
        </div>
        {/* Toggle onglets */}
        <div className="flex justify-center mt-2 mb-4 md:mt-4 md:mb-8">
          {/* Version mobile */}
          <MobileTabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
          
          {/* Version desktop */}
          <div className="hidden md:block">
            <ToggleGroup type="single" value={activeTab} onValueChange={v => v && setActiveTab(v as any)} className="bg-white rounded-full shadow p-1 md:p-2">
              <ToggleGroupItem value="profil" className="px-5 py-2 md:px-8 md:py-3 text-base md:text-lg font-semibold data-[state=on]:bg-blue-600 data-[state=on]:text-white rounded-full">Profil</ToggleGroupItem>
              <ToggleGroupItem value="activite" className="px-5 py-2 md:px-8 md:py-3 text-base md:text-lg font-semibold data-[state=on]:bg-blue-600 data-[state=on]:text-white rounded-full">Activité</ToggleGroupItem>
              <ToggleGroupItem value="messages" className="px-5 py-2 md:px-8 md:py-3 text-base md:text-lg font-semibold data-[state=on]:bg-blue-600 data-[state=on]:text-white rounded-full">Messages</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        {/* Contenu des onglets */}
        <div className="container mx-auto px-2 md:px-0 max-w-2xl md:max-w-3xl lg:max-w-4xl mt-2">
          {activeTab === 'profil' && (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl flex flex-col p-6 md:p-10 gap-8 md:gap-10 mt-2">
              {/* Name */}
              <div>
                <Label htmlFor="name" className="md:text-lg">Nom</Label>
                <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} className="md:h-12 md:text-lg" />
              </div>
              {/* Ville */}
              <div>
                <Label htmlFor="location" className="md:text-lg">Ville</Label>
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
              {/* Bio */}
              <div>
                <Label htmlFor="bio" className="md:text-lg">Biographie</Label>
                <Textarea id="bio" name="bio" value={formData.bio || ''} onChange={handleInputChange} placeholder="Parlez de vous, de votre activité..." rows={5} className="md:text-lg md:h-32"/>
              </div>
              {/* Réseaux sociaux */}
              <div>
                <Label className="md:text-lg">Réseaux Sociaux</Label>
                {formData.social_links?.map((link: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 mt-2">
                    <Input 
                      value={link || ''} 
                      onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                      placeholder="https://soundcloud.com/prestataire"
                      className="md:h-12 md:text-lg"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeSocialLink(index)} className="hover:bg-red-100">
                      <Trash2 className="h-4 w-4 text-red-500"/>
                    </Button>
                  </div>
                ))}
                {(!formData.social_links || formData.social_links.length < 5) && (
                  <div className="mt-2">
                    <Button variant="outline" size="sm" onClick={addSocialLink} type="button" className="md:h-12 md:text-lg">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Ajouter un lien
                    </Button>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="submit" disabled={isSaving} className="md:h-12 md:text-lg md:px-8">
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          )}
          {activeTab === 'activite' && (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl flex flex-col p-6 md:p-10 gap-8 md:gap-10 mt-2">
              {/* Prestation (dropdown) */}
              <div>
                                  <Label htmlFor="subCategory" className="md:text-lg">Type d'organisation</Label>
                <Select value={selectedSubCategory || ''} onValueChange={handleSubCategorySelect}>
                  <SelectTrigger id="subCategory" className="md:h-12 md:text-lg">
                    <SelectValue placeholder="Choisissez votre type d'organisation" />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTNER_SUBCATEGORIES.map(opt => (
                      <SelectItem key={opt.id} value={opt.id} className="md:text-lg">{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Portfolio */}
              <div>
                <Label htmlFor="portfolio_url" className="md:text-lg">Lien Portfolio / Site web</Label>
                <Input id="portfolio_url" name="portfolio_url" value={formData.portfolio_url || ''} onChange={handleInputChange} placeholder="https://votresite.com" className="md:h-12 md:text-lg"/>
              </div>
              {/* Styles musicaux (dropdown) */}
              <div>
                <Label htmlFor="musicStyle" className="md:text-lg">Style musical</Label>
                <Select value={formData.musicStyle || ''} onValueChange={val => setFormData((prev: any) => ({ ...prev, musicStyle: val }))}>
                  <SelectTrigger id="musicStyle" className="md:h-12 md:text-lg">
                    <SelectValue placeholder="Sélectionnez votre style musical" />
                  </SelectTrigger>
                  <SelectContent>
                    {MUSIC_STYLES.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="md:text-lg">{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Images */}
              <div>
                <Label className="md:text-lg">Images de la galerie (utilisées dans le carrousel)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {[0, 1, 2, 3].map(index => (
                    <div key={index} className="space-y-2">
                      <img src={formData.galleryimages?.[index] || '/placeholder.svg'} alt={`Gallery image ${index + 1}`} className="w-full h-24 md:h-32 rounded-md object-cover bg-gray-200"/>
                      <Input id={`gallery_file_${index}`} name={`gallery_file_${index}`} type="file" onChange={(e) => handleFileChange(e, index)} className="text-sm md:h-10 md:text-base"/>
                    </div>
                  ))}
                </div>
              </div>
              {/* Vidéo galerie */}
              <div className="mt-6">
                <Label className="md:text-lg">Vidéo de présentation (optionnelle)</Label>
                {formData.galleryVideo && (
                  <div className="mt-2">
                    <video controls controlsList="nodownload" className="w-full max-w-md rounded-lg shadow">
                      <source src={formData.galleryVideo} type="video/mp4" />
                      Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-gray-500 hover:text-red-500 flex items-center gap-2"
                      onClick={handleDeleteVideo}
                      disabled={isDeletingVideo}
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeletingVideo ? 'Suppression en cours...' : 'Supprimer la vidéo'}
                    </Button>
                  </div>
                )}
                <Input id="galleryVideo" name="galleryVideo" type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleGalleryVideoChange} className="mt-2 text-sm md:h-10 md:text-base"/>
                {isUploadingVideo && <div className="text-blue-600 mt-2">Upload en cours... Veuillez attendre la fin de l'upload avant d'enregistrer.</div>}
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="submit" disabled={isSaving || isUploadingVideo} className="md:h-12 md:text-lg md:px-8">
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          )}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 mt-2">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Mes Conversations</h2>
                <p className="text-gray-600">Historique de toutes vos conversations</p>
              </div>
              <ConversationList />
            </div>
          )}
        </div>
      </div>
      
      {/* Image Cropper Modal */}
      {showCropper && cropperConfig && (
        <ImageCropper
          imageFile={cropperConfig.file}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          title={cropperConfig.type === 'profile' 
            ? 'Recadrer votre photo de profil' 
            : `Recadrer l'image ${cropperConfig.index !== undefined ? cropperConfig.index + 1 : ''} de la galerie`
          }
        />
      )}
    </>
  );
};

export default PartnerProfileSettings; 