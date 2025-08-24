import os
import json
import firebase_admin
from firebase_admin import auth, credentials
from fastapi import Depends, HTTPException, Request

# Initialize Firebase Admin only once
if not firebase_admin._apps:
    # Load service account credentials from environment variable
    cred_dict = json.loads(os.environ["FIREBASE_CREDENTIALS"])
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)

async def get_current_user(request: Request):
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    try:
        # Expect "Authorization: Bearer <token>"
        decoded_token = auth.verify_id_token(token.split(" ")[1])
        return decoded_token  # contains uid, email, etc.
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
