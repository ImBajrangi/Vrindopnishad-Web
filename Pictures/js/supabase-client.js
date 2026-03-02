// Initialize Supabase Client
// You will need to replace the URL and KEY with your own once you set up a project at supabase.com
const SUPABASE_URL = 'https://tilimltxgeucefxzerqi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0YiM-Q8itRORUDdToracaQ_vzcrjUlC';

// Check if supabase is loaded (via CDN in the HTML)
if (typeof supabase === 'undefined') {
    console.error('Supabase library not loaded. Please make sure to include the CDN in your HTML.');
} else {
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
