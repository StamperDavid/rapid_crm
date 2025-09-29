"""
Security utilities for authentication and authorization.
"""
from datetime import datetime, timedelta
from typing import Optional, Union
from passlib.context import CryptContext
from fastapi import HTTPException, status
from app.core.config_simple import settings

# Try to import jose, fallback to basic implementation if not available
try:
    from jose import JWTError, jwt
    JOSE_AVAILABLE = True
except ImportError:
    JOSE_AVAILABLE = False
    print("Warning: python-jose not available. JWT functionality will be limited.")
    
    # Fallback JWT implementation
    class JWTError(Exception):
        pass
    
    def jwt_encode(payload, key, algorithm):
        """Basic JWT encoding fallback."""
        import base64
        import json
        import hmac
        import hashlib
        
        header = {"alg": "HS256", "typ": "JWT"}
        header_encoded = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip('=')
        payload_encoded = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip('=')
        
        message = f"{header_encoded}.{payload_encoded}"
        signature = hmac.new(key.encode(), message.encode(), hashlib.sha256).digest()
        signature_encoded = base64.urlsafe_b64encode(signature).decode().rstrip('=')
        
        return f"{message}.{signature_encoded}"
    
    def jwt_decode(token, key, algorithms):
        """Basic JWT decoding fallback."""
        import base64
        import json
        import hmac
        import hashlib
        
        try:
            parts = token.split('.')
            if len(parts) != 3:
                raise JWTError("Invalid token format")
            
            header_encoded, payload_encoded, signature_encoded = parts
            
            # Verify signature
            message = f"{header_encoded}.{payload_encoded}"
            expected_signature = hmac.new(key.encode(), message.encode(), hashlib.sha256).digest()
            expected_signature_encoded = base64.urlsafe_b64encode(expected_signature).decode().rstrip('=')
            
            if signature_encoded != expected_signature_encoded:
                raise JWTError("Invalid signature")
            
            # Decode payload
            payload = json.loads(base64.urlsafe_b64decode(payload_encoded + '==').decode())
            return payload
        except Exception as e:
            raise JWTError(f"Token decode error: {e}")
    
    # Create aliases for the fallback functions
    jwt.encode = jwt_encode
    jwt.decode = jwt_decode

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def get_current_user_id(token: str) -> Optional[int]:
    """Extract user ID from JWT token."""
    payload = verify_token(token)
    if payload is None:
        return None
    return payload.get("sub")


def authenticate_user(db, email: str, password: str, user_model):
    """Authenticate a user with email and password."""
    user = db.query(user_model).filter(user_model.email == email).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

