import uvicorn
import sys
from pathlib import Path

# Add parent directory to path so backend can be imported
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def main() -> None:
    """Run the FastAPI backend with uvicorn."""

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )


if __name__ == "__main__":
    main()
