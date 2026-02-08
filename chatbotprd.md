\# Product Requirements Document (PRD)

\*\*Project Name:\*\* CodeBot Academy (MVP)  

\*\*Target Audience:\*\* School Students (Beginners)  

\*\*Date:\*\* February 7, 2026  

\*\*Version:\*\* 1.0  



---



\## 1. Executive Summary

The goal is to build an MVP for an educational chatbot platform designed to teach school students the fundamentals of programming and robotics. The platform is divided into two main tracks: \*\*Problem Solving (C++ Basics)\*\* and \*\*Robotics (Tinkercad Integration)\*\*. The core experience is driven by an AI Chatbot that acts as a tutor, grader, and guide, bridging the language gap by offering Arabic explanations for English technical concepts.



---



\## 2. Technology Stack



\### Frontend

\* \*\*Framework:\*\* Next.js (React)

\* \*\*Styling:\*\* Tailwind CSS (for rapid, responsive design)

\* \*\*State Management:\*\* React Context or Zustand

\* \*\*Code Editor:\*\* Monaco Editor (VS Code web implementation) or CodeMirror



\### Backend

\* \*\*Framework:\*\* FastAPI (Python)

&nbsp;   \* \*Reasoning:\* High performance, native async support, and excellent ecosystem for AI integration.

\* \*\*AI Integration:\*\* OpenAI API (GPT-4o/mini) or Google Gemini API via LangChain.



\### Database

\* \*\*Primary DB:\*\* PostgreSQL (Recommended) or SQLite (for local MVP development).

\* \*\*ORM:\*\* Prisma or SQLAlchemy.



\### External Tools

\* \*\*Robotics Simulation:\*\* Tinkercad Circuits (Embedded via `<iframe>`).



---



\## 3. Core Features \& Scope



\### Track A: Problem Solving (C++ Basics)



\#### 3.1. Curriculum Scope (MVP)

The MVP will strictly cover the following C++ fundamentals:

1\.  \*\*Basic Input/Output:\*\* `cin`, `cout`, `endl`.

2\.  \*\*Variables \& Data Types:\*\* `int`, `string`, `float`, `bool`.

3\.  \*\*Conditionals:\*\* `if`, `else if`, `else`.

4\.  \*\*Loops:\*\* `for`, `while`.

5\.  \*\*Arrays:\*\* 1D array basics (declaration, access, modification).



\#### 3.2. Problem Display Interface

The UI must present problems with the following components:

\* \*\*Problem Statement:\*\* The core logic puzzle (in \*\*English\*\*).

\* \*\*Arabic Translation:\*\* A collapsible toggle or tooltip providing the Arabic translation.

\* \*\*Input/Output Format:\*\* Clear specifications on data formats.

\* \*\*Constraints:\*\* Technical limits (e.g., $1 \\le N \\le 100$).

\* \*\*Examples:\*\* Sample Input and Sample Output blocks.



\#### 3.3. Code Submission \& AI Grading

\* \*\*Submission Methods:\*\*

&nbsp;   \* In-browser Code Editor.

&nbsp;   \* File Upload (`.cpp`).

\* \*\*AI Grader Workflow:\*\*

&nbsp;   1.  Student submits code.

&nbsp;   2.  Backend sends `Code` + `Problem Context` + `Constraints` to the AI.

&nbsp;   3.  \*\*Validation:\*\* AI checks for syntax errors, logical correctness, and edge cases.

\* \*\*Feedback System:\*\*

&nbsp;   \* \*\*Success:\*\* "Correct Answer!" with a motivational message.

&nbsp;   \* \*\*Failure:\*\* The bot identifies the specific error type (Syntax vs. Logic) and explains \*why\* it failed (in Arabic) without giving the answer immediately.

&nbsp;   \* \*\*Hinting:\*\* "Your loop goes one step too far; check your condition `<` vs `<=`."



\#### 3.4. Interactive Tutor (On-Demand)

\* \*\*Context:\*\* The chat is always available next to the problem.

