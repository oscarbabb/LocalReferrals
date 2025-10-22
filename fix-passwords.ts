/**
 * Security Fix: Hash all plain text passwords in the database
 * 
 * This script finds users with plain text passwords (not starting with $2b$)
 * and hashes them using bcrypt for security.
 * 
 * Run with: npx tsx fix-passwords.ts
 */

import { db } from "./server/db";
import { users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

async function fixPlainTextPasswords() {
  console.log("🔍 Scanning for users with plain text passwords...\n");
  
  try {
    // Get all users
    const allUsers = await db.select().from(users);
    console.log(`📊 Found ${allUsers.length} total users in database`);
    
    // Find users with plain text passwords (not starting with $2b$ which is bcrypt)
    const usersWithPlainTextPasswords = allUsers.filter(user => 
      user.password && !user.password.startsWith('$2b$')
    );
    
    console.log(`⚠️  Found ${usersWithPlainTextPasswords.length} users with PLAIN TEXT passwords!\n`);
    
    if (usersWithPlainTextPasswords.length === 0) {
      console.log("✅ All passwords are already properly hashed!");
      return;
    }
    
    console.log("🔐 Hashing plain text passwords...\n");
    
    // Hash each plain text password
    for (const user of usersWithPlainTextPasswords) {
      const plainTextPassword = user.password;
      const hashedPassword = await bcrypt.hash(plainTextPassword, 10);
      
      // Update the user's password
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, user.id));
      
      console.log(`✅ Hashed password for user: ${user.email} (was: "${plainTextPassword.substring(0, 20)}...")`);
    }
    
    console.log(`\n🎉 Successfully hashed ${usersWithPlainTextPasswords.length} passwords!`);
    console.log("\n⚠️  IMPORTANT: These users will need to use their ORIGINAL passwords to login.");
    console.log("   The passwords haven't changed, they're just now stored securely.\n");
    
  } catch (error) {
    console.error("❌ Error fixing passwords:", error);
    throw error;
  }
}

// Run the fix
fixPlainTextPasswords()
  .then(() => {
    console.log("✅ Password fix completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Password fix failed:", error);
    process.exit(1);
  });
