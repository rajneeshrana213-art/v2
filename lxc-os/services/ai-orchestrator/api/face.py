import cv2
import numpy as np
import onnxruntime as ort
import base64
import requests
import os
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Vercel Temporary Storage
MODEL_DIR = "/tmp/models"
MODEL_PATH = os.path.join(MODEL_DIR, "face_recognition.onnx")
MODEL_URL = os.environ.get("MODEL_URL", "https://huggingface.co/onnxmodelzoo/arcfaceresnet100-8/resolve/main/arcfaceresnet100-8.onnx")
THRESHOLD = 0.6

# Use Haar Cascade for Vercel (Lighter than Mediapipe)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

session: Optional[ort.InferenceSession] = None

def download_model():
    if os.path.exists(MODEL_PATH):
        return
    
    os.makedirs(MODEL_DIR, exist_ok=True)
    try:
        r = requests.get(MODEL_URL, allow_redirects=True, stream=True, timeout=60)
        if r.status_code == 200:
            with open(MODEL_PATH, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk: f.write(chunk)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model download failed: {str(e)}")

def get_session():
    global session
    if session is None:
        download_model()
        session = ort.InferenceSession(MODEL_PATH, providers=['CPUExecutionProvider'])
    return session

def preprocess(face):
    face = cv2.resize(face, (112, 112))
    face = face.astype(np.float32)
    face = (face - 127.5) / 128.0
    face = np.transpose(face, (2, 0, 1))
    return np.expand_dims(face, axis=0)

def extract_embedding(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    if len(faces) == 0: return None
    
    x, y, w, h = faces[0]
    face_roi = image[y:y+h, x:x+w]
    face_input = preprocess(face_roi)
    
    sess = get_session()
    input_name = sess.get_inputs()[0].name
    embedding = sess.run(None, {input_name: face_input})[0]
    
    norm = np.linalg.norm(embedding)
    if norm == 0: return None
    embedding = (embedding / norm).astype(np.float32).flatten()
    return base64.b64encode(embedding.tobytes()).decode("utf-8")

def load_image(source: str):
    try:
        if source.startswith("http"):
            resp = requests.get(source, timeout=10)
            content = resp.content
        else:
            if "," in source: source = source.split(",")[-1]
            content = base64.b64decode(source)
        
        nparr = np.frombuffer(content, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except:
        return None

@app.get("/api/face/health")
async def health():
    return {"status": "ok", "engine": "vercel-python", "detector": "haar-cascade"}

@app.post("/api/face/embedding")
async def get_embedding_route(data: Dict[str, str] = Body(...)):
    img = load_image(data.get("imageUrl"))
    if img is None: raise HTTPException(status_code=400, detail="Invalid image")
    
    vector = extract_embedding(img)
    if not vector: raise HTTPException(status_code=400, detail="No face detected")
    return {"embedding": vector, "format": "float32-base64"}

@app.post("/api/face/match-embeddings")
async def match_embeddings_route(data: Dict[str, str] = Body(...)):
    try:
        e1 = np.frombuffer(base64.b64decode(data["embedding1"]), dtype=np.float32)
        e2 = np.frombuffer(base64.b64decode(data["embedding2"]), dtype=np.float32)
        score = np.dot(e1, e2) / (np.linalg.norm(e1) * np.linalg.norm(e2))
        return {"matched": bool(score > THRESHOLD), "score": float(score)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
