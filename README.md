# AI Vision Analyzer

## 1. Project Overview

AI Vision Analyzer is a full-stack web application that allows authenticated users to upload images and receive AI-generated analysis using OpenAI's Vision model.

The app:

- Authenticates users with Clerk
- Accepts image uploads (JPG, JPEG, PNG, WebP, max 5MB)
- Analyzes images using GPT-4 Vision
- Supports free and premium usage tiers

**Technologies Used**

- Frontend: Next.js 14, React 18, TypeScript
- Authentication: Clerk (JWT-based auth)
- Backend: FastAPI (Python)
- AI Model: OpenAI gpt-4o-mini
- Deployment: Frontend → Vercel, Backend → Render

## 2. Features

- User authentication (Clerk)
- Protected analyze page
- Image upload with validation
- AI image description (objects, colors, mood, details)
- Free tier (1 analysis per session)
- Premium tier (unlimited)
- Usage tracking endpoint
- Health check endpoint
- Proper error handling (400, 413, 429, 500)

## 3. Setup Instructions

**Prerequisites**

- Node.js 18+
- Python 3.11+
- Clerk account
- OpenAI API key

**Clone the Project**

```bash
git clone <your-repo-url>
cd ai-vision-service
```

**Install Dependencies**

Frontend:

```bash
npm install
```

Backend:

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

**Environment Variables**

Frontend (`.env.local`):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...`
- `CLERK_SECRET_KEY=sk_test_...`
- `CLERK_JWKS_URL=https://your-clerk-domain/.well-known/jwks.json`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/analyze`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/analyze`

Backend (Render or local development):

- `CLERK_JWKS_URL=https://your-clerk-domain/.well-known/jwks.json`
- `OPENAI_API_KEY=sk-proj-...`

**Run Locally**

Backend:

```bash
uvicorn api.index:app --reload --port 8000
```

Frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

(Optional: set `BACKEND_URL=http://localhost:8000` in `.env.local` so `/api/*` proxies to local Python.)

## 4. API Documentation

Base URL (Production Backend): `https://your-render-backend.onrender.com`

**GET /api/health**

Returns service status. No auth required.

**POST /api/analyze**

Upload image (multipart/form-data, field `file`). Max 5MB. Allowed: JPG, JPEG, PNG, WebP.

Requires: `Authorization: Bearer <Clerk JWT>`

Returns:

```json
{
  "success": true,
  "analysis": "AI description...",
  "usage": { "tier": "free", "analyses_used": 1, "limit": 1, "remaining": 0 },
  "image_info": { "filename": "...", "size_kb": 120, "type": "image/jpeg" }
}
```

**GET /api/usage**

Returns current user tier and usage. Requires: `Authorization: Bearer <Clerk JWT>`

```json
{
  "user_id": "user_...",
  "tier": "free",
  "analyses_used": 0,
  "limit": 1
}
```

## 5. Deployment

**Frontend (Vercel)**

1. Push frontend repository to GitHub.
2. Import the repository into Vercel.
3. Add environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_API_URL` (Render backend URL)
4. Deploy.

**Backend (Render)**

1. Create a new Web Service on Render.
2. Connect the backend GitHub repository.
3. Add environment variables:
   - `CLERK_JWKS_URL`
   - `OPENAI_API_KEY`
4. Set start command:
   ```bash
   uvicorn api.index:app --host 0.0.0.0 --port 10000
   ```
5. Deploy.

## 6. Live Demo

- **Frontend:** https://your-vercel-app.vercel.app
- Users can create their own account using Clerk sign-up.

## 7. Screenshots

- Landing Page
- Analyze Page with AI result

(Add screenshots to repository if required.)

## 8. Known Limitations

- Usage tracking stored in memory (resets on restart/deploy)
- No database persistence
- Free tier is per session, not per day
- No image storage
