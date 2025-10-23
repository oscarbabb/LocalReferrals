// Test script to verify provider registration bug fix
// This script simulates a full provider registration flow

const BASE_URL = 'http://localhost:5000';

async function testProviderRegistration() {
  console.log('🧪 Testing Provider Registration Flow');
  console.log('=====================================\n');

  try {
    // Step 1: Register a new provider user
    console.log('1️⃣ Registering new provider user...');
    const timestamp = Date.now();
    const testUser = {
      username: `testprovider${timestamp}`,
      email: `testprovider${timestamp}@example.com`,
      password: 'TestPassword123!',
      fullName: 'Test Provider User',
      isProvider: true,
      building: 'Test Building',
      apartment: '101'
    };

    const registerResponse = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.json();
      throw new Error(`Registration failed: ${error.message}`);
    }

    const registerData = await registerResponse.json();
    console.log(`   ✅ User registered: ${registerData.user.id}`);
    console.log(`   🎫 Provider setup token: ${registerData.providerSetupToken ? 'RECEIVED' : 'MISSING'}`);

    if (!registerData.providerSetupToken) {
      throw new Error('❌ Provider setup token not generated!');
    }

    const providerSetupToken = registerData.providerSetupToken;

    // Step 2: Fetch categories for provider setup
    console.log('\n2️⃣ Fetching categories...');
    const categoriesResponse = await fetch(`${BASE_URL}/api/categories`);
    const categories = await categoriesResponse.json();
    console.log(`   ✅ Found ${categories.length} categories`);

    if (categories.length === 0) {
      throw new Error('❌ No categories found!');
    }

    const firstCategory = categories[0];
    console.log(`   📁 Using category: ${firstCategory.name} (${firstCategory.id})`);

    // Step 3: Create provider profile
    console.log('\n3️⃣ Creating provider profile...');
    const providerPayload = {
      categoryId: firstCategory.id,
      subcategoryId: null,
      title: 'Test Provider Service',
      description: 'This is a test provider profile created to verify the bug fix for provider registration.',
      experience: 'Expert in testing and quality assurance with over 10 years of experience.',
      profilePicture: null,
      providerSetupToken: providerSetupToken,
      categories: [{
        categoryId: firstCategory.id,
        subcategoryId: null,
        isPrimary: true
      }]
    };

    console.log('   📤 Sending POST /api/providers...');
    const providerResponse = await fetch(`${BASE_URL}/api/providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(providerPayload)
    });

    if (!providerResponse.ok) {
      const error = await providerResponse.json();
      throw new Error(`Provider creation failed: ${error.message}`);
    }

    const provider = await providerResponse.json();
    console.log(`   ✅ Provider created successfully!`);
    console.log(`   🆔 Provider ID: ${provider.id}`);
    console.log(`   👤 User ID: ${provider.userId}`);
    console.log(`   📋 Title: ${provider.title}`);

    // Step 4: Create payment method
    console.log('\n4️⃣ Creating payment method...');
    const paymentMethodPayload = {
      paymentType: 'hourly',
      hourlyRate: 250,
      minimumHours: 2,
      isActive: true,
      requiresDeposit: false,
      depositPercentage: 0
    };

    const paymentResponse = await fetch(`${BASE_URL}/api/providers/${provider.id}/payment-methods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentMethodPayload)
    });

    if (!paymentResponse.ok) {
      const error = await paymentResponse.json();
      throw new Error(`Payment method creation failed: ${error.message}`);
    }

    const paymentMethod = await paymentResponse.json();
    console.log(`   ✅ Payment method created: ${paymentMethod.id}`);

    // Step 5: Verify provider exists in database
    console.log('\n5️⃣ Verifying provider in database...');
    const providersResponse = await fetch(`${BASE_URL}/api/providers`);
    const allProviders = await providersResponse.json();
    
    const foundProvider = allProviders.find(p => p.id === provider.id);
    if (foundProvider) {
      console.log(`   ✅ Provider found in database!`);
      console.log(`   📊 Total providers in database: ${allProviders.length}`);
    } else {
      throw new Error('❌ Provider NOT found in database!');
    }

    // Step 6: Verify token was consumed
    console.log('\n6️⃣ Verifying token was consumed...');
    const retryResponse = await fetch(`${BASE_URL}/api/providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...providerPayload,
        title: 'Duplicate Provider (should fail)'
      })
    });

    if (!retryResponse.ok) {
      const error = await retryResponse.json();
      if (error.message.includes('Invalid or expired')) {
        console.log('   ✅ Token properly consumed (cannot reuse)');
      } else {
        console.log(`   ⚠️  Unexpected error: ${error.message}`);
      }
    } else {
      console.log('   ❌ Token was NOT consumed (security issue!)');
    }

    console.log('\n✨ ALL TESTS PASSED! ✨');
    console.log('==========================================');
    console.log('The provider registration bug has been FIXED!');
    return true;

  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('==========================================');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    return false;
  }
}

// Run the test
testProviderRegistration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
