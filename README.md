# ECG Compression Benchmark Platform

A web platform for evaluating ECG compression algorithms with Codabench API integration.

## Features

- 🔐 User Registration and Authentication
- 📊 Real-time Leaderboard
- 📁 Algorithm Upload and Submission
- 🔗 Codabench API Integration
- 📈 Local Scoring System (as backup)
- 🧪 API Testing Tools

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file with the following configuration:

```env
# Server configuration
PORT=3000
JWT_SECRET=your-secret-key

# Codabench API configuration
CODABENCH_USERNAME=your-username
CODABENCH_PASSWORD=your-password
CODABENCH_API_URL=https://www.codabench.org/api
CODABENCH_COMPETITION_ID=5899
CODABENCH_SECRET_KEY=your-secret-key

# File upload configuration
MAX_FILE_SIZE=50000000
UPLOAD_DIR=./uploads
```

### 3. Start the Server

```bash
# Option 1: Direct start
npm start

# Option 2: Using start script
node start-server.js

# Option 3: Development mode
npm run dev
```

### 4. Access the Application

Visit http://localhost:3000 to access the main application.

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Competition
- `GET /api/leaderboard` - Get competition leaderboard
- `POST /api/submit-to-codabench` - Submit algorithm
- `GET /api/submission-status/:id` - Check submission status

### Codabench Integration
- `GET /api/test-codabench` - Test Codabench connection
- `GET /api/check-available-endpoints` - Check available endpoints

## Usage Guide

1. **Register**: Create an account on the main page
2. **Login**: Use your credentials to log in
3. **Upload Algorithm**: Submit your algorithm in .zip format
4. **View Results**: Check your scores on the leaderboard

## Troubleshooting

### Common Issues

1. **404 Error - API Endpoint Not Available**
   - Ensure the server is running
   - Check if port 3000 is available
   - Verify API_BASE_URL setting

2. **Authentication Failed**
   - Check JWT token validity
   - Verify login status
   - Clear browser localStorage and login again

3. **Codabench Connection Failed**
   - Verify Codabench credentials in .env file
   - Check network connection
   - Use API test page for diagnostics

## Project Structure

```
ecg-compression/
├── server.js          # Main server file
├── scripts.js         # Frontend JavaScript
├── styles.css         # Styles
├── index.html         # Main page
├── forum.js          # Forum functionality
├── .env              # Environment variables
├── package.json      # Project configuration
└── uploads/          # Upload directory
```

## Tech Stack

- **Backend**: Node.js + Express
- **Authentication**: JWT
- **File Upload**: Multer
- **API Integration**: Axios
- **Frontend**: HTML/CSS/JavaScript

## License

MIT License