import sys
import os

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uvicorn
from app.main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)