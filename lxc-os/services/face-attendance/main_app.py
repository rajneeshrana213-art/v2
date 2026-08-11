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



os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

MODEL_URL = "https://huggingface.co/onnxmodelzoo/arcfaceresnet100-8/resolve/main/arcfaceresnet100-8.onnx"

MODEL_PATH = "models/face_recognition.onnx"
THRESHOLD = 0.6 

app = FastAPI(title=" Face Recognition BIKY")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)


detector = None
use_fallback = False

try:
    import mediapipe as mp
    if hasattr(mp, 'solutions'):
        mp_face_detection = mp.solutions.face_detection
        detector = mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.5)
    else:
        raise AttributeError("Mediapipe solutions missing")
except Exception:
    detector = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    use_fallback = True

session: Optional[ort.InferenceSession] = None

def download_model():
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            chunk = f.read(100)
            if b"<html" in chunk.lower() or b"<!doctype" in chunk.lower() or os.path.getsize(MODEL_PATH) < 1000:
                print("Model file is corrupted (HTML). Deleting and redownloading...")
                f.close()
                os.remove(MODEL_PATH)
            else:
                print("Model already exists, skipping download.")
                return  
   
    print("Downloading AI Model (ArcFace)... this might take a minute.")
    os.makedirs("models", exist_ok=True)
    
    try:
        r = requests.get(MODEL_URL, allow_redirects=True, stream=True, timeout=60)
        
        if r.status_code != 200:
            error_msg = f"Failed to download model: HTTP {r.status_code}"
            print(f"ERROR: {error_msg}")
            raise HTTPException(status_code=500, detail=error_msg)
        
        with open(MODEL_PATH, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:  # Filter out keep-alive chunks
                    f.write(chunk)
        
        print("Model downloaded successfully.")
        
        # Verify the downloaded file
        if not os.path.exists(MODEL_PATH) or os.path.getsize(MODEL_PATH) < 1000:
            raise HTTPException(status_code=500, detail="Downloaded model file is invalid or too small")
            
    except requests.exceptions.RequestException as e:
        error_msg = f"Network error while downloading model: {str(e)}"
        print(f"ERROR: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        error_msg = f"Unexpected error during model download: {str(e)}"
        print(f"ERROR: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

def get_session():
    global session
    if session is None:
        download_model()
        try:
            session = ort.InferenceSession(MODEL_PATH, providers=['CPUExecutionProvider'])
        except Exception as e:
            print(f"ONNX Load Error: {e}")
            if os.path.exists(MODEL_PATH): os.remove(MODEL_PATH) 
            raise HTTPException(status_code=500, detail="Model could not be loaded. Please restart the service.")
    return session

def preprocess(image, bbox=None):
    if bbox is not None:
        try:
            if use_fallback:
                x, y, bw, bh = bbox
                face = image[max(0, y):y+bh, max(0, x):x+bw]
            else:
                h, w, _ = image.shape
                x, y, bw, bh = int(bbox.xmin * w), int(bbox.ymin * h), int(bbox.width * w), int(bbox.height * h)
                face = image[max(0, y):y+bh, max(0, x):x+bw]
        except Exception:
            face = image
    else:
        face = image

    if face is None or face.size == 0: return None
    try:
        face = cv2.resize(face, (112, 112))
        face = face.astype(np.float32)
        face = (face - 127.5) / 128.0
        face = np.transpose(face, (2, 0, 1))
        return np.expand_dims(face, axis=0)
    except Exception:
        return None

def extract_embedding(image):
    if detector is None or image is None: return None
    
    found_bbox = None
    try:
        if use_fallback:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            faces = detector.detectMultiScale(gray, 1.1, 4)
            if len(faces) > 0: found_bbox = faces[0]
        else:
            results = detector.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            if results.detections:
                found_bbox = results.detections[0].location_data.relative_bounding_box
    except Exception:
        return None

    if found_bbox is None: return None
    face_input = preprocess(image, found_bbox)
    if face_input is None: return None
    
    try:
        sess = get_session()
        input_name = sess.get_inputs()[0].name
        embedding = sess.run(None, {input_name: face_input})[0]
        norm = np.linalg.norm(embedding)
        if norm == 0: return None
        embedding = (embedding / norm).astype(np.float32).flatten()
        return base64.b64encode(embedding.tobytes()).decode("utf-8")

    except Exception:
        return None

def load_image(source: str):
    """Safely loads an image from either a URL or a Base64 string."""
    if not source: return None
    try:
        if source.startswith("http"):
            resp = requests.get(source, timeout=10)
            if resp.status_code != 200: return None
            content = resp.content
        else:
          
            if "," in source: source = source.split(",")[-1]
            content = base64.b64decode(source)
        
        if not content: return None
        nparr = np.frombuffer(content, np.uint8)
        if nparr.size == 0: return None
        
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception as e:
        print(f"Image load error: {e}")
        return None

# --- ROUTES ---

@app.get("/health")
async def health():
    return {"status": "ok", "detector": "OpenCV" if use_fallback else "Mediapipe"}

@app.get("/ready")
async def ready():
    try:
        get_session()
        return {"status": "ready"}
    except Exception:
        return {"status": "error"}

@app.post("/embedding")
async def get_embedding_route(data: Dict[str, str] = Body(...)):
    img = load_image(data.get("imageUrl"))
    if img is None: raise HTTPException(status_code=400, detail="Invalid image or empty URL")
    
    vector = extract_embedding(img)
    if not vector: raise HTTPException(status_code=400, detail="No face detected")
    return {
    "embedding": vector,  
    "length": len(vector),
    "format": "float32-base64"
}


# @app.post("/match")
# async def match_route(data: Dict[str, str] = Body(...)):
#     selfie = load_image(data.get("selfieBase64"))
#     stored = load_image(data.get("storedImageUrl"))
#     
#     if selfie is None or stored is None:
#         return {"matched": False, "error": "Invalid image data"}
#     
#     v1, v2 = extract_embedding(selfie), extract_embedding(stored)
#     if not v1 or not v2: return {"matched": False, "error": "Face not found"}
#     
#     score = np.dot(v1, v2)
#     return {"matched": bool(score > THRESHOLD), "score": float(score)}

@app.post("/match-embeddings")
async def match_embeddings_route(data: Dict[str, str] = Body(...)):
    try:
        e1 = np.frombuffer(base64.b64decode(data["embedding1"]), dtype=np.float32)
        e2 = np.frombuffer(base64.b64decode(data["embedding2"]), dtype=np.float32)

        if e1.shape[0] != e2.shape[0]:
            raise ValueError("Embedding size mismatch")

        score = np.dot(e1, e2) / (np.linalg.norm(e1) * np.linalg.norm(e2))
        return {
            "matched": bool(score > THRESHOLD),
            "score": float(score)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# @app.post("/match-embedding")
# async def match_embedding_route(data: Dict[str, Any] = Body(...)):
#     img = load_image(data.get("selfieInput"))
#     stored_vector = data.get("embedding")
#     
#     if img is None or stored_vector is None:
#         return {"matched": False, "error": "Invalid data"}
#         
#     v1 = extract_embedding(img)
#     if not v1: return {"matched": False, "error": "No face detected"}
#     
#     score = np.dot(v1, np.array(stored_vector))
#     return {"matched": bool(score > THRESHOLD), "score": float(score)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002)
