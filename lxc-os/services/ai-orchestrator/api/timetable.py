from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from ortools.sat.python import cp_model

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class TimetableRequest(BaseModel):
    payload: Dict[str, Any]
    teacherPreferences: Dict[str, List[str]] = {}

def create_variables(data: Dict[str, Any]) -> Dict[str, Any]:
    lessons: List[Dict[str, Any]] = []
    classes = data.get("classes", [])
    rooms = data.get("rooms", [])
    days = data.get("days", [])
    time_slots = data.get("timeSlots", [])
    room_index = 0

    for cls in classes:
        subjects = cls.get("subjects", []) 
        periods_per_subject = cls.get("periods_per_subject", 1)
        class_room = cls.get("roomNumber")

        for subject in subjects:
            teacher_id = subject.get("teacherId") if isinstance(subject, dict) else None
            subject_name = subject.get("name") if isinstance(subject, dict) else subject
            for p in range(periods_per_subject):
                day = days[p % len(days)] if days else None
                time_slot = time_slots[p % len(time_slots)] if time_slots else None
                room_id = class_room or (rooms[room_index % len(rooms)]["id"] if rooms else "default_room")
                if not class_room: room_index += 1
                lessons.append({"classId": cls["id"], "subjectId": subject_name, "teacherId": teacher_id, "day": day, "timeSlot": time_slot, "roomId": room_id})
    return {"lessons": lessons}

def optimize_timetable(lessons: List[Dict], days: List[str], time_slots: List[str], teacher_preferences: Dict[str, List[str]] = None) -> List[Dict]:
    model = cp_model.CpModel()
    teacher_preferences = teacher_preferences or {}
    slots = [{"day": d, "time": t} for d in days for t in time_slots]
    num_slots = len(slots)
    lesson_vars = {i: model.NewIntVar(0, num_slots - 1, f"l_{i}") for i in range(len(lessons))}

    for i in range(len(lessons)):
        for j in range(i + 1, len(lessons)):
            if (lessons[i]["teacherId"] == lessons[j]["teacherId"] and lessons[i]["teacherId"] not in [None, "No Teacher"]) or \
               (lessons[i]["roomId"] == lessons[j]["roomId"] and lessons[i]["roomId"] not in [None, "default_room"]) or \
               (lessons[i]["classId"] == lessons[j]["classId"]):
                model.Add(lesson_vars[i] != lesson_vars[j])

    for i, lesson in enumerate(lessons):
        tid = lesson["teacherId"]
        if tid in teacher_preferences:
            pref_indexes = [idx for idx, s in enumerate(slots) if s["time"] in teacher_preferences[tid]]
            if pref_indexes: model.AddAllowedAssignments([lesson_vars[i]], [[p] for p in pref_indexes])

    solver = cp_model.CpSolver()
    status = solver.Solve(model)
    if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
        for i, lesson in enumerate(lessons):
            slot_idx = solver.Value(lesson_vars[i])
            lesson["day"], lesson["timeSlot"] = slots[slot_idx]["day"], slots[slot_idx]["time"]
        return lessons
    raise ValueError("Infeasible timetable configuration.")

@app.post("/api/timetable/generate-timetable")
async def generate_timetable_endpoint(request: TimetableRequest):
    try:
        lessons_data = create_variables(request.payload)
        days, time_slots = request.payload.get("days", []), request.payload.get("timeSlots", [])
        result = optimize_timetable(lessons_data["lessons"], days, time_slots, request.teacherPreferences)
        return {"success": True, "timetable": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/timetable/health")
async def health():
    return {"status": "ok", "engine": "vercel-python"}
