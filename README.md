# AI ChatBot

A modern, responsive AI ChatBot built with **Next.js**, **FastAPI**, and **Tailwind CSS**, powered by OpenAI's GPT-4.1-mini model.

## 🌟 Overview

AI ChatBot is a web application for chatting with an AI assistant through a beautiful and user-friendly interface, supporting light/dark modes, real-time streaming, and chat history persistence.  
The backend processes requests to OpenAI's API, implements rate limiting, and protects access via an API key.

## 🚀 Live Demo

- [Frontend on Vercel](https://aichatbot-zeta-ivory.vercel.app)
- Backend deployed on a private VPS using FastAPI.

## 📋 Features

- Conversational UI with streaming responses
- Light and dark theme support
- Markdown rendering with GitHub Flavored Markdown (GFM)
- Syntax-highlighted code blocks with copy feature
- Local storage persistence for messages and settings
- Right-click context menu for copying and deleting messages
- Export conversations to text files
- API rate limiting to prevent abuse
- Server-side protected API key

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, React Markdown, Prism.js
- **Backend**: FastAPI, AsyncOpenAI, SlowAPI (rate limiting)
- **Deployment**:
  - Frontend: Vercel
  - Backend: VPS (ps.kz)

## 🧩 Installation and Setup

### Backend

1. Connect to your VPS server.
2. Create a Python virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run the FastAPI app:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

5. Create a `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key
API_SECRET_KEY=your_custom_secret
```

### Frontend

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ai-chatbot.git
cd ai-chatbot
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
API_SECRET_KEY=your_custom_secret
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Design and Development Process

- First, I developed the backend using FastAPI to handle OpenAI API calls.
- Implemented both standard and streaming chat endpoints.
- Set up rate limiting using SlowAPI to prevent abuse.
- Created a mobile-first, responsive, and modern frontend using Next.js and Tailwind CSS.
- Integrated real-time streaming messages using Server-Sent Events (SSE).
- Deployed the backend on a VPS server and the frontend to Vercel.

## 🧠 Unique Approaches and Methodologies

- Implemented real-time streaming responses for a more dynamic chat experience.
- Markdown parsing with syntax-highlighted code blocks and copy functionality.
- Mobile-first design with automatic adjustments for different screen sizes.
- Persistent local storage for chat history and settings.

## ⚖️ Trade-offs and Decisions

- Using open CORS policy (`allow_origins=["*"]`) for simplicity during development (should be restricted in production).
- The frontend fetches from a custom server API instead of calling OpenAI directly for better control and security.
- Limited maximum tokens for responses to avoid long latencies but sometimes truncates large answers.

## 🐞 Known Issues

- Streaming may break on very slow internet connections.
- Token limit (`MAX_OUTPUT_TOKENS`) may occasionally cut off longer responses.

## ❓ Why This Tech Stack?

- **Next.js**: Robust React framework for building production-grade web apps with SSR and API support.
- **Tailwind CSS**: Rapid UI development with consistent design.
- **FastAPI**: High-performance asynchronous Python web framework.
- **AsyncOpenAI SDK**: Modern, async-first API client for interacting with OpenAI models.
