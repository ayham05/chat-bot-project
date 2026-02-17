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

    def _clean_json_response(self, text: str) -> str:
        """Strip markdown code fencing from an AI response."""
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

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
            text = self._clean_json_response(response.text)
            return json.loads(text)
        except Exception as e:
            logger.error(f"Error in generate_problem: {e}")
            raise

    async def grade_code(
        self,
        code: str,
        problem_desc: str,
        constraints: str | None = None,
        sample_io: list | None = None,
    ) -> dict:
        """Grade a user's code submission using AI.

        Returns a dict with: status, is_correct, feedback_en, feedback_ar, hint.
        """
        sample_io_text = json.dumps(sample_io, ensure_ascii=False) if sample_io else "N/A"

        prompt = (
            "You are an expert code grader for a C++ / Robotics educational platform.\n"
            "Evaluate the following code against the problem description.\n\n"
            f"### Problem Description\n{problem_desc}\n\n"
            f"### Constraints\n{constraints or 'N/A'}\n\n"
            f"### Sample Input/Output\n{sample_io_text}\n\n"
            f"### Student Code\n```\n{code}\n```\n\n"
            "Respond with ONLY strict JSON (no markdown, no extra text). "
            "The JSON must contain exactly these keys:\n"
            '- "status": one of "ACCEPTED", "WRONG_ANSWER", "SYNTAX_ERROR", "LOGIC_ERROR", "RUNTIME_ERROR"\n'
            '- "is_correct": boolean\n'
            '- "feedback_en": string with detailed feedback in English\n'
            '- "feedback_ar": string with detailed feedback in Arabic\n'
            '- "hint": string with a short hint for the student (or null if correct)\n'
        )

        try:
            response = await self.model.generate_content_async(prompt)
            text = self._clean_json_response(response.text)
            result = json.loads(text)

            # Validate required keys
            required = {"status", "is_correct", "feedback_en", "feedback_ar", "hint"}
            if not required.issubset(result.keys()):
                missing = required - result.keys()
                logger.warning(f"grade_code response missing keys: {missing}")
                # Fill in defaults for any missing keys
                result.setdefault("status", "WRONG_ANSWER")
                result.setdefault("is_correct", False)
                result.setdefault("feedback_en", "Could not fully evaluate the code.")
                result.setdefault("feedback_ar", "تعذّر تقييم الكود بشكل كامل.")
                result.setdefault("hint", None)

            return result

        except json.JSONDecodeError as e:
            logger.error(f"grade_code JSON parse error: {e}")
            return {
                "status": "WRONG_ANSWER",
                "is_correct": False,
                "feedback_en": "The grading system encountered an error. Please try again.",
                "feedback_ar": "واجه نظام التقييم خطأ. يرجى المحاولة مرة أخرى.",
                "hint": None,
            }
        except Exception as e:
            logger.error(f"grade_code error: {e}")
            return {
                "status": "WRONG_ANSWER",
                "is_correct": False,
                "feedback_en": "An unexpected error occurred during grading.",
                "feedback_ar": "حدث خطأ غير متوقع أثناء التقييم.",
                "hint": None,
            }

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
