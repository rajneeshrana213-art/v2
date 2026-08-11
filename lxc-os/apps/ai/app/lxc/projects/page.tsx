'use client';

import { useState } from 'react';
import { LXCNav } from '@/components/lxc/lxc-nav';
import { getCurrentModelConfig } from '@/lib/utils/model-config';
import {
  Rocket,
  Package,
  Clock,
  Users,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Download,
} from 'lucide-react';

interface ProjectPhase {
  phase: number;
  name: string;
  duration: string;
  tasks: string[];
  deliverable: string;
}

interface ProjectResult {
  projectTitle: string;
  tagline: string;
  realWorldConnection: string;
  learningOutcomes: string[];
  difficulty: string;
  materials: string[];
  totalBudget: string;
  phases: ProjectPhase[];
  presentationIdeas: string[];
  extensionChallenges: string[];
  curriculumLinks: string[];
  socialImpact: string;
  portfolioValue: string;
  teacherNote: string;
}

const SUBJECTS = [
  'Mathematics',
  'Science',
  'Social Science',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Geography',
  'Economics',
  'Computer Science',
];
const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'text-green-400 bg-green-400/10 border-green-400/30',
  Intermediate: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  Advanced: 'text-red-400 bg-red-400/10 border-red-400/30',
};

export default function ProjectsPage() {
  const [subject, setSubject] = useState('Science');
  const [topic, setTopic] = useState('');
  const [studentClass, setStudentClass] = useState('Class 10');
  const [duration, setDuration] = useState('1 week');
  const [projectType, setProjectType] = useState('solo');
  const [language, setLanguage] = useState('english');
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<ProjectResult | null>(null);
  const [error, setError] = useState('');
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    setError('');
    setLoading(true);
    setProject(null);
    setCompletedPhases(new Set());

    try {
      const config = getCurrentModelConfig();
      const res = await fetch('/api/lxc/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-model': config.modelString,
          'x-api-key': config.apiKey || '',
          'x-base-url': config.baseUrl || '',
          'x-provider-type': config.providerType || '',
        },
        body: JSON.stringify({ subject, topic, studentClass, duration, projectType, language }),
      });
      const data = await res.json();
      if (data.success) setProject(data.data);
      else setError(data.error?.message || 'Error generating project');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const togglePhase = (phase: number) => {
    setCompletedPhases((prev) => {
      const next = new Set(prev);
      next.has(phase) ? next.delete(phase) : next.add(phase);
      return next;
    });
  };

  const progress = project ? Math.round((completedPhases.size / project.phases.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0c1522] text-white">
      <LXCNav />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1 text-sm text-orange-300 mb-4">
            <Rocket className="w-4 h-4" />
            Module 15 — Real World Project Engine
          </div>
          <h1 className="text-3xl font-bold mb-2">Real World Projects</h1>
          <p className="text-white/60">Connect curriculum with real-world problems — learn by doing</p>
        </div>

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm"
              >
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Class</label>
              <select
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm"
              >
                {[
                  'Class 6',
                  'Class 7',
                  'Class 8',
                  'Class 9',
                  'Class 10',
                  'Class 11',
                  'Class 12',
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm"
              >
                {['3 days', '1 week', '2 weeks', '1 month'].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Project Type</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm"
              >
                <option value="solo">Solo</option>
                <option value="pair">Pair</option>
                <option value="group">Group (3-5)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm"
              >
                <option value="hindi">Hindi</option>
                <option value="hinglish">Hinglish</option>
                <option value="english">English</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-white/60 mb-2">Topic / Chapter</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis, Electricity, French Revolution, Linear Equations..."
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-400"
            />
          </div>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 disabled:opacity-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Generating project...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" /> Generate Project
              </>
            )}
          </button>
        </div>

        {/* Project Display */}
        {project && (
          <div className="space-y-5 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/30 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{project.projectTitle}</h2>
                  <p className="text-white/70">{project.tagline}</p>
                </div>
                <span
                  className={`text-sm px-3 py-1 rounded-full border ${DIFFICULTY_COLORS[project.difficulty] || 'text-white/60 bg-white/10 border-white/20'}`}
                >
                  {project.difficulty}
                </span>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-xs text-orange-300 mb-1">🌍 Real-World Connection</p>
                <p className="text-sm text-white/80">{project.realWorldConnection}</p>
              </div>
            </div>

            {/* Budget + Materials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-400" />
                    <h3 className="font-bold">Materials</h3>
                  </div>
                  <span className="text-green-400 font-bold text-sm">{project.totalBudget}</span>
                </div>
                <ul className="space-y-1">
                  {project.materials.map((m, i) => (
                    <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                      <span className="text-green-400 shrink-0">•</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  Learning Outcomes
                </h3>
                <ul className="space-y-1">
                  {project.learningOutcomes.map((o, i) => (
                    <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                      <span className="text-blue-400 shrink-0">✓</span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Progress */}
            {completedPhases.size > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-white/60">Project Progress</span>
                  <span className="font-bold text-green-400">{progress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Phases */}
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" /> Project Phases
              </h3>
              {project.phases.map((phase) => (
                <div
                  key={phase.phase}
                  className={`border rounded-2xl p-5 transition-all ${completedPhases.has(phase.phase) ? 'border-green-500/40 bg-green-500/10' : 'border-white/10 bg-white/5'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => togglePhase(phase.phase)}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${completedPhases.has(phase.phase) ? 'border-green-400 bg-green-400' : 'border-white/30'}`}
                      >
                        {completedPhases.has(phase.phase) && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </button>
                      <div>
                        <span className="text-xs text-white/40">Phase {phase.phase}</span>
                        <h4 className="font-bold">{phase.name}</h4>
                      </div>
                    </div>
                    <span className="text-sm text-white/50 bg-white/10 px-3 py-1 rounded-full">
                      {phase.duration}
                    </span>
                  </div>
                  <ul className="space-y-1 mb-3">
                    {phase.tasks.map((task, i) => (
                      <li key={i} className="text-sm text-white/70 flex items-start gap-2 ml-10">
                        <span className="text-white/30 shrink-0">→</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                  <div className="ml-10 bg-white/10 rounded-lg px-3 py-2">
                    <p className="text-xs text-white/40">Deliverable</p>
                    <p className="text-sm font-medium">{phase.deliverable}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold mb-3 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" /> Presentation Ideas
                </h3>
                <ul className="space-y-1">
                  {project.presentationIdeas.map((p, i) => (
                    <li key={i} className="text-sm text-white/70">
                      • {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold mb-3 text-sm flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-blue-400" /> Curriculum Links
                </h3>
                <ul className="space-y-1">
                  {project.curriculumLinks.map((c, i) => (
                    <li key={i} className="text-sm text-white/70">
                      • {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5">
                <p className="text-xs text-green-400 mb-1">🌱 Social Impact</p>
                <p className="text-sm text-white/80">{project.socialImpact}</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5">
                <p className="text-xs text-blue-400 mb-1">💼 Portfolio Value</p>
                <p className="text-sm text-white/80">{project.portfolioValue}</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-yellow-400" />
                <p className="text-sm font-bold text-yellow-400">Teacher Approval Tip</p>
              </div>
              <p className="text-sm text-white/70">{project.teacherNote}</p>
            </div>

            {/* Extension */}
            {project.extensionChallenges.length > 0 && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-5">
                <h3 className="font-bold mb-2 text-purple-300">🚀 Bonus Challenges</h3>
                <ul className="space-y-1">
                  {project.extensionChallenges.map((c, i) => (
                    <li key={i} className="text-sm text-white/70">
                      ★ {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => {
                setProject(null);
                setTopic('');
                setCompletedPhases(new Set());
              }}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 text-sm transition-all"
            >
              Generate New Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
