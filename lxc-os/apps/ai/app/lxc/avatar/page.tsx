'use client';

import { useState, useRef } from 'react';
import { LXCNav } from '@/components/lxc/lxc-nav';
import { getCurrentModelConfig } from '@/lib/utils/model-config';
import { Bot, BookOpen, Mic, MicOff, Volume2, Loader2, Sparkles, ChevronRight } from 'lucide-react';

const AVATARS = [
  {
    id: 'rit',
    name: 'Rit Sir',
    nameHi: 'Rit Sir',
    emoji: '🧑‍🏫',
    style: 'Strict but caring mentor',
    subject: 'All Subjects',
    lang: 'Hindi',
  },
  {
    id: 'priya',
    name: "Priya Ma'am",
    nameHi: "Priya Ma'am",
    emoji: '👩‍🏫',
    style: 'Friendly and encouraging',
    subject: 'Science & Maths',
    lang: 'Hinglish',
  },
  {
    id: 'aryan',
    name: 'Aryan Bhai',
    nameHi: 'Aryan Bhai',
    emoji: '🧑‍💻',
    style: 'Peer-like, casual',
    subject: 'Computer Science',
    lang: 'Hinglish',
  },
  {
    id: 'dadi',
    name: 'Nani Ji',
    nameHi: 'Nani Ji',
    emoji: '👵',
    style: 'Stories & wisdom',
    subject: 'History & Life Skills',
    lang: 'Hindi',
  },
];

const QUICK_LESSONS = [
  'What is Photosynthesis? Explain simply',
  'Explain Newton\'s 3 laws with examples',
  'Explain the French Revolution in 5 minutes',
  'How to solve a quadratic equation?',
  'India\'s independence movement timeline',
  'Cell division (Mitosis vs Meiosis) difference',
];

export default function AvatarPage() {
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [question, setQuestion] = useState('');
  const [lesson, setLesson] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const lessonRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const handleAsk = async (q?: string) => {
    const askQ = q || question.trim();
    if (!askQ) {
      setError('Write or speak a question');
      return;
    }
    setError('');
    setLesson('');
    setLoading(true);
    if (q) setQuestion(q);

    const systemPrompt = `You are ${selectedAvatar.name} (${selectedAvatar.nameHi}), an AI teacher avatar for Indian students.
Personality: ${selectedAvatar.style}
Teaching style: Make concepts crystal clear using Indian examples, analogies, and relatable scenarios.
Language: Respond in ${selectedAvatar.lang === 'Hindi' ? 'Hindi' : selectedAvatar.lang === 'Hinglish' ? 'Hinglish (Hindi + English mix)' : 'English'}.
Format: Use simple language. Add emojis. Break into small paragraphs. Give 1 real-world example. End with a quick recall question for the student.`;

    try {
      const config = getCurrentModelConfig();

      const { streamText } = await import('ai');
      const modelConfig = config;

      const res = await fetch('/api/lxc/communication-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-model': modelConfig.modelString,
          'x-api-key': modelConfig.apiKey || '',
          'x-base-url': modelConfig.baseUrl || '',
          'x-provider-type': modelConfig.providerType || '',
        },
        body: JSON.stringify({
          mode: 'essay',
          content: `[AVATAR MODE] ${systemPrompt}\n\nStudent question: ${askQ}`,
          topic: askQ,
          language: selectedAvatar.lang === 'Hindi' ? 'hindi' : 'hinglish',
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
        setLesson(buffer);
        if (lessonRef.current) lessonRef.current.scrollTop = lessonRef.current.scrollHeight;
      }
    } catch {
      setError('Network error — try again');
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: { results: { transcript: string; isFinal: boolean }[][] }) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('');
      setQuestion(transcript);
    };
    recognition.onend = () => {
      setListening(false);
      handleAsk(question || undefined);
    };
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const speakLesson = () => {
    if (!lesson) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lesson.substring(0, 500));
    utterance.lang = selectedAvatar.lang === 'Hindi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-[#0c1522] text-white">
      <LXCNav />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-1 text-sm text-purple-300 mb-4">
            <Bot className="w-4 h-4" />
            Module 20 — AI Avatar Teacher System
          </div>
          <h1 className="text-3xl font-bold mb-2">AI Teacher Avatars</h1>
          <p className="text-white/60">Choose your teacher — get personalized lessons</p>
        </div>

        {/* Avatar Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {AVATARS.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                setSelectedAvatar(a);
                setLesson('');
                setQuestion('');
              }}
              className={`p-4 rounded-2xl border text-center transition-all ${selectedAvatar.id === a.id ? 'border-purple-500 bg-purple-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
            >
              <div className="text-4xl mb-2">{a.emoji}</div>
              <p className="font-bold text-sm">{a.name}</p>
              <p className="text-xs text-white/40 mt-1">{a.subject}</p>
              <p className="text-xs text-white/30">{a.lang}</p>
            </button>
          ))}
        </div>

        {/* Selected Avatar Banner */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/10 border border-purple-500/30 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <div className="text-5xl">{selectedAvatar.emoji}</div>
          <div>
            <h3 className="font-bold text-lg">{selectedAvatar.name}</h3>
            <p className="text-sm text-white/60">{selectedAvatar.style}</p>
            <p className="text-xs text-purple-300 mt-1">
              📚 {selectedAvatar.subject} • 🗣️ {selectedAvatar.lang}
            </p>
          </div>
        </div>

        {/* Quick Lessons */}
        <div className="mb-5">
          <p className="text-sm text-white/40 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Quick Lessons:
          </p>
          <div className="flex flex-col gap-1">
            {QUICK_LESSONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleAsk(q)}
                disabled={loading}
                className="text-left text-sm text-white/60 hover:text-white transition-all flex items-center gap-1 py-1"
              >
                <ChevronRight className="w-3 h-3 shrink-0 text-purple-400" />
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Question Input */}
        <div className="flex gap-3 mb-4">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleAsk()}
            placeholder={`Ask ${selectedAvatar.name} anything...`}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
          />
          <button
            onClick={toggleVoice}
            className={`p-3 rounded-xl border transition-all ${listening ? 'bg-red-500/30 border-red-500/50 animate-pulse' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}
          >
            {listening ? <MicOff className="w-5 h-5 text-red-400" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <button
          onClick={() => handleAsk()}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 disabled:opacity-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mb-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> {selectedAvatar.name} is teaching...
            </>
          ) : (
            <>
              <BookOpen className="w-5 h-5" /> Ask
            </>
          )}
        </button>

        {/* Lesson Output */}
        {(lesson || loading) && (
          <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{selectedAvatar.emoji}</span>
              <div>
                <h4 className="font-bold">{selectedAvatar.name} is speaking...</h4>
                <p className="text-xs text-white/40">{selectedAvatar.style}</p>
              </div>
              {lesson && !loading && (
                <button
                  onClick={speakLesson}
                  className="ml-auto p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
              {loading && <Loader2 className="w-4 h-4 animate-spin text-white/40 ml-auto" />}
            </div>
            <div
              ref={lessonRef}
              className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto"
            >
              {lesson || 'Thinking...'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
