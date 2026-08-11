'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Trophy,
  TrendingDown,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getCurrentModelConfig } from '@/lib/utils/model-config';
import { nanoid } from 'nanoid';
import type {
  ExamEvaluateRequest,
  ExamEvaluateResponse,
  MCQQuestion,
  SubjectiveQuestion,
  MCQAnswer,
  SubjectiveAnswer,
} from '@/app/api/exam-evaluate/route';

type Tab = 'mcq' | 'subjective';
type Language = 'hi' | 'en';

export function ExamEvaluator() {
  const [activeTab, setActiveTab] = useState<Tab>('mcq');
  const [examTitle, setExamTitle] = useState('');
  const [language, setLanguage] = useState<Language>('hi');

  // MCQ state
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([]);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});

  // Subjective state
  const [subjectiveQuestions, setSubjectiveQuestions] = useState<SubjectiveQuestion[]>([]);
  const [subjectiveAnswers, setSubjectiveAnswers] = useState<Record<string, string>>({});

  const [result, setResult] = useState<ExamEvaluateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── MCQ helpers ──────────────────────────────────────────────────────────
  function addMCQ() {
    setMcqQuestions((prev) => [
      ...prev,
      {
        id: nanoid(8),
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 'A',
        topic: '',
        points: 1,
      },
    ]);
  }

  function removeMCQ(id: string) {
    setMcqQuestions((prev) => prev.filter((q) => q.id !== id));
    setMcqAnswers((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
  }

  function updateMCQ(id: string, patch: Partial<MCQQuestion>) {
    setMcqQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  // ── Subjective helpers ────────────────────────────────────────────────────
  function addSubjective() {
    setSubjectiveQuestions((prev) => [
      ...prev,
      { id: nanoid(8), question: '', maxPoints: 5, rubric: '', modelAnswer: '', topic: '' },
    ]);
  }

  function removeSubjective(id: string) {
    setSubjectiveQuestions((prev) => prev.filter((q) => q.id !== id));
    setSubjectiveAnswers((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
  }

  function updateSubjective(id: string, patch: Partial<SubjectiveQuestion>) {
    setSubjectiveQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleEvaluate() {
    if (mcqQuestions.length === 0 && subjectiveQuestions.length === 0) {
      setError(language === 'hi' ? 'कम से कम एक प्रश्न जोड़ें।' : 'Add at least one question.');
      return;
    }
    setError('');
    setResult(null);
    setLoading(true);

    const mcqAnswersList: MCQAnswer[] = mcqQuestions.map((q) => ({
      questionId: q.id,
      selectedAnswer: mcqAnswers[q.id] ?? '',
    }));

    const subjectiveAnswersList: SubjectiveAnswer[] = subjectiveQuestions.map((q) => ({
      questionId: q.id,
      answer: subjectiveAnswers[q.id] ?? '',
    }));

    const body: ExamEvaluateRequest = {
      examTitle,
      mcqQuestions,
      mcqAnswers: mcqAnswersList,
      subjectiveQuestions,
      subjectiveAnswers: subjectiveAnswersList,
      language,
    };

    const modelConfig = getCurrentModelConfig();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-model': modelConfig.modelString,
      'x-api-key': modelConfig.apiKey,
    };
    if (modelConfig.baseUrl) headers['x-base-url'] = modelConfig.baseUrl;
    if (modelConfig.providerType) headers['x-provider-type'] = modelConfig.providerType;

    try {
      const res = await fetch('/api/exam-evaluate', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (data.success) setResult(data.data as ExamEvaluateResponse);
      else throw new Error(data.error?.message ?? 'Unknown error');
    } catch (e) {
      setError(
        language === 'hi'
          ? 'मूल्यांकन विफल। अपनी AI model settings जांचें।'
          : 'Evaluation failed. Check your AI model settings.',
      );
    } finally {
      setLoading(false);
    }
  }

  const LETTER = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Header controls */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            placeholder={language === 'hi' ? 'परीक्षा का नाम (वैकल्पिक)' : 'Exam title (optional)'}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex gap-1 p-1 rounded-lg bg-muted">
            {(['hi', 'en'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-all',
                  language === lang
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {lang === 'hi' ? 'हिंदी' : 'English'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab selector */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted">
          {(['mcq', 'subjective'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all',
                activeTab === t
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t === 'mcq'
                ? language === 'hi'
                  ? 'MCQ (बहुविकल्पीय)'
                  : 'MCQ'
                : language === 'hi'
                  ? 'विस्तृत उत्तर'
                  : 'Subjective'}
            </button>
          ))}
        </div>
      </div>

      {/* MCQ Tab */}
      {activeTab === 'mcq' && (
        <div className="flex flex-col gap-3">
          {mcqQuestions.map((q, qi) => (
            <div key={q.id} className="rounded-xl border border-border bg-background p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                  {qi + 1}
                </span>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateMCQ(q.id, { question: e.target.value })}
                  placeholder={language === 'hi' ? 'प्रश्न लिखें' : 'Enter question'}
                  className="flex-1 px-2 py-1 text-sm rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={() => removeMCQ(q.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Options */}
              <div className="space-y-1.5 pl-8">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <button
                      onClick={() => updateMCQ(q.id, { correctAnswer: LETTER[oi] })}
                      className={cn(
                        'w-5 h-5 rounded-full border-2 shrink-0 transition-colors',
                        q.correctAnswer === LETTER[oi]
                          ? 'border-green-500 bg-green-500'
                          : 'border-muted-foreground hover:border-green-400',
                      )}
                    />
                    <span className="text-xs font-semibold text-muted-foreground w-4">
                      {LETTER[oi]}.
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...q.options];
                        newOpts[oi] = e.target.value;
                        updateMCQ(q.id, { options: newOpts });
                      }}
                      placeholder={`${language === 'hi' ? 'विकल्प' : 'Option'} ${LETTER[oi]}`}
                      className="flex-1 px-2 py-1 text-xs rounded-md border border-border bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                    {/* Student answer */}
                    <button
                      onClick={() => setMcqAnswers((prev) => ({ ...prev, [q.id]: LETTER[oi] }))}
                      className={cn(
                        'px-2 py-0.5 text-[10px] rounded-md border transition-colors',
                        mcqAnswers[q.id] === LETTER[oi]
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50',
                      )}
                    >
                      {language === 'hi' ? 'मेरा उत्तर' : 'My ans'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pl-8">
                <input
                  type="text"
                  value={q.topic ?? ''}
                  onChange={(e) => updateMCQ(q.id, { topic: e.target.value })}
                  placeholder={language === 'hi' ? 'विषय (वैकल्पिक)' : 'Topic (optional)'}
                  className="flex-1 px-2 py-1 text-xs rounded-md border border-border bg-muted/50 focus:outline-none"
                />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {language === 'hi' ? 'अंक:' : 'Pts:'}
                  </span>
                  <input
                    type="number"
                    value={q.points ?? 1}
                    onChange={(e) => updateMCQ(q.id, { points: Number(e.target.value) })}
                    min={1}
                    className="w-12 px-1 py-1 text-xs rounded-md border border-border bg-muted/50 text-center focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addMCQ} className="w-full rounded-xl">
            <Plus className="w-4 h-4 mr-1" />
            {language === 'hi' ? 'MCQ प्रश्न जोड़ें' : 'Add MCQ Question'}
          </Button>
        </div>
      )}

      {/* Subjective Tab */}
      {activeTab === 'subjective' && (
        <div className="flex flex-col gap-3">
          {subjectiveQuestions.map((q, qi) => (
            <div key={q.id} className="rounded-xl border border-border bg-background p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                  {qi + 1}
                </span>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateSubjective(q.id, { question: e.target.value })}
                  placeholder={language === 'hi' ? 'प्रश्न लिखें' : 'Enter question'}
                  className="flex-1 px-2 py-1 text-sm rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={() => removeSubjective(q.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={subjectiveAnswers[q.id] ?? ''}
                onChange={(e) =>
                  setSubjectiveAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
                placeholder={
                  language === 'hi'
                    ? 'छात्र का उत्तर यहाँ लिखें...'
                    : 'Enter student answer here...'
                }
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={q.rubric ?? ''}
                  onChange={(e) => updateSubjective(q.id, { rubric: e.target.value })}
                  placeholder={
                    language === 'hi' ? 'रूब्रिक / मूल्यांकन मानदंड' : 'Rubric / Grading criteria'
                  }
                  className="px-2 py-1 text-xs rounded-md border border-border bg-muted/50 focus:outline-none"
                />
                <input
                  type="text"
                  value={q.topic ?? ''}
                  onChange={(e) => updateSubjective(q.id, { topic: e.target.value })}
                  placeholder={language === 'hi' ? 'विषय' : 'Topic'}
                  className="px-2 py-1 text-xs rounded-md border border-border bg-muted/50 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {language === 'hi' ? 'अधिकतम अंक:' : 'Max Points:'}
                </span>
                <input
                  type="number"
                  value={q.maxPoints}
                  onChange={(e) => updateSubjective(q.id, { maxPoints: Number(e.target.value) })}
                  min={1}
                  className="w-16 px-2 py-1 text-xs rounded-md border border-border bg-muted/50 text-center focus:outline-none"
                />
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addSubjective} className="w-full rounded-xl">
            <Plus className="w-4 h-4 mr-1" />
            {language === 'hi' ? 'विस्तृत प्रश्न जोड़ें' : 'Add Subjective Question'}
          </Button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Evaluate button */}
      <Button onClick={handleEvaluate} disabled={loading} className="w-full rounded-xl">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {language === 'hi' ? 'मूल्यांकन हो रहा है...' : 'Evaluating...'}
          </>
        ) : language === 'hi' ? (
          '📊 परीक्षा का मूल्यांकन करें'
        ) : (
          '📊 Evaluate Exam'
        )}
      </Button>

      {/* Results */}
      {result && <ExamResults result={result} language={language} />}
    </div>
  );
}

function ExamResults({ result, language }: { result: ExamEvaluateResponse; language: Language }) {
  const isHindi = language === 'hi';
  const pctColor =
    result.percentage >= 75
      ? 'text-green-500'
      : result.percentage >= 50
        ? 'text-amber-500'
        : 'text-red-500';

  return (
    <div className="rounded-2xl border border-border bg-background overflow-hidden">
      {/* Score banner */}
      <div
        className={cn(
          'p-5 text-center',
          result.percentage >= 75
            ? 'bg-green-50 dark:bg-green-950/20'
            : result.percentage >= 50
              ? 'bg-amber-50 dark:bg-amber-950/20'
              : 'bg-red-50 dark:bg-red-950/20',
        )}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Trophy className={cn('w-5 h-5', pctColor)} />
          <span className={cn('text-3xl font-bold', pctColor)}>{result.percentage}%</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {result.totalScore} / {result.maxScore} {isHindi ? 'अंक' : 'points'}
        </p>
        {result.overallFeedback && (
          <p className="text-sm mt-3 text-foreground leading-relaxed">{result.overallFeedback}</p>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Weak & Strong Topics */}
        {(result.weakTopics.length > 0 || result.strongTopics.length > 0) && (
          <div className="grid grid-cols-2 gap-3">
            {result.weakTopics.length > 0 && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {isHindi ? 'कमज़ोर विषय' : 'Weak Topics'}
                  </span>
                </div>
                {result.weakTopics.map((t) => (
                  <span key={t} className="block text-xs text-red-700 dark:text-red-300">
                    • {t}
                  </span>
                ))}
              </div>
            )}
            {result.strongTopics.length > 0 && (
              <div className="rounded-xl bg-green-50 dark:bg-green-950/20 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                    {isHindi ? 'मज़बूत विषय' : 'Strong Topics'}
                  </span>
                </div>
                {result.strongTopics.map((t) => (
                  <span key={t} className="block text-xs text-green-700 dark:text-green-300">
                    • {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MCQ results */}
        {result.mcqResults.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
              {isHindi ? 'MCQ परिणाम' : 'MCQ Results'}
            </h4>
            <div className="space-y-1.5">
              {result.mcqResults.map((r, i) => (
                <div key={r.questionId} className="flex items-center gap-2 text-sm">
                  {r.correct ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  <span className="text-xs text-muted-foreground">Q{i + 1}</span>
                  {!r.correct && (
                    <span className="text-xs text-muted-foreground">
                      {isHindi ? 'सही:' : 'Correct:'} <strong>{r.correctAnswer}</strong>
                      {r.selectedAnswer
                        ? ` | ${isHindi ? 'आपका:' : 'Yours:'} ${r.selectedAnswer}`
                        : ''}
                    </span>
                  )}
                  <span className="ml-auto text-xs font-medium">
                    {r.points}/{r.maxPoints}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subjective results */}
        {result.subjectiveResults.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
              {isHindi ? 'विस्तृत उत्तर' : 'Subjective Results'}
            </h4>
            <div className="space-y-3">
              {result.subjectiveResults.map((r, i) => (
                <div key={r.questionId} className="rounded-xl border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Q{i + 1}</span>
                    <span className="text-xs font-bold text-primary">
                      {r.score}/{r.maxPoints} {isHindi ? 'अंक' : 'pts'}
                    </span>
                  </div>
                  {r.grammarFeedback && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {isHindi ? 'भाषा: ' : 'Language: '}
                      </span>
                      {r.grammarFeedback}
                    </p>
                  )}
                  {r.conceptFeedback && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {isHindi ? 'अवधारणा: ' : 'Concept: '}
                      </span>
                      {r.conceptFeedback}
                    </p>
                  )}
                  {r.improvementSuggestions.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-foreground">
                        {isHindi ? 'सुझाव:' : 'Suggestions:'}
                      </span>
                      {r.improvementSuggestions.map((s, si) => (
                        <p key={si} className="text-xs text-muted-foreground ml-2">
                          • {s}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Study recommendations */}
        {result.studyRecommendations.length > 0 && (
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
            <h4 className="text-xs font-semibold text-primary mb-2">
              {isHindi ? '📚 अध्ययन सुझाव' : '📚 Study Recommendations'}
            </h4>
            {result.studyRecommendations.map((rec, i) => (
              <p key={i} className="text-xs text-foreground mb-1">
                • {rec}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
