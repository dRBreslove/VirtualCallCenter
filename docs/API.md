# API Reference

This document provides detailed information about the VirtualCallCenter API endpoints.

## Base URL
```
https://your-domain.com
```

## Authentication
All API endpoints require authentication using the Voiso API key in the Authorization header:
```
Authorization: Bearer your_voiso_api_key
```

## Endpoints

### Voice Call Handling

#### POST /voice
Handles incoming voice calls from Twilio.

**Request Body:**
```json
{
  "CallSid": "string",
  "From": "string",
  "To": "string",
  "CallStatus": "string"
}
```

**Response:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Record action="/process-recording" maxLength="300" playBeep="true" recordingStatusCallback="/recording-status" recordingStatusCallbackEvent="completed"/>
</Response>
```

### Recording Processing

#### POST /process-recording
Processes the recorded audio file.

**Request Body:**
- `RecordingUrl`: Audio file (multipart/form-data)
- `From`: Caller's phone number
- `CallSid`: Twilio call ID

**Response:**
```json
{
  "success": true,
  "message": "Call processed successfully",
  "data": {
    "transcription": "string",
    "summary": "string",
    "status": "success"
  }
}
```

### Recording Status

#### POST /recording-status
Handles recording status updates from Twilio.

**Request Body:**
```json
{
  "RecordingSid": "string",
  "RecordingUrl": "string",
  "RecordingStatus": "string",
  "RecordingDuration": "string",
  "RecordingChannels": "string",
  "RecordingSource": "string",
  "RecordingStartTime": "string",
  "RecordingErrorCode": "string",
  "RecordingErrorMsg": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Recording status updated"
}
```

### Health Check

#### GET /health
Checks the health status of the service.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "string",
  "services": {
    "azure_speech": "up",
    "azure_copilot": "up",
    "voiso": "up"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid request parameters",
  "details": "string"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid or missing API key"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "details": "string"
}
```

## Rate Limiting
- 100 requests per minute per API key
- 1000 requests per hour per API key

## Webhooks
The API supports webhook notifications for the following events:
- Call completed
- Recording processed
- Summary generated
- WhatsApp message sent

Configure webhook URLs in your Voiso dashboard to receive these notifications. 