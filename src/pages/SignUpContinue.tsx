import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const ROLE_OPTIONS = [
  { label: "Artiste", value: "artist" },
  { label: "Prestataire", value: "provider" },
  { label: "Partenaire Stratégique", value: "partner" },
];

export default function SignUpContinue() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [selecting, setSelecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setError("Impossible de récupérer l'utilisateur. Merci de réessayer.");
        setLoading(false);
        return;
      }
      setUser(data.user);
      // Vérifie le champ 'role' dans la table User
      const { data: userProfile, error: userError } = await supabase
        .from('User')
        .select('role')
        .eq('id', data.user.id)
        .single();
      if (userError) {
        setError("Impossible de récupérer le profil utilisateur.");
        setLoading(false);
        return;
      }
      if (userProfile && userProfile.role) {
        // Si le rôle existe déjà, redirige directement
        navigate('/mon-compte', { replace: true });
        return;
      }
      setSelecting(true);
      setLoading(false);
    };
    fetchUser();
  }, [navigate]);

  const handleRoleSelect = async (role) => {
    if (!user) return;
    setLoading(true);
    // Met à jour le champ 'role' dans la table User
    const { error } = await supabase
      .from("User")
      .update({ role })
      .eq("id", user.id);
    if (error) {
      setError("Erreur lors de la mise à jour du rôle. Merci de réessayer.");
      setLoading(false);
      return;
    }
    // Redirige vers la page de compte utilisateur (à adapter si besoin)
    navigate("/mon-compte");
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, borderRadius: 12, boxShadow: "0 2px 16px #0001", background: "#fff" }}>
      <h2 style={{ marginBottom: 24 }}>Choisissez votre type de compte</h2>
      {ROLE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleRoleSelect(opt.value)}
          style={{
            display: "block",
            width: "100%",
            marginBottom: 16,
            padding: "12px 0",
            fontSize: 18,
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#f9f9f9",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
} 