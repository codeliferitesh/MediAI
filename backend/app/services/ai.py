import google.generativeai as genai
import json
from app.core.config import settings

# Configure Gemini API client if key is supplied
has_gemini = False
if settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        has_gemini = True
    except Exception as e:
        print(f"Gemini configuration error: {e}")

def summarize_medical_report(extracted_text: str) -> dict:
    """
    Summarizes lab report findings into structured observations using Gemini.
    Raises an error if Gemini is not configured or if the API call fails.
    """
    if not has_gemini:
        raise RuntimeError("Gemini API is not configured on the server.")
        
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        You are a Clinical Decision Support System assistant. Summarize the following medical text.
        Do not provide a final diagnosis. Formulate the response in valid JSON matching this schema:
        {{
            "key_findings": ["finding 1", "finding 2"],
            "abnormal_values": {{"metric": "value"}},
            "observations": ["observation 1"],
            "suggested_questions": ["question 1"],
            "summary_text": "general text summary"
        }}
        Medical report text:
        {extracted_text}
        """
        response = model.generate_content(prompt)
        res_text = response.text.strip()
        start = res_text.find('{')
        end = res_text.rfind('}') + 1
        if start != -1 and end != -1:
            return json.loads(res_text[start:end])
        raise ValueError(f"Failed to parse clinical summary. Response did not contain valid JSON: {res_text}")
    except Exception as e:
        raise RuntimeError(f"Gemini clinical summarization failed: {str(e)}")

def analyze_symptoms_chat(symptoms_text: str) -> dict:
    """
    Analyzes symptoms and provides triage priority advice using Gemini.
    """
    if not has_gemini:
        raise RuntimeError("Gemini API is not configured on the server.")
        
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        You are a Clinical Decision Support System assistant. Analyze these symptoms: "{symptoms_text}".
        Provide triage feedback (Urgency level, Reasoning, Follow-up questions).
        Do not diagnose. All emergency guidelines must recommend calling 108 (the Indian emergency response number) instead of 911.
        Provide valid JSON matching this schema:
        {{
            "triage_priority": "Critical" | "High" | "Medium" | "Low",
            "urgency_reasoning": "Reason here...",
            "follow_up_questions": ["Question 1?"],
            "clinical_guidance": "Recommended next steps..."
        }}
        """
        response = model.generate_content(prompt)
        res_text = response.text.strip()
        start = res_text.find('{')
        end = res_text.rfind('}') + 1
        if start != -1 and end != -1:
            return json.loads(res_text[start:end])
        raise ValueError(f"Failed to parse symptom analysis. Response did not contain valid JSON: {res_text}")
    except Exception as e:
        raise RuntimeError(f"Gemini symptom analyzer failed: {str(e)}")

def analyze_medical_image(image_bytes: bytes, mime_type: str) -> dict:
    """
    Analyzes medical scan images (X-Rays, scans) using Gemini Multimodal inputs.
    """
    if not has_gemini:
        raise RuntimeError("Gemini API is not configured on the server.")
        
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = """
        You are a Clinical Decision Support System assistant. Analyze this medical scan image (e.g. Chest X-Ray, MRI, CT scan).
        Do not provide a final diagnosis. Formulate the response in valid JSON matching this schema:
        {
            "key_findings": ["finding 1", "finding 2"],
            "abnormal_values": {"metric": "value"},
            "observations": ["observation 1"],
            "suggested_questions": ["question 1"],
            "summary_text": "general scan summary and visual observations"
        }
        """
        response = model.generate_content([
            {"mime_type": mime_type, "data": image_bytes},
            prompt
        ])
        res_text = response.text.strip()
        start = res_text.find('{')
        end = res_text.rfind('}') + 1
        if start != -1 and end != -1:
            return json.loads(res_text[start:end])
        raise ValueError(f"Failed to parse medical image analysis. Response did not contain valid JSON: {res_text}")
    except Exception as e:
        raise RuntimeError(f"Gemini scan analysis failed: {str(e)}")
