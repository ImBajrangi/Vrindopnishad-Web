import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lnsibpzjylkxhqsecxcg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxuc2licHpqeWxreGhxc2VjeGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTY2MjksImV4cCI6MjA4Mzk3MjYyOX0.bNyBQrvBWk4-VAomg_5rZObHJUmSbdkh9CwDKV7aOO8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
