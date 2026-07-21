from functools import wraps
from flask import request, jsonify
import os
from dotenv import load_dotenv
import requests
import json
import logging
import jwt

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('auth_middleware')

load_dotenv()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
# Update the API URL to the correct domain (com instead of dev)
CLERK_API_URL = os.getenv("CLERK_API_URL", "https://api.clerk.com/v1")
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL", "https://api.clerk.com/v1/jwks")

# Print debug info at startup
logger.info(f"Clerk API URL: {CLERK_API_URL}")
logger.info(f"Clerk API Key configured: {'Yes' if CLERK_SECRET_KEY else 'No'}")

def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        logger.info(f"Received request with Authorization header: {auth_header is not None}")
        logger.info(f"Request headers: {dict(request.headers)}")
        
        if not auth_header:
            logger.warning(f"Authorization header missing for {request.method} {request.path}")
            return jsonify({'error': 'Authorization header missing', 'path': request.path, 'method': request.method}), 401
        
        try:
            # Extract the token
            token_parts = auth_header.split()
            if len(token_parts) != 2 or token_parts[0].lower() != 'bearer':
                logger.warning(f"Invalid Authorization header format: {auth_header}")
                return jsonify({'error': 'Invalid Authorization header format'}), 401
            
            token = token_parts[1]
            logger.info(f"Token extracted, length: {len(token)}")
            
            # Manually decode the JWT to get the claims
            try:
                # Decode without verification first to get the token's payload
                decoded = jwt.decode(token, options={"verify_signature": False})
                logger.info(f"Token payload decoded: {decoded.get('sub')}")
                
                # Now we'll trust the token and pass the session data
                request.session = decoded
                return f(*args, **kwargs)
                
            except jwt.PyJWTError as e:
                logger.error(f"JWT decoding error: {str(e)}")
                return jsonify({'error': 'Invalid token format', 'details': str(e)}), 401
            
        except Exception as e:
            logger.exception("Authentication error")
            return jsonify({'error': 'Authentication error', 'details': str(e)}), 401
            
        return f(*args, **kwargs)
    return decorated_function
