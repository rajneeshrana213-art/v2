'use client';

import { useState, useRef } from 'react';
import { LXCNav } from '@/components/lxc/lxc-nav';
import { getCurrentModelConfig } from '@/lib/utils/model-config';
import { MessageSquare, Mic, FileText, Award, ChevronRight, Loader2 } from 'lucide-react';

type CoachMode = 'essay' | 'speech' | 'interview' | 'debate';

const MODES: {
  key: CoachMode;
  icon: typeof FileText;
  label: string;
  labelHi: string;
  desc: string;
  needsTopic: boolean;
}[] = [
  {
    key: 'essay',
    icon: FileText,
    label: 'Essay Coach',
    labelHi: 'Essay Coach',
    desc: 'Writing feedback & improvement',
    needsTopic: false,
  },
  {
    key: 'speech',
    icon: Mic,
    label: 'Speech Coach',
    labelHi: 'Speech Coach',
    desc: 'Public speaking & confidence',
    needsTopic: true,
  },
  {
    key: 'interview',
    icon: Award,
    label: 'Interview Prep',
    labelHi: 'Interview Prep',
    desc: 'School/college/job interviews',
    needsTopic: true,
  },
  {
    key: 'debate',
    icon: MessageSquare,
    label: 'Debate Coach',
    labelHi: 'Debate Coach',
    desc: 'Argue effectively & rebuttals',
    needsTopic: true,
  },
];

const ESSAY_PROMPTS = [
  'My favorite festival is Diwali. Diwali is the festival of lights and happiness. We light lamps.',
  'India is a great country. It has many rivers and mountains. The people are very friendly.',
  'My favourite subject is mathematics. I like it because it is logical and has clear answers.',
];

export default function CommunicationCoachPage() {
  const [mode, setMode] = useState<CoachMode>('essay');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('english');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const feedbackRef = useRef<HTMLDivElement>(null);

  const currentMode = MODES.find((m) => m.key === mode)!;

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Please write your writing/speaking draft');
      return;
    }
    setError('');
    setFeedback('');
    setLoading(true);

    try {
      const config = getCurrentModelConfig();
      const res = await fetch('/api/lxc/communication-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-model': config.modelString,
          'x-api-key': config.apiKey || '',
          'x-base-url': config.baseUrl || '',
          'x-provider-type': config.providerType || '',
        },
        body: JSON.stringify({ mode, content: content.trim(), topic, language }),
      });

      if (!res.body) throw new Error('No stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        setFeedback(buffer);
        if (feedbackRef.current) feedbackRef.current.scrollTop = feedbackRef.current.scrollHeight;
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c1522] text-white">
      <LXCNav />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-1 text-sm text-blue-300 mb-4">
            <MessageSquare className="w-4 h-4" />
            Module 11 — Communication Coach
          </div>
          <h1 className="text-3xl font-bold mb-2">AI Communication Coach</h1>
          <p className="text-white/60">Essay, speech, interview, debate — master them all</p>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => {
                setMode(m.key);
                setFeedback('');
                setError('');
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                mode === m.key
                  ? 'border-[#1a6fd8] bg-[#1a6fd8]/20'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <m.icon
                className={`w-5 h-5 mb-2 ${mode === m.key ? 'text-[#1a6fd8]' : 'text-white/50'}`}
              />
              <p className="font-bold text-sm">{m.label}</p>
              <p className="text-xs text-white/40 mt-1">{m.desc}</p>
            </button>
          ))}
        </div>

        {/* Topic field if needed */}
        {currentMode.needsTopic && (
          <div className="mb-4">
            <label className="block text-sm text-white/60 mb-2">
              {mode === 'speech'
                ? 'Speech Topic'
                : mode === 'interview'
                  ? 'Interview Role / Type'
                  : 'Debate Topic'}
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                mode === 'speech'
                  ? 'e.g., Independence Day speech, Climate change'
                  : mode === 'interview'
                    ? 'e.g., School prefect interview, Engineering college interview'
                    : 'e.g., Social media is harmful for students'
              }
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
            />
          </div>
        )}

        {/* Sample prompts for essay */}
        {mode === 'essay' && (
          <div className="mb-3">
            <p className="text-xs text-white/40 mb-2">Examples (click to load):</p>
            <div className="flex flex-col gap-1">
              {ESSAY_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setContent(p)}
                  className="text-left text-xs text-white/50 hover:text-white/80 transition-all truncate"
                >
                  <ChevronRight className="w-3 h-3 inline mr-1" />
                  {p.substring(0, 60)}...
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Input */}
        <div className="mb-4">
          <label className="block text-sm text-white/60 mb-2">
            {mode === 'essay'
              ? 'Paste your essay / writing here'
              : mode === 'speech'
                ? 'Write your speech draft here'
                : mode === 'interview'
                  ? 'Write your response here'
                  : 'Write your argument here'}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder={
              mode === 'essay' ? 'Paste your essay here...' : 'Write your draft here...'
            }
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-white/30">{content.length} characters</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white/60"
            >
              <option value="english">Feedback in English</option>
              <option value="hindi">Feedback in Hindi</option>
              <option value="hinglish">Feedback in Hinglish</option>
            </select>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-[#1a6fd8] hover:opacity-90 disabled:opacity-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mb-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> AI is generating feedback...
            </>
          ) : (
            <>
              <MessageSquare className="w-5 h-5" /> Get Coaching
            </>
          )}
        </button>

        {/* Feedback Output */}
        {(feedback || loading) && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold">AI Coaching Feedback</h3>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-white/40 ml-auto" />}
            </div>
            <div
              ref={feedbackRef}
              className="prose prose-invert max-w-none text-sm text-white/80 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto"
            >
              {feedback || 'Analyzing...'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
