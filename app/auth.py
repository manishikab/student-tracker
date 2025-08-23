import firebase_admin
from firebase_admin import auth, credentials
from fastapi import Depends, HTTPException, Request

# Initialize Firebase Admin
cred = credentials.Certificate("path/to/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

async def get_current_user(request: Request):
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    try:
        # Remove "Bearer " prefix
        decoded_token = auth.verify_id_token(token.split(" ")[1])
        return decoded_token  # contains uid, email, etc.
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
