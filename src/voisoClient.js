import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class VoisoClient {
    constructor(apiKey = null) {
        this.apiKey = apiKey || process.env.VOISO_API_KEY;
        if (!this.apiKey) {
            throw new Error('API key is required. Set VOISO_API_KEY environment variable or pass it directly.');
        }

        this.baseURL = process.env.VOISO_BASE_URL || 'https://api.voiso.com/v1';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    async makeRequest(method, endpoint, options = {}) {
        try {
            const url = `${this.baseURL}/${endpoint}`;
            const response = await axios({
                method,
                url,
                headers: this.headers,
                ...options
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(`Voiso API Error: ${error.response.data.message || error.message}`);
            }
            throw error;
        }
    }

    async getBalance() {
        return this.makeRequest('GET', 'balance');
    }

    async sendWhatsAppMessage(phoneNumber, message) {
        const payload = {
            phone_number: phoneNumber,
            message
        };
        return this.makeRequest('POST', 'whatsapp/messages', { data: payload });
    }

    async getConversations() {
        return this.makeRequest('GET', 'conversations');
    }
}

export default VoisoClient; 