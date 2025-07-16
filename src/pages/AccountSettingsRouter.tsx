import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArtistProfileSettings from "./ArtistProfileSettings";
import ProviderProfileSettings from "./ProviderProfileSettings";
import PartnerProfileSettings from "./PartnerProfileSettings";

export default function AccountSettingsRouter() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("musiclinks_user");
    if (!userStr) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userStr);
    setProfile(user);
    setLoading(false);
  }, [navigate]);

  if (loading) return <div>Chargement…</div>;
  if (!profile) return null;

  switch (profile.role) {
    case "artist":
      return <ArtistProfileSettings />;
    case "provider":
      return <ProviderProfileSettings />;
    case "partner":
      return <PartnerProfileSettings />;
    default:
      return <div>Type de compte inconnu.</div>;
  }
} 