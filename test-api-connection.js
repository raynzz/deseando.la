// Test script to verify Directus API connection and collections endpoint
const API_URL = 'https://hoztlat-deseandola.6vlrrp.easypanel.host';
const API_TOKEN = '8CzN175Z3ibcoDZQRnD3v86AkZAcoaeh';

// Test function to check API connection
async function testAPIConnection() {
  console.log('=== Testing Directus API Connection ===');
  
  try {
    // Test 1: Check if API is reachable
    console.log('\n1. Testing API reachability...');
    const response = await fetch(`${API_URL}/server/info`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`API check failed: ${response.status} ${response.statusText}`);
    }
    
    const healthData = await response.json();
    console.log('✓ API is reachable');
    console.log('Server info:', healthData);
    
    // Test 2: Test collections endpoint
    console.log('\n2. Testing collections endpoint...');
    const collectionsResponse = await fetch(`${API_URL}/collections?limit=-1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Accept': 'application/json',
      }
    });
    
    if (!collectionsResponse.ok) {
      throw new Error(`Collections endpoint failed: ${collectionsResponse.status} ${collectionsResponse.statusText}`);
    }
    
    const collectionsData = await collectionsResponse.json();
    console.log('✓ Collections endpoint is accessible');
    console.log('Collections data:', JSON.stringify(collectionsData, null, 2));
    
    // Test 3: Test wishes endpoint
    console.log('\n3. Testing wishes endpoint...');
    const wishesResponse = await fetch(`${API_URL}/items/wishes?limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Accept': 'application/json',
      }
    });
    
    if (!wishesResponse.ok) {
      throw new Error(`Wishes endpoint failed: ${wishesResponse.status} ${wishesResponse.statusText}`);
    }
    
    const wishesData = await wishesResponse.json();
    console.log('✓ Wishes endpoint is accessible');
    console.log(`Found ${wishesData.data?.length || 0} wishes`);
    
    console.log('\n=== All tests passed! ===');
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testAPIConnection();