import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface ContactButtonProps {
  userId: string;
  userName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const ContactButton: React.FC<ContactButtonProps> = ({
  userId,
  userName,
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  const navigate = useNavigate();

  const handleContact = () => {
    const user = localStorage.getItem('musiclinks_user');
    if (!user) {
      navigate('/signup');
      return;
    }
    navigate(`/chat?userId=${userId}`);
  };

  return (
    <Button
      onClick={handleContact}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      Contacter {userName}
    </Button>
  );
};

export default ContactButton; 