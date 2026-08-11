/**
 * Module 12 — Life Skills AI
 * Time management, financial literacy, leadership, entrepreneurship,
 * critical thinking — practical life skills for Indian students
 */

import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { createLogger } from '@/lib/logger';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';
import { apiError } from '@/lib/server/api-response';

const log = createLogger('LifeSkills');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { skill, question, studentClass = 'Class 10', language = 'hindi' } = body;

    if (!skill || !question) {
      return apiError('MISSING_FIELDS', 400, 'Skill category and question are required');
    }

    const { model } = resolveModelFromHeaders(req);

    const langInstruction =
      language === 'hindi'
        ? 'Respond entirely in Hindi. Use simple, conversational Hindi.'
        : language === 'hinglish'
          ? 'Respond in Hinglish (Hindi + English mix). Keep it relatable.'
          : 'Respond in clear, simple English.';

    const skillContexts: Record<string, string> = {
      time_management: `You are a productivity coach for Indian students. Focus on practical time management techniques suited for Indian family environments (joint families, study pressure, board exams, tuition schedules). Include techniques like Pomodoro, time blocking, and managing parental expectations.`,
      financial_literacy: `You are a financial literacy educator for Indian teenagers. Cover concepts like savings, budgeting, UPI payments, compound interest, mutual funds basics, avoiding debt traps, and building good money habits from school. Use Indian currency (₹) and relatable Indian examples.`,
      leadership: `You are a leadership development coach for young Indians. Focus on school-level leadership (class monitor, sports captain, project leader), community leadership, building confidence, resolving conflicts, and leading diverse groups. Reference Indian leaders as examples.`,
      entrepreneurship: `You are a startup mentor for young Indian entrepreneurs. Cover idea validation, lean startup method, Indian startup ecosystem (Zomato, Byju's, Flipkart origin stories), government schemes for youth (Startup India, MSME), bootstrapping vs funding, and building while studying.`,
      critical_thinking: `You are a critical thinking coach. Teach Indian students to question assumptions, spot misinformation (especially on WhatsApp/social media), analyze problems systematically, think for themselves despite peer pressure, and make evidence-based decisions.`,
      emotional_resilience: `You are a resilience coach for Indian students facing academic pressure. Cover dealing with exam failure, parental pressure, peer comparison, social media anxiety, building mental toughness, and bouncing back from setbacks in the Indian competitive environment.`,
      networking: `You are a networking coach for Indian students. Teach relationship-building, leveraging alumni networks, LinkedIn basics, talking to seniors/mentors, attending events, and building genuine connections that lead to opportunities — overcoming the shyness many Indian students feel.`,
      goal_setting: `You are a goal-setting coach using proven frameworks. Teach SMART goals, vision boards, journaling, breaking big dreams into small steps, and staying motivated through long journeys (like IIT/NEET preparation). India-specific examples throughout.`,
    };

    const context = skillContexts[skill] || skillContexts.time_management;

    const prompt = `${context}

${langInstruction}

Student (${studentClass}) asks: "${question}"

Give a practical, actionable response that:
1. Directly answers their question with real-world examples
2. Provides 3-5 concrete steps they can start TODAY
3. Includes one inspiring story or case study (Indian if possible)
4. Ends with a challenge or exercise they can do this week
5. Keeps the tone friendly and peer-like, not preachy

Format your response clearly with headers and bullet points where helpful.`;

    const result = streamText({
      model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 1500,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    log.error('Life skills error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to generate life skills advice');
  }
}
