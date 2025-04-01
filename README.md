# Voice-to-Text Task Summarization & WhatsApp Automation

## Quick Start
```bash
# Install dependencies
npm install

# Start the server
npm start
```

## Overview
This project enables users to receive tasks via voice calls, convert them to text using Azure Speech Services, summarize the content using Microsoft Copilot, and send the summarized task list to WhatsApp automatically. It leverages **Azure Speech Services**, **Microsoft Copilot**, and **WhatsApp automation** through Voiso API.

## Features
- **Voice Call Reception**: Receive and record voice calls using Twilio
- **Speech-to-Text Conversion**: Transcribe spoken tasks using Azure Speech Services
- **AI-Powered Summarization**: Generate concise summaries using Microsoft Copilot
- **WhatsApp Integration**: Automatically send task summaries via WhatsApp using Voiso API

## Technology Stack
- **Azure Speech Services**: For high-quality voice-to-text conversion
- **Microsoft Copilot**: For intelligent conversation summarization
- **Twilio**: For handling voice calls and call recording
- **Voiso API**: For WhatsApp message automation
- **Node.js**: For backend implementation
- **Express**: For web server and API endpoints

## Prerequisites
- Azure account with Speech Services and OpenAI (Copilot) resources
- Twilio account with a phone number
- Voiso API account
- Node.js (v14 or higher)

## Setup Guide

### 1️⃣ Azure Configuration
1. Create an Azure Speech Services resource
   - Get your Speech Key and Region
2. Create an Azure OpenAI resource
   - Deploy Microsoft Copilot
   - Get your API Key and Endpoint

### 2️⃣ Twilio Setup
1. Create a Twilio account
2. Get a phone number
3. Configure webhook URLs in Twilio console

### 3️⃣ Voiso API Setup
1. Create a Voiso account
2. Get your API key
3. Configure WhatsApp integration

### 4️⃣ Environment Configuration
Create a `.env` file with the following variables:
```env
# Voiso API Configuration
VOISO_API_KEY=your_voiso_api_key_here
VOISO_BASE_URL=https://api.voiso.com/v1

# Azure Speech Services Configuration
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=your_azure_region_here

# Azure OpenAI (Copilot) Configuration
AZURE_OPENAI_API_KEY=your_azure_openai_key_here
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint_here
AZURE_OPENAI_DEPLOYMENT_NAME=your_copilot_deployment_name

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 5️⃣ Installation
```bash
# Install dependencies
npm install

# Start the server
npm start
```

## Usage
1. Call your Twilio phone number
2. Speak your task list (up to 5 minutes)
3. The system will:
   - Record your voice
   - Convert it to text using Azure Speech Services
   - Generate a summary using Microsoft Copilot
   - Send the summary to your WhatsApp

## API Endpoints
- `POST /voice`: Twilio webhook for incoming calls
- `POST /process-recording`: Process recorded audio
- `POST /recording-status`: Handle recording status updates
- `GET /health`: Health check endpoint

## Future Enhancements
- **Real-time Transcription**: Stream transcription as you speak
- **Multi-language Support**: Add support for multiple languages
- **Custom Summarization**: Allow customization of summary style and length
- **Analytics Dashboard**: Track call statistics and summaries
- **Team Collaboration**: Enable sharing summaries with team members

## Error Handling
The system includes comprehensive error handling for:
- Audio recording failures
- Transcription errors
- Summary generation issues
- WhatsApp delivery problems
- API rate limiting

## Security
- All API keys are stored securely in environment variables
- HTTPS endpoints for webhooks
- Input validation and sanitization
- Rate limiting on API endpoints

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For support, please open an issue in the GitHub repository or contact the maintainers.

---

Hope this README helps! Let me know if you need any modifications. 😊🚀
