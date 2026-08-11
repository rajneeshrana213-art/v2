from typing import Dict, List, Any
from datetime import datetime, timedelta

def flatten_dict(data: Dict[str, Any], parent_key: str = '', sep: str = '.') -> Dict[str, Any]:
   
    items = []
    for k, v in data.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

def generate_time_slots(start_hour: int, end_hour: int, duration_minutes: int) -> List[str]:
    """Generate list of time slots."""
    slots = []
    current = datetime(2000, 1, 1, start_hour, 0)
    end = datetime(2000, 1, 1, end_hour, 0)
    delta = timedelta(minutes=duration_minutes)
    while current < end:
        slots.append(current.strftime("%H:%M"))
        current += delta
    return slots

def map_prisma_to_solver(lessons: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
 
    solver_lessons = []
    for l in lessons:
        solver_lessons.append({
            "lessonId": l.get("id"),
            "classId": l.get("classId"),
            "subjectId": l.get("subjectId"),
            "teacherId": l.get("teacherId"),
            "roomId": l.get("roomId", None),
            "day": l.get("day"),
            "timeSlot": l.get("startTime")[:5] if l.get("startTime") else None,
        })
    return solver_lessons
