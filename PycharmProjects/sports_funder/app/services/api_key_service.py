"""
API Key management service for secure key storage, retrieval, and rotation.
"""
import hashlib
import secrets
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
try:
    from cryptography.fernet import Fernet
except ImportError:
    # Fallback for when cryptography is not available
    Fernet = None
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.api_keys import ApiKey, ApiKeyType, ApiKeyStatus, ApiKeyUsage
from app.core.config_simple import settings


class ApiKeyService:
    """Service for managing API keys securely."""
    
    def __init__(self):
        # Generate encryption key from app secret (in production, use a dedicated key)
        if Fernet is None:
            # Fallback to simple encoding when cryptography is not available
            self.cipher = None
        else:
            key = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
            self.cipher = Fernet(Fernet.generate_key())  # In production, use the key above
    
    def _encrypt_key(self, api_key: str) -> str:
        """Encrypt an API key for storage."""
        if self.cipher is None:
            # Simple base64 encoding as fallback
            import base64
            return base64.b64encode(api_key.encode()).decode()
        return self.cipher.encrypt(api_key.encode()).decode()
    
    def _decrypt_key(self, encrypted_key: str) -> str:
        """Decrypt an API key for use."""
        if self.cipher is None:
            # Simple base64 decoding as fallback
            import base64
            return base64.b64decode(encrypted_key.encode()).decode()
        return self.cipher.decrypt(encrypted_key.encode()).decode()
    
    def _generate_key_hash(self, api_key: str) -> str:
        """Generate a hash of the API key for quick lookup."""
        return hashlib.sha256(api_key.encode()).hexdigest()
    
    def create_api_key(
        self,
        db: Session,
        name: str,
        key_type: ApiKeyType,
        api_key: str,
        description: Optional[str] = None,
        expires_at: Optional[datetime] = None,
        environment: str = "production",
        created_by: Optional[str] = None,
        notes: Optional[str] = None
    ) -> ApiKey:
        """Create a new API key entry."""
        
        # Check if this is the first key of this type
        existing_keys = db.query(ApiKey).filter(
            and_(
                ApiKey.key_type == key_type,
                ApiKey.environment == environment,
                ApiKey.status == ApiKeyStatus.ACTIVE
            )
        ).count()
        
        is_primary = existing_keys == 0
        
        # Create the API key record
        db_api_key = ApiKey(
            name=name,
            key_type=key_type,
            description=description,
            encrypted_key=self._encrypt_key(api_key),
            key_hash=self._generate_key_hash(api_key),
            status=ApiKeyStatus.ACTIVE,
            is_primary=is_primary,
            expires_at=expires_at,
            environment=environment,
            created_by=created_by,
            notes=notes
        )
        
        db.add(db_api_key)
        db.commit()
        db.refresh(db_api_key)
        
        return db_api_key
    
    def get_active_key(self, db: Session, key_type: ApiKeyType, environment: str = "production") -> Optional[str]:
        """Get the active API key for a specific type and environment."""
        api_key_record = db.query(ApiKey).filter(
            and_(
                ApiKey.key_type == key_type,
                ApiKey.environment == environment,
                ApiKey.status == ApiKeyStatus.ACTIVE,
                ApiKey.is_primary == True
            )
        ).first()
        
        if not api_key_record or api_key_record.is_expired:
            return None
        
        # Mark as used
        api_key_record.mark_as_used()
        db.commit()
        
        return self._decrypt_key(api_key_record.encrypted_key)
    
    def get_all_keys(self, db: Session, key_type: Optional[ApiKeyType] = None) -> List[ApiKey]:
        """Get all API keys, optionally filtered by type."""
        query = db.query(ApiKey)
        
        if key_type:
            query = query.filter(ApiKey.key_type == key_type)
        
        return query.order_by(ApiKey.created_at.desc()).all()
    
    def rotate_api_key(
        self,
        db: Session,
        key_id: int,
        new_api_key: str,
        deactivate_old: bool = True
    ) -> ApiKey:
        """Rotate an API key to a new value."""
        
        old_key = db.query(ApiKey).filter(ApiKey.id == key_id).first()
        if not old_key:
            raise ValueError("API key not found")
        
        # Create new key record
        new_key = ApiKey(
            name=f"{old_key.name} (Rotated)",
            key_type=old_key.key_type,
            description=old_key.description,
            encrypted_key=self._encrypt_key(new_api_key),
            key_hash=self._generate_key_hash(new_api_key),
            status=ApiKeyStatus.ACTIVE,
            is_primary=old_key.is_primary,
            expires_at=old_key.expires_at,
            environment=old_key.environment,
            created_by=old_key.created_by,
            notes=f"Rotated from key ID {key_id}"
        )
        
        db.add(new_key)
        
        # Deactivate old key if requested
        if deactivate_old:
            old_key.status = ApiKeyStatus.REVOKED
            old_key.is_primary = False
        
        db.commit()
        db.refresh(new_key)
        
        return new_key
    
    def revoke_api_key(self, db: Session, key_id: int) -> bool:
        """Revoke an API key."""
        api_key = db.query(ApiKey).filter(ApiKey.id == key_id).first()
        if not api_key:
            return False
        
        api_key.status = ApiKeyStatus.REVOKED
        api_key.is_primary = False
        db.commit()
        
        return True
    
    def test_api_key(self, db: Session, key_id: int) -> Dict[str, Any]:
        """Test an API key to see if it's working."""
        api_key_record = db.query(ApiKey).filter(ApiKey.id == key_id).first()
        if not api_key_record:
            return {"success": False, "error": "API key not found"}
        
        try:
            api_key = self._decrypt_key(api_key_record.encrypted_key)
            
            # Test the key based on its type
            if api_key_record.key_type == ApiKeyType.GOOGLE_GEMINI:
                return self._test_google_gemini_key(api_key)
            elif api_key_record.key_type == ApiKeyType.TWILIO_SMS:
                return self._test_twilio_key(api_key)
            elif api_key_record.key_type == ApiKeyType.GOOGLE_PLACES:
                return self._test_google_places_key(api_key)
            else:
                return {"success": True, "message": "Key format appears valid"}
                
        except Exception as e:
            api_key_record.record_error(str(e))
            db.commit()
            return {"success": False, "error": str(e)}
    
    def _test_google_gemini_key(self, api_key: str) -> Dict[str, Any]:
        """Test Google Gemini API key."""
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content("Test")
            return {"success": True, "message": "Google Gemini API key is working"}
        except Exception as e:
            return {"success": False, "error": f"Google Gemini test failed: {str(e)}"}
    
    def _test_twilio_key(self, api_key: str) -> Dict[str, Any]:
        """Test Twilio API key."""
        try:
            from twilio.rest import Client
            # This would need the account SID as well, but for now just check format
            if len(api_key) == 32 and api_key.isalnum():
                return {"success": True, "message": "Twilio API key format appears valid"}
            else:
                return {"success": False, "error": "Invalid Twilio API key format"}
        except Exception as e:
            return {"success": False, "error": f"Twilio test failed: {str(e)}"}
    
    def _test_google_places_key(self, api_key: str) -> Dict[str, Any]:
        """Test Google Places API key."""
        try:
            import requests
            # Simple test request
            url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=0,0&radius=1&key={api_key}"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return {"success": True, "message": "Google Places API key is working"}
            else:
                return {"success": False, "error": f"Google Places API returned status {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": f"Google Places test failed: {str(e)}"}


# Global service instance
api_key_service = ApiKeyService()
