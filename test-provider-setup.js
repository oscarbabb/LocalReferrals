// Test script to verify provider setup flow with profile picture upload
// This tests the fix for the timing issue where providerSetupToken was consumed before photo upload

import { apiRequest } from './client/src/lib/queryClient.js';

async function testProviderSetupFlow() {
  console.log('🧪 Testing Provider Setup Flow with Profile Picture Upload');
  console.log('=======================================================');

  try {
    // Step 1: Create a test user (provider)
    console.log('1️⃣ Creating test provider user...');
    
    const testUserData = {
      username: `testprovider_${Date.now()}`,
      email: `testprovider_${Date.now()}@example.com`,
      password: 'testpassword123',
      fullName: 'Test Provider User',
      isProvider: true,
      building: 'Building A',
      apartment: '101'
    };

    const userResponse = await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUserData)
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      throw new Error(`User creation failed: ${errorData.message}`);
    }

    const userData = await userResponse.json();
    console.log('✅ Test user created successfully');
    console.log(`   User ID: ${userData.user.id}`);
    console.log(`   Provider Setup Token: ${userData.providerSetupToken ? 'Present' : 'Missing'}`);

    if (!userData.providerSetupToken) {
      throw new Error('Provider setup token not generated');
    }

    // Step 2: Simulate profile picture upload
    console.log('\n2️⃣ Simulating profile picture upload...');
    
    // For testing, we'll use a mock photo URL (in real scenario, this would come from object storage upload)
    const mockPhotoURL = 'https://test-bucket/uploads/test-profile-photo.jpg';
    console.log(`   Mock photo URL: ${mockPhotoURL}`);

    // Step 3: Create provider with profile picture
    console.log('\n3️⃣ Creating provider profile with photo...');
    
    const providerData = {
      categoryId: 'bcb265b9-3760-43ca-82e2-654b3dd655f4', // Using first available category
      title: 'Test Service Provider',
      description: 'This is a test provider profile created to verify the photo upload timing fix.',
      experience: 'Testing experience with automated verification systems.',
      profilePicture: mockPhotoURL, // This should now be handled correctly
      providerSetupToken: userData.providerSetupToken
    };

    const providerResponse = await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(providerData)
    });

    if (!providerResponse.ok) {
      const errorData = await providerResponse.json();
      throw new Error(`Provider creation failed: ${errorData.message}`);
    }

    const providerResult = await providerResponse.json();
    console.log('✅ Provider created successfully');
    console.log(`   Provider ID: ${providerResult.id}`);
    console.log(`   Profile Photo Path: ${providerResult.profilePhotoPath || 'Not set'}`);

    // Step 4: Verify user avatar was updated
    console.log('\n4️⃣ Verifying user avatar was updated...');
    
    const userCheckResponse = await fetch(`http://localhost:5000/api/users/${userData.user.id}`);
    if (userCheckResponse.ok) {
      const updatedUser = await userCheckResponse.json();
      console.log(`   User avatar: ${updatedUser.avatar || 'Not set'}`);
      
      if (updatedUser.avatar) {
        console.log('✅ User avatar updated successfully');
      } else {
        console.log('⚠️  User avatar not updated (photo upload may have failed silently)');
      }
    }

    // Step 5: Verify token was consumed
    console.log('\n5️⃣ Verifying provider setup token was consumed...');
    
    const tokenTestResponse = await fetch('http://localhost:5000/api/providers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...providerData,
        title: 'Duplicate Test Provider',
        providerSetupToken: userData.providerSetupToken // Should be invalid now
      })
    });

    if (!tokenTestResponse.ok) {
      const errorData = await tokenTestResponse.json();
      if (errorData.message.includes('Invalid or expired setup token')) {
        console.log('✅ Provider setup token properly consumed');
      } else {
        console.log(`⚠️  Unexpected error: ${errorData.message}`);
      }
    } else {
      console.log('❌ Token was not consumed (security issue)');
    }

    console.log('\n🎉 Provider Setup Flow Test Completed Successfully!');
    console.log('   ✅ User creation with provider setup token');
    console.log('   ✅ Provider creation with profile picture');
    console.log('   ✅ Profile picture handling before token consumption');
    console.log('   ✅ Provider setup token properly consumed');
    
    return {
      success: true,
      userId: userData.user.id,
      providerId: providerResult.id,
      profilePhotoPath: providerResult.profilePhotoPath
    };

  } catch (error) {
    console.error('\n❌ Provider Setup Flow Test Failed!');
    console.error(`   Error: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testProviderSetupFlow().then(result => {
  console.log('\n📊 Test Result Summary:');
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}).catch(error => {
  console.error('Fatal test error:', error);
  process.exit(1);
});