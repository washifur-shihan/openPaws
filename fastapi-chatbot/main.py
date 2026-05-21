import os
from typing import List, Literal, Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="OpenPaws AI Chatbot")

origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

@app.get("/")
def health():
    return {"ok": True, "service": "mewmew-fastapi-chatbot"}

@app.post("/chat")
def chat(payload: ChatRequest):
    message = payload.message.lower().strip()
    store = os.getenv("STORE_NAME", "OpenPaws")

    if any(word in message for word in ["delivery", "shipping", "dhaka", "courier"]):
        reply = "We can take Bangladesh delivery orders. After checkout, admin will confirm by phone or WhatsApp before sending."
    elif any(word in message for word in ["kitten", "small cat", "baby cat"]):
        reply = "For kittens, choose lightweight toys like feather teaser wands, soft plush mice, or small bell balls. Keep play supervised."
    elif any(word in message for word in ["cheap", "budget", "price", "under"]):
        reply = "Good budget picks are Rolling Bell Ball Set and Catnip Mouse Toy. They are affordable and easy for cats to chase."
    elif any(word in message for word in ["best", "recommend", "suggest"]):
        reply = "My top recommendation is the Feather Teaser Wand for active cats. For solo play, try bell balls or a catnip mouse toy."
    elif any(word in message for word in ["order", "checkout", "buy"]):
        reply = "Add products to cart, go to checkout, and submit your name, phone, email, city, and full address. Your order will reach our admin dashboard."
    else:
        reply = f"Welcome to {store}! Tell me your cat's age and play style, and I can suggest a toy. Active cats usually love teaser wands and tunnels."

    return {"reply": reply}
