from abc import ABC, abstractmethod
from typing import Dict, Any

class OAuth2Provider(ABC):
    """Base class for OAuth2 providers"""
    
    @abstractmethod
    def get_authorization_url(self) -> str:
        """Get the authorization URL for the provider"""
        pass
    
    @abstractmethod
    def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        pass
    
    @abstractmethod
    def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get user information from the provider"""
        pass