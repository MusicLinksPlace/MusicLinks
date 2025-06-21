import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-ml-blue-faded to-white text-center px-4">
      <div className="max-w-md">
        <h1 className="text-6xl font-extrabold text-ml-blue mb-4">
          <span role="img" aria-label="music note" className="mr-3">🎵</span>
          Oups !
        </h1>
        <p className="text-2xl font-semibold text-ml-gray-dark mb-2">
          Ce lien sonne faux.
        </p>
        <p className="text-ml-gray-medium mb-8">
          La page que tu cherches a peut-être changé de tempo… Retourne à la page d’accueil pour relancer le bon groove.
        </p>
        <Button asChild className="bg-ml-blue hover:bg-ml-blue-dark text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300">
          <Link to="/">Retour à l'accueil</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
