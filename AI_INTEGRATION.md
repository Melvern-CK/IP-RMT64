# AI Integration - Gemini Pokemon Team Assistant

## Overview
The Pokemon Battle Hub now includes AI-powered team recommendations and analysis using Google's Gemini AI. This feature helps users build optimal Pokemon teams and analyze existing teams for competitive battles.

## Features

### 1. Team Recommendation
- **Endpoint**: `POST /ai/recommend`
- **Description**: Get AI-powered Pokemon team recommendations based on user prompts
- **Input**: Natural language description of desired team strategy
- **Output**: Complete team recommendation with Pokemon, reasons, and analysis

### 2. Team Analysis
- **Endpoint**: `GET /ai/analyze/:teamId`
- **Description**: Analyze existing teams for strengths, weaknesses, and improvement suggestions
- **Input**: Team ID from user's existing teams
- **Output**: Detailed analysis with strategic insights

## Setup

### Backend Setup
1. Install the Google Generative AI package:
   ```bash
   npm install @google/generative-ai
   ```

2. Set up environment variables in `.env`:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Get your Gemini API key:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

### Frontend Setup
The frontend includes:
- **AI Recommendation Page** (`/ai`): Full-featured AI assistant interface
- **Navbar Integration**: AI Assistant link for authenticated users
- **Teams Page Integration**: Quick access button to AI features

## Usage Examples

### Team Recommendation Prompts
- "I want a balanced team for competitive battles with good type coverage"
- "Create a fast, offensive team focused on sweeping"
- "Build a defensive team that can stall and counter physical attackers"
- "I need a team weak to water types but strong against fire"

### Team Analysis
- Select any existing team by ID
- Get detailed analysis of type coverage, strengths, and weaknesses
- Receive strategic suggestions for improvement

## File Structure

### Backend Files
```
folder_server/
├── controllers/geminiController.js    # AI logic and API integration
├── routes/geminiRoute.js             # AI endpoints routing
├── app.js                            # Updated with AI routes
└── .env.example                      # Environment variables template
```

### Frontend Files
```
folder_client/client/src/
├── pages/
│   ├── AIRecommendation.jsx         # Main AI interface
│   └── AIRecommendation.css         # AI page styling
├── components/Navbar.jsx            # Updated with AI link
└── App.jsx                          # Updated with AI route
```

## API Endpoints

### POST /ai/recommend
**Request:**
```json
{
  "prompt": "I want a balanced team for competitive battles"
}
```

**Response:**
```json
{
  "summary": "Balanced team strategy focusing on type coverage...",
  "recommendedPokemon": [
    {
      "name": "charizard",
      "types": ["fire", "flying"],
      "sprite": "https://...",
      "reason": "Provides fire coverage and flying mobility..."
    }
  ],
  "analysis": {
    "strengths": ["Good type coverage", "Balanced offense/defense"],
    "weaknesses": ["Vulnerable to rock types"],
    "suggestions": ["Consider adding a water type"]
  }
}
```

### GET /ai/analyze/:teamId
**Response:**
```json
{
  "teamName": "My Competitive Team",
  "currentPokemon": [
    {
      "name": "pikachu",
      "types": ["electric"],
      "sprite": "https://..."
    }
  ],
  "analysis": {
    "strengths": ["Fast electric attacks"],
    "weaknesses": ["Weak to ground types"],
    "suggestions": ["Add a flying type for ground immunity"]
  }
}
```

## Error Handling
- **401 Unauthorized**: User must be logged in to access AI features
- **404 Not Found**: Team ID not found or doesn't belong to user
- **500 Internal Server Error**: AI API issues or processing errors

## Security
- All AI endpoints require JWT authentication
- Users can only analyze their own teams
- API key is securely stored in environment variables

## Testing
Run the existing test suite to ensure AI integration doesn't break existing functionality:
```bash
npm test
```

## Future Enhancements
- Pokemon move recommendations
- Battle simulation predictions
- Type effectiveness calculator
- Tournament meta analysis
- Team synergy scoring
