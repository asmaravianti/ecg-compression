const http = require('http');

console.log('🔍 Looking for ECG Compression Server...');
console.log('');

async function checkPort(port) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}`, { timeout: 2000 }, (res) => {
            resolve(true);
        });

        req.on('error', () => {
            resolve(false);
        });

        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
    });
}

async function findServer() {
    const ports = [3000, 3001, 3002, 3003, 3004, 3005];

    for (const port of ports) {
        process.stdout.write(`Checking port ${port}... `);
        const isRunning = await checkPort(port);

        if (isRunning) {
            console.log('✅ FOUND!');
            console.log('');
            console.log('🎉 ECG Compression Server is running!');
            console.log('');
            console.log('📂 Available pages:');
            console.log(`🏠 Main page:    http://localhost:${port}/index.html`);
            console.log(`👥 Team page:    http://localhost:${port}/team.html`);
            console.log(`🧪 API test:     http://localhost:${port}/api-test.html`);
            console.log(`🔧 Port test:    http://localhost:${port}/port-test.html`);
            console.log('');
            console.log('💡 Click any link above or copy to browser!');
            return;
        } else {
            console.log('❌');
        }
    }

    console.log('');
    console.log('❌ No server found on ports 3000-3005');
    console.log('');
    console.log('🔧 Try starting the server:');
    console.log('   node server.js');
    console.log('');
}

findServer();