import * as sdk from '@azure/cognitiveservices-speech-sdk';
import { OpenAIClient } from '@azure/openai';
import VoisoClient from './voisoClient.js';
import dotenv from 'dotenv';

dotenv.config();

class VoiceAgent {
    constructor() {
        // Initialize Azure Speech Services
        this.speechConfig = sdk.SpeechConfig.fromSubscription(
            process.env.AZURE_SPEECH_KEY,
            process.env.AZURE_SPEECH_REGION
        );
        
        // Initialize Azure OpenAI (Copilot)
        this.copilot = new OpenAIClient({
            apiKey: process.env.AZURE_OPENAI_API_KEY,
            endpoint: process.env.AZURE_OPENAI_ENDPOINT
        });

        this.voiso = new VoisoClient();
    }

    async transcribeAudio(audioBuffer) {
        try {
            // Create audio config from buffer
            const audioConfig = sdk.AudioConfig.fromAudioFileInput(audioBuffer);
            
            // Create speech recognizer
            const recognizer = new sdk.SpeechRecognizer(
                this.speechConfig,
                audioConfig
            );

            return new Promise((resolve, reject) => {
                let transcription = '';

                recognizer.recognized = (s, e) => {
                    transcription += e.result.text + ' ';
                };

                recognizer.recognizeOnceAsync(
                    result => {
                        transcription += result.text;
                        recognizer.close();
                        resolve(transcription.trim());
                    },
                    error => {
                        recognizer.close();
                        reject(error);
                    }
                );
            });
        } catch (error) {
            console.error('Transcription error:', error);
            throw new Error('Failed to transcribe audio');
        }
    }

    async generateSummary(text) {
        try {
            const completion = await this.copilot.getChatCompletions(
                process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
                [
                    {
                        role: "system",
                        content: "You are Microsoft Copilot, a helpful AI assistant that creates concise summaries of conversations. Focus on key points and action items."
                    },
                    {
                        role: "user",
                        content: `Please summarize this conversation: ${text}`
                    }
                ],
                {
                    maxTokens: 150,
                    temperature: 0.7
                }
            );

            return completion.choices[0].message.content;
        } catch (error) {
            console.error('Summary generation error:', error);
            throw new Error('Failed to generate summary');
        }
    }

    async processCall(audioBuffer, phoneNumber) {
        try {
            // Transcribe audio to text
            const transcription = await this.transcribeAudio(audioBuffer);
            console.log('Transcription:', transcription);

            // Generate summary using Copilot
            const summary = await this.generateSummary(transcription);
            console.log('Summary:', summary);

            // Send summary via WhatsApp
            const message = `Call Summary (Powered by Microsoft Copilot):\n${summary}`;
            await this.voiso.sendWhatsAppMessage(phoneNumber, message);

            return {
                transcription,
                summary,
                status: 'success'
            };
        } catch (error) {
            console.error('Call processing error:', error);
            throw error;
        }
    }
}

export default VoiceAgent; 