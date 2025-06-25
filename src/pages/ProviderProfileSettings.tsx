import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import { Loader2, Trash2, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LocationFilter } from '@/components/ui/LocationFilter';

const PROVIDER_DOMAINS = [
  {
    domain: "Professionnels de l'enregistrement",
    specialties: [
      { id: 'studio', label: 'Studios' },
      { id: 'beatmaker', label: 'Beatmakers' },
      { id: 'engineer', label: 'Ingénieurs du son' },
    ],
  },
  {
    domain: 'Audiovisuel',
    specialties: [
      { id: 'clipmaker', label: 'Clipmaker' },
      { id: 'video_editor', label: 'Monteurs' },
      { id: 'photographer', label: 'Photographes' },
      { id: 'graphic_designer', label: 'Graphistes' },
    ],
  },
  {
    domain: 'Promotion et marketing',
    specialties: [
      { id: 'radio_curator', label: 'Programmateurs de radio/playlist' },
      { id: 'community_manager', label: 'Community manager' },
    ],
  },
  {
    domain: 'Distribution',
    specialties: [
      { id: 'distributor', label: 'Distributeurs de musique' },
    ],
  },
  {
    domain: 'Droits',
    specialties: [
      { id: 'music_lawyer', label: 'Avocats spécialisés' },
    ],
  },
  {
    domain: 'Formation',
    specialties: [
      { id: 'vocal_coach', label: 'Coach vocal' },
      { id: 'music_workshop', label: 'Ateliers et cours de musique' },
    ],
  },
];

const ProviderProfileSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [filesToUpload, setFilesToUpload] = useState<{ [key: string]: File }>({});
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = localStorage.getItem('musiclinks_user');
      if (!storedUser) {
        navigate('/login');
        return;
      }
      const { id, role } = JSON.parse(storedUser);
      if (role !== 'provider') {
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
        // Préselectionner le domaine si subCategory déjà choisi
        if (userData.subcategory) {
          const found = PROVIDER_DOMAINS.find(d => d.specialties.some(s => s.id === userData.subcategory));
          if (found) setSelectedDomain(found.domain);
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
    const key = galleryIndex !== undefined ? `gallery_${galleryIndex}` : 'profile';
    setFilesToUpload(prev => ({ ...prev, [key]: file }));
    // Preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      if (galleryIndex !== undefined) {
        const newGallery = [...(formData.galleryimages || [])];
        newGallery[galleryIndex] = imageUrl;
        setFormData((prev: any) => ({ ...prev, galleryimages: newGallery }));
      } else {
        setFormData((prev: any) => ({ ...prev, profilepicture: imageUrl }));
      }
    };
    reader.readAsDataURL(file);
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

  const handleSpecialtySelect = (domain: string, subId: string) => {
    setSelectedDomain(domain);
    setFormData((prev: any) => ({ ...prev, subcategory: subId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;
    setIsSaving(true);
    try {
      const formUpdates = { ...formData };
      // Upload files
      for (const key in filesToUpload) {
        const file = filesToUpload[key];
        const isGalleryUpload = key.startsWith('gallery');
        const bucket = isGalleryUpload ? 'gallery' : 'avatars';
        const filePath = isGalleryUpload 
          ? `gallery_0/${formData.id}/${file.name}`
          : `${formData.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
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
      // Clean up data for submission
      const { id, createdat, email, role, verified, disabled, ...updateData } = formUpdates;
      // Update the user profile in the DB
      const { data: updatedUser, error: updateError } = await supabase
        .from('User')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (updateError) throw updateError;
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
        <form onSubmit={handleSubmit} className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl flex flex-col p-6 gap-8">
            <h1 className="text-2xl font-bold text-gray-800">Mon Compte Prestataire</h1>
            {/* --- General Information --- */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">Informations Générales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="name">Nom</Label>
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
                  <Textarea id="bio" name="bio" value={formData.bio || ''} onChange={handleInputChange} placeholder="Parlez de vous, de votre activité..." rows={5}/>
              </div>
              {/* --- Specialty Dropdown --- */}
              <div>
                <Label>Spécialité</Label>
                <Accordion type="single" collapsible>
                  {PROVIDER_DOMAINS.map((domain) => (
                    <AccordionItem value={domain.domain} key={domain.domain}>
                      <AccordionTrigger className="text-gray-800 text-base font-semibold">{domain.domain}</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-3 mt-2">
                          {domain.specialties.map((sub) => (
                            <Button
                              key={sub.id}
                              variant={formData.subcategory === sub.id ? 'default' : 'outline'}
                              className="w-full justify-start text-left"
                              type="button"
                              onClick={() => handleSpecialtySelect(domain.domain, sub.id)}
                            >
                              {sub.label}
                              {formData.subcategory === sub.id && <span className="ml-2">✓</span>}
                            </Button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
            {/* --- Links --- */}
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
              {formData.social_links?.map((link: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Input 
                    value={link || ''} 
                    onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                    placeholder="https://soundcloud.com/prestataire"
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
          </div>
        </form>
      </div>
    </>
  );
};

export default ProviderProfileSettings; 