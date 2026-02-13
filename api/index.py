from dotenv import load_dotenv
load_dotenv()
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer


from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
import os
import base64
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer, HTTPAuthorizationCredentials
from openai import OpenAI
from typing import Optional
import json

app = FastAPI(title="AI Vision Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")

if not CLERK_JWKS_URL:
    print("WARNING: CLERK_JWKS_URL not set")

clerk_config = ClerkConfig(jwks_url=CLERK_JWKS_URL) if CLERK_JWKS_URL else None
clerk_guard = ClerkHTTPBearer(clerk_config) if clerk_config else None


# OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    print("WARNING: OPENAI_API_KEY not set")

client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

clerk_config = ClerkConfig(
    jwks_url=os.getenv("CLERK_JWKS_URL", "")
)

# In-memory storage for usage tracking
usage_tracker = {}

# Constants
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
FREE_TIER_LIMIT = 1

# Endpoint 1: Health Check
@app.get("/python-api/health")
def health_check():
    """
    Simple health check endpoint
    """
    return {
        "status": "healthy",
        "service": "AI Vision Service"
    }

# Endpoint 2: Analyze Image
@app.post("/python-api/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    creds: HTTPAuthorizationCredentials = Depends(clerk_guard)
):
    """
    Accept image upload, validate it, and return AI analysis
    
    Requirements:
    - Authenticate user via JWT (Clerk)
    - Validate file type (jpg, jpeg, png, webp only)
    - Check file size (max 5MB)
    - Convert to base64
    - Call OpenAI Vision API
    - Check usage limits (free vs premium)
    - Return analysis result
    """
    try:
        decoded = creds.decoded
        user_id = decoded["sub"]

        public_metadata = decoded.get("public_metadata", {})
        tier = public_metadata.get("subscription_tier", "free")

        subscription = decoded.get("subscription", {})
        plan = subscription.get("plan", "")
        is_premium = "premium" in plan.lower()

        if tier == "premium" or is_premium:
            tier = "premium"
        else:
            tier = "free"

        # Initialize user in tracker if not exists
        if user_id not in usage_tracker:
            usage_tracker[user_id] = {
                "tier": tier,
                "analyses_used": 0
            }
        
        # Check usage limits
        user_usage = usage_tracker[user_id]
        if tier == "free" and user_usage["analyses_used"] >= 1:
            raise HTTPException(
                status_code=429,
                detail="Free tier limit reached"
            )
        
        # Validate file extension
        filename = file.filename.lower()
        file_ext = None
        for ext in ALLOWED_EXTENSIONS:
            if filename.endswith(ext):
                file_ext = ext
                break
        
        if not file_ext:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Invalid file type",
                    "message": f"Only {', '.join(ALLOWED_EXTENSIONS)} files are allowed",
                    "received": filename
                }
            )
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Check file size
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail={
                    "error": "File too large",
                    "message": f"Maximum file size is 5MB",
                    "received_size_mb": round(file_size / (1024 * 1024), 2),
                    "max_size_mb": 5
                }
            )
        
        # Convert to base64
        base64_image = base64.b64encode(file_content).decode('utf-8')
        
        # Determine MIME type
        mime_types = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp"
        }
        mime_type = mime_types.get(file_ext, "image/jpeg")
        
        # Call OpenAI Vision API
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Describe this image in detail, including objects, colors, mood, and any notable features."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime_type};base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=500
            )
            
            analysis = response.choices[0].message.content
            
            # Update usage counter
            usage_tracker[user_id]["analyses_used"] += 1
            
            return {
                "success": True,
                "analysis": analysis,
                "usage": {
                    "tier": tier,
                    "analyses_used": usage_tracker[user_id]["analyses_used"],
                    "limit": "unlimited" if tier == "premium" else FREE_TIER_LIMIT,
                    "remaining": "unlimited" if tier == "premium" else FREE_TIER_LIMIT - usage_tracker[user_id]["analyses_used"]
                },
                "image_info": {
                    "filename": file.filename,
                    "size_kb": round(file_size / 1024, 2),
                    "type": mime_type
                }
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "OpenAI API error",
                    "message": f"Failed to analyze image: {str(e)}"
                }
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "message": str(e)
            }
        )

# Endpoint 3: Check Usage
@app.get("/python-api/usage")
def check_usage(
    creds: HTTPAuthorizationCredentials = Depends(clerk_guard)
):
    decoded = creds.decoded
    user_id = decoded["sub"]

    public_metadata = decoded.get("public_metadata", {})
    tier = public_metadata.get("subscription_tier", "free")

    used = usage_tracker.get(user_id, {}).get("analyses_used", 0)

    return {
        "user_id": user_id,
        "tier": tier,
        "analyses_used": used,
        "limit": "unlimited" if tier == "premium" else 1
    }

# For Vercel serverless
handler = app