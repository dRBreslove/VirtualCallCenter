import os
import requests
from typing import Dict, Any, Optional
from dotenv import load_dotenv

class VoisoClient:
    """Client for interacting with the Voiso API."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the Voiso client.
        
        Args:
            api_key: Voiso API key. If not provided, will look for VOISO_API_KEY in environment.
        """
        load_dotenv()
        self.api_key = api_key or os.getenv('VOISO_API_KEY')
        if not self.api_key:
            raise ValueError("API key is required. Set VOISO_API_KEY environment variable or pass it directly.")
        
        self.base_url = "https://api.voiso.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make an HTTP request to the Voiso API.
        
        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint
            **kwargs: Additional arguments to pass to requests
            
        Returns:
            API response as dictionary
        """
        url = f"{self.base_url}/{endpoint}"
        response = requests.request(method, url, headers=self.headers, **kwargs)
        response.raise_for_status()
        return response.json()
    
    def get_balance(self) -> Dict[str, Any]:
        """Get current contact center balance information."""
        return self._make_request("GET", "balance")
    
    def send_whatsapp_message(self, phone_number: str, message: str) -> Dict[str, Any]:
        """Send a WhatsApp message.
        
        Args:
            phone_number: Recipient's phone number
            message: Message content
        """
        payload = {
            "phone_number": phone_number,
            "message": message
        }
        return self._make_request("POST", "whatsapp/messages", json=payload)
    
    def get_conversations(self) -> Dict[str, Any]:
        """Get conversation messages."""
        return self._make_request("GET", "conversations") 