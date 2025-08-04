// Page de paramètres de profil spécifique aux artistes

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import { Loader2, Upload, Trash2, PlusCircle, User, Music, MessageSquare, Heart, Pencil, Mail, Video, X, Plus, AlertTriangle } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { LocationFilter } from '@/components/ui/LocationFilter';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import MobileTabs from '@/components/ui/MobileTabs';
import AccountTabs from '@/components/profile/AccountTabs';
import ConversationList from '@/components/profile/ConversationList';
import { getImageUrlWithCacheBust } from '@/lib/utils';
import ImageCropper from '@/components/ui/ImageCropper';
import LikedProfiles from '@/components/profile/LikedProfiles';
import { useIsMobile } from '@/hooks/use-mobile';
import { MUSIC_STYLES } from '@/lib/constants';
import DeleteAccountDialog from '@/components/ui/DeleteAccountDialog';

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

const ARTIST_SUBCATEGORIES = [
  { id: 'singer', label: 'Chanteur' },
  { id: 'rapper', label: 'Rappeur' },
  { id: 'musician', label: 'Musicien' },
  { id: 'composer', label: 'Compositeur' },
  { id: 'producer', label: 'Producteur' },
  { id: 'dj', label: 'DJ' },
];

const ArtistProfileSettings = () => {
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
  const [activeTab, setActiveTab] = useState<'profil' | 'activite' | 'messages' | 'likes'>('profil');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuration des tabs pour mobile
  const tabs = [
    { id: 'profil', label: 'Profil', icon: <User className="w-4 h-4" /> },
    { id: 'activite', label: 'Activité', icon: <Music className="w-4 h-4" /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'likes', label: 'Likes', icon: <Heart className="w-4 h-4" /> }
  ];

  // Ajout pour upload photo de profil depuis le header
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
        // Préselectionner la sous-catégorie si déjà choisi
        if (userData.subCategory) {
          const found = ARTIST_SUBCATEGORIES.find(s => s.id === userData.subCategory);
          if (found) setFormData((prev: any) => ({ ...prev, subCategory: userData.subCategory }));
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
    
    // Si c'est une image de galerie, l'uploader directement sans cropper
    if (galleryIndex !== undefined) {
      const key = `gallery_${galleryIndex}`;
      
      // Preview immédiat
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const newGallery = [...(formData?.galleryimages || [])];
        newGallery[galleryIndex] = imageUrl;
        setFormData((prev: any) => ({ ...prev, galleryimages: newGallery }));
      };
      reader.readAsDataURL(file);
      
      // Ajouter au filesToUpload pour sauvegarde lors du submit
      // setFilesToUpload(prev => ({ ...prev, [key]: file })); // This line was removed
    } else {
      // Pour la photo de profil, ouvrir le cropper
      setCropperConfig({
        file,
        type: 'profile',
        index: undefined
      });
      setShowCropper(true);
    }
    
    // Reset l'input
    e.target.value = '';
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
        
        // Mettre à jour le state et le localStorage (données essentielles seulement)
        setFormData(updatedUser);
        
        // Sauvegarder seulement les données essentielles pour éviter le quota localStorage
        const essentialUserData = {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          profilepicture: updatedUser.profilepicture,
          verified: updatedUser.verified,
          disabled: updatedUser.disabled
        };
        localStorage.setItem('musiclinks_user', JSON.stringify(essentialUserData));
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
      // setFilesToUpload(prev => ({ ...prev, [key]: croppedFile })); // This line was removed
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCropperConfig(null);
  };

  const handleSocialLinkChange = (index: number, value: string) => {
    const newLinks = [...(formData?.social_links || [])];
    newLinks[index] = value;
    setFormData((prev: any) => ({ ...prev, social_links: newLinks }));
  };

  const addSocialLink = () => {
    const newLinks = [...(formData?.social_links || []), ''];
    setFormData((prev: any) => ({ ...prev, social_links: newLinks }));
  };

  const removeSocialLink = (index: number) => {
    const newLinks = formData?.social_links?.filter((_: any, i: number) => i !== index);
    setFormData((prev: any) => ({ ...prev, social_links: newLinks }));
  };

  const handleSubCategorySelect = (subId: string) => {
    setFormData((prev: any) => ({ ...prev, subCategory: subId }));
    // setSelectedSubCategory(subId); // This line was removed
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData?.id) return;
    setIsSaving(true);
    try {
      const formUpdates = { ...formData };
      console.log('[UPLOAD] Starting upload process...');
      // console.log('[UPLOAD] Files to upload:', Object.keys(filesToUpload)); // This line was removed
      
      // Upload files
      // for (const key in filesToUpload) { // This loop was removed
      //   const file = filesToUpload[key];
      //   console.log(`[UPLOAD] Processing file: ${key}`, file);
        
      //   const isGalleryUpload = key.startsWith('gallery');
      //   // Utiliser le bon bucket selon le type
      //   const bucket = isGalleryUpload ? 'gallery' : 'avatars';
        
      //   // Sanitize filename to remove spaces and special characters
      //   const sanitizedFileName = file.name
      //     .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      //     .replace(/_+/g, '_') // Replace multiple underscores with single
      //     .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
        
      //   const filePath = isGalleryUpload 
      //     ? `${formData.id}/${Date.now()}_${sanitizedFileName}`
      //     : `${formData.id}/${Date.now()}_${sanitizedFileName}`;
        
      //   console.log(`[UPLOAD] Uploading to bucket: ${bucket}, path: ${filePath}`);
        
      //   const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
      //       cacheControl: '3600',
      //       upsert: true,
      //   });
        
      //   if (uploadError) {
      //     console.error(`[UPLOAD] Upload error for ${key}:`, uploadError);
      //     throw new Error(`Erreur d'upload (${key}): ${uploadError.message}`);
      //   }
        
      //   console.log(`[UPLOAD] Upload successful for ${key}`);
        
      //   const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      //   console.log(`[UPLOAD] Public URL for ${key}:`, publicUrl);
        
      //   if (isGalleryUpload) {
      //     const index = parseInt(key.split('_')[1]);
      //     if (!formUpdates.galleryimages) formUpdates.galleryimages = [];
      //     formUpdates.galleryimages[index] = publicUrl;
      //     console.log(`[UPLOAD] Updated galleryimages[${index}] with URL`);
      //   } else {
      //     formUpdates.profilepicture = publicUrl;
      //     console.log('[UPLOAD] Updated profilepicture with URL');
      //   }
      // }
      
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
      
      // Sauvegarder seulement les données essentielles pour éviter le quota localStorage
      const essentialUserData = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilepicture: updatedUser.profilepicture,
        verified: updatedUser.verified,
        disabled: updatedUser.disabled
      };
      localStorage.setItem('musiclinks_user', JSON.stringify(essentialUserData));
      window.dispatchEvent(new Event('auth-change'));
      // setFilesToUpload({}); // This line was removed
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
        {formData?.location || "Sélectionnez votre localisation"}
    </Button>
  );

  const locationContent = (
    <LocationFilter 
        selectedLocation={formData?.location || null}
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
  const months = getMonthDiff(formData?.createdat);

  const handleMediaFilesChange = (files: any[]) => {
    setMediaFiles(files);
  };

  const handleGalleryVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploadingVideo(true);
    try {
      console.log('[VIDEO UPLOAD] Starting video upload...');
      
      // Génère un nom unique
      const fileExt = file.name.split('.').pop();
      const fileName = `video_${formData?.id}_${Date.now()}.${fileExt}`;
      
      console.log('[VIDEO UPLOAD] File:', file);
      console.log('[VIDEO UPLOAD] FileName:', fileName);
      console.log('[VIDEO UPLOAD] File size:', file.size, 'bytes');
      
      // Upload dans le bucket user-videos
      const { data, error } = await supabase.storage.from('user-videos').upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });
      
      console.log('[VIDEO UPLOAD] Upload result:', { data, error });
      if (error) {
        console.error('[VIDEO UPLOAD] Upload error:', error);
        throw error;
      }
      
      console.log('[VIDEO UPLOAD] Upload to bucket successful');
      
      // Récupère l'URL publique
      const { data: publicUrlData } = supabase.storage.from('user-videos').getPublicUrl(fileName);
      const publicUrl = publicUrlData?.publicUrl;
      console.log('[VIDEO UPLOAD] Public URL:', publicUrl);
      
      if (publicUrl) {
        console.log('[VIDEO DB UPDATE] Starting database update...');
        console.log('[VIDEO DB UPDATE] User ID:', formData?.id);
        console.log('[VIDEO DB UPDATE] Video URL to save:', publicUrl);
        
        // Mets à jour dans la DB avec vérification
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
        
        // Mettre à jour le state et le localStorage (données essentielles seulement)
        setFormData(updatedUser);
        
        // Sauvegarder seulement les données essentielles pour éviter le quota localStorage
        const essentialUserData = {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          profilepicture: updatedUser.profilepicture,
          verified: updatedUser.verified,
          disabled: updatedUser.disabled
        };
        localStorage.setItem('musiclinks_user', JSON.stringify(essentialUserData));
        window.dispatchEvent(new Event('auth-change'));
        
        toast({ title: "Vidéo mise à jour !", description: "Votre vidéo a été sauvegardée." });
      } else {
        throw new Error('Impossible de récupérer l\'URL publique');
      }
    } catch (err: any) {
      console.error('[VIDEO UPLOAD] ERROR:', err);
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!formData?.galleryVideo) return;
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

  const handleDeleteProfilePicture = async () => {
    if (!formData?.profilepicture) return;
    
    try {
      console.log('[DELETE PROFILE PICTURE] Starting deletion...');
      console.log('[DELETE PROFILE PICTURE] User ID:', formData.id);
      
      // Supprime l'URL dans la DB
      const { error: updateError } = await supabase
        .from('User')
        .update({ profilepicture: null })
        .eq('id', formData.id);
      
      if (updateError) {
        console.error('[DELETE PROFILE PICTURE] Database error:', updateError);
        throw new Error(`Erreur de mise à jour: ${updateError.message}`);
      }
      
      console.log('[DELETE PROFILE PICTURE] Database updated successfully');
      
      // Met à jour le state local
      setFormData((prev: any) => ({ ...prev, profilepicture: null }));
      
      // Met à jour le localStorage (données essentielles seulement)
      const essentialUserData = {
        id: formData.id,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        profilepicture: null,
        verified: formData.verified,
        disabled: formData.disabled
      };
      localStorage.setItem('musiclinks_user', JSON.stringify(essentialUserData));
      window.dispatchEvent(new Event('auth-change'));
      
      toast({ title: "Photo supprimée !", description: "Votre photo de profil a été supprimée." });
    } catch (error: any) {
      console.error('[DELETE PROFILE PICTURE] Error:', error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteGalleryImage = async (index: number) => {
    if (!formData?.galleryimages?.[index]) return;
    
    try {
      console.log('[DELETE GALLERY IMAGE] Starting deletion...');
      console.log('[DELETE GALLERY IMAGE] User ID:', formData.id);
      console.log('[DELETE GALLERY IMAGE] Image index:', index);
      
      // Créer une nouvelle liste d'images sans l'image à supprimer
      const newGalleryImages = [...(formData.galleryimages || [])];
      newGalleryImages[index] = null;
      
      // Supprime l'URL dans la DB
      const { error: updateError } = await supabase
        .from('User')
        .update({ galleryimages: newGalleryImages })
        .eq('id', formData.id);
      
      if (updateError) {
        console.error('[DELETE GALLERY IMAGE] Database error:', updateError);
        throw new Error(`Erreur de mise à jour: ${updateError.message}`);
      }
      
      console.log('[DELETE GALLERY IMAGE] Database updated successfully');
      
      // Met à jour le state local
      setFormData((prev: any) => ({ ...prev, galleryimages: newGalleryImages }));
      
      toast({ title: "Image supprimée !", description: "L'image de galerie a été supprimée." });
    } catch (error: any) {
      console.error('[DELETE GALLERY IMAGE] Error:', error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteAccount = async () => {
    if (!formData) return;
    
    setIsDeletingAccount(true);
    
    try {
      // Mettre à jour le statut disabled = 1
      const { error } = await supabase
        .from('User')
        .update({ disabled: 1 })
        .eq('id', formData.id);
      
      if (error) throw error;
      
      // Déconnecter l'utilisateur
      await supabase.auth.signOut();
      localStorage.removeItem('musiclinks_user');
      localStorage.removeItem('musiclinks_authorized');
      
      toast({
        title: "Compte supprimé",
        description: "Votre compte a été désactivé avec succès.",
      });
      
      // Rediriger vers la page d'accueil
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer votre compte.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteAccountDialog(false);
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
            <img src={getImageUrlWithCacheBust(formData.profilepicture)} alt="Avatar" className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow" />
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
              <ToggleGroupItem value="likes" className="px-5 py-2 md:px-8 md:py-3 text-base md:text-lg font-semibold data-[state=on]:bg-blue-600 data-[state=on]:text-white rounded-full">Likes</ToggleGroupItem>
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
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteAccountDialog(true)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Supprimer mon compte
                </button>
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
                <Label htmlFor="subCategory" className="md:text-lg">Prestation</Label>
                <Select value={formData?.subCategory || ''} onValueChange={handleSubCategorySelect}>
                  <SelectTrigger id="subCategory" className="md:h-12 md:text-lg">
                    <SelectValue placeholder="Choisissez votre spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    {ARTIST_SUBCATEGORIES.map(opt => (
                      <SelectItem key={opt.id} value={opt.id} className="md:text-lg">{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Portfolio */}
              <div>
                <Label htmlFor="portfolio_url" className="md:text-lg">Lien Portfolio / Site web</Label>
                <Input id="portfolio_url" name="portfolio_url" value={formData?.portfolio_url || ''} onChange={handleInputChange} placeholder="https://votresite.com" className="md:h-12 md:text-lg"/>
              </div>
              {/* Styles musicaux (dropdown) */}
              <div>
                <Label htmlFor="musicStyle" className="md:text-lg">Style musical</Label>
                <Select value={formData?.musicStyle || ''} onValueChange={val => setFormData((prev: any) => ({ ...prev, musicStyle: val }))}>
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
                <Label className="md:text-lg">Images de présentation</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {[0, 1, 2, 3].map(index => (
                    <div key={index} className="space-y-2">
                      <div className="relative group">
                        {formData?.galleryimages?.[index] ? (
                          <>
                            <img src={formData?.galleryimages[index]} alt={`Gallery image ${index + 1}`} className="w-full h-24 md:h-32 rounded-md object-cover bg-gray-200"/>
                            <button 
                              type="button" 
                              onClick={() => handleDeleteGalleryImage(index)} 
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full p-1 shadow group-hover:scale-110 transition-transform border border-red-600"
                              title="Supprimer cette image"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </>
                        ) : (
                          <label 
                            htmlFor={`gallery_file_${index}`}
                            className="w-full h-24 md:h-32 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors group"
                          >
                            <Plus className="w-8 h-8 text-gray-400 group-hover:text-gray-600 mb-1" />
                            <span className="text-xs text-gray-500 group-hover:text-gray-700">Choisir une image</span>
                          </label>
                        )}
                      </div>
                      <input 
                        id={`gallery_file_${index}`} 
                        name={`gallery_file_${index}`} 
                        type="file" 
                        onChange={(e) => handleFileChange(e, index)} 
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                  ))}
                </div>
              </div>
              {/* Vidéos de présentation */}
              <div>
                <Label className="md:text-lg">Vidéos de présentation</Label>
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  Ajoutez des vidéos ou autres médias pour vous présenter
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {[0, 1, 2, 3].map(index => (
                    <div key={index} className="space-y-2">
                      <div className="relative group">
                        {formData?.galleryVideo && index === 0 ? (
                          <>
                            <div className="w-full h-24 md:h-32 rounded-md bg-gray-200 flex items-center justify-center relative overflow-hidden">
                              <video className="w-full h-full object-cover rounded-md">
                                <source src={formData?.galleryVideo} type="video/mp4" />
                              </video>
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <Video className="w-6 h-6 text-white" />
                              </div>
                            </div>
                            <button 
                              type="button" 
                              onClick={handleDeleteVideo} 
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full p-1 shadow group-hover:scale-110 transition-transform border border-red-600"
                              title="Supprimer cette vidéo"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </>
                        ) : (
                          <label 
                            htmlFor={`video_file_${index}`}
                            className="w-full h-24 md:h-32 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors group"
                          >
                            <Video className="w-8 h-8 text-gray-400 group-hover:text-gray-600 mb-1" />
                            <span className="text-xs text-gray-500 group-hover:text-gray-700">Choisir une vidéo</span>
                          </label>
                        )}
                      </div>
                      <input 
                        id={`video_file_${index}`} 
                        name={`video_file_${index}`} 
                        type="file" 
                        onChange={handleGalleryVideoChange} 
                        className="hidden"
                        accept="video/*"
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Formats acceptés : MP4, AVI, MOV. Taille maximale : 100MB.
                </p>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteAccountDialog(true)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Supprimer mon compte
                </button>
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
              <div className="md:block">
                <ConversationList />
              </div>
              <div className="md:hidden">
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Vos conversations</h3>
                  <p className="text-gray-600 mb-4">Retrouvez ici tous vos échanges avec d'autres utilisateurs</p>
                  <Button 
                    onClick={() => navigate('/chat')} 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Voir mes conversations
                  </Button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'likes' && (
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 mt-2">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Mes Likes</h2>
                <p className="text-gray-600">Profils que vous avez likés</p>
              </div>
              <div className="md:block">
                <LikedProfiles />
              </div>
              <div className="md:hidden">
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Vos likes</h3>
                  <p className="text-gray-600 mb-4">Retrouvez ici tous les profils que vous avez likés</p>
                  <Button 
                    onClick={() => navigate('/')} 
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Découvrir des profils
                  </Button>
                </div>
              </div>
            </div>
          )}
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

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        open={showDeleteAccountDialog}
        onOpenChange={setShowDeleteAccountDialog}
        onConfirm={handleDeleteAccount}
        isLoading={isDeletingAccount}
      />
    </>
  );
};

export default ArtistProfileSettings; 