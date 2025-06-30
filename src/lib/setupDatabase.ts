import { supabase } from './supabaseClient';

export const setupMessageTable = async () => {
  try {
    // Vérifier si la table Message existe
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'Message');

    if (tablesError) {
      console.error('Error checking table existence:', tablesError);
      return;
    }

    if (tables && tables.length === 0) {
      console.log('Table Message does not exist. Creating...');
      
      // Créer la table Message
      const { error: createError } = await supabase.rpc('create_message_table');
      
      if (createError) {
        console.error('Error creating Message table:', createError);
        return;
      }
      
      console.log('Message table created successfully!');
    } else {
      console.log('Message table already exists.');
    }
  } catch (error) {
    console.error('Error in setupMessageTable:', error);
  }
};

// Fonction pour créer la table Message via SQL direct
export const createMessageTableSQL = `
CREATE TABLE IF NOT EXISTS "Message" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  senderId UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  receiverId UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT message_sender_receiver_check CHECK (senderId != receiverId)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_message_sender_receiver ON "Message"(senderId, receiverId);
CREATE INDEX IF NOT EXISTS idx_message_created_at ON "Message"(createdAt);

-- Activer RLS (Row Level Security)
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour permettre aux utilisateurs de voir leurs messages
CREATE POLICY "Users can view their own messages" ON "Message"
  FOR SELECT USING (
    auth.uid() = senderId OR auth.uid() = receiverId
  );

-- Politique RLS pour permettre aux utilisateurs d'envoyer des messages
CREATE POLICY "Users can insert their own messages" ON "Message"
  FOR INSERT WITH CHECK (
    auth.uid() = senderId
  );
`; 