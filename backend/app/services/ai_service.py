import os
import json
import google.generativeai as genai
from app.config import get_settings

settings = get_settings()

# Configure Gemini
api_key = settings.final_gemini_key or os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("CRITICAL WARNING: GOOGLE_API_KEY is missing")

try:
    genai.configure(api_key=api_key)
except Exception as e:
    print(f"Error configuring Gemini: {e}")

# Constants for prompts
PROBLEM_SOLVING_SYSTEM = """You are CodeBot, a friendly C++ tutor for beginners. 
Answer in Arabic, keep code in English. Be encouraging."""

GRADING_PROMPT = """You are a C++ grader.
Problem: {desc}
Code: {code}
Return JSON: {{ "status": "ACCEPTED"|"WRONG_ANSWER", "is_correct": bool, "feedback_ar": "string", "feedback_en": "string", "hint": "string" }}
"""

GENERATION_PROMPT = """Generate a C++ problem. Topic: {topic}, Difficulty: {difficulty}.
Return JSON: {{ "title_en": "", "title_ar": "", "desc_en": "", "desc_ar": "", "sample_io": [], "constraints": "" }}
"""

class AIService:
    def __init__(self):
        self.model = self._init_model()
    
    def _init_model(self):
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            # Test generation? No, just return it.
            return model
        except Exception:
            print("Flash model failed, falling back to Pro")
            return genai.GenerativeModel('gemini-pro')

    async def chat(self, track: str, message: str, history: list = None, **kwargs) -> dict:
        try:
            # Simple direct generation for robustness
            chat = self.model.start_chat(history=[])
            
            # Construct prompt with context
            full_prompt = f"System: {PROBLEM_SOLVING_SYSTEM}\nUser: {message}"
            if kwargs.get('problem_context'):
                full_prompt += f"\nContext: {kwargs['problem_context']}"
                
            response = await self.model.generate_content_async(full_prompt)
            return {
                "message": response.text,
                "message_ar": response.text,
                "suggestions": []
            }
        except Exception as e:
            print(f"Chat Error: {e}")
            return {"message": "عذراً، حدث خطأ في الاتصال.", "message_ar": "عذراً، حدث خطأ في الاتصال.", "suggestions": []}

    async def grade_code(self, code: str, problem_desc: str, **kwargs) -> dict:
        try:
            prompt = GRADING_PROMPT.format(desc=problem_desc, code=code)
            response = await self.model.generate_content_async(prompt)
            text = response.text
            
            # Extract JSON
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1:
                return json.loads(text[start:end])
            return {"status": "ERROR", "is_correct": False, "feedback_ar": "فشل تحليل الرد"}
            
        except Exception as e:
            print(f"Grading Error: {e}")
            return {"status": "ERROR", "is_correct": False, "feedback_ar": "خطأ في التقييم"}

    async def generate_problem(self, topic: str, difficulty: str, **kwargs) -> dict:
        try:
            prompt = GENERATION_PROMPT.format(topic=topic, difficulty=difficulty)
            response = await self.model.generate_content_async(prompt)
            text = response.text
            
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1:
                data = json.loads(text[start:end])
                data['topic'] = topic
                data['difficulty'] = difficulty
                return data
            raise ValueError("No JSON")
            
        except Exception as e:
            print(f"Generation Error: {e}")
            raise e

# Singleton
ai_service = AIService()
def get_ai_service(): return ai_service
