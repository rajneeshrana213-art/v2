'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Zap,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Globe,
  Wifi,
  WifiOff,
  BookOpen,
  MessageCircle,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { LXCNav } from '@/components/lxc/lxc-nav';
import { XPBar } from '@/components/lxc/xp-bar';
import { loadStudentData, type LXCStudentData } from '@/lib/lxc/student-store';
import { getCurrentModelConfig } from '@/lib/utils/model-config';

// Module 17 — Bharat Mode
// Voice-first, Hindi/Hinglish, low-bandwidth learning

const QUICK_DOUBTS = [
  'Photosynthesis kya hai simple bhasha mein?',
  'Triangle ka area kaise nikaalte hai?',
  'Newton ke teen niyam explain karo',
  'Democracy aur Monarchy mein kya fark hai?',
  'Square root kaise nikaalte hai?',
  'India ka itihas — Mughal Empire kab tha?',
];

const LANGUAGE_OPTIONS = [
  { id: 'hindi', label: 'Hindi', flag: '🇮🇳', desc: 'Pure Hindi (Devanagari)' },
  { id: 'hinglish', label: 'Hinglish', flag: '🤝', desc: 'Hindi + English mix' },
  { id: 'english', label: 'English', flag: '🏫', desc: 'Simple English' },
];

