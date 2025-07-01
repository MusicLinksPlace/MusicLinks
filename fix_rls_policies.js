import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://cvmdnxzzdnhnwvopdalv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bWRueHp6ZG5obnd2b3BkYWx2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTU5NzE5NywiZXhwIjoyMDUxMTczMTk3fQ.cvmdnxzzdnhnwvopdalv';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLSPolicies() {
  try {
    console.log('🔧 Correction des politiques RLS...');

    // 1. Supprimer les anciennes politiques problématiques
    console.log('Suppression des anciennes politiques...');
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Admins can view all users" ON "User";
        DROP POLICY IF EXISTS "Admins can update all users" ON "User";
      `
    });

    // 2. Créer les nouvelles politiques RLS
    console.log('Création des nouvelles politiques...');
    await supabase.rpc('exec_sql', {
      sql: `
        -- Politique RLS simple pour permettre aux admins de voir tous les utilisateurs
        CREATE POLICY "Admins can view all users" ON "User"
          FOR SELECT USING (
            auth.uid() IN (
              SELECT id FROM "User" WHERE "isAdmin" = TRUE
            )
          );

        -- Politique RLS simple pour permettre aux admins de modifier tous les utilisateurs
        CREATE POLICY "Admins can update all users" ON "User"
          FOR UPDATE USING (
            auth.uid() IN (
              SELECT id FROM "User" WHERE "isAdmin" = TRUE
            )
          );

        -- Politique RLS pour permettre aux utilisateurs de voir leur propre profil
        CREATE POLICY "Users can view own profile" ON "User"
          FOR SELECT USING (
            auth.uid() = id
          );

        -- Politique RLS pour permettre aux utilisateurs de modifier leur propre profil
        CREATE POLICY "Users can update own profile" ON "User"
          FOR UPDATE USING (
            auth.uid() = id
          );

        -- Politique RLS pour permettre l'insertion de nouveaux utilisateurs
        CREATE POLICY "Users can insert own profile" ON "User"
          FOR INSERT WITH CHECK (
            auth.uid() = id
          );

        -- Politique RLS pour permettre la lecture publique des profils vérifiés et actifs
        CREATE POLICY "Public can view verified active users" ON "User"
          FOR SELECT USING (
            verified = 1 AND disabled = 0
          );
      `
    });

    console.log('✅ Politiques RLS corrigées avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la correction des politiques RLS:', error);
  }
}

fixRLSPolicies(); 