import { prisma } from "@/lib/prisma";

export const getLessonsForStudent = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { classId: true },
  });

  if (!student) throw new Error("Student not found");
  if (!student.classId) throw new Error("Student is not assigned to a class");

  return await prisma.lesson.findMany({
    where: { classId: student.classId },
    include: {
      subject: { select: { id: true, name: true } },
      teacher: {
        select: {
          id: true,
          user: { select: { name: true, email: true, profilePic: true } },
        },
      },
    },
    orderBy: { startTime: "asc" },
  });
};

export const getStudentExams = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { classId: true },
  });

  if (!student) throw new Error("Student not found");
  if (!student.classId) throw new Error("Student is not assigned to a class");

  return await prisma.exam.findMany({
    where: { classId: student.classId },
    include: {
      subject: true,
      ExamAttendance: {
        where: { studentId },
        select: { id: true, date: true, present: true },
      },
      results: {
        where: { studentId },
        select: { id: true, score: true },
      },
    },
    orderBy: { startTime: "asc" },
  });
};

export const getStudentResultsAnalysis = async (studentId: string) => {
  const results = await prisma.result.findMany({
    where: { studentId },
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          subjectId: true,
          totalMarks: true,
          scheduleDate: true,
          subject: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { exam: { scheduleDate: "asc" } },
  });

  if (!results.length) return { subjectWise: [], overall: {} };

  const subjectMap: Record<string, any> = {};
  let totalScore = 0;
  let examCount = 0;
  let maxScore = -Infinity;
  let minScore = Infinity;

  for (const result of results) {
    const subjectName = result.exam?.subject?.name ?? "Unknown Subject";
    const score = result.score;
    const totalMarks = result.exam?.totalMarks || 100;

    if (!subjectMap[subjectName]) {
      subjectMap[subjectName] = {
        subject: subjectName,
        exams: [],
        total: 0,
        count: 0,
      };
    }

    subjectMap[subjectName].exams.push({
      examId: result.exam?.id,
      title: result.exam?.title,
      score,
      totalMarks,
      scheduleDate: result.exam?.scheduleDate,
    });

    subjectMap[subjectName].total += score;
    subjectMap[subjectName].count += 1;
    totalScore += score;
    examCount += 1;
    maxScore = Math.max(maxScore, score);
    minScore = Math.min(minScore, score);
  }

  const subjectWise = Object.values(subjectMap).map((s: any) => ({
    ...s,
    average: Math.round(s.total / s.count),
  }));

  return {
    subjectWise,
    overall: {
      examsAttempted: examCount,
      totalScore,
      averageScore: examCount > 0 ? Math.round(totalScore / examCount) : 0,
      highestScore: maxScore === -Infinity ? 0 : maxScore,
      lowestScore: minScore === Infinity ? 0 : minScore,
    },
  };
};

export const getStudentAttendanceAndLeaves = async (studentId: string) => {
  const attendance = await prisma.attendance.findMany({
    where: { studentId },
    include: {
      lesson: {
        select: {
          id: true,
          day: true,
          startTime: true,
          endTime: true,
          subject: { select: { name: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { userId: true },
  });

  if (!student) throw new Error("Student not found");

  const leaveRequests = await prisma.leaveRequest.findMany({
    where: { userId: student.userId },
    orderBy: { createdAt: "desc" },
  });

  return { attendance, leaveRequests };
};

export const getStudentAcademicResources = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { classId: true },
  });

  if (!student) throw new Error("Student not found");
  if (!student.classId) throw new Error("Student is not assigned to a class");

  const assignments = await prisma.assignment.findMany({
    where: { classId: student.classId },
    include: {
      subject: true,
      lesson: true,
    },
    orderBy: { dueDate: "asc" },
  });

  const homeworks = await prisma.homeWork.findMany({
    where: { classId: student.classId },
    include: {
      subject: true,
      HomeworkSubmission: { where: { studentId } },
    },
    orderBy: { dueDate: "asc" },
  });

  const pyqs = await prisma.pYQ.findMany({
    orderBy: { createdAt: "desc" },
  });

  return { assignments, homeworks, pyqs };
};

export const getStudentDashboardResources = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { schoolId: true, classId: true },
  });

  if (!student) throw new Error("Student not found");
  if (!student.classId) throw new Error("Student is not assigned to a class");

  const { schoolId, classId } = student;

  const notices = await prisma.notice.findMany({
    where: {
      schoolId,
      recipients: { some: { userType: "STUDENT" } },
    },
    include: {
      recipients: true,
      creator: { select: { name: true, email: true, profilePic: true } },
    },
    orderBy: { publishDate: "desc" },
  });

  const holidays = await prisma.holiday.findMany({
    where: { schoolId },
    orderBy: { date: "asc" },
  });

  const events = await prisma.event.findMany({
    where: {
      schoolId,
      OR: [{ targetAudience: "ALL" }, { Class: { some: { id: classId } } }],
    },
    include: { roles: true, sections: true },
    orderBy: { start: "asc" },
  });

  return { notices, holidays, events };
};

