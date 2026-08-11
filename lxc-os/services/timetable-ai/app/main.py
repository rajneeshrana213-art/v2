from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from app.solver.solver import generate_timetable


app = FastAPI(title="Timetable automatic API biky")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import Response

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)


class TimetableRequest(BaseModel):
    payload: Dict[str, Any]
    teacherPreferences: Dict[str, List[str]] = {}



@app.post("/generate-timetable")
async def generate_timetable_endpoint(request: TimetableRequest):
    try:
       
        result = generate_timetable(request.payload, request.teacherPreferences)
        if not result.get("success"):
          
            raise HTTPException(status_code=400, detail=result.get("errors"))
        return result
    except Exception as e:
      
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "ok", "message": "I am awake and ready Biky is here !"}


