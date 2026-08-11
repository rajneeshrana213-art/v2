from typing import Dict, List, Any, Optional


def check_hard_constraints(lessons: List[Dict[str, Any]]) -> List[str]:
    errors = []
    teacher_schedule = {}
    room_schedule = {}
    class_schedule = {}

    for lesson in lessons:
        key_teacher = (lesson["teacherId"], lesson["day"], lesson["timeSlot"])
        key_room = (lesson["roomId"], lesson["day"], lesson["timeSlot"])
        key_class = (lesson["classId"], lesson["day"], lesson["timeSlot"])

    
        if key_teacher in teacher_schedule:
            errors.append(f"Teacher {lesson['teacherId']} has two classes at the same time: {lesson['day']} {lesson['timeSlot']}")
        else:
            teacher_schedule[key_teacher] = True

      
        if key_room in room_schedule:
            errors.append(f"Room {lesson['roomId']} is being used by two classes at once: {lesson['day']} {lesson['timeSlot']}")
        else:
            room_schedule[key_room] = True

  
        if key_class in class_schedule:
            errors.append(f"Class {lesson['classId']} has two lessons scheduled at the same time: {lesson['day']} {lesson['timeSlot']}")
        else:
            class_schedule[key_class] = True

    return errors


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

                if class_room:
                    room_id = class_room
                else:
                    room_id = rooms[room_index % len(rooms)]["id"] if rooms else "default_room"
                    room_index += 1

                lessons.append({
                    "classId": cls["id"],
                    "subjectId": subject_name,
                    "teacherId": teacher_id,
                    "day": day,
                    "timeSlot": time_slot,
                    "roomId": room_id
                })

    return {"lessons": lessons}
