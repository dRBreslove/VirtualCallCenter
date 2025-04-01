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
        
        // Call quality metrics
        this.callMetrics = {
            totalCalls: 0,
            successfulTranscriptions: 0,
            failedTranscriptions: 0,
            averageTranscriptionTime: 0,
            totalTranscriptionTime: 0
        };
    }

    async transcribeAudio(audioBuffer) {
        const startTime = Date.now();
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
                let confidence = 0;
                let wordCount = 0;

                recognizer.recognized = (s, e) => {
                    transcription += e.result.text + ' ';
                    confidence += e.result.confidence;
                    wordCount += e.result.text.split(' ').length;
                };

                recognizer.recognizeOnceAsync(
                    result => {
                        transcription += result.text;
                        confidence += result.confidence;
                        wordCount += result.text.split(' ').length;
                        
                        // Calculate average confidence
                        const avgConfidence = confidence / (wordCount || 1);
                        
                        // Update metrics
                        this.callMetrics.totalCalls++;
                        this.callMetrics.successfulTranscriptions++;
                        const transcriptionTime = Date.now() - startTime;
                        this.callMetrics.totalTranscriptionTime += transcriptionTime;
                        this.callMetrics.averageTranscriptionTime = 
                            this.callMetrics.totalTranscriptionTime / this.callMetrics.successfulTranscriptions;

                        recognizer.close();
                        resolve({
                            text: transcription.trim(),
                            confidence: avgConfidence,
                            wordCount,
                            processingTime: transcriptionTime
                        });
                    },
                    error => {
                        this.callMetrics.failedTranscriptions++;
                        recognizer.close();
                        reject(new Error(`Transcription failed: ${error.message}`));
                    }
                );
            });
        } catch (error) {
            this.callMetrics.failedTranscriptions++;
            console.error('Transcription error:', error);
            throw new Error(`Failed to transcribe audio: ${error.message}`);
        }
    }

    async generateSummary(text, options = {}) {
        const {
            model = process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
            maxTokens = 150,
            temperature = 0.7,
            format = 'text'
        } = options;

        try {
            const completion = await this.copilot.getChatCompletions(
                model,
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
                    maxTokens,
                    temperature
                }
            );

            const summary = completion.choices[0].message.content;

            // Format the summary based on requested format
            if (format === 'json') {
                return {
                    summary,
                    metadata: {
                        model,
                        tokens: completion.usage,
                        timestamp: new Date().toISOString()
                    }
                };
            }

            return summary;
        } catch (error) {
            console.error('Summary generation error:', error);
            throw new Error(`Failed to generate summary: ${error.message}`);
        }
    }

    async processCall(audioBuffer, phoneNumber, options = {}) {
        try {
            // Transcribe audio to text
            const transcriptionResult = await this.transcribeAudio(audioBuffer);
            console.log('Transcription:', transcriptionResult);

            // Generate summary using Copilot
            const summary = await this.generateSummary(transcriptionResult.text, options);
            console.log('Summary:', summary);

            // Prepare message based on transcription quality
            let message = 'Call Summary (Powered by Microsoft Copilot):\n';
            
            if (transcriptionResult.confidence < 0.7) {
                message += '⚠️ Note: This transcription may have low accuracy.\n\n';
            }
            
            message += typeof summary === 'string' ? summary : summary.summary;

            // Add quality metrics if requested
            if (options.includeMetrics) {
                message += `\n\nQuality Metrics:\n`;
                message += `- Confidence: ${(transcriptionResult.confidence * 100).toFixed(1)}%\n`;
                message += `- Words: ${transcriptionResult.wordCount}\n`;
                message += `- Processing Time: ${transcriptionResult.processingTime}ms`;
            }

            // Send summary via WhatsApp
            await this.voiso.sendWhatsAppMessage(phoneNumber, message);

            return {
                success: true,
                transcription: transcriptionResult,
                summary,
                metrics: this.callMetrics
            };
        } catch (error) {
            console.error('Call processing error:', error);
            throw new Error(`Failed to process call: ${error.message}`);
        }
    }

    getMetrics() {
        return { ...this.callMetrics };
    }

    resetMetrics() {
        this.callMetrics = {
            totalCalls: 0,
            successfulTranscriptions: 0,
            failedTranscriptions: 0,
            averageTranscriptionTime: 0,
            totalTranscriptionTime: 0
        };
    }
}

export default VoiceAgent; 