/**
 * AI Exam Evaluation API
 *
 * Comprehensive exam evaluation supporting:
 * - MCQ auto grading
 * - Subjective answer evaluation with rubric-based scoring
 * - Grammar + concept correction
 * - Improvement suggestions
 * - Weak topic detection
 */

import { NextRequest } from 'next/server';
import { callLLM } from '@/lib/ai/llm';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';

const log = createLogger('ExamEvaluate');

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  topic?: string;
  points?: number;
}

export interface SubjectiveQuestion {
  id: string;
  question: string;
  topic?: string;
  maxPoints: number;
  rubric?: string;
  modelAnswer?: string;
}

export interface MCQAnswer {
  questionId: string;
  selectedAnswer: string;
}

export interface SubjectiveAnswer {
  questionId: string;
  answer: string;
}

export interface ExamEvaluateRequest {
  examTitle?: string;
  mcqQuestions?: MCQQuestion[];
  mcqAnswers?: MCQAnswer[];
  subjectiveQuestions?: SubjectiveQuestion[];
  subjectiveAnswers?: SubjectiveAnswer[];
  language?: 'hi' | 'hi-IN' | 'en';
}

export interface MCQResult {
  questionId: string;
  correct: boolean;
  points: number;
  maxPoints: number;
  correctAnswer: string;
  selectedAnswer: string;
  topic?: string;
}

export interface SubjectiveResult {
  questionId: string;
  score: number;
  maxPoints: number;
  grammarFeedback: string;
  conceptFeedback: string;
  improvementSuggestions: string[];
  topic?: string;
}

