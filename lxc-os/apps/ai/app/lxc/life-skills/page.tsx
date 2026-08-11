'use client';

import { useState, useRef } from 'react';
import { LXCNav } from '@/components/lxc/lxc-nav';
import { getCurrentModelConfig } from '@/lib/utils/model-config';
import {
  Clock,
  DollarSign,
  Users,
  Rocket,
  Brain,
  Shield,
  Globe,
  Target,
  Loader2,
  ChevronRight,
} from 'lucide-react';

const SKILLS = [
  {
    key: 'time_management',
    icon: Clock,
    labelHi: 'Time Management',
    labelEn: 'Time Management',
    color: 'text-blue-400',
    desc: 'Pomodoro, scheduling, productivity hacks',
  },
  {
    key: 'financial_literacy',
    icon: DollarSign,
    labelHi: 'Financial Literacy',
    labelEn: 'Financial Literacy',
    color: 'text-green-400',
    desc: 'Savings, UPI, mutual funds, money habits',
  },
  {
    key: 'leadership',
    icon: Users,
    labelHi: 'Leadership',
    labelEn: 'Leadership',
    color: 'text-purple-400',
    desc: 'Lead teams, resolve conflicts, inspire others',
  },
  {
    key: 'entrepreneurship',
    icon: Rocket,
    labelHi: 'Entrepreneurship',
    labelEn: 'Entrepreneurship',
    color: 'text-orange-400',
    desc: 'Startup ideas, lean method, Startup India',
  },
  {
    key: 'critical_thinking',
    icon: Brain,
    labelHi: 'Critical Thinking',
    labelEn: 'Critical Thinking',
    color: 'text-pink-400',
    desc: 'Spot misinformation, analyze, decide wisely',
  },
  {
    key: 'emotional_resilience',
    icon: Shield,
    labelHi: 'Emotional Resilience',
    labelEn: 'Emotional Resilience',
    color: 'text-red-400',
    desc: 'Exam failure, pressure, bounce back strong',
  },
  {
    key: 'networking',
    icon: Globe,
    labelHi: 'Networking',
    labelEn: 'Networking',
    color: 'text-cyan-400',
    desc: 'Alumni, LinkedIn, mentors, opportunities',
  },
  {
    key: 'goal_setting',
    icon: Target,
    labelHi: 'Goal Setting',
    labelEn: 'Goal Setting',
    color: 'text-yellow-400',
    desc: 'SMART goals, vision boards, long journeys',
  },
];

const SAMPLE_QUESTIONS: Record<string, string[]> = {
  time_management: [
    'How do I manage both studies and sports?',
    'I waste a lot of time — what should I do?',
  ],
  financial_literacy: [
    'How can I save pocket money?',
    'Tell me about mutual funds',
    'How do UPI and bank accounts work?',
  ],
  leadership: [
    'I became a school monitor — how can I be a good leader?',
    'People do not listen to me in group projects — what should I do?',
  ],
  entrepreneurship: [
    'How do I start a startup as a student?',
    'I have an idea — how do I validate it?',
  ],
  critical_thinking: [
    'How to spot fake news on WhatsApp?',
    'How to make the right decisions under peer pressure?',
  ],
  emotional_resilience: [
    'I failed an exam — what should I do now?',
    'Parental pressure is too high — how do I handle it?',
  ],
  networking: [
    'How do I ask seniors for help without being awkward?',
    'How to create a LinkedIn profile as a student?',
  ],
  goal_setting: [
    'I want to crack IIT JEE — how should I set goals?',
    'How to break down big dreams into small steps?',
  ],
};

export default function LifeSkillsPage() {
  const [selectedSkill, setSelectedSkill] = useState('time_management');
  const [question, setQuestion] = useState('');
  const [studentClass, setStudentClass] = useState('Class 10');
  const [language, setLanguage] = useState('english');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const answerRef = useRef<HTMLDivElement>(null);

  const handleAsk = async () => {
    if (!question.trim()) {
      setError('Please write your question');
      return;
    }
    setError('');
    setAnswer('');
    setLoading(true);

    try {
      const config = getCurrentModelConfig();
      const res = await fetch('/api/lxc/life-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-model': config.modelString,
          'x-api-key': config.apiKey || '',
          'x-base-url': config.baseUrl || '',
          'x-provider-type': config.providerType || '',
        },
        body: JSON.stringify({
          skill: selectedSkill,
          question: question.trim(),
          studentClass,
          language,
        }),
      });

      if (!res.body) throw new Error('No stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        setAnswer(buffer);
        if (answerRef.current) answerRef.current.scrollTop = answerRef.current.scrollHeight;
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const skill = SKILLS.find((s) => s.key === selectedSkill)!;
  const samples = SAMPLE_QUESTIONS[selectedSkill] || [];

  return (
    <div className="min-h-screen bg-[#0c1522] text-white">
      <LXCNav />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1 text-sm text-orange-300 mb-4">
            <Target className="w-4 h-4" />
            Module 12 — Life Skills AI
          </div>
          <h1 className="text-3xl font-bold mb-2">Life Skills AI</h1>
          <p className="text-white/60">Learn what schools don't teach you</p>
        </div>

        {/* Skill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {SKILLS.map((s) => (
            <button
              key={s.key}
              onClick={() => {
                setSelectedSkill(s.key);
                setAnswer('');
                setQuestion('');
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedSkill === s.key
                  ? 'border-white/30 bg-white/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <s.icon
                className={`w-6 h-6 mb-2 ${selectedSkill === s.key ? s.color : 'text-white/30'}`}
              />
              <p
                className={`font-bold text-sm ${selectedSkill === s.key ? 'text-white' : 'text-white/60'}`}
              >
                {s.labelEn}
              </p>
              <p className="text-xs text-white/30 mt-1 hidden sm:block">{s.desc}</p>
            </button>
          ))}
        </div>

        {/* Selected Skill + Q&A */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-xl bg-white/10`}>
              <skill.icon className={`w-6 h-6 ${skill.color}`} />
            </div>
            <div>
              <h2 className="font-bold">{skill.labelEn}</h2>
              <p className="text-sm text-white/50">
                {skill.labelEn} — {skill.desc}
              </p>
            </div>
          </div>

          {/* Sample Questions */}
          <div className="mb-4">
            <p className="text-xs text-white/40 mb-2">Suggested Questions:</p>
            <div className="flex flex-col gap-1">
              {samples.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setQuestion(q)}
                  className="text-left text-sm text-white/60 hover:text-white transition-all flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3 shrink-0" />
                  {q}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Write your question..."
            rows={4}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-400 resize-none mb-3"
          />

          <div className="flex gap-3 mb-3">
            <select
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white/70"
            >
              {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ),
              )}
            </select>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white/70"
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          <button
            onClick={handleAsk}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 disabled:opacity-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> AI is teaching...
              </>
            ) : (
              <>
                <skill.icon className="w-5 h-5" /> Get Answer
              </>
            )}
          </button>
        </div>

        {/* Answer */}
        {(answer || loading) && (
          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <skill.icon className={`w-5 h-5 ${skill.color}`} />
              <h3 className="font-bold">{skill.labelEn} — AI Advice</h3>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-white/40 ml-auto" />}
            </div>
            <div
              ref={answerRef}
              className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto"
            >
              {answer || 'Thinking...'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
