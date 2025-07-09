import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Toaster, toast } from 'sonner';
import { ArrowLeft, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MUSIC_STYLES } from '@/lib/constants';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { LocationFilter } from '@/components/ui/LocationFilter';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerTrigger, DrawerContent } from '@/components/ui/drawer';

// --- Data Configuration ---
const ROLES = [
    { id: 'artist', label: 'Artiste' },
    { id: 'provider', label: 'Prestataire de service' },
    { id: 'partner', label: 'Partenaire stratégique' },
];

const PARTNER_SUB_CATEGORIES = [
  { id: 'label', label: 'Label ou maison de disque' },
  { id: 'manager', label: 'Manager / Directeur artistique' },
];

const PROVIDER_SUB_CATEGORIES = {
  'Promotion & marketing': [
    { id: 'radio_curator', label: 'Programmateur radio / playlist' },
    { id: 'community_manager', label: 'Community manager' },
    { id: 'media', label: 'Médias' },
  ],
  'Visuel': [
    { id: 'clipmaker', label: 'Clipmaker' },
    { id: 'video_editor', label: 'Monteur vidéo' },
    { id: 'photographer', label: 'Photographe' },
    { id: 'graphic_designer', label: 'Graphiste' },
  ],
  'Droits & Distribution': [
    { id: 'distributor', label: 'Distributeur' },
    { id: 'music_lawyer', label: 'Avocat spécialisé' },
  ],
  'Formation': [
    { id: 'vocal_coach', label: 'Coach vocal' },
    { id: 'music_workshop', label: 'Ateliers de musique' },
  ],
};

// --- Step Components ---
const Step1Credentials = ({ formData, onFormChange, onGoogleSignUp, cguAccepted, setCguAccepted, onSubmit, isLoading }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onFormChange(prev => ({ ...prev, [name]: value }));
    };

    // CGU/Privacy content (repris de Legal)
    const cguContent = (
      <>
        <DialogHeader>
          <DialogTitle>Conditions générales d'utilisation</DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <div className="space-y-4 text-ml-charcoal text-sm max-h-[50vh] overflow-y-auto">
            <p>En utilisant ce site, vous acceptez les conditions générales d'utilisation. MusicLinks est une plateforme de mise en relation entre artistes et prestataires musicaux. Nous ne sommes pas responsables des transactions effectuées entre les utilisateurs.</p>
          </div>
        </DialogDescription>
      </>
    );
    const privacyContent = (
      <>
        <DialogHeader>
          <DialogTitle>Politique de confidentialité</DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <div className="space-y-4 text-ml-charcoal text-sm max-h-[50vh] overflow-y-auto">
            <p>Conformément au Règlement Général sur la Protection des Données (RGPD), les utilisateurs peuvent demander la suppression de leurs données à tout moment en nous contactant à l'adresse email mentionnée dans les mentions légales.</p>
          </div>
        </DialogDescription>
      </>
    );

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white">Pas encore de compte ?</h2>
                <p className="text-white/70 text-sm">S'inscrire gratuitement</p>
            </div>
            
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); onSubmit(); }}>
                <div className="space-y-2">
                   <Label htmlFor="name" className="text-white font-medium text-sm md:text-base">Nom complet ou surnom</Label>
                   <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-ml-teal focus:ring-ml-teal rounded-xl" placeholder="John Doe"/>
                </div>
                <div className="space-y-2">
                   <Label htmlFor="email" className="text-white font-medium text-sm md:text-base">Email</Label>
                   <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-ml-teal focus:ring-ml-teal rounded-xl" placeholder="votre@email.com"/>
                </div>
                <div className="space-y-2">
                   <Label htmlFor="password" className="text-white font-medium text-sm md:text-base">Mot de passe</Label>
                   <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-ml-teal focus:ring-ml-teal rounded-xl" placeholder="••••••••"/>
                </div>
                 <div className="space-y-2">
                   <Label htmlFor="confirmPassword" className="text-white font-medium text-sm md:text-base">Confirmer le mot de passe</Label>
                   <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-ml-teal focus:ring-ml-teal rounded-xl" placeholder="••••••••"/>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <Checkbox id="cgu" checked={cguAccepted} onCheckedChange={setCguAccepted} required />
                  <label htmlFor="cgu" className="text-white text-sm select-none">
                    J'accepte les{' '}
                    <Dialog>
                      <DialogTrigger asChild>
                        <span className="font-bold cursor-pointer hover:text-ml-teal">Conditions d'utilisation</span>
                      </DialogTrigger>
                      <DialogContent>{cguContent}</DialogContent>
                    </Dialog>
                    {' '}et la{' '}
                    <Dialog>
                      <DialogTrigger asChild>
                        <span className="font-bold cursor-pointer hover:text-ml-teal">Politique de confidentialité</span>
                      </DialogTrigger>
                      <DialogContent>{privacyContent}</DialogContent>
                    </Dialog>
                  </label>
                </div>
                <Button type="submit" variant="teal" className="w-full text-lg font-semibold py-3 rounded-xl mt-4" disabled={isLoading}>
                  {isLoading ? 'Création du compte...' : 'Créer mon compte'}
                </Button>
            </form>

            <div className="relative my-6 flex items-center gap-4">
              <hr className="flex-grow border-t border-white/20" />
              <span className="text-xs uppercase text-white/50">OU</span>
              <hr className="flex-grow border-t border-white/20" />
            </div>

            <GoogleLoginButton />
        </div>
    );
};

