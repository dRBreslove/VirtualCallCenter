import VoisoClient from '../voisoClient.js';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('VoisoClient', () => {
    let client;
    const mockApiKey = 'test-api-key';

    beforeEach(() => {
        client = new VoisoClient(mockApiKey);
        axios.mockClear();
    });

    describe('constructor', () => {
        it('should throw error if no API key is provided', () => {
            process.env.VOISO_API_KEY = '';
            expect(() => new VoisoClient()).toThrow('API key is required');
        });

        it('should use provided API key', () => {
            expect(client.apiKey).toBe(mockApiKey);
        });
    });

    describe('getBalance', () => {
        it('should make GET request to balance endpoint', async () => {
            const mockResponse = { data: { balance: 100 } };
            axios.mockResolvedValueOnce(mockResponse);

            await client.getBalance();

            expect(axios).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: 'GET',
                    url: `${client.baseURL}/balance`
                })
            );
        });
    });

    describe('sendWhatsAppMessage', () => {
        it('should make POST request to whatsapp/messages endpoint', async () => {
            const mockResponse = { data: { success: true } };
            axios.mockResolvedValueOnce(mockResponse);

            const phoneNumber = '+1234567890';
            const message = 'Test message';

            await client.sendWhatsAppMessage(phoneNumber, message);

            expect(axios).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: 'POST',
                    url: `${client.baseURL}/whatsapp/messages`,
                    data: {
                        phone_number: phoneNumber,
                        message: message
                    }
                })
            );
        });
    });
}); 