import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const GoogleLoginButton = () => {
  const handleGoogleLogin = async () => {
    console.log("🚀 GoogleLoginButton - Lancement login Google");
    console.log("🌐 GoogleLoginButton - URL actuelle:", window.location.href);
    console.log("🌐 GoogleLoginButton - Origin:", window.location.origin);
    console.log("🎯 GoogleLoginButton - RedirectTo:", `${window.location.origin}/auth/callback`);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });

      console.log("✅ GoogleLoginButton - Requête OAuth envoyée");
      console.log("📊 GoogleLoginButton - Résultat:", { hasError: !!error, errorMessage: error?.message });

      if (error) {
        console.error("❌ GoogleLoginButton - Erreur OAuth:", error);
        toast.error(
          error.message ||
            "Une erreur est survenue lors de la connexion avec Google."
        );
      } else {
        console.log("🎉 GoogleLoginButton - Redirection OAuth initiée avec succès");
      }
    } catch (catchError) {
      console.error("💥 GoogleLoginButton - Erreur inattendue:", catchError);
      toast.error("Une erreur inattendue est survenue.");
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 rounded-xl text-base transition-all duration-300 border border-gray-200"
      onClick={handleGoogleLogin}
    >
      <img src="/lovable-uploads/google.png" alt="Google logo" className="h-5 w-5" />
      Continuer avec Google
    </Button>
  );
};

export default GoogleLoginButton; 