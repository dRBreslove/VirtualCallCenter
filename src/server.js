import express from 'express';
import multer from 'multer';
import twilio from 'twilio';
import { WebSocketServer } from 'ws';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import VoiceAgent from './voiceAgent.js';
import dotenv from 'dotenv';
import WebSocket from 'ws';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import connectDB from './config/db.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const upload = multer({ storage: multer.memoryStorage() });
const voiceAgent = new VoiceAgent();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Enable compression
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            // Handle different message types
            switch (data.type) {
                case 'call_start':
                    // Handle call start
                    break;
                case 'call_end':
                    // Handle call end
                    break;
                case 'agent_status':
                    // Handle agent status update
                    break;
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

// Twilio webhook for incoming calls
app.post('/voice', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Start recording when call is answered
    twiml.record({
        action: '/process-recording',
        maxLength: 300,
        playBeep: true,
        recordingStatusCallback: '/recording-status',
        recordingStatusCallbackEvent: ['completed']
    });

    res.type('text/xml');
    res.send(twiml.toString());
});

// Handle recording status updates
app.post('/recording-status', (req, res) => {
    console.log('Recording status:', req.body);
    // Broadcast status to connected WebSocket clients
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'recording_status',
                data: req.body
            }));
        }
    });
    res.sendStatus(200);
});

// Process the recording
app.post('/process-recording', upload.single('RecordingUrl'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No audio file received');
        }

        const phoneNumber = req.body.From;
        const result = await voiceAgent.processCall(req.file.buffer, phoneNumber);
        
        console.log('Call processed successfully:', result);
        
        // Broadcast result to connected WebSocket clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'call_processed',
                    data: { phoneNumber, result }
                }));
            }
        });

        res.json({ success: true, message: 'Call processed successfully' });
    } catch (error) {
        console.error('Error processing recording:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        websocketConnections: wss.clients.size
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 