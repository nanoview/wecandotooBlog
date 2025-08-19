// Emergency Security Cleanup Script
// This script removes unauthorized user access immediately

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rowcloxlszwnowlggqon.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role key for admin operations

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required for admin operations');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function emergencyCleanup() {
  console.log('🚨 Starting Emergency Security Cleanup...');
  
  try {
    // Step 1: Check for orphaned user_roles
    console.log('\n📊 Checking for orphaned user_roles...');
    const { data: orphanedRoles, error: checkError } = await supabase
      .rpc('find_orphaned_user_roles');
    
    if (checkError && !checkError.message.includes('function "find_orphaned_user_roles" does not exist')) {
      console.error('Error checking orphaned roles:', checkError);
    } else if (orphanedRoles) {
      console.log(`Found ${orphanedRoles.length} orphaned roles`);
      orphanedRoles.forEach(role => {
        console.log(`  - User ID: ${role.user_id}, Role: ${role.role}`);
      });
    }

    // Step 2: Check specifically for shapnokhan@yahoo.com
    console.log('\n🔍 Checking for shapnokhan@yahoo.com access...');
    const { data: shapnokhanRoles, error: shapnokhanError } = await supabase
      .from('user_roles')
      .select(`
        id,
        user_id,
        role,
        profiles!inner(email)
      `)
      .eq('profiles.email', 'shapnokhan@yahoo.com');

    if (shapnokhanError) {
      console.error('Error checking shapnokhan roles:', shapnokhanError);
    } else if (shapnokhanRoles && shapnokhanRoles.length > 0) {
      console.log(`❌ Found ${shapnokhanRoles.length} active roles for shapnokhan@yahoo.com:`);
      shapnokhanRoles.forEach(role => {
        console.log(`  - Role ID: ${role.id}, User ID: ${role.user_id}, Role: ${role.role}`);
      });
    } else {
      console.log('✅ No active roles found for shapnokhan@yahoo.com');
    }

    // Step 3: Remove orphaned user_roles (where user no longer exists)
    console.log('\n🧹 Cleaning up orphaned user_roles...');
    
    // First get all user_roles
    const { data: allUserRoles, error: allRolesError } = await supabase
      .from('user_roles')
      .select('id, user_id, role');

    if (allRolesError) {
      throw allRolesError;
    }

    let orphanedCount = 0;
    for (const role of allUserRoles) {
      // Check if user exists in auth.users
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(role.user_id);
      
      if (userError || !user.user) {
        // User doesn't exist, remove the role
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('id', role.id);
        
        if (deleteError) {
          console.error(`Failed to delete orphaned role ${role.id}:`, deleteError);
        } else {
          console.log(`✅ Removed orphaned role: ${role.id} (user: ${role.user_id}, role: ${role.role})`);
          orphanedCount++;
        }
      }
    }

    console.log(`\n🧹 Cleaned up ${orphanedCount} orphaned user roles`);

    // Step 4: Specifically remove any remaining shapnokhan@yahoo.com roles
    console.log('\n🎯 Removing any remaining shapnokhan@yahoo.com roles...');
    
    // Get shapnokhan user ID if they still exist
    const { data: shapnokhanUser, error: getUserError } = await supabase.auth.admin.listUsers();
    
    if (!getUserError && shapnokhanUser.users) {
      const shapnokhan = shapnokhanUser.users.find(u => u.email === 'shapnokhan@yahoo.com');
      
      if (shapnokhan) {
        const { error: deleteShapnokhanError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', shapnokhan.id);
        
        if (deleteShapnokhanError) {
          console.error('Failed to delete shapnokhan roles:', deleteShapnokhanError);
        } else {
          console.log('✅ Removed all roles for shapnokhan@yahoo.com');
        }
      } else {
        console.log('✅ shapnokhan@yahoo.com user not found in auth.users');
      }
    }

    // Step 5: Final verification
    console.log('\n✅ Final verification...');
    
    const { data: finalCheck, error: finalError } = await supabase
      .from('user_roles')
      .select(`
        id,
        user_id,
        role,
        created_at
      `);

    if (finalError) {
      console.error('Error in final verification:', finalError);
    } else {
      console.log(`\n📊 Final status: ${finalCheck.length} total user roles remaining:`);
      finalCheck.forEach(role => {
        console.log(`  - User ID: ${role.user_id}, Role: ${role.role}, Created: ${role.created_at}`);
      });
    }

    console.log('\n🎉 Emergency cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Emergency cleanup failed:', error);
    process.exit(1);
  }
}

// Run the cleanup
emergencyCleanup();
