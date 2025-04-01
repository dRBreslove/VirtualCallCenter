# Configuration Guide

This guide will help you set up and configure the VirtualCallCenter application.

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Azure account with Speech Services and OpenAI (Copilot) resources
- Twilio account with a phone number
- Voiso API account

## Setup Steps

### 1. Node.js Setup
1. Install Node.js (v14 or higher)
2. Verify installation:
   ```bash
   node --version
   npm --version
   ```
3. Install global dependencies:
   ```bash
   npm install -g pm2
   ```

### 2. Azure Configuration
1. Create an Azure Speech Services resource
   - Get your Speech Key and Region
2. Create an Azure OpenAI resource
   - Deploy Microsoft Copilot
   - Get your API Key and Endpoint

### 3. Twilio Setup
1. Create a Twilio account
2. Get a phone number
3. Configure webhook URLs in Twilio console:
   - Voice Webhook: `https://your-domain.com/voice`
   - Recording Status Callback: `https://your-domain.com/recording-status`

### 4. Voiso API Setup
1. Create a Voiso account
2. Get your API key
3. Configure WhatsApp integration

### 5. Environment Configuration
Create a `.env` file in the root directory with the following variables:

```env
# Node.js Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

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

# PM2 Configuration
PM2_INSTANCES=2
PM2_EXEC_MODE=cluster
```

## Security Considerations
- Never commit your `.env` file to version control
- Use strong, unique API keys
- Enable HTTPS for all webhook endpoints
- Regularly rotate API keys and credentials
- Monitor API usage and set up alerts for unusual activity
- Use helmet for Express security
- Implement proper CORS policies

## Troubleshooting
Common issues and solutions:

1. **Node.js Issues**
   - Verify Node.js version compatibility
   - Check npm dependencies
   - Monitor memory usage
   - Check PM2 logs

2. **API Connection Issues**
   - Verify API keys are correct
   - Check network connectivity
   - Ensure proper firewall rules

3. **Webhook Failures**
   - Verify webhook URLs are accessible
   - Check SSL certificate validity
   - Monitor webhook logs

4. **Audio Processing Issues**
   - Verify audio format compatibility
   - Check file size limits
   - Monitor Azure Speech Services quotas

## Monitoring and Maintenance
- Set up logging with Winston or Pino
- Configure PM2 monitoring
- Set up alerts for critical errors
- Regular backup of configuration
- Monitor API usage and costs
- Implement health checks
- Use proper error tracking (e.g., Sentry) 