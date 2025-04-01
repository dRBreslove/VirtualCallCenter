import VoisoClient from './voisoClient.js';

// Example usage
async function main() {
    try {
        // Initialize the client
        const voiso = new VoisoClient();

        // Get account balance
        const balance = await voiso.getBalance();
        console.log('Account Balance:', balance);

        // Send a WhatsApp message
        const messageResult = await voiso.sendWhatsAppMessage(
            '+1234567890',
            'Hello from Virtual Call Center!'
        );
        console.log('Message Sent:', messageResult);

        // Get conversations
        const conversations = await voiso.getConversations();
        console.log('Conversations:', conversations);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

main(); 