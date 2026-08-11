/**
 * Module 1 & 4 — Personalized Study Roadmap Engine
 * Generates a daily AI-powered learning plan tailored to exam schedule + performance
 * Reuses and integrates with pre-existing database tables (Roadmap, Topic, Subject)
 */

import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { createLogger } from '@/lib/logger';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';
import { apiError } from '@/lib/server/api-response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const log = createLogger('StudyRoadmap');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const body = await req.json();
    const {
      studentName,
      class: studentClass,
      subjects,
      examDate,
      studyHoursPerDay,
      weakTopics,
      strongTopics,
      language = 'hindi',
      daysToGenerate = 7,
    } = body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'Subjects array is required');
    }

    const { model } = resolveModelFromHeaders(req);

    const langInstruction =
      language === 'hindi'
        ? 'Respond entirely in Hindi (Devanagari script).'
        : language === 'hinglish'
          ? 'Respond in Hinglish — mix Hindi and English naturally, like a friend teaching.'
          : 'Respond in clear, simple English.';

    const weakSection = weakTopics?.length
      ? `Weak topics to prioritize: ${weakTopics.join(', ')}`
      : '';
    const strongSection = strongTopics?.length
      ? `Strong topics (less focus needed): ${strongTopics.join(', ')}`
      : '';
    const examSection = examDate ? `Exam date: ${examDate}` : 'No specific exam date set';

    const prompt = `You are an expert Indian education counselor creating a personalized ${daysToGenerate}-day study roadmap.

Student: ${studentName || 'Student'}
Class: ${studentClass || 'Unknown'}
Subjects: ${subjects.join(', ')}
Daily study hours available: ${studyHoursPerDay || 3} hours
${examSection}
${weakSection}
${strongSection}

${langInstruction}

Create a detailed ${daysToGenerate}-day study plan in this JSON format:
{
  "studentMessage": "A warm, encouraging message to the student (2–3 sentences)",
  "strategy": "Overall study strategy explanation (3–4 sentences)",
  "days": [
    {
      "day": "Day 1 — Monday",
      "date": "",
      "totalMinutes": 180,
      "theme": "Focus theme for the day (e.g. Math Foundations)",
      "tasks": [
        {
          "subject": "Mathematics",
          "topic": "Quadratic Equations",
          "durationMinutes": 45,
          "type": "learn",
          "priority": "high",
          "tip": "Quick study tip for this task"
        }
      ],
      "motivation": "Short motivational quote/message for the day"
    }
  ],
  "weeklyGoals": ["Goal 1", "Goal 2", "Goal 3"],
  "revisionSchedule": "When and how to revise (e.g. Saturday is full revision day)"
}

Rules:
- Total daily minutes = studyHoursPerDay × 60
- Include 5–10 min breaks between tasks (add as type: "rest")
- Prioritize weak topics early in the week
- Use spaced repetition — revisit important topics every 3 days
- Mix subjects per day to prevent fatigue
- Include practice/mock test tasks on final days
- All text must follow the language instruction

Return ONLY valid JSON, no markdown, no extra text.`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 4000,
    });

    // Save generated roadmap and topics in database if user is authenticated
    if (userId) {
      try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const student = await prisma.student.findFirst({ where: { userId } });
          
          if (student && student.schoolId) {
            const classId = student.classId || 'default-class';

            // Clean up existing roadmaps for this user to avoid database bloat
            await prisma.roadmap.deleteMany({ where: { userId } });

            for (const day of parsed.days || []) {
              for (const task of day.tasks || []) {
                if (task.type !== 'rest') {
                  const subjectName = task.subject || 'General';

                  // Dynamic subject mapping
                  const subject = await prisma.subject.findFirst({
                    where: { name: subjectName, classId }
                  }) || await prisma.subject.create({
                    data: {
                      name: subjectName,
                      code: subjectName.toUpperCase().substring(0, 5),
                      type: 'theory',
                      classId,
                      schoolId: student.schoolId,
                    }
                  });

                  // Save core study plan roadmap
                  const roadmap = await prisma.roadmap.create({
                    data: {
                      title: `${day.day} - ${task.topic}`,
                      userId,
                      subjectId: subject.id,
                      startDate: new Date(),
                      endDate: new Date(Date.now() + daysToGenerate * 24 * 60 * 60 * 1000),
                      progress: 0,
                    }
                  });

                  // Save detailed topics links
                  await prisma.topic.create({
                    data: {
                      name: task.topic,
                      roadmapId: roadmap.id,
                      isCompleted: false,
                    }
                  });
                }
              }
            }
          }
        }
      } catch (dbErr) {
        log.error('Failed to save study roadmap in database', dbErr);
      }
    }

    return new Response(result.text, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    log.error('Study roadmap error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to generate study roadmap');
  }
}
