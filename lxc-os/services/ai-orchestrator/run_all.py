import subprocess
import os
import sys
import time

def run_services():
    # Find our folders
    root_dir = os.path.dirname(os.path.abspath(__file__))
    face_attendance_dir = os.path.join(root_dir, "face-attendance")
    timetable_dir = os.path.join(root_dir, "timetableAi")

    print("--- Starting AI Services ---")

    # 1. Start the Face Recognition Service (Python)
    print("Starting Face Recognition Service (Port 5002)...")
    face_env = os.environ.copy()
    face_env["FACE_SERVICE_PORT"] = "5002"
    
    # We run the new Python version of the face service
    face_proc = subprocess.Popen(
        [sys.executable, "main_app.py"],
        cwd=face_attendance_dir,
        env=face_env,
        shell=True
    )

    # 2. Start the Timetable AI Service (Python)
    print("Starting Timetable AI Service (Port 8000)...")
    tt_env = os.environ.copy()
    tt_env["PYTHONPATH"] = timetable_dir
    
    timetable_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
        cwd=timetable_dir,
        env=tt_env,
        shell=True
    )

    print("\n--- BOTH SERVICES ARE RUNNING! ---")
    print("Face Recognition: http://localhost:5002/health")
    print("Timetable AI:    http://localhost:8000/health")
    print("\nNote: Use 'start.bat' if you see 'ModuleNotFoundError'.")
    print("To stop both, press Ctrl+C or close this window.")
    print("----------------------------------\n")

    try:
        while True:
            time.sleep(1)
            # If one service stops, we show a message
            if face_proc.poll() is not None:
                print("Face Recognition service has stopped.")
                break
            if timetable_proc.poll() is not None:
                print("Timetable AI service has stopped.")
                break
    except KeyboardInterrupt:
        print("\nStopping everything...")
        if sys.platform == "win32":
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(face_proc.pid)], shell=True)
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(timetable_proc.pid)], shell=True)
        else:
            face_proc.terminate()
            timetable_proc.terminate()

if __name__ == "__main__":
    run_services()
