import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const GoogleLoginButton = () => {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/signup/continue?verified=true`,
      },
    });

    if (error) {
      toast.error(
        error.message ||
          "Une erreur est survenue lors de la connexion avec Google."
      );
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