\* \*\*Functionality:\*\* Students can ask specific questions like "What does `int` mean?" or "Explain this loop."

\* \*\*Response Style:\*\* Simple Arabic explanations with small English code snippets.



---



\### Track B: Robotics (Simulated)



\#### 3.5. Robotics Chat Assistant

\* \*\*Persona:\*\* A friendly hardware engineer.

\* \*\*Capabilities:\*\*

&nbsp;   \* Explaining Arduino components (LEDs, Resistors, Ultrasonic Sensors, Servos).

&nbsp;   \* Assisting with Arduino C++ syntax (`setup()`, `loop()`, `digitalWrite()`).

&nbsp;   \* Troubleshooting wiring logic based on student descriptions.



\#### 3.6. Tinkercad Integration

\* \*\*UI Layout:\*\* Split screen.

&nbsp;   \* \*\*Left/Bottom:\*\* Chatbot.

&nbsp;   \* \*\*Right/Top:\*\* Tinkercad Circuits `<iframe>`.

\* \*\*Workflow:\*\*

&nbsp;   1.  Bot proposes a project (e.g., "Blinking LED").

&nbsp;   2.  Student builds it in the iframe.

&nbsp;   3.  Student asks the bot for help if the simulation fails.



---



\## 4. User Flow



\### 4.1. Onboarding

1\.  \*\*Landing Page:\*\* Simple explanation of the platform.

2\.  \*\*Track Selection:\*\* User chooses "Problem Solving" or "Robotics".



\### 4.2. C++ Learning Loop

1\.  \*\*Bot:\*\* "Hello! Let's solve a problem about `if` statements." -> Presents Problem.

2\.  \*\*Student:\*\* Reads problem (toggles Arabic if needed) -> Writes Code -> Clicks Submit.

3\.  \*\*System:\*\* Analyzes code.

&nbsp;   \* \*If Correct:\* "Great job! Next Level?"

&nbsp;   \* \*If Incorrect:\* "It looks like you missed a semicolon on line 5. Try again."



\### 4.3. Robotics Lab Loop

1\.  \*\*Bot:\*\* "Let's build a distance detector."

2\.  \*\*Student:\*\* Opens Tinkercad window.

3\.  \*\*Bot:\*\* Provides code snippet for the sensor.

4\.  \*\*Student:\*\* Copies code to Tinkercad -> Runs Simulation.



---



\## 5. Non-Functional Requirements

\* \*\*Language Support:\*\*

&nbsp;   \* \*\*UI Labels:\*\* Arabic (RTL support).

&nbsp;   \* \*\*Technical Content:\*\* English (Standard coding terms).

&nbsp;   \* \*\*Chat Output:\*\* Arabic (Casual, encouraging tone).

\* \*\*Performance:\*\* Code grading feedback < 5 seconds.

\* \*\*Scalability:\*\* Stateless backend to allow easy horizontal scaling.

\* \*\*Accessibility:\*\* High contrast text for code readability.



---



\## 6. Proposed Database Schema (Simplified)



\### `User`

| Field | Type | Description |

| :--- | :--- | :--- |

| `id` | UUID | Primary Key |

| `username` | String | Display name |

| `created\_at` | DateTime | |



\### `Problem`

| Field | Type | Description |

| :--- | :--- | :--- |

| `id` | Int | Primary Key |

| `topic` | String | Enum: IO, IF, LOOP, ARRAY |

| `difficulty` | String | Easy, Medium, Hard |

| `title\_en` | String | |

| `desc\_en` | Text | Markdown supported |

| `desc\_ar` | Text | Translation |

| `sample\_io` | JSON | `\[{input: "5", output: "10"}]` |



\### `Submission`

| Field | Type | Description |

| :--- | :--- | :--- |

| `id` | UUID | Primary Key |

| `user\_id` | UUID | FK to User |

| `problem\_id` | Int | FK to Problem |

| `code` | Text | The submitted C++ code |

| `status` | String | ACCEPTED, WRONG\_ANSWER, ERROR |

| `ai\_feedback` | Text | The feedback generated by the bot |

