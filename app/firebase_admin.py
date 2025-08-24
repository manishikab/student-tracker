import firebase_admin
from firebase_admin import credentials, auth

import os

# Load your Firebase service account JSON file path from env
SERVICE_ACCOUNT_JSON = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

cred = credentials.Certificate(SERVICE_ACCOUNT_JSON)
firebase_admin.initialize_app(cred)
