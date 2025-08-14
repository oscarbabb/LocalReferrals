import fetch from 'node-fetch';

async function debugProviders() {
  try {
    const response = await fetch('http://localhost:5000/api/providers');
    const providers = await response.json();
    console.log('Providers response:', JSON.stringify(providers, null, 2));
    console.log('Number of providers:', providers.length);
  } catch (error) {
    console.error('Error:', error);
  }
}

debugProviders();