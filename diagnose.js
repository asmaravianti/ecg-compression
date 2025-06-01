console.log('🔍 ECG Compression Platform - System Diagnosis');
console.log('================================================');
console.log();

// Check Node.js version
console.log('1. Node.js Version:');
console.log(`   Version: ${process.version}`);
console.log(`   Platform: ${process.platform}`);
console.log(`   Architecture: ${process.arch}`);
console.log();

// Check current directory
console.log('2. Current Directory:');
console.log(`   Working Dir: ${process.cwd()}`);
console.log();

// Check if required files exist
const fs = require('fs');
const path = require('path');

console.log('3. Required Files Check:');
const requiredFiles = [
    'server.js',
    'package.json',
    '.env',
    'index.html',
    'team.html',
    'scripts.js',
    'styles.css'
];

requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    console.log(`   ${file}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
});
console.log();

// Check package.json
console.log('4. Package.json Check:');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`   Name: ${packageJson.name}`);
    console.log(`   Version: ${packageJson.version}`);
    console.log(`   Main: ${packageJson.main}`);
    console.log(`   Dependencies: ${Object.keys(packageJson.dependencies || {}).length} packages`);
} catch (error) {
    console.log(`   ❌ Error reading package.json: ${error.message}`);
}
console.log();

// Check .env file
console.log('5. Environment Configuration:');
try {
    require('dotenv').config();
    const envVars = [
        'PORT',
        'JWT_SECRET',
        'CODABENCH_USERNAME',
        'CODABENCH_PASSWORD',
        'CODABENCH_API_URL',
        'CODABENCH_COMPETITION_ID'
    ];

    envVars.forEach(varName => {
        const value = process.env[varName];
        console.log(`   ${varName}: ${value ? '✅ SET' : '❌ MISSING'}`);
    });
} catch (error) {
    console.log(`   ❌ Error loading .env: ${error.message}`);
}
console.log();

// Check dependencies
console.log('6. Dependencies Check:');
const dependencies = [
    'express',
    'bcryptjs',
    'jsonwebtoken',
    'axios',
    'multer',
    'form-data',
    'dotenv'
];

dependencies.forEach(dep => {
    try {
        require.resolve(dep);
        console.log(`   ${dep}: ✅ INSTALLED`);
    } catch (error) {
        console.log(`   ${dep}: ❌ MISSING`);
    }
});
console.log();

// Check node_modules
console.log('7. Node Modules:');
const nodeModulesExists = fs.existsSync(path.join(__dirname, 'node_modules'));
console.log(`   node_modules folder: ${nodeModulesExists ? '✅ EXISTS' : '❌ MISSING'}`);

if (nodeModulesExists) {
    try {
        const modules = fs.readdirSync(path.join(__dirname, 'node_modules'));
        console.log(`   Installed modules: ${modules.length} folders`);
    } catch (error) {
        console.log(`   ❌ Error reading node_modules: ${error.message}`);
    }
}
console.log();

// Check uploads directory
console.log('8. Upload Directory:');
const uploadsDir = path.join(__dirname, 'uploads');
const uploadsExists = fs.existsSync(uploadsDir);
console.log(`   uploads folder: ${uploadsExists ? '✅ EXISTS' : '⚠️ WILL BE CREATED'}`);

if (!uploadsExists) {
    try {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log(`   ✅ Created uploads directory`);
    } catch (error) {
        console.log(`   ❌ Failed to create uploads directory: ${error.message}`);
    }
}
console.log();

// Test basic server functionality
console.log('9. Basic Server Test:');
try {
    const express = require('express');
    const app = express();
    console.log(`   ✅ Express can be required`);

    // Try to create a basic route
    app.get('/test', (req, res) => {
        res.json({ status: 'ok' });
    });
    console.log(`   ✅ Basic route creation works`);

} catch (error) {
    console.log(`   ❌ Express test failed: ${error.message}`);
}
console.log();

console.log('🎯 Recommendations:');
console.log('===================');

// Check if npm install is needed
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('1. Run: npm install');
}

console.log('2. Start server with: node server.js');
console.log('3. Or use startup script: node start-server.js');
console.log('4. Access port test page: port-test.html');
console.log('5. Access API test page: http://localhost:3000/api-test.html');
console.log();

console.log('✅ Diagnosis complete!');