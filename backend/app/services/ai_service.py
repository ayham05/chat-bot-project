import json
import logging
import google.generativeai as genai
from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Configure Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY is not set. AI features will not work.")

class AIService:
    def __init__(self):
        self.model_name = settings.AI_MODEL
        try:
            self.model = genai.GenerativeModel(self.model_name)
        except Exception as e:
            logger.error(f"Failed to initialize model {self.model_name}: {e}")
            raise

    async def generate_problem(self, topic: str, difficulty: str) -> dict:
        prompt = (
            f"You are a Technical Interviewer. Generate a coding problem about {topic} "
            f"with {difficulty} difficulty.\n"
            "Respond with strictly clean JSON without markdown formatting. "
            "The JSON must contain:\n"
            "- title: string\n"
            "- description: string\n"
            "- examples: list of objects (input, output, explanation)\n"
            "- constraints: string\n"
            "- starter_code: string\n"
        )
        
        try:
            response = await self.model.generate_content_async(prompt)
            # Basic cleanup if model ignores "no markdown" instruction
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            return json.loads(text)
        except Exception as e:
            logger.error(f"Error in generate_problem: {e}")
            raise

    async def review_solution(self, problem_context: str, user_code: str) -> str:
        prompt = (
            f"You are a Code Reviewer.\n"
            f"Problem Context: {problem_context}\n"
            f"User Code:\n{user_code}\n"
            "Provide feedback on correctness, complexity, and bugs. "
            "Return the response as a Markdown string."
        )
        
        try:
            response = await self.model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error in review_solution: {e}")
            raise

    async def chat(self, track: str, message: str, history: list = None, **kwargs) -> dict:
        """Chat with the AI tutor."""
        system_prompt = (
            "You are CodeBot, a friendly C++ tutor for beginners. "
            "Answer in Arabic, keep code in English. Be encouraging."
        )
        full_prompt = f"System: {system_prompt}\nUser: {message}"
        
        if kwargs.get("problem_context"):
            full_prompt += f"\nContext: {kwargs['problem_context']}"
            
        if kwargs.get("code_context"):
            full_prompt += f"\nCode: {kwargs['code_context']}"

        # Add history if provided (simplistic history handling)
        # Gemeni supports chat history via start_chat but here we just append previous messages?
        # The original code just ignored history in the prompt construction!
        # "history" argument was unused in prompt construction in original code:
        # full_prompt = f"System: {PROBLEM_SOLVING_SYSTEM}\nUser: {message}"
        # ...
        # So I will replicate that behavior or maybe improve it?
        # User asked to "Rewrite app/services/ai_service.py".
        # But this specific restoration is to fix regression. I'll stick to original behavior + code_context support if it was there?
        # Original code:
        # 87:     async def chat(self, track: str, message: str, history: list = None, **kwargs) -> dict:
        # ...
        # 93:             response = await self.model.generate_content_async(full_prompt)
        
        try:
            response = await self.model.generate_content_async(full_prompt)
            return {
                "message": response.text,
                "message_ar": response.text,
                "suggestions": [],
            }
        except Exception as e:
            logger.error(f"Chat Error: {e}")
            return {
                "message": "عذراً، حدث خطأ في الاتصال.",
                "message_ar": "عذراً، حدث خطأ في الاتصال.",
                "suggestions": [],
            }

ai_service = AIService()
