import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1/superadmin/tickets';

async function testApi() {
  console.log('Testing Support Dashboard APIs...');

  try {
    // Note: This test expects the server to be running and requires a valid session if verifyAuth is strict.
    // In a real dev environment, we might need to pass a cookie or token.
    // Assuming for this verification that we can reach the endpoint or it will at least return a 403/405 if alive.
    
    console.log('\n1. Testing /stats...');
    const stats = await axios.get(`${BASE_URL}/stats`);
    console.log('Stats Response:', JSON.stringify(stats.data, null, 2));

    console.log('\n2. Testing /trends...');
    const trends = await axios.get(`${BASE_URL}/trends?days=7`);
    console.log('Trends Response (last 7 days):', JSON.stringify(trends.data, null, 2));

    console.log('\n3. Testing /resolution-trends...');
    const resTrends = await axios.get(`${BASE_URL}/resolution-trends?days=7`);
    console.log('Resolution Trends Response (last 7 days):', JSON.stringify(resTrends.data, null, 2));

    console.log('\nVerification Successful!');
  } catch (error: any) {
    if (error.response) {
        console.error(`API Error (${error.response.status}):`, error.response.data);
        if (error.response.status === 403) {
            console.log('Note: 403 is expected if not authenticated in the test script.');
        }
    } else {
        console.error('Connection Error:', error.message);
    }
  }
}

testApi();
