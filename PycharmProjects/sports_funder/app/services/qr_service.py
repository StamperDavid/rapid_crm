import qrcode
import io
import base64
from typing import Optional
import structlog

logger = structlog.get_logger()


class QRCodeService:
    """Service for automatically generating QR codes for new accounts."""
    
    @staticmethod
    def generate_qr_code_data(entity_type: str, entity_id: int, base_url: str = "https://sportsfunder.com") -> str:
        """Generate QR code data string for an entity."""
        return f"{base_url}/{entity_type}/{entity_id}"
    
    @staticmethod
    def generate_qr_code_image(qr_data: str, size: int = 200) -> str:
        """Generate QR code image and return as base64 data URL."""
        try:
            # Create QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(qr_data)
            qr.make(fit=True)
            
            # Create image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            img_str = base64.b64encode(buffer.getvalue()).decode()
            
            return f"data:image/png;base64,{img_str}"
            
        except Exception as e:
            logger.error(f"Error generating QR code: {e}")
            return None
    
    @staticmethod
    def generate_entity_qr_codes(entity_type: str, entity_id: int, base_url: str = "https://sportsfunder.com") -> dict:
        """Generate both QR code data and image for an entity."""
        qr_data = QRCodeService.generate_qr_code_data(entity_type, entity_id, base_url)
        qr_image = QRCodeService.generate_qr_code_image(qr_data)
        
        return {
            "qr_code_data": qr_data,
            "qr_code_image_url": qr_image
        }


def auto_generate_qr_codes_for_user(user_id: int, user_type: str):
    """Automatically generate QR codes when a user account is created."""
    try:
        qr_info = QRCodeService.generate_entity_qr_codes(user_type, user_id)
        logger.info(f"Auto-generated QR codes for {user_type} {user_id}")
        return qr_info
    except Exception as e:
        logger.error(f"Failed to auto-generate QR codes for {user_type} {user_id}: {e}")
        return None


def auto_generate_qr_codes_for_school(school_id: int):
    """Automatically generate QR codes when a school is created."""
    try:
        qr_info = QRCodeService.generate_entity_qr_codes("school", school_id)
        logger.info(f"Auto-generated QR codes for school {school_id}")
        return qr_info
    except Exception as e:
        logger.error(f"Failed to auto-generate QR codes for school {school_id}: {e}")
        return None


def auto_generate_qr_codes_for_player(player_id: int):
    """Automatically generate QR codes when a player is created."""
    try:
        qr_info = QRCodeService.generate_entity_qr_codes("player", player_id)
        logger.info(f"Auto-generated QR codes for player {player_id}")
        return qr_info
    except Exception as e:
        logger.error(f"Failed to auto-generate QR codes for player {player_id}: {e}")
        return None