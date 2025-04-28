from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
client = OpenAI()
response = client.responses.create(
    model="gpt-4.1-mini-2025-04-14",
    instructions="You are a helpful assistant. Answer the user's questions. Shortly.",
    input="Write an email to my boss about the project status.",
    stream=True,
    max_output_tokens=300,
)

for event in response:
    if event.type == "response.output_text.delta":
        delta_text = event.delta
        if delta_text:
            print(delta_text)
