from typing import List, Dict
from ortools.sat.python import cp_model


def optimize_timetable(lessons: List[Dict], days: List[str], time_slots: List[str], teacher_preferences: Dict[str, List[str]] = None) -> List[Dict]:
   
    model = cp_model.CpModel()
    teacher_preferences = teacher_preferences or {}

    slots = []
    for d in days:
        for t in time_slots:
            slots.append({"day": d, "time": t})
    
    num_slots = len(slots)

    lesson_vars = {}
    for i in range(len(lessons)):
        lesson_vars[i] = model.NewIntVar(0, num_slots - 1, f"l_{i}")

    for i in range(len(lessons)):
        for j in range(i + 1, len(lessons)):
            l1 = lessons[i]
            l2 = lessons[j]

            shares_teacher = (l1["teacherId"] == l2["teacherId"] and l1["teacherId"] not in [None, "No Teacher"])
            shares_room = (l1["roomId"] == l2["roomId"] and l1["roomId"] not in [None, "default_room"])
            shares_class = (l1["classId"] == l2["classId"])

            if shares_teacher or shares_room or shares_class:
                model.Add(lesson_vars[i] != lesson_vars[j])

  
    for i, lesson in enumerate(lessons):
        tid = lesson["teacherId"]
        if tid in teacher_preferences:
            pref_times = teacher_preferences[tid]
            pref_indexes = [idx for idx, s in enumerate(slots) if s["time"] in pref_times]
            if pref_indexes:
                model.AddAllowedAssignments([lesson_vars[i]], [[p] for p in pref_indexes])

  
    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        for i, lesson in enumerate(lessons):
            slot_idx = solver.Value(lesson_vars[i])
            lesson["day"] = slots[slot_idx]["day"]
            lesson["timeSlot"] = slots[slot_idx]["time"]
        return lessons
    else:
        raise ValueError("not solved and geenaret the time table error .")
