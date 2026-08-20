import pytesseract
from PIL import Image
import io
import os
from app.core.config import settings

# Configure Tesseract binary path if provided in environment variables
if settings.TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

def extract_text_from_file(file_bytes: bytes, file_name: str) -> str:
    """
    Extract text from laboratory images or PDF files using OCR or text decoders.
    Raises errors if OCR libraries or binaries are missing or fail.
    """
    ext = os.path.splitext(file_name)[1].lower()
    
    if ext in ['.png', '.jpg', '.jpeg']:
        try:
            image = Image.open(io.BytesIO(file_bytes))
            text = pytesseract.image_to_string(image)
            if not text.strip():
                raise ValueError("OCR returned empty text stream")
            return text.strip()
        except Exception as e:
            raise RuntimeError(f"OCR text extraction failed: {str(e)}")
            
    elif ext == '.pdf':
        raise ValueError("Direct PDF scanning is not supported. Please upload a clear image (PNG, JPG, or JPEG) of the laboratory report.")
        
    return "Unsupported document type for clinical OCR scanning."
