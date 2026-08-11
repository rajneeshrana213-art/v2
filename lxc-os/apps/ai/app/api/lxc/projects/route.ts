/**
 * Module 15 — Real World Project Engine
 * Generates mini-projects tied to curriculum that solve real Indian problems
 * Connects academic knowledge to practical application
 */

import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { createLogger } from '@/lib/logger';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';
import { apiError, apiSuccess } from '@/lib/server/api-response';

const log = createLogger('ProjectEngine');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      subject,
      topic,
      studentClass = 'Class 10',
      duration = '1 week',
      projectType = 'solo',
      language = 'hindi',
    } = body;

    if (!subject || !topic) {
      return apiError('MISSING_FIELDS', 400, 'Subject and topic are required');
    }

    const { model } = resolveModelFromHeaders(req);

    const langInstruction =
      language === 'hindi'
        ? 'All project instructions in Hindi.'
        : language === 'hinglish'
          ? 'Project instructions in Hinglish.'
          : 'Project instructions in English.';

    const prompt = `You are a project-based learning expert designing real-world projects for Indian students.

${langInstruction}

Student: ${studentClass}
Subject: ${subject}
Topic: ${topic}
Duration: ${duration}
Project type: ${projectType} (solo / pair / group)

Design an engaging real-world project that:
1. Connects ${topic} to a real problem in India (rural/urban issues, environment, health, education, etc.)
2. Is doable with limited resources (no expensive equipment)
3. Creates something tangible and shareable
4. Builds 21st century skills (collaboration, research, presentation)

Return as JSON:
{
  "projectTitle": "Catchy project name",
  "tagline": "One sentence problem statement",
  "realWorldConnection": "How this connects to an actual Indian challenge",
  "learningOutcomes": ["What student will know", "What student will be able to do", "Skills gained"],
  "difficulty": "Beginner / Intermediate / Advanced",
  "materials": ["Material 1 (cost ₹X)", "Material 2 (free)", "Material 3"],
  "totalBudget": "₹X - ₹Y",
  "phases": [
    {
      "phase": 1,
      "name": "Research & Planning",
      "duration": "Day 1-2",
      "tasks": ["Task 1", "Task 2"],
      "deliverable": "What they produce"
    },
    {
      "phase": 2,
      "name": "Build & Create",
      "duration": "Day 3-5",
      "tasks": ["Task 1", "Task 2"],
      "deliverable": "What they produce"
    },
    {
      "phase": 3,
      "name": "Present & Reflect",
      "duration": "Day 6-7",
      "tasks": ["Task 1", "Task 2"],
      "deliverable": "Final presentation/report"
    }
  ],
  "presentationIdeas": ["How to present: school fair", "Online video", "Community display"],
  "extensionChallenges": ["Bonus challenge 1", "Bonus challenge 2"],
  "curriculumLinks": ["NCERT chapter this connects to", "Exam topic this reinforces"],
  "socialImpact": "How this project could help their community",
  "portfolioValue": "How this project looks on college applications/resume",
  "teacherNote": "Tips for getting teacher's support and approval"
}

Make it exciting and achievable. Return ONLY valid JSON.`;

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.8,
      maxOutputTokens: 2000,
    });

    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return apiError('PARSE_FAILED', 500, 'Failed to parse project response');
    }

    return apiSuccess(parsed as unknown as Record<string, unknown>);
  } catch (err) {
    log.error('Project engine error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to generate project');
  }
}
