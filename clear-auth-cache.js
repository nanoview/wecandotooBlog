// Clear All Authentication Data - Frontend Cleanup
// Run this in your browser's console (F12) while on your website

// 1. Clear Supabase session data
console.log('🧹 Starting complete authentication cleanup...');

// Clear localStorage
Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth') || key.includes('token')) {
        localStorage.removeItem(key);
        console.log('Removed from localStorage:', key);
    }
});

// Clear sessionStorage
Object.keys(sessionStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth') || key.includes('token')) {
        sessionStorage.removeItem(key);
        console.log('Removed from sessionStorage:', key);
    }
});

// Clear all localStorage (nuclear option)
console.log('📦 Clearing all localStorage...');
localStorage.clear();

// Clear all sessionStorage
console.log('📦 Clearing all sessionStorage...');
sessionStorage.clear();

// Clear IndexedDB (where Supabase might store data)
if ('indexedDB' in window) {
    indexedDB.databases().then(databases => {
        databases.forEach(db => {
            if (db.name.includes('supabase') || db.name.includes('auth')) {
                indexedDB.deleteDatabase(db.name);
                console.log('Deleted IndexedDB:', db.name);
            }
        });
    }).catch(err => console.log('IndexedDB cleanup error:', err));
}

// Clear cookies for the current domain
console.log('🍪 Clearing cookies...');
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// Force reload to clear any in-memory state
console.log('🔄 Reloading page to clear in-memory state...');
setTimeout(() => {
    window.location.reload(true);
}, 1000);

console.log('✅ Authentication cleanup complete! Page will reload in 1 second.');
console.log('If you can still log in after this, the issue is in the database.');

// Alternative: If you have access to the Supabase client, force sign out
/*
// Uncomment this if you have access to the supabase client
if (typeof supabase !== 'undefined') {
    supabase.auth.signOut().then(() => {
        console.log('Supabase sign out completed');
    });
}
*/
