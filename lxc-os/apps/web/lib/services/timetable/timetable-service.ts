import { prisma } from "../../prisma";
import { DraftTimetable } from "./draft-store";
import axios from "axios";
import {
    getInstitutionalNow,
    getISTCurrentDayOfWeek,
    getISTHours,
    getISTMinutes,
} from "../../utils/date-utils";


const TIMETABLE_AI_URL = process.env.TIMETABLE_AI_URL;

export const timetableservicesAutomatic = {
    async generateDraft(schoolId: string, options: any) {
        // Fetch school settings if not provided in options
        const school = await prisma.school.findUnique({
            where: { id: schoolId },
            select: {
                schoolOpening: true,
                schoolClosing: true,
                lunchStart: true,
                lunchEnd: true,
                periodDuration: true
            }
        });

        if (school) {
            options.schoolOpening = options.schoolOpening || school.schoolOpening;
            options.schoolClosing = options.schoolClosing || school.schoolClosing;
            options.lunchStart = options.lunchStart || school.lunchStart;
            options.lunchEnd = options.lunchEnd || school.lunchEnd;
            options.periodDuration = options.periodDuration || school.periodDuration;
        }

        const requiredFields = ["schoolOpening", "schoolClosing", "lunchStart", "lunchEnd"];
        const missingFields = requiredFields.filter(field => !options[field]);

        if (missingFields.length > 0) {
            return {
                success: false,
                status: "INPUT_REQUIRED",
                missing_fields: missingFields,
                message: "Please provide the missing information to generate the timetable."
            };
        }

        const schoolClasses = await prisma.class.findMany({
            where: { schoolId },
            include: {
                Subject: {
                    include: {
                        teachers: {
                            include: {
                                user: true
                            }
                        }
                    }
                },
                Section: true,
                Teacher: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (schoolClasses.length === 0) {
            return {
                success: false,
                status: "ERROR",
                reason: "No classes found for this school. Please create classes first."
            };
        }

        for (const cls of schoolClasses) {
            if (cls.Subject.length === 0) {
                return {
                    success: false,
                    status: "ERROR",
                    reason: `Class ${cls.name} has no subjects assigned.`
                };
            }
            for (const subj of cls.Subject) {
                if (!subj.teachers || subj.teachers.length === 0) {
                    return {
                        success: false,
                        status: "ERROR",
                        reason: `No teacher assigned for subject '${subj.name}' in Class ${cls.name}.`
                    };
                }
            }
        }


        const schoolOpening = options.schoolOpening;
        const schoolClosing = options.schoolClosing;
        const lunchStart = options.lunchStart;
        const lunchEnd = options.lunchEnd;
        const periodDuration = options.periodDuration || 45;

        const calculatedTimeSlots = this.calculateTimeSlots(
            schoolOpening,
            schoolClosing,
            lunchStart,
            lunchEnd,
            periodDuration
        );

        const days = options.days || ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
        const periodsPerSubject = options.periodsPerSubject || 1;
        const timetableRange = options.timetableRange || "1_week";

        const classesPayload: any[] = [];
        const roomsList: any[] = [];

        schoolClasses.forEach(cls => {
            const hasSections = cls.Section && cls.Section.length > 0;

            if (hasSections) {
                cls.Section.forEach((sec, secIndex) => {

                    const virtualRoomNumber = cls.roomNumber ? `${cls.roomNumber}-${sec.name}` : `Room-Virtual-${cls.name}-${sec.name}`;
                    roomsList.push({ id: virtualRoomNumber });

                    classesPayload.push({
                        id: `${cls.id}__${sec.id}`,
                        name: `${cls.name} - ${sec.name}`,
                        roomNumber: virtualRoomNumber,
                        sectionName: sec.name,
                        subjects: cls.Subject.map(subj => {
                            let availableTeachers = subj.teachers || [];

                            const teacherId = (availableTeachers.length > 0)
                                ? availableTeachers[secIndex % availableTeachers.length].id
                                : null;

                            return {
                                id: subj.id,
                                name: subj.name,
                                teacherId: teacherId
                            };
                        }),
                        periods_per_subject: periodsPerSubject
                    });
                });
            } else {
                const roomNum = cls.roomNumber || `Room-Virtual-${cls.name}`;
                roomsList.push({ id: roomNum });

                classesPayload.push({
                    id: cls.id,
                    name: cls.name,
                    roomNumber: roomNum,
                    subjects: cls.Subject.map(subj => ({
                        id: subj.id,
                        name: subj.name,
                        teacherId: (subj.teachers && subj.teachers.length > 0) ? subj.teachers[0].id : null
                    })),
                    periods_per_subject: periodsPerSubject
                });
            }
        });

        const uniqueRooms = Array.from(new Set(roomsList.map(r => r.id))).map(r => ({ id: r }));

        const aiPayload = {
            payload: {
                classes: classesPayload,
                rooms: uniqueRooms,
                days: days,
                timeSlots: calculatedTimeSlots,
                periodDuration: periodDuration,
                timetableRange: timetableRange
            },
            teacherPreferences: options.teacherPreferences || {}
        };

        if (!TIMETABLE_AI_URL) {
            return {
                success: false,
                status: "ERROR",
                message: "AI timetable service is not configured (TIMETABLE_AI_URL missing)"
            };
        }

        try {

            const response = await axios.post(TIMETABLE_AI_URL, aiPayload);
            const aiResult = response.data;

            if (!aiResult.success) {
                return {
                    success: false,
                    status: "ERROR",
                    reason: aiResult.errors || "Timetable could not be generated due to conflicts."
                };
            }


            let draftLessons = aiResult.timetable.map((lesson: any) => {
                const startTime = this.calculateDateTime(lesson.day, lesson.timeSlot);
                const endTime = new Date(startTime.getTime() + periodDuration * 60000);


                const [classId, sectionId] = lesson.classId.includes("__")
                    ? lesson.classId.split("__")
                    : [lesson.classId, null];

                const cls = schoolClasses.find(c => c.id === classId);
                const section = sectionId ? cls?.Section.find(s => s.id === sectionId) : null;
                const subj = cls?.Subject.find(s => s.name === lesson.subjectId || s.id === lesson.subjectId);

                return {
                    day: lesson.day,
                    startTime,
                    endTime,
                    subjectId: subj?.id || lesson.subjectId,
                    classId: classId,
                    section: section?.name || null,
                    teacherId: lesson.teacherId === "No Teacher" ? null : lesson.teacherId,
                    name: `${subj?.name || "Lesson"} - ${cls?.name || "Class"}${section ? ` (${section.name})` : ""}`,
                    roomId: lesson.roomId,
                    weekNumber: 1
                };
            });


            if (timetableRange === "1_month") {
                const monthLessons: any[] = [];
                for (let w = 0; w < 4; w++) {
                    draftLessons.forEach((lesson: any) => {
                        const newStart = new Date(lesson.startTime);
                        newStart.setDate(newStart.getDate() + (w * 7));
                        const newEnd = new Date(lesson.endTime);
                        newEnd.setDate(newEnd.getDate() + (w * 7));

                        monthLessons.push({
                            ...lesson,
                            startTime: newStart,
                            endTime: newEnd,
                            weekNumber: w + 1
                        });
                    });
                }
                draftLessons = monthLessons;
            }


            const draft = await DraftTimetable.create(draftLessons);

            return {
                draftId: draft.id,
                lessons: draftLessons,
                success: true,
                status: "SUCCESS",
                timetable_type: timetableRange === "1_month" ? "MONTH" : "WEEK",
                slotsCalculated: calculatedTimeSlots.length
            };
        } catch (error: any) {
            console.error("Error generating automatic timetable:", error.message);
            return {
                success: false,
                status: "ERROR",
                reason: error.response?.data?.detail || error.message
            };
        }
    },


    calculateTimeSlots(start: string, end: string, lStart: string, lEnd: string, duration: number): string[] {
        const slots: string[] = [];
        const [startH, startM] = start.split(":").map(Number);
        const [endH, endM] = end.split(":").map(Number);
        const [lunchSH, lunchSM] = lStart.split(":").map(Number);
        const [lunchEH, lunchEM] = lEnd.split(":").map(Number);

        let current = new Date(2024, 0, 1, startH, startM);
        const schoolEnd = new Date(2024, 0, 1, endH, endM);
        const lunchStart = new Date(2024, 0, 1, lunchSH, lunchSM);
        const lunchEnd = new Date(2024, 0, 1, lunchEH, lunchEM);

        while (new Date(current.getTime() + duration * 60000) <= schoolEnd) {
            const next = new Date(current.getTime() + duration * 60000);


            const overlapsLunch = (current < lunchEnd && next > lunchStart);

            if (!overlapsLunch) {
                slots.push(current.getHours().toString().padStart(2, '0') + ":" + current.getMinutes().toString().padStart(2, '0'));
                current = next;
            } else {

                if (current < lunchEnd) {
                    current = lunchEnd;
                } else {
                    current = next;
                }
            }
        }
        return slots;
    },

    calculateDateTime(dayName: string, timeStr: string): Date {
        const [hours, minutes] = timeStr.split(":").map(Number);
        const dayMap: any = {
            "SUNDAY": 0, "MONDAY": 1, "TUESDAY": 2, "WEDNESDAY": 3,
            "THURSDAY": 4, "FRIDAY": 5, "SATURDAY": 6
        };

        const targetDay = dayMap[dayName.toUpperCase()];

        // Use IST-aware helpers so this works correctly on UTC-based Vercel servers
        const now = getInstitutionalNow();
        const currentDay = getISTCurrentDayOfWeek();          // IST weekday (0=Sun…6=Sat)
        const istHour = getISTHours(now);            // IST hour
        const istMinute = getISTMinutes(now);          // IST minute

        // Build a result Date anchored to IST so the stored UTC value is accurate
        const resultDate = new Date(now);
        resultDate.setUTCHours(hours - 5, minutes - 30, 0, 0); // IST h:m → UTC
        // Correct for negative minutes
        if (minutes < 30) {
            resultDate.setUTCHours(hours - 6, minutes + 30, 0, 0);
        }

        let distance = targetDay - currentDay;

        if (distance < 0) {
            distance += 7;
        } else if (distance === 0) {
            const todayTime = istHour * 60 + istMinute;
            const targetTime = hours * 60 + minutes;
            if (targetTime <= todayTime) {
                distance = 7;
            }
        }

        resultDate.setDate(resultDate.getDate() + distance);
        return resultDate;
    },

    async approveDraft(draftId: string) {
        const draft = await DraftTimetable.get(draftId);
        if (!draft) {
            return { error: "Draft not found" };
        }

        const lessons = draft.payload as any[];

        const savedLessons = await prisma.lesson.createMany({
            data: lessons.map(l => ({
                day: l.day,
                startTime: new Date(l.startTime),
                endTime: new Date(l.endTime),
                subjectId: l.subjectId,
                classId: l.classId,
                teacherId: l.teacherId
            }))
        });

        await DraftTimetable.remove(draftId);
        return {
            message: "Draft approved and lessons saved",
            count: savedLessons.count,
            success: true
        };
    },

    async deleteDraft(draftId: string) {
        const draft = await DraftTimetable.remove(draftId);
        if (!draft) {
            return { error: "Draft not found" };
        }
        return { message: "Draft deleted successfully", success: true };
    }
}
