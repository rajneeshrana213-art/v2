from typing import Dict, Any, Optional
from app.solver.constraints import create_variables
from app.solver.model import optimize_timetable

def generate_timetable(payload: Dict[str, Any], teacher_preferences: Optional[Dict[str, list]] = None) -> Dict[str, Any]:
   
    
    lessons_data = create_variables(payload)
    
    days = payload.get("days", [])
    time_slots = payload.get("timeSlots", [])

    try:
       
        final_lessons = optimize_timetable(lessons_data["lessons"], days, time_slots, teacher_preferences)
    except ValueError as e:
      
        return {"success": False, "errors": str(e)}

    return {"success": True, "timetable": final_lessons}
