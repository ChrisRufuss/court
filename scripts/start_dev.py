import subprocess
import sys
import os
import time

def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    print("=" * 70)
    print("  LexAnalyze — Starting Full-Stack Local Development Servers")
    print("=" * 70)

    # 1. Start Backend FastAPI Server
    backend_cwd = os.path.join(root_dir, 'backend')
    backend_env = os.environ.copy()
    backend_env['PYTHONPATH'] = backend_cwd
    
    print("[1/2] Starting FastAPI Backend on http://localhost:8000 ...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"],
        cwd=root_dir,
        env=backend_env
    )

    time.sleep(2)

    # 2. Start Frontend Vite Server
    frontend_cwd = os.path.join(root_dir, 'frontend')
    print("[2/2] Starting Vite React Frontend on http://localhost:5173 ...")
    frontend_proc = subprocess.Popen(
        ["npm.cmd" if os.name == "nt" else "npm", "run", "dev"],
        cwd=frontend_cwd
    )

    print("\n[SUCCESS] LexAnalyze is running!")
    print("  - Frontend: http://localhost:5173")
    print("  - Backend API: http://localhost:8000")
    print("  - API Documentation: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop servers.\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down LexAnalyze development servers...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == '__main__':
    main()