export const getStudentReportCard = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { name: true, profilePic: true } },
      school: { select: { id: true, schoolName: true, schoolLogo: true } },
      class: {
        include: {
          grades: { select: { level: true } },
          Section: { select: { id: true, name: true }, take: 1 },
        },
      },
      academicRecords: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!student) throw new Error("Student not found");
  if (!student.classId || !student.class)
    throw new Error("Student is not assigned to a class");

  const results = await prisma.result.findMany({
    where: { studentId, examId: { not: null } },
    include: {
      exam: {
        include: {
          subject: { select: { id: true, name: true, code: true } },
          class: { select: { name: true } },
        },
      },
    },
    orderBy: { exam: { scheduleDate: "asc" } },
  });

  if (!results.length) {
    return {
      student: {
        name: student.user.name,
        admission_no: student.admissionNo,
        class: student.class.name,
        section: student.class.Section[0]?.name || "N/A",
        roll_no: student.academicRecords?.[0]?.rollNumber || "",
        profile_pic: student.user.profilePic || null,
      },
      school: {
        name: student.school.schoolName,
        logo: student.school.schoolLogo,
      },
      exam: {
        name: "N/A",
        session: student.academicRecords?.[0]?.academicYear || "N/A",
        term: "N/A",
      },
      subjects: [],
      summary: {
        total_marks: 0,
        obtained_marks: 0,
        percentage: 0,
        grade: "N/A",
        result: "N/A",
      },
      remarks: "No results available",
    };
  }

  const subjectMap: Record<string, any> = {};
  let totalMaxMarks = 0;
  let totalObtainedMarks = 0;
  let hasFailedSubject = false;

  // Grades logic
  const grades = await prisma.grade.findMany({
    where: { status: "ACTIVE" },
    orderBy: { level: "desc" },
  });

  const getGradeFromPercentage = (percentage: number): string => {
    if (grades.length === 0) {
      if (percentage >= 90) return "A+";
      if (percentage >= 80) return "A";
      if (percentage >= 70) return "B";
      if (percentage >= 60) return "C";
      if (percentage >= 33) return "D";
      return "FAIL";
    }
    for (const grade of grades) {
      if (percentage >= grade.marksFrom && percentage <= grade.marksUpto)
        return grade.grade;
    }
    const lowestGrade = grades[grades.length - 1];
    return percentage < lowestGrade.marksFrom ? "FAIL" : lowestGrade.grade;
  };

  for (const result of results) {
    if (!result.exam) continue;
    const subjectId = result.exam.subjectId;
    const maxMarks = result.exam.totalMarks || 100;
    const obtainedMarks = result.score;
    const passMark = result.exam.passMark || 33;

    if (obtainedMarks < passMark) hasFailedSubject = true;

    if (!subjectMap[subjectId]) {
      subjectMap[subjectId] = {
        subject_id: subjectId,
        subject_name: result.exam.subject.name,
        subject_code: result.exam.subject.code || "",
        max_marks: 0,
        obtained_marks: 0,
        exams: [],
      };
    }

    subjectMap[subjectId].exams.push({
      examId: result.exam.id,
      title: result.exam.title,
      maxMarks,
      obtainedMarks,
    });

    subjectMap[subjectId].max_marks += maxMarks;
    subjectMap[subjectId].obtained_marks += obtainedMarks;
    totalMaxMarks += maxMarks;
    totalObtainedMarks += obtainedMarks;
  }

  const subjects = Object.values(subjectMap).map((subject: any) => {
    const percentage =
      subject.max_marks > 0
        ? (subject.obtained_marks / subject.max_marks) * 100
        : 0;
    const grade = getGradeFromPercentage(percentage);
    const passMark = 33;
    const status =
      subject.obtained_marks >= (subject.max_marks * passMark) / 100
        ? "PASS"
        : "FAIL";

    return {
      subject_name: subject.subject_name,
      subject_code: subject.subject_code,
      max_marks: subject.max_marks,
      obtained_marks: subject.obtained_marks,
      percentage: Number(percentage.toFixed(2)),
      grade,
      status,
    };
  });

  const overallPercentage =
    totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : 0;
  const overallGrade = getGradeFromPercentage(overallPercentage);
  const overallResult = hasFailedSubject ? "FAIL" : "PASS";

  // Remarks logic
  const getRemarks = (pct: number, failed: boolean) => {
    if (failed) return "Needs Improvement";
    if (pct >= 90) return "Outstanding";
    if (pct >= 80) return "Excellent";
    if (pct >= 70) return "Very Good";
    if (pct >= 60) return "Good";
    if (pct >= 33) return "Satisfactory";
    return "Needs Improvement";
  };
  const remarks = getRemarks(overallPercentage, hasFailedSubject);

  const firstExam = results[0]?.exam;
  const lastExam = results[results.length - 1]?.exam;
  const examTerm =
    firstExam?.scheduleDate && lastExam?.scheduleDate
      ? `${new Date(firstExam.scheduleDate).toLocaleDateString()} - ${new Date(lastExam.scheduleDate).toLocaleDateString()}`
      : "N/A";

  return {
    student: {
      name: student.user.name,
      admission_no: student.admissionNo,
      class: student.class.name,
      section: student.class.Section[0]?.name || "N/A",
      roll_no: student.academicRecords?.[0]?.rollNumber || "",
      profile_pic: student.user.profilePic || null,
    },
    school: {
      name: student.school.schoolName,
      logo: student.school.schoolLogo,
    },
    exam: {
      name: firstExam?.title || "Annual Examination",
      session: student.academicRecords?.[0]?.academicYear || "N/A",
      term: examTerm,
    },
    subjects,
    summary: {
      total_marks: totalMaxMarks,
      obtained_marks: totalObtainedMarks,
      percentage: Number(overallPercentage.toFixed(2)),
      grade: overallGrade,
      result: overallResult,
    },
    remarks,
  };
};

