// Initialize Supabase Client (Deprecated - Moving to Firebase)
const SUPABASE_URL = 'https://tilimltxgeucefxzerqi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbGltbHR4Z2V1Y2VmeHplcnFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MjQyNTQsImV4cCI6MjA4MzIwMDI1NH0.lwaCJyTRW6jNsfQJ32R_wAwp11yj6bvsJ4fzC0EX_00';

// Check if supabase is loaded (via CDN in the HTML)
if (typeof supabase !== 'undefined' && !window.supabaseClient) {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized (Legacy Bridge)');
}

/**
 * BRIDGE: Fetch any table from Firebase instead of Supabase
 * This resolves connection errors by using the stable Firebase Realtime DB.
 */
async function fetchFromFirebase(tableName) {
    try {
        if (!window.AuthService) {
            console.warn('AuthService (Firebase) not found.');
            return null;
        }
        
        // Map Supabase table names to Firebase paths if necessary
        const firebasePath = `public/${tableName === 'images' ? 'collections' : tableName}`;
        
        const { getDatabase, ref, get } = await import("firebase/database");
        const db = getDatabase();
        const dataRef = ref(db, firebasePath);
        const snapshot = await get(dataRef);
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Ensure data is consistently returned as an array
            return Array.isArray(data) ? data : Object.values(data);
        }
        return null;
    } catch (error) {
        console.error(`Error fetching ${tableName} from Firebase:`, error.message);
        return null;
    }
}

/**
 * Generalized fetch function that tries Firebase first, falls back to Supabase.
 */
async function fetchFromDatabase(tableName, options = {}) {
    console.log(`Attempting to fetch ${tableName}...`);
    
    // 1. Try Firebase first
    const firebaseData = await fetchFromFirebase(tableName);
    if (firebaseData) {
        console.log(`Successfully fetched ${tableName} from Firebase`);
        return firebaseData;
    }

    // 2. Fallback to Supabase
    try {
        if (!window.supabaseClient) throw new Error('Supabase client not initialized');
        
        let query = window.supabaseClient.from(tableName).select('*');
        
        // Basic sort support for 'content' table or others
        if (options.orderBy) {
            query = query.order(options.orderBy, { ascending: options.ascending ?? false });
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    } catch (error) {
        console.error(`Supabase fetch failed for ${tableName}, and no Firebase data found:`, error.message);
        return null;
    }
}

// Legacy helper for Pictures/Gallery module
async function fetchImagesFromSupabase() {
    return await fetchFromDatabase('images');
}

// Helper for Sketch/Paath module
async function fetchContentFromSupabase() {
    return await fetchFromDatabase('content', { orderBy: 'created_at', ascending: false });
}

// Expose globally for modules not using imports
window.fetchFromDatabase = fetchFromDatabase;
window.fetchImagesFromSupabase = fetchImagesFromSupabase;
window.fetchContentFromSupabase = fetchContentFromSupabase;
