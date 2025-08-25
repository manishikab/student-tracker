from fastapi import APIRouter, Depends
from app.dependencies import verify_token

router = APIRouter()

@router.get("/test-token")
def test_token(user=Depends(verify_token)):
    # If token is valid, verify_token returns decoded info
    return {
        "message": "Token is valid!",
        "uid": user["uid"],
        "email": user.get("email"),
        "token_info": user
    }
