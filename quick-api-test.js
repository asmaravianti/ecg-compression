const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
    console.log('🧪 Testing ECG Compression API...\n');

    // Test 1: Basic server connection
    try {
        const response = await axios.get('http://localhost:3000/');
        console.log('✅ Server is running');
    } catch (error) {
        console.log('❌ Server connection failed:', error.message);
        return;
    }

    // Test 2: Debug info
    try {
        const response = await axios.get(`${API_BASE}/debug-info`);
        console.log('✅ Debug info endpoint working');
        console.log('   API URL:', response.data.apiUrl);
        console.log('   Competition ID:', response.data.competitionId);
    } catch (error) {
        console.log('❌ Debug info failed:', error.message);
    }

    // Test 3: Registration
    const testUser = {
        teamName: 'TestTeam' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        password: 'testpass123'
    };

    let authToken = null;

    try {
        const response = await axios.post(`${API_BASE}/register`, testUser);
        console.log('✅ Registration working');
    } catch (error) {
        console.log('⚠️ Registration response:', error.response?.status, error.response?.data?.message);
    }

    // Test 4: Login
    try {
        const response = await axios.post(`${API_BASE}/login`, {
            team_name: testUser.teamName,
            password: testUser.password
        });

        if (response.data.success && response.data.token) {
            authToken = response.data.token;
            console.log('✅ Login working - Token received');
        } else {
            console.log('⚠️ Login response:', response.data);
        }
    } catch (error) {
        console.log('❌ Login failed:', error.response?.data?.message || error.message);
    }

    // Test 5: Leaderboard (requires auth)
    if (authToken) {
        try {
            const response = await axios.get(`${API_BASE}/leaderboard`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            console.log('✅ Leaderboard working');
            console.log('   Results count:', response.data.results?.length || 0);
        } catch (error) {
            console.log('❌ Leaderboard failed:', error.response?.data?.message || error.message);
        }

        // Test 6: Codabench connection
        try {
            const response = await axios.get(`${API_BASE}/test-codabench`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            console.log('✅ Codabench test endpoint working');
            console.log('   Success:', response.data.success);
            console.log('   Message:', response.data.message);
        } catch (error) {
            console.log('⚠️ Codabench test:', error.response?.data?.message || error.message);
        }
    }

    console.log('\n🎉 API test completed!');
    console.log('📝 Next steps:');
    console.log('   1. Open http://localhost:3000/index.html');
    console.log('   2. Try registering and logging in');
    console.log('   3. Visit http://localhost:3000/team.html after login');
    console.log('   4. Use http://localhost:3000/api-test.html for detailed testing');
}

// Run the test
testAPI().catch(console.error);