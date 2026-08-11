# Multi-stage Docker build for AI Services
# Stage 1: Base Python environment
FROM python:3.10-slim as base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgl1 \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app


# ===============================
# Stage 2: Face Recognition Service
# ===============================
FROM base as face-service

COPY face-attendance/requirements.txt /app/face-requirements.txt
RUN pip install --no-cache-dir -r /app/face-requirements.txt

COPY face-attendance/ /app/face-attendance/
RUN mkdir -p /app/face-attendance/models

ENV FACE_SERVICE_PORT=5002
ENV PYTHONUNBUFFERED=1

WORKDIR /app/face-attendance
EXPOSE 5002


# ===============================
# Stage 3: Timetable AI Service
# ===============================
FROM base as timetable-service

COPY timetableAi/requirements.txt /app/timetable-requirements.txt
RUN pip install --no-cache-dir -r /app/timetable-requirements.txt

COPY timetableAi/ /app/timetableAi/

ENV TIMETABLE_SERVICE_PORT=8000
ENV PYTHONUNBUFFERED=1

WORKDIR /app/timetableAi
EXPOSE 8000


# ===============================
# Stage 4: Combined Runtime
# ===============================
FROM base as runtime

COPY face-attendance/requirements.txt /tmp/face-requirements.txt
COPY timetableAi/requirements.txt /tmp/timetable-requirements.txt

RUN pip install --no-cache-dir \
    -r /tmp/face-requirements.txt \
    -r /tmp/timetable-requirements.txt \
    && rm -rf /tmp/*.txt

COPY face-attendance/ /app/face-attendance/
COPY timetableAi/ /app/timetableAi/
COPY run_all.py /app/run_all.py

RUN mkdir -p /app/face-attendance/models

ENV FACE_SERVICE_PORT=5002
ENV TIMETABLE_SERVICE_PORT=8000
ENV PYTHONUNBUFFERED=1

WORKDIR /app
EXPOSE 5002 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5002/health && curl -f http://localhost:8000/health || exit 1

CMD ["python", "run_all.py"]