export default function BharatModePage() {
  const [data, setData] = useState<LXCStudentData | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<'hindi' | 'hinglish' | 'english'>(
    'hinglish',
  );
  const [isOnline, setIsOnline] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setData(loadStudentData());
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  function startListening() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Your browser does not support voice input. Please use Chrome.');
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = activeLanguage === 'english' ? 'en-IN' : 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const t = Array.from(event.results as unknown[])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript)
        .join('');
      setTranscript(t);
      if (event.results[event.results.length - 1].isFinal) {
        setQuestion(t);
        setTranscript('');
        setIsListening(false);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
    if (transcript) setQuestion(transcript);
  }

  function speakAnswer(text: string) {
    if (!voiceEnabled || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = activeLanguage === 'english' ? 'en-IN' : 'hi-IN';
    utter.rate = 0.9;
    utter.onend = () => setIsSpeaking(false);
    utter.onstart = () => setIsSpeaking(true);
    window.speechSynthesis.speak(utter);
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }

  async function askQuestion(q?: string) {
    const finalQ = q || question;
    if (!finalQ.trim()) return;
    setQuestion(finalQ);
    setAnswer('');
    setStreaming(true);
    stopSpeaking();

    streamRef.current?.abort();
    streamRef.current = new AbortController();

    const config = getCurrentModelConfig();

    const langInstruction =
      activeLanguage === 'hindi'
        ? 'Answer ONLY in simple Hindi (Devanagari). Use very simple words that a rural Class 8-10 student can understand.'
        : activeLanguage === 'hinglish'
          ? 'Answer in Hinglish — mix simple Hindi and English like a friendly teacher explains. Use real examples from Indian rural life.'
          : 'Answer in very simple English. Short sentences. Easy vocabulary for Indian students.';

    const prompt = `You are Bharat AI — a friendly, helpful AI teacher for Indian students. 

Question: ${finalQ}

${langInstruction}

Format your answer:
1. Direct simple answer first (1-2 lines)
2. Explanation with easy example (2-3 lines)  
3. Key point to remember (1 line, marked with ⭐)

Use emojis naturally. Keep total response under 150 words. Be warm and encouraging like a good didi/bhaiya teacher.`;

    try {
      const res = await fetch('/api/lesson-companion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-model': config.modelString,
          'x-api-key': config.apiKey,
          'x-base-url': config.baseUrl ?? '',
          'x-provider-type': config.providerType ?? '',
        },
        body: JSON.stringify({
          mode: 'doubt',
          question: finalQ,
          context: `Bharat Mode — ${activeLanguage} language. Student class: ${data?.profile?.class ?? '10'}`,
          language: activeLanguage === 'hindi' ? 'hi-IN' : 'en-US',
        }),
        signal: streamRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error('API error');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setAnswer(full);
      }

      if (voiceEnabled) speakAnswer(full);
    } catch (err: unknown) {
        setAnswer('Sorry, something went wrong. Please try again.');
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0c1522]">
      <LXCNav />
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Bharat Mode
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Module 17 — Bharat Mode — Voice-First Hindi AI for Rural India
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <Wifi className="w-3 h-3" /> Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-red-400">
                <WifiOff className="w-3 h-3" /> Offline
              </span>
            )}
            {data && (
              <XPBar
                totalXP={data.totalXP}
                level={data.level}
                streak={data.streak.currentStreak}
                compact
              />
            )}
          </div>
        </div>

        {/* Features Banner */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: '🎙️', label: 'Voice First', desc: 'Ask by speaking' },
            { icon: '🇮🇳', label: 'Hindi/Hinglish', desc: 'In your language' },
            { icon: '📡', label: 'Low Bandwidth', desc: 'Works on 2G/3G' },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-800/30 rounded-xl p-3 text-center"
            >
              <div className="text-2xl mb-1">{f.icon}</div>
              <p className="text-xs font-semibold text-yellow-300">{f.label}</p>
              <p className="text-xs text-white/40">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Language Selector */}
        <div className="mb-6">
          <p className="text-sm text-white/50 mb-2">Choose Language:</p>
          <div className="flex gap-2">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setActiveLanguage(lang.id as typeof activeLanguage)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  activeLanguage === lang.id
                    ? 'bg-[#1a6fd8] border-[#1a6fd8] text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Input */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">🎙️ Ask any question</h2>
            <button
              onClick={() => setVoiceEnabled((v) => !v)}
              className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {voiceEnabled ? 'Mute Voice' : 'Unmute Voice'}
            </button>
          </div>

          {/* Big mic button */}
          <div className="flex flex-col items-center mb-4">
            <button
              onMouseDown={startListening}
              onMouseUp={() => {
                if (isListening) stopListening();
              }}
              onTouchStart={startListening}
              onTouchEnd={() => {
                if (isListening) stopListening();
              }}
              className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-white transition-all mb-3 ${
                isListening
                  ? 'bg-red-600 border-red-400 scale-110 animate-pulse'
                  : 'bg-[#1a6fd8] border-[#3b8eef] hover:scale-105'
              }`}
            >
              {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>
            <p className="text-sm text-white/50">
              {isListening ? '🎙️ Listening... release to stop' : 'Hold button and speak your question'}
            </p>
            {transcript && <p className="text-sm text-[#3b8eef] mt-2 italic">"{transcript}"</p>}
          </div>

          {/* Text input fallback */}
          <div className="flex gap-2">
            <input
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#1a6fd8]"
              placeholder="or type here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
            />
            <button
              onClick={() => askQuestion()}
              disabled={!question.trim() || streaming}
              className="px-4 py-2.5 rounded-xl bg-[#1a6fd8] text-white text-sm font-medium hover:bg-[#3b8eef] disabled:opacity-50 transition-colors"
            >
              {streaming ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Ask'}
            </button>
          </div>
        </div>

        {/* Answer */}
        {(answer || streaming) && (
          <div className="bg-gradient-to-br from-[#0d1a2d] to-[#0c1522] border border-[#1a6fd8]/30 rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1a6fd8] to-[#5cc21a] flex items-center justify-center">
                  <span className="text-xs">🤖</span>
                </div>
                <span className="text-sm font-medium text-white">Bharat AI</span>
              </div>
              {answer && !streaming && (
                <button
                  onClick={() => (isSpeaking ? stopSpeaking() : speakAnswer(answer))}
                  className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full transition-colors ${
                    isSpeaking
                      ? 'bg-red-900/30 text-red-400'
                      : 'bg-[#1a6fd8]/20 text-[#3b8eef] hover:bg-[#1a6fd8]/30'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3 h-3" /> Stop
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3" /> Listen
                    </>
                  )}
                </button>
              )}
            </div>
            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
              {answer}
              {streaming && (
                <span className="inline-block w-1.5 h-4 bg-[#3b8eef] ml-1 animate-pulse rounded-sm" />
              )}
            </p>
          </div>
        )}

        {/* Quick Questions */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
            ⚡ Quick Questions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_DOUBTS.map((doubt, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuestion(doubt);
                  askQuestion(doubt);
                }}
                className="text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
              >
                💬 {doubt}
              </button>
            ))}
          </div>
        </div>

        {/* Bharat Mode Features Info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-base font-semibold text-white mb-4">🇮🇳 Bharat Mode Features</h2>
          <div className="space-y-3">
            {[
              {
                icon: '🎙️',
                title: 'Voice-First Learning',
                desc: "Don't type — just speak. In your own language.",
              },
              {
                icon: '📡',
                title: 'Low Bandwidth Mode',
                desc: 'Works on 2G/3G. Offline sync coming soon.',
              },
              {
                icon: '🌾',
                title: 'Rural Context Examples',
                desc: 'Examples from agriculture, village, and Indian life.',
              },
              {
                icon: '🔊',
                title: 'Audio Responses',
                desc: 'Listen to AI responses — no reading required.',
              },
              {
                icon: '📱',
                title: 'Mobile Optimized',
                desc: 'Perfect for small screens on any phone.',
              },
              {
                icon: '🤝',
                title: 'Hindi + Regional (Phase 2)',
                desc: 'Tamil, Bengali, Marathi — coming soon.',
              },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="text-xl shrink-0">{f.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white">{f.title}</p>
                  <p className="text-xs text-white/50">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
