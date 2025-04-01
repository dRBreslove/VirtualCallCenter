import express from 'express';
import multer from 'multer';
import twilio from 'twilio';
import VoiceAgent from './voiceAgent.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const voiceAgent = new VoiceAgent();

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
    res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 