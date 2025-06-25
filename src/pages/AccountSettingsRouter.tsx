import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArtistAccountSettings from "./ArtistAccount";
import ProviderAccountSettings from "./ProviderAccount";
import PartnerAccountSettings from "./PartnerAccount";

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
      return <ArtistAccountSettings />;
    case "provider":
      return <ProviderAccountSettings />;
    case "partner":
      return <PartnerAccountSettings />;
    default:
      return <div>Type de compte inconnu.</div>;
  }
} 