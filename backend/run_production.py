"""
Production server for the Flask application.
Uses Waitress, a production-ready WSGI server.
"""
import os
from waitress import serve
from main import app

if __name__ == '__main__':
    # Get port from environment or use default
    port = int(os.environ.get('PORT', 5000))
    
    print(f"Starting production server on http://127.0.0.1:{port}")
    print("Press Ctrl+C to stop the server")
    
    # Start waitress WSGI server
    serve(app, host='127.0.0.1', port=port)
