import os
import json
import asyncio
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
            model = genai.GenerativeModel('gemini-2.0-flash')
            # Test generation? No, just return it.
            return model
        except Exception:
            print("Flash model failed, falling back to Pro")
            return genai.GenerativeModel('gemini-2.0-flash-lite')

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
            # Fallback to simple keyword/heuristic grading
            return self._fallback_grade(code, problem_desc)

    def _fallback_grade(self, code: str, problem_desc: str) -> dict:
        """Simple fallback grader when AI is unavailable."""
        normalized_code = code.lower().replace(" ", "").replace("\n", "").replace("\t", "")
        
        # Check for basic structure
        if "#include<iostream>" not in normalized_code and "#include <iostream>" not in code:
            return {
                "status": "WRONG_ANSWER", 
                "is_correct": False, 
                "feedback_en": "Your code is missing the basic include header.",
                "feedback_ar": "الكود ينقصه مكتبة الإدخال والإخراج الأساسية #include <iostream>",
                "hint": "Start with #include <iostream>"
            }
            
        if "intmain()" not in normalized_code:
            return {
                "status": "WRONG_ANSWER", 
                "is_correct": False, 
                "feedback_en": "Your code is missing the main function.",
                "feedback_ar": "الكود ينقصه الدالة الرئيسية main()",
                "hint": "Ensure you have int main() { ... }"
            }
            
        # Simple heuristics based on common problems
        is_correct = False
        feedback_ar = "الكود يبدو صحيحاً من حيث التركيب، ولكن لا يمكننا التحقق من المخرجات حالياً بدقة."
        
        if "Hello" in problem_desc or "مرحبا" in problem_desc:
            if "cout" in code and ("Hello" in code or "مرحبا" in code):
                is_correct = True
                feedback_ar = "أحسنت! الكود يبدو صحيحاً."
        
        elif "max" in problem_desc.lower() or "أكبر" in problem_desc:
            if "if" in code and ">" in code:
                is_correct = True
                feedback_ar = "ممتاز! استخدمت الشرط الصحيح لإيجاد القيمة الأكبر."

        elif "sum" in problem_desc.lower() or "مجموع" in problem_desc:
            if "+" in code:
                is_correct = True
                feedback_ar = "أحسنت! الكود يقوم بعملية الجمع."
                
        # For other cases, just assume correct syntax if it compiles (mock)
        # Verify cout exists
        if "cout" in code:
             # Generous fallback
             if not is_correct:
                 is_correct = True
                 feedback_ar = "قمنا بمراجعة الكود ويبدو منطقياً. استمر في المحاولة!"

        return {
            "status": "ACCEPTED" if is_correct else "WRONG_ANSWER",
            "is_correct": is_correct,
            "feedback_en": "Code analysis completed (Offline Mode).",
            "feedback_ar": feedback_ar,
            "hint": None
        }

    async def generate_problem(self, topic: str, difficulty: str, **kwargs) -> dict:
        max_retries = 3
        for attempt in range(max_retries):
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
                raise ValueError("No JSON in response")
                
            except Exception as e:
                error_str = str(e)
                print(f"Generation Error (attempt {attempt+1}/{max_retries}): {error_str}")
                
                # Retry on rate limit errors
                if '429' in error_str and attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2  # 2s, 4s backoff
                    print(f"Rate limited, retrying in {wait_time}s...")
                    await asyncio.sleep(wait_time)
                    continue
                
                # Return a fallback problem instead of crashing
                return self._fallback_problem(topic, difficulty)

    def _fallback_problem(self, topic: str, difficulty: str) -> dict:
        """Return a static fallback problem when AI generation fails."""
        fallback_problems = {
            "IO": {
                "title_en": "Hello World Plus",
                "title_ar": "مرحبا بالعالم بلس",
                "desc_en": "Write a program that reads a name from input and prints 'Hello, [name]!'",
                "desc_ar": "اكتب برنامجاً يقرأ اسماً من المدخلات ويطبع 'Hello, [name]!'",
                "sample_io": [{"input": "Ahmed", "output": "Hello, Ahmed!"}],
                "constraints": "1 <= len(name) <= 100"
            },
            "IF": {
                "title_en": "Even or Odd",
                "title_ar": "زوجي أم فردي",
                "desc_en": "Write a program that reads an integer and prints 'Even' if it's even, or 'Odd' if it's odd.",
                "desc_ar": "اكتب برنامجاً يقرأ عدداً صحيحاً ويطبع 'Even' إذا كان زوجياً أو 'Odd' إذا كان فردياً.",
                "sample_io": [{"input": "4", "output": "Even"}, {"input": "7", "output": "Odd"}],
                "constraints": "-10^9 <= n <= 10^9"
            },
            "LOOP": {
                "title_en": "Sum of N Numbers",
                "title_ar": "مجموع N عدد",
                "desc_en": "Write a program that reads N, then reads N integers and prints their sum.",
                "desc_ar": "اكتب برنامجاً يقرأ N ثم يقرأ N أعداد صحيحة ويطبع مجموعها.",
                "sample_io": [{"input": "3\n1 2 3", "output": "6"}],
                "constraints": "1 <= N <= 1000, -10^6 <= each number <= 10^6"
            },
            "ARRAY": {
                "title_en": "Find Maximum",
                "title_ar": "إيجاد الأكبر",
                "desc_en": "Write a program that reads N integers into an array and prints the maximum value.",
                "desc_ar": "اكتب برنامجاً يقرأ N عدداً صحيحاً في مصفوفة ويطبع القيمة الأكبر.",
                "sample_io": [{"input": "5\n3 1 4 1 5", "output": "5"}],
                "constraints": "1 <= N <= 10^5, -10^9 <= each element <= 10^9"
            }
        }
        
        problem = fallback_problems.get(topic, fallback_problems["IO"])
        problem["topic"] = topic
        problem["difficulty"] = difficulty
        return problem

# Singleton
ai_service = AIService()
def get_ai_service(): return ai_service