const Step2RoleSelection = ({ formData, onRoleChangeAndNext }) => {
    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white">Type de profil</h2>
                <p className="text-white/70 text-sm">Sélectionnez le type de profil qui vous correspond</p>
            </div>
            <div className="space-y-3">
                {ROLES.map((role) => (
                    <button
                        key={role.id}
                        type="button"
                        onClick={() => onRoleChangeAndNext(role.id)}
                        className={cn(
                            "w-full flex items-center gap-4 rounded-xl p-3 cursor-pointer bg-white/5 hover:bg-white/10 font-semibold text-white text-lg transition-all"
                        )}
                    >
                        {role.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const Step3SubCategory = ({ role, onSelectSubCategory, selectedSubCategory }) => {
  const [selectedDomain, setSelectedDomain] = useState(null);

  const getSubCategoryContent = () => {
    if (role === 'partner') {
      return (
        <div className="space-y-4">
            <div className="text-center">
                <h2 className="text-xl font-bold text-white">Spécialité Partenaire</h2>
                <p className="text-white/70 text-sm">Précisez votre domaine d'activité.</p>
            </div>
          <RadioGroup value={selectedSubCategory} onValueChange={onSelectSubCategory} className="space-y-3">
            {PARTNER_SUB_CATEGORIES.map((sub) => (
              <Label key={sub.id} htmlFor={sub.id} className="flex items-center gap-3 border border-transparent rounded-xl p-3 cursor-pointer bg-white/5 hover:bg-white/10 has-[input:checked]:bg-white/20">
                <RadioGroupItem value={sub.id} id={sub.id} className="text-ml-teal border-white/30"/>
                <span className="font-semibold text-white">{sub.label}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>
      );
    }
  
    if (role === 'provider') {
      return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-bold text-white">Spécialité Prestataire</h2>
                <p className="text-white/70 text-sm">Sélectionnez votre domaine, puis votre spécialité.</p>
            </div>
            <div>
                <h3 className="font-semibold text-white mb-3 text-center">Domaines</h3>
                <div className="grid grid-cols-2 gap-3">
                {Object.keys(PROVIDER_SUB_CATEGORIES).map(domain => (
                    <Button
                      key={domain}
                      variant="outline"
                      onClick={() => { setSelectedDomain(domain); onSelectSubCategory(null); }}
                      className={cn(
                        "h-auto py-3 whitespace-normal text-center border text-white transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                        selectedDomain === domain
                          ? 'bg-ml-teal border-ml-teal hover:bg-ml-teal/90'
                          : 'bg-white/5 border-white/20 hover:bg-white/10'
                      )}
                    >
                      {domain}
                    </Button>
                ))}
                </div>
            </div>
    
            {selectedDomain && (
                <div>
                <h3 className="font-semibold text-white mb-3 text-center">Spécialités pour "{selectedDomain}"</h3>
                <RadioGroup value={selectedSubCategory} onValueChange={onSelectSubCategory} className="space-y-3">
                    {PROVIDER_SUB_CATEGORIES[selectedDomain].map((sub) => (
                    <Label key={sub.id} htmlFor={sub.id} className="flex items-center gap-3 border border-transparent rounded-xl p-3 cursor-pointer bg-white/5 hover:bg-white/10 has-[input:checked]:bg-white/20">
                        <RadioGroupItem value={sub.id} id={sub.id} className="text-ml-teal border-white/30"/>
                        <span className="text-white">{sub.label}</span>
                    </Label>
                    ))}
                </RadioGroup>
                </div>
            )}
        </div>
      );
    }

    // For artists, skip this step and go to next
    return null;
  }

  return getSubCategoryContent();
};

const Step3ProfileInfo = ({ formData, onFormChange, role }) => {
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    onFormChange(prev => ({...prev, [name]: value}));
  }

  const handleMusicStyleChange = (value) => {
    onFormChange(prev => ({...prev, musicStyle: value}));
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
        onFormChange(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleGalleryFileChange = (index, file) => {
    const newFiles = [...formData.galleryImages];
    newFiles[index] = file;
    onFormChange(prev => ({ ...prev, galleryImages: newFiles }));
  };

  const handleSocialLinkChange = (index, value) => {
    const newLinks = [...formData.socialLinks];
    newLinks[index] = value;
    onFormChange(prev => ({ ...prev, socialLinks: newLinks }));
  };

  const addSocialLink = () => {
    if (formData.socialLinks.length < 5) {
      onFormChange(prev => ({ ...prev, socialLinks: [...prev.socialLinks, ''] }));
    }
  };

  const removeSocialLink = (index) => {
    const newLinks = formData.socialLinks.filter((_, i) => i !== index);
    onFormChange(prev => ({ ...prev, socialLinks: newLinks }));
  };

  const isMobile = useIsMobile();
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const handleLocationSelect = (location) => {
    onFormChange(prev => ({ ...prev, location }));
    setIsLocationOpen(false);
  };
    
  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 -mr-4">
      <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white">Informations du profil</h2>
            <p className="text-white/70 text-sm">Ces informations sont facultatives mais recommandées.</p>
        </div>
        <div className="space-y-2">
            <Label htmlFor="profilePicture" className="text-white font-medium text-sm">Photo de profil</Label>
            <Input id="profilePicture" name="profilePicture" type="file" onChange={handleFileChange} className="bg-white/10 border-white/20 text-white file:text-white/80" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="bio" className="text-white font-medium text-sm">Bio</Label>
            <Textarea id="bio" name="bio" placeholder="Parlez un peu de vous..." className="bg-white/10 border-white/20 text-white" value={formData.bio} onChange={handleFormChange}/>
        </div>
        <div className="space-y-2">
            <Label htmlFor="location" className="text-white font-medium text-sm">Localisation</Label>
            {isMobile ? (
              <Drawer open={isLocationOpen} onOpenChange={setIsLocationOpen}>
                <DrawerTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full bg-white/10 border-white/20 text-white rounded-xl px-4 py-3 text-left",
                      !formData.location && "text-white/50"
                    )}
                  >
                    {formData.location || "Sélectionnez votre localisation"}
                  </button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[90vh] p-0 bg-white">
                  <LocationFilter
                    selectedLocation={formData.location}
                    onLocationChange={handleLocationSelect}
                  />
                </DrawerContent>
              </Drawer>
            ) : (
              <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full bg-white/10 border-white/20 text-white rounded-xl px-4 py-3 text-left",
                      !formData.location && "text-white/50"
                    )}
                  >
                    {formData.location || "Sélectionnez votre localisation"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[340px] p-0" side="bottom" align="start" sideOffset={12}>
                  <LocationFilter
                    selectedLocation={formData.location}
                    onLocationChange={handleLocationSelect}
                  />
                </PopoverContent>
              </Popover>
            )}
        </div>
        <div className="space-y-2">
            <Label htmlFor="musicStyle" className="text-white font-medium text-sm">Style musical principal</Label>
            <Select onValueChange={handleMusicStyleChange} value={formData.musicStyle}>
              <SelectTrigger id="musicStyle" className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Sélectionnez votre style..." />
              </SelectTrigger>
              <SelectContent>
                {MUSIC_STYLES.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="portfolioLink" className="text-white font-medium text-sm">Lien portfolio/site web</Label>
            <Input id="portfolioLink" name="portfolioLink" placeholder="https://votre-site.com" className="bg-white/10 border-white/20 text-white" value={formData.portfolioLink} onChange={handleFormChange}/>
        </div>
        <div className="space-y-3">
            <Label className="text-white font-medium text-sm">Réseaux sociaux (max 5)</Label>
            {formData.socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                    <Input 
                        placeholder="https://soundcloud.com/..." 
                        className="bg-white/10 border-white/20 text-white" 
                        value={link}
                        onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeSocialLink(index)} className="text-white/50 hover:text-red-500 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                </div>
            ))}
             {formData.socialLinks.length < 5 && (
                <Button variant="outline" size="sm" onClick={addSocialLink} className="bg-transparent text-white/80 border-white/20 hover:bg-white/10 hover:text-white">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Ajouter un lien
                </Button>
             )}
        </div>
         <div className="space-y-3">
            <Label className="text-white font-medium text-sm">Autres images (max 4)</Label>
            {[...Array(4)].map((_, i) => 
                <div key={i} className="space-y-2">
                    <Input type="file" onChange={(e) => e.target.files && handleGalleryFileChange(i, e.target.files[0])} className="bg-white/10 border-white/20 text-white file:text-white/80" />
                </div>
            )}
        </div>
    </div>
  );
};

// --- Main SignUp Component ---
const SignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [emailCheckStep, setEmailCheckStep] = useState(false);

  const initialFormData = {
    email: '',
    password: '',
    confirmPassword: '',
    role: 'artist',
    subCategory: null,
    name: '',
    bio: '',
    location: '',
    portfolioLink: '',
    socialLinks: [''],
    profilePicture: null,
    galleryImages: Array(4).fill(null),
    musicStyle: '',
  };

  const [step, setStep] = useState(() => {
    const savedState = localStorage.getItem('signUpFormData');
    if (savedState) {
      try {
        return JSON.parse(savedState).step || 1;
      } catch (e) { return 1; }
    }
    return 1;
  });

  const [formData, setFormData] = useState(() => {
    const savedState = localStorage.getItem('signUpFormData');
    if (savedState) {
      try {
        const savedFormData = JSON.parse(savedState).formData;
        return { ...initialFormData, ...savedFormData };
      } catch (e) { return initialFormData; }
    }
    return initialFormData;
  });

  const from = location.state?.from?.pathname || "/";

  // Effect to save state to localStorage
  useEffect(() => {
    const stateToSave = JSON.stringify({ step, formData });
    localStorage.setItem('signUpFormData', stateToSave);
  }, [step, formData]);

  const handleFormChange = (newFormData) => {
    setFormData(newFormData);
  };

  const handleNextStep = () => {
    if (step === 1) {
      // Validate credentials
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        toast.error("Veuillez remplir tous les champs obligatoires.");
        return;
      }
    if (formData.password !== formData.confirmPassword) {
        toast.error("Les mots de passe ne correspondent pas.");
        return;
      }
    }
    
    if (step === 2) {
      // Validate role selection
      if (!formData.role) {
        toast.error("Veuillez sélectionner un type de profil.");
        return;
      }
    }
    
    if (step === 3) {
      // Validate sub-category for partners and providers
      if ((formData.role === 'partner' || formData.role === 'provider') && !formData.subCategory) {
        toast.error("Veuillez sélectionner une spécialité.");
      return;
      }
    }
    
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step === 4 && formData.role === 'artist') {
      setStep(2);
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    console.log('🚀 Starting signup process...');
    console.log('📧 Email:', formData.email);
    console.log('👤 Name:', formData.name);
    console.log('🎭 Role:', formData.role);
    
    setIsLoading(true);
    
    try {
      // Consolidate all profile data to pass to Supabase Auth
      const profileData = {
        name: formData.name,
        role: formData.role,
        subCategory: formData.subCategory,
        bio: formData.bio || null,
        location: formData.location || null,
        portfolio_url: formData.portfolioLink || null,
        social_links: formData.socialLinks.filter(link => link).length > 0 ? formData.socialLinks.filter(link => link) : null,
        musicStyle: formData.musicStyle || null,
        // Note: verified and disabled are handled by Supabase Auth/Triggers
      };

      console.log('📊 Profile data to be passed:', profileData);

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/signup/continue`,
          data: profileData,
        }
      });
      
      console.log('✅ Supabase signup response:', data);
      console.log('❌ Supabase signup error:', error);
      
      setIsLoading(false);

      if (error) {
        console.error('🚨 Signup error:', error);
        toast.error(error.message);
      } else {
        console.log('✅ Signup successful, user created:', data.user);
        toast.success('Compte créé !', {
          description: "Veuillez vérifier vos emails pour confirmer votre inscription.",
          duration: 6000,
        });
        localStorage.removeItem('signUpFormData');
        setEmailCheckStep(true);
        return;
      }
    } catch (error: any) {
      console.error('🚨 Signup Error:', error);
      toast.error(`Erreur lors de l'inscription: ${error.message}`);
    }
  };
  
  const handleRoleChangeAndNext = (role) => {
    setFormData(prev => ({ ...prev, role, subCategory: null }));
    if (role === 'artist') {
      setStep(4);
    } else {
      setStep(step + 1);
    }
  };

  const ActionButtons = () => {
    const mainButtonClass = cn("bg-ml-teal hover:bg-ml-teal/90", step > 1 ? "w-2/3" : "w-full");
    if (isLoading) {
        return <Button className={cn(mainButtonClass, "w-full")} disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Veuillez patienter...</Button>
    }
    return (
        <div className="mt-8 flex gap-4">
            {step > 1 && (
                <Button variant="ghost" onClick={handlePrevStep} className="w-1/3 bg-transparent hover:bg-white/20 text-white/70 hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Précédent
                </Button>
            )}
            {step === 4 && (
                <Button onClick={handleSubmit} className={mainButtonClass}>
                    Terminer l'inscription
                </Button>
            )}
        </div>
    )
  }

  if (emailCheckStep) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-ml-charcoal via-ml-navy to-ml-charcoal px-4">
        <div className="w-full max-w-sm text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 flex flex-col items-center">
          <img src="/lovable-uploads/logo-white.png" alt="MusicLinks Logo" className="h-8 w-auto mb-4 mx-auto" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Vérifiez votre email</h2>
          <p className="text-white/80 text-base md:text-lg leading-relaxed mb-2">Cliquez sur le lien reçu par email pour continuer votre inscription.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ml-charcoal via-ml-navy to-ml-charcoal flex items-center justify-center p-4">
        <Toaster richColors position="top-center" />
      <div className="w-full max-w-md">
         <div className="text-center mb-8">
           <Link to="/" className="inline-flex items-center text-white/70 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Link>
           <Link to="/" className="flex justify-center mb-4">
             <img src="/lovable-uploads/logo-white.png" alt="MusicLinks Logo" className="h-8 w-auto" />
          </Link>
           <h1 className="text-3xl font-bold text-white mb-2">
            Créer un compte
          </h1>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10">
            {step === 1 && (
                <Step1Credentials 
                    formData={formData}
                    onFormChange={setFormData}
                    onGoogleSignUp={() => {}}
                    cguAccepted={formData.cguAccepted}
                    setCguAccepted={(value) => setFormData(prev => ({ ...prev, cguAccepted: value }))}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                />
            )}
            {step === 2 && (
                <Step2RoleSelection 
                    formData={formData}
                    onRoleChangeAndNext={handleRoleChangeAndNext}
                />
            )}
            {step === 3 && formData.role !== 'artist' && (
                <Step3SubCategory 
                    role={formData.role} 
                    onSelectSubCategory={(value) => setFormData(prev => ({ ...prev, subCategory: value }))} 
                    selectedSubCategory={formData.subCategory} 
                />
            )}
            {step === 4 && (
                <Step3ProfileInfo 
                    formData={formData} 
                    onFormChange={setFormData} 
                    role={formData.role}
                />
            )}
          
            <ActionButtons />
            </div>
        <div className="text-center mt-8">
            <p className="text-white/70 text-sm">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-ml-teal hover:text-ml-teal/80 font-medium transition-colors">
                Se connecter
              </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

