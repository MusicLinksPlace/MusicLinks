import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ConfirmPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // The onAuthStateChange listener in App.tsx handles the session logic automatically.
    // This page just provides feedback to the user and redirects after a delay.
    toast.info("Validation de votre compte en cours...");

    const timer = setTimeout(() => {
      // Redirect to home, where the central listener will have updated the user state.
      navigate('/');
    }, 3000); // Wait a bit for the auth state to propagate

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700">Confirmation de votre compte en cours...</p>
        <p className="text-gray-500 mt-2">Vous allez être redirigé dans un instant.</p>
      </div>
    </div>
  );
};

export default ConfirmPage; 