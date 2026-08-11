@echo off
echo.
echo --- Automatic Setup and Start ---
echo Installing dependencies (this will skip if already installed)...

REM Install for current venv/environment
pip install -r face-attendance\requirements.txt --quiet
pip install -r timetableAi\requirements.txt --quiet

echo Dependencies checked.
echo.
echo Starting both Timetable and Face Attendance services...
python run_all.py
pause
