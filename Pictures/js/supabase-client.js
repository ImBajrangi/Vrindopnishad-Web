// Initialize Supabase Client
// You will need to replace the URL and KEY with your own once you set up a project at supabase.com
const SUPABASE_URL = 'https://lnsibpzjylkxhqsecxcg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxuc2licHpqeWxreGhxc2VjeGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTY2MjksImV4cCI6MjA4Mzk3MjYyOX0.bNyBQrvBWk4-VAomg_5rZObHJUmSbdkh9CwDKV7aOO8';

// Check if supabase is loaded (via CDN in the HTML)
if (typeof supabase !== 'undefined' && !window.supabaseClient) {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized');
}

// Function to fetch image data from Supabase
async function fetchImagesFromSupabase() {
    try {
        const { data, error } = await window.supabaseClient
            .from('images') // Assumes you have a table named 'images'
            .select('*');

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching images from Supabase:', error.message);
        return null;
    }
}
