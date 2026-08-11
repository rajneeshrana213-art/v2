'use client';

import { useState } from 'react';
import { LXCNav } from '@/components/lxc/lxc-nav';
import { getCurrentModelConfig } from '@/lib/utils/model-config';
import { Heart, Wind, Star, BookOpen, Moon, Phone, Loader2, CheckCircle2 } from 'lucide-react';

const MOODS = [
  { emoji: '😊', label: 'Happy', value: 'happy', score: 9 },
  { emoji: '😌', label: 'Calm', value: 'calm', score: 7 },
  { emoji: '😐', label: 'Okay', value: 'okay', score: 5 },
  { emoji: '😟', label: 'Anxious', value: 'anxious', score: 4 },
  { emoji: '😔', label: 'Sad', value: 'sad', score: 3 },
  { emoji: '😤', label: 'Angry', value: 'angry', score: 3 },
  { emoji: '😰', label: 'Very Stressed', value: 'stressed', score: 2 },
  { emoji: '😭', label: 'Terrible', value: 'terrible', score: 1 },
];

const STRESSORS = [
  'Exam pressure',
  'Parent expectations',
  'Peer comparison',
  'Social media',
  'Friendship issues',
  'Future uncertainty',
  'Physical health',
  'Loneliness',
];

interface WellnessResult {
  greeting: string;
  emotionValidation: string;
  wellnessStatus: string;
  primaryEmotion: string;
  rootCause: string;
  immediateExercise: { name: string; duration: string; steps: string[]; why: string };
  copingStrategies: string[];
  affirmation: string;
  journalPrompt: string;
  sleepTip: string;
  tomorrowPlan: string;
  indianContext?: string;
  crisisResources?: { iCall: string; vandrevala: string; snehaMumbai: string; message: string };
  closingMessage: string;
  isCrisis?: boolean;
}

