# AI-Powered Task Management Application

A full-stack Task Management application built with **React**, **FastAPI**, and **SQLite/PostgreSQL**. The application allows users to manage tasks and generate AI-based task insights.

---

## Tech Stack

- Frontend: React + TypeScript (Vite)
- Backend: FastAPI (Python)
- Database: SQLite / PostgreSQL (Docker)
- AI: OpenAI-compatible API (Demo mode available without API key)

---

## Features

- Create Task
- View All Tasks
- View Task Details
- Update Task
- Delete Task
- Explain Task with AI
- Generate Implementation Plan

---

## Project Structure

```
Task-Management-App/
│
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│
├── docker-compose.yml
│
└── README.md
```

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Task-Management-App
```

---

### 2. Start Database (PostgreSQL using Docker)

```bash
docker compose up -d
```

Or use SQLite by keeping the default database URL.

---

### 3. Run Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt

copy .env.example .env

uvicorn app.main:app --reload
```

Backend runs at:

```
http://localhost:8000
```

Swagger Documentation:

```
http://localhost:8000/docs
```

---

### 4. Run Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## Environment Variables

```
DATABASE_URL=sqlite:///./taskdb.sqlite3

# PostgreSQL
# DATABASE_URL=postgresql://taskuser:taskpass@localhost:5432/taskdb

OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

---

## API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/{id}` | Get task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |
| POST | `/api/tasks/{id}/ai` | Generate AI response |

---

## Task Status

- Todo
- In Progress
- Done

---

## Notes

- SQLite is used by default for local development.
- PostgreSQL can be started using Docker.
- If no OpenAI API key is provided, the application returns a demo AI response.
