from fastapi import Depends, Header, HTTPException
from firebase_admin import auth as firebase_auth

def verify_token(authorization: str = Header(...)):
    """
    Expects header: Authorization: Bearer <Firebase_ID_Token>
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")

    token = authorization.split(" ")[1]
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token  # uid, email, etc.
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")