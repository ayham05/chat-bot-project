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
        prompt = f"""\
You are a **Senior Competitive Programming Problem Setter** who writes problems in the exact style of Codeforces / ACM-ICPC contests.
The problems are for Jordanian university students, so use local names (Ayham, Qaruti, Hamza, Omar, Nooreldeen, Mohammad) and cultural references (Irbid, Amman, Shawarma, Mansaf, Falafel, Gaming Cafe, University Bus, Exam Night).

Below are 6 gold-standard examples. Study their structure, tone, formatting, and rigor, then generate a NEW problem that follows the exact same pattern.

─── EXAMPLE 1 (Arrays & Floating Point) ───
{{
  "title": "Big Chungus and Shawarmaji",
  "description": "Big Chungus is on a mission to rate all shawarma restaurants in Irbid because of his undying love for shawarma. He has rated $n$ restaurants, where the rating of the $i$-th restaurant is given as $a_i$. Help Big Chungus calculate the average rating of all the restaurants he has reviewed.",
  "input_format": "The first line contains a single integer $n$ ($2 \\\\le n \\\\le 10^6$) — the number of restaurants.\\nThe second line contains $n$ integers $a_1, a_2, \\\\dots, a_n$ ($1 \\\\le a_i \\\\le 600$) — the ratings.",
  "output_format": "Print the average rating as a floating-point number with exactly 3 decimal places.",
  "examples": [
    {{"input": "4\\n10 20 30 40", "output": "25.000", "explanation": "The sum is 100, divided by 4 gives 25.000."}}
  ],
  "constraints": "$2 \\\\le n \\\\le 10^6$, $1 \\\\le a_i \\\\le 600$"
}}

─── EXAMPLE 2 (Math & Divisibility) ───
{{
  "title": "Qaruti's Game",
  "description": "Qaruti and Omar are playing a game. Omar has a deck of $n$ cards, numbered from $1$ to $n$. In this game, Qaruti will take all the cards whose numbers are divisible by $k$. Your task is to determine how many cards Qaruti will take.",
  "input_format": "Two integers $n$ and $k$, where ($1 \\\\le k \\\\le n \\\\le 10^{{18}}$).",
  "output_format": "Print a single integer: the number of cards Qaruti will take.",
  "examples": [
    {{"input": "25 7", "output": "3", "explanation": "The numbers divisible by 7 up to 25 are: 7, 14, 21. So the answer is 3."}}
  ],
  "constraints": "$1 \\\\le k \\\\le n \\\\le 10^{{18}}$"
}}

─── EXAMPLE 3 (Physics & Conditionals) ───
{{
  "title": "Hamza vs Nooreldeen",
  "description": "Hamza's car crashed during a race. The pit crew needs $T$ hours to fix it. After repairs, his new speed will be $S_1$ km/h. He has $D_1$ km left to finish.\\nMeanwhile, Nooreldeen is still driving at speed $S_2$ km/h and has $D_2$ km left.\\nCan Hamza finish the race before Nooreldeen?",
  "input_format": "Five integers $T, S_1, D_1, S_2, D_2$ where all values are between $1$ and $10^9$.\\nIt is guaranteed that $S_2 \\\\ge S_1$.",
  "output_format": "Print \\"YES\\" if Hamza finishes strictly before Nooreldeen.\\nPrint \\"NO\\" if Nooreldeen finishes first.\\nPrint \\"DRAW\\" if they finish at the exact same time.",
  "examples": [
    {{"input": "5 4 10 5 50", "output": "YES", "explanation": "Hamza finishes in 5 + 10/4 = 7.5 hours. Nooreldeen finishes in 50/5 = 10 hours. Hamza is faster."}}
  ],
  "constraints": "$1 \\\\le T, S_1, D_1, S_2, D_2 \\\\le 10^9$"
}}

─── EXAMPLE 4 (Logic & Loop) ───
{{
  "title": "Ayham's Reels",
  "description": "Ayham was watching Reels and found a puzzle: \\"Given a number $x$, find 4 consecutive even numbers whose sum equals $x$.\\"\\nIf no such numbers exist, Ayham will be sad.",
  "input_format": "A single integer $x$ ($20 \\\\le x \\\\le 10^{{12}}$).",
  "output_format": "Print the 4 consecutive even numbers in ascending order.\\nIf no solution exists, print \\"-_-\\".",
  "examples": [
    {{"input": "20", "output": "2 4 6 8", "explanation": "2 + 4 + 6 + 8 = 20."}},
    {{"input": "30", "output": "-_-", "explanation": "No 4 consecutive even numbers sum to 30."}}
  ],
  "constraints": "$20 \\\\le x \\\\le 10^{{12}}$"
}}

─── EXAMPLE 5 (Simulation) ───
{{
  "title": "Road to Specialist",
  "description": "Seven months ago, Ayham reached the rank of Pupil. To become a Specialist, his rating must reach 1400 or higher at any point during the contests.\\nGiven his initial rating $k$ and the rating changes from $n$ contests, determine if he ever becomes a Specialist.",
  "input_format": "The first line contains $n$ (contests) and $k$ (initial rating) ($1 \\\\le n \\\\le 1000, 0 \\\\le k \\\\le 1399$).\\nThe second line contains $n$ integers representing the change in rating ($-100 \\\\le x_i \\\\le 100$).",
  "output_format": "Print \\"YES\\" if the rating reaches $\\\\ge 1400$ at any point. Otherwise, print \\"NO\\".",
  "examples": [
    {{"input": "6 1100\\n50 100 -30 78 61 53", "output": "YES", "explanation": "After contests: 1150, 1250, 1220, 1298, 1359, 1412. Rating hit 1412 >= 1400."}}
  ],
  "constraints": "$1 \\\\le n \\\\le 1000$, $0 \\\\le k \\\\le 1399$, $-100 \\\\le x_i \\\\le 100$"
}}

─── EXAMPLE 6 (Strings) ───
{{
  "title": "Welcome to JUST ACM",
  "description": "Qaruti wants to greet new students. Write a program that takes a student's name and prints a specific welcome message.",
  "input_format": "A string containing the name (no spaces, max 20 chars).",
  "output_format": "Print \\"Hello [Name], welcome to JUST ACM.\\"",
  "examples": [
    {{"input": "Mohammad", "output": "Hello Mohammad, welcome to JUST ACM.", "explanation": "Simply print the greeting with the name inserted."}}
  ],
  "constraints": "Name length $\\\\le 20$, no spaces."
}}

═══════════════════════════════════════════
YOUR TASK: Generate ONE new problem with these constraints:
  • Topic: {topic}
  • Difficulty: {difficulty}
  • Pick a RANDOM creative theme from: Falafel Shop, University Bus, Gaming Cafe, Exam Night, Mansaf Competition, Rooftop Study Session, Campus Parking, Late Night Coding, Library Queue, Eid Shopping — or invent a new local theme.
  • Use LaTeX-style formatting for ALL variables in text: $n$, $A_i$, $10^9$, etc.
  • Story must be in English with local Jordanian cultural references.
  • The problem must be solvable, with correct and verifiable sample I/O.
═══════════════════════════════════════════

Respond with ONLY a single valid JSON object (no markdown fencing, no extra text). The JSON must have exactly these keys:
  "title", "description", "input_format", "output_format", "examples", "constraints"
where "examples" is an array of objects with "input", "output", "explanation".
"""

        try:
            response = await self.model.generate_content_async(prompt)
            text = self._clean_json_response(response.text)
            return json.loads(text)
        except json.JSONDecodeError as e:
            logger.error(f"generate_problem JSON parse error: {e}")
            raise ValueError(f"AI returned invalid JSON: {e}")
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
