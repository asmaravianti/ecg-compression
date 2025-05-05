# ECG Compression Benchmark Website

This repository contains the frontend code for the ECG Compression Benchmark website, which allows users to submit and evaluate ECG compression algorithms.

## Features

- Responsive design for all devices
- Interactive ECG visualization
- Algorithm submission and evaluation
- Result tracking and leaderboard
- Integration with Codabench for algorithm evaluation

## Quick Start for Development

Simply open `index.html` in your browser to view the website. For development purposes, the site uses a mock API to simulate Codabench integration.

## Codabench Integration

The website integrates with Codabench to process and evaluate algorithm submissions. Due to CORS restrictions, direct browser-to-Codabench communication is not possible. Two options are available:

1. **Development Mode** (currently active): Uses mock local data to simulate the Codabench API.
2. **Production Mode**: Requires a backend proxy server to handle communication with Codabench.

### Setting Up the Proxy Server for Production

To enable actual Codabench integration, you'll need to:

1. Create a backend server (Node.js/Express recommended) that acts as a proxy
2. Deploy the backend server (e.g., on Heroku, AWS, etc.)
3. Update the `useLocalMock` flag in `codabench-integration.js` to `false`

#### Example Node.js Proxy Server Implementation

```javascript
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static('public'));

// Submit algorithm to Codabench
app.post('/api/proxy/codabench/submit', upload.single('file'), async (req, res) => {
  try {
    const { secret_key, method_name, description } = req.body;
    const file = req.file;

    // Create form data
    const formData = new FormData();
    formData.append('secret_key', secret_key);
    formData.append('method_name', method_name);
    
    if (description) {
      formData.append('description', description);
    }
    
    // Append file
    formData.append('file', fs.createReadStream(file.path), {
      filename: file.originalname,
      contentType: file.mimetype
    });

    // Send to Codabench
    const response = await axios.post(
      'https://www.codabench.org/api/submissions/', 
      formData, 
      {
        headers: {
          ...formData.getHeaders()
        }
      }
    );

    // Remove temporary file
    fs.unlinkSync(file.path);

    // Return response
    res.json(response.data);
  } catch (error) {
    console.error('Error submitting to Codabench:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get results from Codabench
app.get('/api/proxy/codabench/results/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;
    
    const response = await axios.get(
      `https://www.codabench.org/api/results/${submissionId}`
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error getting results from Codabench:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user submissions from Codabench
app.get('/api/proxy/codabench/my-submissions', async (req, res) => {
  try {
    // In a real implementation, you would forward auth cookies or tokens
    const response = await axios.get(
      'https://www.codabench.org/api/my-submissions/'
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error getting submissions from Codabench:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Required NPM Packages

```
npm install express cors multer axios form-data
```

## Authentication

For the production setup, you'll need to implement authentication that works with Codabench. This typically involves:

1. Creating a login system that obtains credentials from Codabench
2. Storing authentication tokens securely
3. Forwarding these tokens with each proxy request

## Deployment

1. Deploy the frontend to a static file host (GitHub Pages, Netlify, etc.)
2. Deploy the backend proxy server to a suitable hosting service
3. Update the API endpoints in `codabench-integration.js` to point to your deployed proxy server

## Credits

- ECG animation inspired by PhysioNet resources
- Competition framework powered by Codabench 