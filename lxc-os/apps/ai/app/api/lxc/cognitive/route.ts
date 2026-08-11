/**
 * Module 7 — Cognitive Optimization Engine
 * Analyzes study sessions → break recommendations, forgetting curve alerts, productivity scoring
 */

import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { createLogger } from '@/lib/logger';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';
import { apiError, apiSuccess } from '@/lib/server/api-response';

const log = createLogger('CognitiveOptimization');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studySessions, currentFocusMinutes = 0, language = 'hindi' } = body;

    const { model } = resolveModelFromHeaders(req);

    const langInstruction =
      language === 'hindi'
        ? 'Respond entirely in Hindi.'
        : language === 'hinglish'
          ? 'Respond in Hinglish.'
          : 'Respond in English.';

    // Calculate forgetting curve alerts (Ebbinghaus)
    const now = Date.now();
    const forgettingAlerts: Array<{
      subject: string;
      topic: string;
      daysAgo: number;
      urgency: string;
    }> = [];

    if (Array.isArray(studySessions)) {
      const seen = new Set<string>();
      for (const session of studySessions) {
        const key = `${session.subject}|${session.topic}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const daysAgo = Math.floor((now - session.timestamp) / 86400000);
        const criticalIntervals = [1, 3, 7, 14, 30];
        for (const interval of criticalIntervals) {
          if (Math.abs(daysAgo - interval) <= 1) {
            forgettingAlerts.push({
              subject: session.subject,
              topic: session.topic,
              daysAgo,
              urgency: interval <= 3 ? 'high' : interval <= 7 ? 'medium' : 'low',
            });
            break;
          }
        }
      }
    }

    // Break recommendation based on current focus time
    let breakRecommendation = null;
    if (currentFocusMinutes >= 90) {
      breakRecommendation = {
        type: 'long',
        minutes: 15,
        reason: "You've been focusing for 90+ minutes",
      };
    } else if (currentFocusMinutes >= 45) {
      breakRecommendation = {
        type: 'short',
        minutes: 5,
        reason: 'Good focus block — take a quick break',
      };
    }

    const recentTopics = Array.isArray(studySessions)
      ? studySessions
          .slice(0, 10)
          .map(
            (s: { subject: string; topic: string; durationMinutes: number }) =>
              `${s.subject}: ${s.topic} (${s.durationMinutes} min)`,
          )
          .join('\n')
      : 'No sessions recorded yet';

    const prompt = `You are a cognitive science expert helping an Indian student optimize their study sessions.

Recent study sessions:
${recentTopics}

Current focus session duration: ${currentFocusMinutes} minutes
Forgetting curve alerts: ${forgettingAlerts.length} topics need review

${langInstruction}

Generate a cognitive optimization report as JSON:
{
  "productivityScore": 75,
  "productivityLabel": "Good / अच्छा",
  "focusAnalysis": "2 sentence analysis of their study pattern",
  "breakAdvice": "${currentFocusMinutes >= 45 ? 'Recommend a break' : 'Study time looks fine'}",
  "forgettingCurveMessage": "Explain Ebbinghaus forgetting curve briefly and which topics need review",
  "revisionAlerts": [
    {
      "subject": "Subject name",
      "topic": "Topic name",
      "message": "Why they should review this now",
      "urgency": "high/medium/low"
    }
  ],
  "studyTips": ["Tip 1", "Tip 2", "Tip 3"],
  "pomodoroRecommendation": "Suggested Pomodoro schedule for today",
  "brainFoodTip": "A simple diet/lifestyle tip for better focus",
  "motivationalMessage": "Short encouraging message"
}

Include all ${forgettingAlerts.length} forgetting alerts in revisionAlerts.
All text must follow the language instruction.
Return ONLY valid JSON.`;

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.6,
      maxOutputTokens: 1500,
    });

    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return apiError('PARSE_FAILED', 500, 'Failed to parse cognitive response');
    }

    return apiSuccess({
      ...parsed,
      breakRecommendation,
      forgettingAlerts,
    } as unknown as Record<string, unknown>);
  } catch (err) {
    log.error('Cognitive optimization error', err);
    return apiError('INTERNAL_ERROR', 500, 'Failed to generate cognitive report');
  }
}
