import { createClient } from '@supabase/supabase-js';

export type Database = {
  public: {
    Tables: {
      Project: {
        Row: {
          id: number
          title: string
          description: string
          category: string
          location: string | null
          status: string
          authorId: string
          createdAt: string
          applicantCount: number
          verified: number
        }
        Insert: Omit<Database['public']['Tables']['Project']['Row'], 'id' | 'createdAt'>
        Update: Partial<Database['public']['Tables']['Project']['Insert']>
      }
      User: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          subCategory?: string | null
          location?: string | null
          bio?: string | null
          profilepicture?: string | null
          galleryimages?: string[] | null
          portfolio_url?: string | null
          social_links?: string[] | null
          createdat: string
          skills?: string[] | null
          musicStyle?: string | null
          verified: number
          disabled: number
          isAdmin: boolean
        }
        Insert: Omit<Database['public']['Tables']['User']['Row'], 'id' | 'createdat'>
        Update: Partial<Database['public']['Tables']['User']['Insert']>
      }
    }
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase configuration:');
console.log('📡 URL:', supabaseUrl ? '✅ Loaded' : '❌ Missing');
console.log('🔑 Key:', supabaseKey ? '✅ Loaded' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single instance to avoid multiple GoTrueClient instances
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
