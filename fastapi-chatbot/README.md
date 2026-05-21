# FastAPI Chatbot Service

Local run:

```bash
cd fastapi-chatbot
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

Deploy on Render as a Web Service:

- Root Directory: `fastapi-chatbot`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Add `ALLOWED_ORIGINS` with your Vercel domain.

After deploy, set the Next.js env variable:

```bash
FASTAPI_CHAT_URL=https://your-render-service.onrender.com/chat
```
