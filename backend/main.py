from enum import Enum
from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel
from openai import AsyncOpenAI
import os
import json
from dotenv import load_dotenv

load_dotenv()

API_SECRET_KEY = os.getenv("API_SECRET_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
NUMBER_OF_REQUESTS_PER_MINUTE = 10
MODEL = "gpt-4.1-mini-2025-04-14"
MAX_OUTPUT_TOKENS = 300

client = AsyncOpenAI(api_key=OPENAI_API_KEY)


class RoleEnum(str, Enum):
    user = "user"
    assistant = "assistant"


class Message(BaseModel):
    role: RoleEnum = RoleEnum.user
    content: str


class ChatRequest(BaseModel):
    input: list[Message]
    instructions: str = "You are a helpful assistant. Answer the user's questions. Shortly."


limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Можно потом указать конкретный адрес фронта
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/chat")
@limiter.limit(f"{NUMBER_OF_REQUESTS_PER_MINUTE}/minute")
async def chat(chat_request: ChatRequest, request: Request, x_api_key: str = Header(None)) -> Message:
    if x_api_key != API_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        response = await client.responses.create(
            model=MODEL,
            instructions=chat_request.instructions,
            input=chat_request.input,
            max_output_tokens=MAX_OUTPUT_TOKENS,
        )
        return {"role": "assistant", "content": response.output_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat/stream")
@limiter.limit(f"{NUMBER_OF_REQUESTS_PER_MINUTE}/minute")
async def chat_stream(chat_request: ChatRequest, request: Request, x_api_key: str = Header(None)):
    if x_api_key != API_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        response = await client.responses.create(
            model=MODEL,
            instructions=chat_request.instructions,
            input=chat_request.input,
            stream=True,
            max_output_tokens=MAX_OUTPUT_TOKENS,
        )

        async def event_generator():
            async for event in response:
                if event.type == "response.output_text.delta":
                    delta_text = event.delta
                    if delta_text:
                        yield json.dumps({"delta": delta_text}) + "\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
