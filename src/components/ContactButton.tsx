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
      className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-0 backdrop-blur-sm ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      Contacter {userName}
    </Button>
  );
};

export default ContactButton; 