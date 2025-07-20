import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, Link, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareProfileProps {
  userId: string;
  userName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const ShareProfile: React.FC<ShareProfileProps> = ({
  userId,
  userName,
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const profileUrl = `${window.location.origin}/profile/${userId}`;

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Profil de ${userName} sur MusicLinks`,
          text: `Découvrez le profil de ${userName} sur MusicLinks`,
          url: profileUrl,
        });
      } else {
        // Fallback: copier le lien
        await copyToClipboard();
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Erreur lors du partage:', error);
        await copyToClipboard();
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast({
        title: "Lien copié !",
        description: "Le lien du profil a été copié dans le presse-papiers.",
      });
      
      // Reset après 2 secondes
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const openInNewTab = () => {
    window.open(profileUrl, '_blank');
  };

  const shareViaWhatsApp = () => {
    const text = `Découvrez le profil de ${userName} sur MusicLinks : ${profileUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `Profil de ${userName} sur MusicLinks`;
    const body = `Bonjour,\n\nJe vous partage le profil de ${userName} sur MusicLinks :\n${profileUrl}\n\nCordialement`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={`flex items-center gap-2 ${className}`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copié !
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Partager
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleNativeShare} className="flex items-center gap-2 py-2 cursor-pointer">
            <Share2 className="h-4 w-4" />
            <span>Partager nativement</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={copyToClipboard} className="flex items-center gap-2 py-2 cursor-pointer">
            <Copy className="h-4 w-4" />
            <span>Copier le lien</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={openInNewTab} className="flex items-center gap-2 py-2 cursor-pointer">
            <ExternalLink className="h-4 w-4" />
            <span>Ouvrir dans un nouvel onglet</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={shareViaWhatsApp} className="flex items-center gap-2 py-2 cursor-pointer">
            <MessageCircle className="h-4 w-4" />
            <span>Partager sur WhatsApp</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={shareViaEmail} className="flex items-center gap-2 py-2 cursor-pointer">
            <Link className="h-4 w-4" />
            <span>Partager par email</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ShareProfile; 