export const getStudentQuizzesAndNewspapers = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { classId: true, userId: true },
  });

  if (!student) throw new Error("Student not found");
  if (!student.classId) throw new Error("Student is not assigned to a class");

  const { classId, userId } = student;

  const quizzes = await prisma.quiz.findMany({
    where: { classId },
    include: {
      quizResults: {
        where: { userId },
        select: { score: true, createdAt: true },
      },
      questions: { take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const quizzesWithScore = quizzes.map((q) => {
    const firstQuestion = q.questions[0];
    return {
      id: q.id,
      question: q.title, // Map Quiz title to 'question' for backward compatibility
      options: firstQuestion?.options || [],
      answer: firstQuestion?.correctAnswer || "",
      createdAt: q.createdAt,
      score: q.quizResults.length ? q.quizResults[0].score : null,
      attemptedAt: q.quizResults.length ? q.quizResults[0].createdAt : null,
    };
  });

  const newspapers = await prisma.newspaper.findMany({
    where: { classId },
    include: {
      NewspaperSubmission: {
        where: { studentId: userId },
        select: {
          content: true,
          submittedAt: true,
          feedback: true,
          score: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const newspapersWithSubmission = newspapers.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    attachment: n.attachment,
    createdAt: n.createdAt,
    submission: n.NewspaperSubmission.length ? n.NewspaperSubmission[0] : null,
  }));

  return { quizzes: quizzesWithScore, newspapers: newspapersWithSubmission };
};
