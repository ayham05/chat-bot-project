# CodeBot Academy

An educational chatbot platform for teaching school students programming (C++) and robotics (Arduino/Tinkercad).

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- OpenAI API key (or Google Gemini API key)

### Setup

1. **Clone and configure environment**
   ```bash
   cd "chat bot"
   cp .env.example .env
   # Edit .env and add your API key
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost
   - API Docs: http://localhost/api/docs
   - Backend directly: http://localhost:8000

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Nginx     │────▶│  Frontend   │     │   Backend   │
│   (Port 80) │     │  (Next.js)  │     │  (FastAPI)  │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                    ┌─────────────┐     ┌──────┴──────┐
                    │    Redis    │     │  PostgreSQL │
                    │   (Cache)   │     │  (Database) │
                    └─────────────┘     └─────────────┘
```

## 📁 Project Structure

```
chat bot/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # Application entry point
│   │   ├── config.py       # Configuration
│   │   ├── database.py     # Database connection
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── routers/        # API routes
│   │   └── services/       # Business logic
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                # Next.js frontend
│   ├── app/                # Pages and layouts
│   ├── components/         # React components
│   ├── lib/                # API client and store
│   ├── Dockerfile
│   └── package.json
├── nginx/                   # Nginx configuration
│   └── nginx.conf
├── docker-compose.yml       # Docker orchestration
├── .env.example            # Environment template
└── README.md
```

## 🔧 Development

### Backend only
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend only
```bash
cd frontend
npm install
npm run dev
```

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login and get token |
| `/api/problems` | GET | List all problems |
| `/api/problems/{id}` | GET | Get problem details |
| `/api/submissions` | POST | Submit code for grading |
| `/api/chat` | POST | Send message to AI tutor |

## 🤖 AI Integration

The platform supports two AI providers:

1. **OpenAI GPT-4o** (recommended)
   - Set `AI_PROVIDER=openai` and `OPENAI_API_KEY`

2. **Google Gemini**
   - Set `AI_PROVIDER=gemini` and `GEMINI_API_KEY`

## 📝 License

MIT License - feel free to use for educational purposes.
