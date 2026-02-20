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
            # Allow up to 120s for large prompts (e.g. few-shot problem generation)
            self.request_options = {"timeout": 120}
        except Exception as e:
            logger.error(f"Failed to initialize model {self.model_name}: {e}")
            raise

    async def generate_problem(self, topic: str, difficulty: str) -> dict:
        prompt = f"""\
You are a **Senior Competitive Programming Problem Setter** who writes problems strictly following the Codeforces / ACM-ICPC problem-setting conventions.

**Style requirements (follow rigorously):**
- Each problem MUST read like an official Codeforces round problem: a short narrative followed by a precise mathematical task statement.
- Input/output specifications must be exact: state the number of lines, the variables on each line, and their ranges using LaTeX math notation ($n$, $a_i$, $10^9$, etc.).
- Constraints must be tight and realistic for competitive programming (use powers of 10 as upper bounds).
- Include at least one non-trivial sample test case with a clear explanation.
- The problem must be algorithmically solvable — avoid ambiguous or open-ended tasks.

**Cultural flavour:**
The problems are for Jordanian university students, so use local names (Ayham, Qaruti, Hamza, Omar, Nooreldeen, Mohammad) and cultural references (Irbid, Amman, Shawarma, Mansaf, Falafel, Gaming Cafe, University Bus, Exam Night).

Below are 3 gold-standard reference problems. Study their structure, tone, input/output rigor, and LaTeX formatting, then generate a NEW problem that follows the exact same editorial pattern.

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

─── EXAMPLE 3 (Logic & Loop) ───
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

═══════════════════════════════════════════
YOUR TASK: Generate ONE new problem with these constraints:
  • Topic: {topic}
  • Difficulty: {difficulty}
  • Pick a RANDOM creative theme from: Falafel Shop, University Bus, Gaming Cafe, Exam Night, Mansaf Competition, Rooftop Study Session, Campus Parking, Late Night Coding, Library Queue, Eid Shopping — or invent a new Jordanian-flavoured theme.
  • Use LaTeX-style formatting for ALL math variables and expressions: $n$, $A_i$, $10^9$, etc.
  • Story must be in English with local Jordanian cultural references.
  • The problem MUST be algorithmically solvable with correct, verifiable sample I/O — think like a Codeforces problem-setter.
═══════════════════════════════════════════

Respond with ONLY a single valid JSON object (no markdown fencing, no extra text). The JSON must have exactly these keys:
  "title", "description", "input_format", "output_format", "examples", "constraints"
where "examples" is an array of objects with "input", "output", "explanation".
"""

        try:
            response = await self.model.generate_content_async(
                prompt, 
                request_options=self.request_options,
                generation_config={"response_mime_type": "application/json"}
            )
            return json.loads(response.text)
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
        if len(problem_desc) > 1500:
            problem_desc = problem_desc[:1500] + "..."
            
        if sample_io and len(sample_io) > 3:
            sample_io = sample_io[:3]

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
            response = await self.model.generate_content_async(
                prompt, 
                request_options=self.request_options,
                generation_config={"response_mime_type": "application/json"}
            )
            result = json.loads(response.text)

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
            response = await self.model.generate_content_async(
                prompt, request_options=self.request_options
            )
            return response.text
        except Exception as e:
            logger.error(f"Error in review_solution: {e}")
            raise

    # ── Track-specific system prompts ──────────────────────────────────
    SYSTEM_PROMPTS = {
        "problem_solving": (
            "You are CodeBot, a friendly and encouraging C++ tutor for beginners. "
            "You specialize in C++ logic, algorithms, data structures, and competitive programming (ACM/ICPC style). "
            "Always answer in Arabic. Keep code snippets in English (C++). "
            "Be encouraging, patient, and give clear step-by-step explanations."
        ),
        "robotics": (
            "You are RoboBot, a friendly and enthusiastic electronics and robotics tutor. "
            "You specialize in Arduino, Tinkercad circuits, sensors, LEDs, motors, and hardware projects. "
            "Always answer in Arabic. Keep code snippets (Arduino/C++) and component names in English. "
            "Be encouraging, patient, and guide the student through wiring and code step-by-step. "
            "When the student is working on a specific Tinkercad project, tailor your answers to that project."
        ),
    }

    async def chat(self, track: str, message: str, history: list = None, **kwargs) -> dict:
        """Chat with the AI tutor. Prompt switches based on *track*."""

        # Pick the right personality
        system_prompt = self.SYSTEM_PROMPTS.get(
            track, self.SYSTEM_PROMPTS["problem_solving"]
        )

        system_prompt += (
            "\n\nYou MUST respond strictly with a valid JSON object containing EXACTLY three keys:\n"
            '- "message_en": The English version of your response.\n'
            '- "message_ar": The Arabic version of your response.\n'
            '- "suggestions": An array of maximum 3 short follow-up questions or suggestions for the user as strings.\n'
            "No markdown fencing or other text outside the JSON."
        )

        # If the robotics page told us which project is selected, add it
        if kwargs.get("project_context"):
            system_prompt += (
                f"\n\nThe student is currently working on the following project: "
                f"{kwargs['project_context']}. "
                f"Tailor your responses to help with this specific project."
            )

        full_prompt = f"System: {system_prompt}\nUser: {message}"

        if kwargs.get("problem_context"):
            full_prompt += f"\nContext: {kwargs['problem_context']}\n"

        if kwargs.get("code_context"):
            full_prompt += f"\nCode: {kwargs['code_context']}\n"

        try:
            response = await self.model.generate_content_async(
                full_prompt, 
                request_options=self.request_options,
                generation_config={"response_mime_type": "application/json"}
            )
            result = json.loads(response.text)
            return {
                "message": result.get("message_en", ""),
                "message_ar": result.get("message_ar", ""),
                "suggestions": result.get("suggestions", []),
            }
        except json.JSONDecodeError as e:
            logger.error(f"Chat JSON parse error: {e}")
            return {
                "message": "I'm sorry, I couldn't format my response properly.",
                "message_ar": "عذراً، لم أتمكن من تنسيق الرد بشكل صحيح.",
                "suggestions": [],
            }
        except Exception as e:
            logger.error(f"Chat Error: {e}")
            return {
                "message": "I'm sorry, there was a connection error.",
                "message_ar": "عذراً، حدث خطأ في الاتصال.",
                "suggestions": [],
            }


ai_service = AIService()