export default function WellnessPage() {
  const [selectedMood, setSelectedMood] = useState<(typeof MOODS)[0] | null>(null);
  const [selectedStressors, setSelectedStressors] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [language, setLanguage] = useState('hindi');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WellnessResult | null>(null);
  const [error, setError] = useState('');
  const [showExercise, setShowExercise] = useState(false);

  const toggleStressor = (s: string) => {
    setSelectedStressors((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleCheckIn = async () => {
    if (!selectedMood) {
      setError('Select your mood');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const config = getCurrentModelConfig();
      const res = await fetch('/api/lxc/wellness', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-model': config.modelString,
          'x-api-key': config.apiKey || '',
          'x-base-url': config.baseUrl || '',
          'x-provider-type': config.providerType || '',
        },
        body: JSON.stringify({
          mood: selectedMood.value,
          moodScore: selectedMood.score,
          stressors: selectedStressors,
          freeText,
          language,
        }),
      });
      const data = await res.json();
      if (data.success) setResult(data.data);
      else setError(data.error?.message || 'An error occurred');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    Great: 'text-green-400 bg-green-400/10',
    Good: 'text-blue-400 bg-blue-400/10',
    Okay: 'text-yellow-400 bg-yellow-400/10',
    Struggling: 'text-orange-400 bg-orange-400/10',
    'Need Support': 'text-red-400 bg-red-400/10',
  };

  return (
    <div className="min-h-screen bg-[#0c1522] text-white">
      <LXCNav />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-pink-500/20 border border-pink-500/30 rounded-full px-4 py-1 text-sm text-pink-300 mb-4">
            <Heart className="w-4 h-4" />
            Module 13 — Mental Wellness AI
          </div>
          <h1 className="text-3xl font-bold mb-2">Wellness Check-In</h1>
          <p className="text-white/60">Understanding your emotions, helping you cope</p>
        </div>

        {!result ? (
          <div className="space-y-6">
            {/* Mood Selection */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="font-bold mb-4">How are you feeling today?</h2>
              <div className="grid grid-cols-4 gap-3">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setSelectedMood(m)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                      selectedMood?.value === m.value
                        ? 'border-pink-400 bg-pink-500/20'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-xs text-center">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stressors */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="font-bold mb-4">What is bothering you? (Optional)</h2>
              <div className="flex flex-wrap gap-2">
                {STRESSORS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleStressor(s)}
                    className={`px-4 py-2 rounded-full text-sm border transition-all ${
                      selectedStressors.includes(s)
                        ? 'border-pink-400 bg-pink-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Free Text */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="font-bold mb-2">Want to share anything else? (Optional)</h2>
              <p className="text-xs text-white/40 mb-3">This is a safe space. Write whatever is on your mind.</p>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="e.g. Had a tough day at school, feeling stressed about exams..."
                rows={4}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-400 resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-white/30">🔒 This data stays secure on your device</p>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="text-xs bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white/60"
                >
                  <option value="hindi">Hindi</option>
                  <option value="hinglish">Hinglish</option>
                  <option value="english">English</option>
                </select>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 disabled:opacity-50 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> AI is analyzing...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" /> Check-In
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
            {/* Crisis Alert */}
            {result.isCrisis && result.crisisResources && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold text-red-300">Immediate Helpline Support</h3>
                </div>
                <p className="text-sm text-white/80 mb-3">{result.crisisResources.message}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs text-white/50">iCall</p>
                    <p className="font-bold text-white">{result.crisisResources.iCall}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs text-white/50">Vandrevala Foundation</p>
                    <p className="font-bold text-white">{result.crisisResources.vandrevala}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Greeting */}
            <div
              className={`rounded-2xl p-5 border ${statusColors[result.wellnessStatus] || 'bg-white/5 border-white/10'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full ${statusColors[result.wellnessStatus] || ''}`}
                >
                  {result.wellnessStatus}
                </span>
                <span className="text-2xl">{selectedMood?.emoji}</span>
              </div>
              <p className="text-white/90 font-medium mb-2">{result.greeting}</p>
              <p className="text-sm text-white/70">{result.emotionValidation}</p>
            </div>

            {/* Root Cause Insight */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-xs text-white/40 mb-1">Primary Emotion — {result.primaryEmotion}</p>
              <p className="text-sm text-white/80">{result.rootCause}</p>
            </div>

            {/* Immediate Exercise */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold">{result.immediateExercise.name}</h3>
                </div>
                <span className="text-sm text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">
                  {result.immediateExercise.duration}
                </span>
              </div>
              <p className="text-xs text-white/50 mb-3">{result.immediateExercise.why}</p>
              {showExercise ? (
                <ol className="space-y-2">
                  {result.immediateExercise.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-white/80">{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <button
                  onClick={() => setShowExercise(true)}
                  className="w-full py-2 bg-purple-500/30 hover:bg-purple-500/40 rounded-xl text-sm font-medium transition-all"
                >
                  Do it now →
                </button>
              )}
            </div>

            {/* Coping Strategies */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" /> Coping Strategies
              </h3>
              <ul className="space-y-2">
                {result.copingStrategies.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <span className="text-green-400 shrink-0">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Affirmation */}
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl p-5 text-center">
              <Star className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
              <p className="font-medium italic text-white/90">&ldquo;{result.affirmation}&rdquo;</p>
            </div>

            {/* Journal + Sleep + Tomorrow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <BookOpen className="w-4 h-4 text-yellow-400 mb-2" />
                <p className="text-xs text-white/40 mb-1">Write in your journal tonight:</p>
                <p className="text-sm text-white/80">{result.journalPrompt}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <Moon className="w-4 h-4 text-blue-400 mb-2" />
                <p className="text-xs text-white/40 mb-1">Sleep tip:</p>
                <p className="text-sm text-white/80">{result.sleepTip}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <Star className="w-4 h-4 text-green-400 mb-2" />
                <p className="text-xs text-white/40 mb-1">One step for tomorrow:</p>
                <p className="text-sm text-white/80">{result.tomorrowPlan}</p>
              </div>
            </div>

            {result.indianContext && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-sm text-white/70">{result.indianContext}</p>
              </div>
            )}

            <div className="bg-[#1a6fd8]/10 border border-[#1a6fd8]/30 rounded-2xl p-5 text-center">
              <p className="text-white/80">{result.closingMessage}</p>
            </div>

            <button
              onClick={() => {
                setResult(null);
                setSelectedMood(null);
                setSelectedStressors([]);
                setFreeText('');
                setShowExercise(false);
              }}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 text-sm transition-all"
            >
              New Check-In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