export interface ExamEvaluateResponse {
  mcqResults: MCQResult[];
  subjectiveResults: SubjectiveResult[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  weakTopics: string[];
  strongTopics: string[];
  overallFeedback: string;
  studyRecommendations: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExamEvaluateRequest;
    const {
      examTitle,
      mcqQuestions = [],
      mcqAnswers = [],
      subjectiveQuestions = [],
      subjectiveAnswers = [],
      language = 'en',
    } = body;

    if (mcqQuestions.length === 0 && subjectiveQuestions.length === 0) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'At least one question is required');
    }

    const { model: languageModel } = resolveModelFromHeaders(req);
    const isHindi = language === 'hi' || language === 'hi-IN';

    // ── Step 1: Grade MCQs locally (no LLM needed) ──────────────────────
    const mcqResults: MCQResult[] = mcqQuestions.map((q) => {
      const userAnswer = mcqAnswers.find((a) => a.questionId === q.id)?.selectedAnswer ?? '';
      const correct = userAnswer.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase();
      return {
        questionId: q.id,
        correct,
        points: correct ? (q.points ?? 1) : 0,
        maxPoints: q.points ?? 1,
        correctAnswer: q.correctAnswer,
        selectedAnswer: userAnswer,
        topic: q.topic,
      };
    });

    // ── Step 2: Evaluate subjective answers via LLM ──────────────────────
    const subjectiveResults: SubjectiveResult[] = [];

    for (const q of subjectiveQuestions) {
      const userAnswer = subjectiveAnswers.find((a) => a.questionId === q.id)?.answer ?? '';

      const systemPrompt = isHindi
        ? `आप एक विशेषज्ञ शिक्षक और परीक्षा मूल्यांकनकर्ता हैं।
छात्र के उत्तर का मूल्यांकन करें और नीचे दिए गए JSON प्रारूप में उत्तर दें।
केवल JSON लौटाएं, कोई अन्य टेक्स्ट नहीं:
{
  "score": <0 से ${q.maxPoints} तक संख्या>,
  "grammarFeedback": "<व्याकरण और भाषा पर टिप्पणी>",
  "conceptFeedback": "<विषय की समझ पर टिप्पणी>",
  "improvementSuggestions": ["<सुझाव 1>", "<सुझाव 2>"]
}`
        : `You are an expert teacher and exam evaluator.
Evaluate the student's answer and respond in the JSON format below.
Return JSON only, no other text:
{
  "score": <number from 0 to ${q.maxPoints}>,
  "grammarFeedback": "<comment on grammar and language>",
  "conceptFeedback": "<comment on conceptual understanding>",
  "improvementSuggestions": ["<suggestion 1>", "<suggestion 2>"]
}`;

      const userPrompt = isHindi
        ? `प्रश्न: ${q.question}
${q.rubric ? `रूब्रिक: ${q.rubric}\n` : ''}${q.modelAnswer ? `आदर्श उत्तर: ${q.modelAnswer}\n` : ''}अधिकतम अंक: ${q.maxPoints}
छात्र का उत्तर: ${userAnswer || '(कोई उत्तर नहीं दिया)'}`
        : `Question: ${q.question}
${q.rubric ? `Rubric: ${q.rubric}\n` : ''}${q.modelAnswer ? `Model Answer: ${q.modelAnswer}\n` : ''}Max Points: ${q.maxPoints}
Student Answer: ${userAnswer || '(No answer provided)'}`;

      try {
        const result = await callLLM(
          { model: languageModel, system: systemPrompt, prompt: userPrompt },
          'exam-evaluate-subjective',
        );
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON');
        const parsed = JSON.parse(jsonMatch[0]);
        subjectiveResults.push({
          questionId: q.id,
          score: Math.max(0, Math.min(q.maxPoints, Number(parsed.score ?? 0))),
          maxPoints: q.maxPoints,
          grammarFeedback: String(parsed.grammarFeedback ?? ''),
          conceptFeedback: String(parsed.conceptFeedback ?? ''),
          improvementSuggestions: Array.isArray(parsed.improvementSuggestions)
            ? parsed.improvementSuggestions.map(String)
            : [],
          topic: q.topic,
        });
      } catch {
        subjectiveResults.push({
          questionId: q.id,
          score: 0,
          maxPoints: q.maxPoints,
          grammarFeedback: isHindi ? 'मूल्यांकन उपलब्ध नहीं' : 'Evaluation unavailable',
          conceptFeedback: isHindi ? 'मूल्यांकन उपलब्ध नहीं' : 'Evaluation unavailable',
          improvementSuggestions: [],
          topic: q.topic,
        });
      }
    }

    // ── Step 3: Compute totals and detect weak/strong topics ─────────────
    const mcqTotal = mcqResults.reduce((s, r) => s + r.points, 0);
    const mcqMax = mcqResults.reduce((s, r) => s + r.maxPoints, 0);
    const subTotal = subjectiveResults.reduce((s, r) => s + r.score, 0);
    const subMax = subjectiveResults.reduce((s, r) => s + r.maxPoints, 0);
    const totalScore = mcqTotal + subTotal;
    const maxScore = mcqMax + subMax;
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Group by topic
    const topicMap: Record<string, { correct: number; total: number }> = {};
    for (const r of mcqResults) {
      if (r.topic) {
        if (!topicMap[r.topic]) topicMap[r.topic] = { correct: 0, total: 0 };
        topicMap[r.topic].total += r.maxPoints;
        topicMap[r.topic].correct += r.points;
      }
    }
    for (const r of subjectiveResults) {
      if (r.topic) {
        if (!topicMap[r.topic]) topicMap[r.topic] = { correct: 0, total: 0 };
        topicMap[r.topic].total += r.maxPoints;
        topicMap[r.topic].correct += r.score;
      }
    }

    const weakTopics: string[] = [];
    const strongTopics: string[] = [];
    for (const [topic, { correct, total }] of Object.entries(topicMap)) {
      const pct = total > 0 ? (correct / total) * 100 : 0;
      if (pct < 50) weakTopics.push(topic);
      else if (pct >= 80) strongTopics.push(topic);
    }

    // ── Step 4: Generate overall feedback via LLM ─────────────────────────
    const feedbackSystemPrompt = isHindi
      ? `आप एक शिक्षक हैं। परीक्षा के परिणामों के आधार पर समग्र प्रतिक्रिया और अध्ययन सुझाव दें।
केवल JSON लौटाएं:
{
  "overallFeedback": "<2-3 वाक्यों में समग्र प्रतिक्रिया>",
  "studyRecommendations": ["<सुझाव 1>", "<सुझाव 2>", "<सुझाव 3>"]
}`
      : `You are a teacher. Based on exam results, provide overall feedback and study recommendations.
Return JSON only:
{
  "overallFeedback": "<2-3 sentences of overall feedback>",
  "studyRecommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"]
}`;

    const feedbackUserPrompt = isHindi
      ? `परीक्षा: ${examTitle ?? 'सामान्य परीक्षा'}
कुल अंक: ${totalScore}/${maxScore} (${percentage}%)
MCQ सही: ${mcqResults.filter((r) => r.correct).length}/${mcqResults.length}
कमज़ोर विषय: ${weakTopics.join(', ') || 'कोई नहीं'}
मज़बूत विषय: ${strongTopics.join(', ') || 'कोई नहीं'}`
      : `Exam: ${examTitle ?? 'General Exam'}
Total Score: ${totalScore}/${maxScore} (${percentage}%)
MCQ Correct: ${mcqResults.filter((r) => r.correct).length}/${mcqResults.length}
Weak Topics: ${weakTopics.join(', ') || 'None'}
Strong Topics: ${strongTopics.join(', ') || 'None'}`;

    let overallFeedback = '';
    let studyRecommendations: string[] = [];

    try {
      const feedbackResult = await callLLM(
        {
          model: languageModel,
          system: feedbackSystemPrompt,
          prompt: feedbackUserPrompt,
        },
        'exam-overall-feedback',
      );
      const jsonMatch = feedbackResult.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        overallFeedback = String(parsed.overallFeedback ?? '');
        studyRecommendations = Array.isArray(parsed.studyRecommendations)
          ? parsed.studyRecommendations.map(String)
          : [];
      }
    } catch {
      overallFeedback = isHindi
        ? `आपने ${percentage}% अंक प्राप्त किए।`
        : `You scored ${percentage}%.`;
    }

    const response: ExamEvaluateResponse = {
      mcqResults,
      subjectiveResults,
      totalScore,
      maxScore,
      percentage,
      weakTopics,
      strongTopics,
      overallFeedback,
      studyRecommendations,
    };

    return apiSuccess(response as unknown as Record<string, unknown>);
  } catch (error) {
    log.error('Error:', error);
    return apiError('INTERNAL_ERROR', 500, 'Failed to evaluate exam');
  }
}
