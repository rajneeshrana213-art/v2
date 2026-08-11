'use client';

import { useState, useEffect } from 'react';
import { LXCNav } from '@/components/lxc/lxc-nav';
import { getLXCStudentData } from '@/lib/lxc/student-store';
import {
  Users,
  Search,
  Star,
  BookOpen,
  Zap,
  MessageCircle,
  Clock,
  TrendingUp,
  Copy,
  CheckCircle2,
} from 'lucide-react';

interface PeerProfile {
  id: string;
  name: string;
  class: string;
  board: string;
  subjects: string[];
  studyStyle: string;
  timezone: string;
  languages: string[];
  strengthSubject: string;
  weakSubject: string;
  matchScore: number;
  xpLevel: number;
  sessionPref: string;
  bio: string;
}

const MOCK_PEERS: PeerProfile[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    class: 'Class 10',
    board: 'CBSE',
    subjects: ['Mathematics', 'Science'],
    studyStyle: 'Visual',
    timezone: 'IST',
    languages: ['Hindi', 'English'],
    strengthSubject: 'Mathematics',
    weakSubject: 'English',
    matchScore: 95,
    xpLevel: 4,
    sessionPref: 'Evening (6-9 PM)',
    bio: 'Maths lover, dreaming of IIT! Really enjoy group studies.',
  },
  {
    id: '2',
    name: 'Arjun Patel',
    class: 'Class 10',
    board: 'CBSE',
    subjects: ['Science', 'Social Science'],
    studyStyle: 'Reading/Writing',
    timezone: 'IST',
    languages: ['Hindi', 'Gujarati'],
    strengthSubject: 'Science',
    weakSubject: 'Mathematics',
    matchScore: 88,
    xpLevel: 5,
    sessionPref: 'Morning (6-9 AM)',
    bio: 'NEET aspirant. Love sharing notes and clearing doubts.',
  },
  {
    id: '3',
    name: 'Sneha Reddy',
    class: 'Class 10',
    board: 'ICSE',
    subjects: ['English', 'Science', 'Mathematics'],
    studyStyle: 'Kinesthetic',
    timezone: 'IST',
    languages: ['English', 'Telugu'],
    strengthSubject: 'English',
    weakSubject: 'Physics',
    matchScore: 82,
    xpLevel: 3,
    sessionPref: 'Afternoon (2-5 PM)',
    bio: 'Love teaching concepts to others. Organize mock tests.',
  },
  {
    id: '4',
    name: 'Ravi Kumar',
    class: 'Class 10',
    board: 'CBSE',
    subjects: ['Mathematics', 'Computer Science'],
    studyStyle: 'Logical',
    timezone: 'IST',
    languages: ['Hindi', 'Telugu'],
    strengthSubject: 'Computer Science',
    weakSubject: 'Chemistry',
    matchScore: 79,
    xpLevel: 6,
    sessionPref: 'Night (9-11 PM)',
    bio: 'Coding + Maths combo! Study using online tools and YouTube.',
  },
  {
    id: '5',
    name: 'Ananya Singh',
    class: 'Class 10',
    board: 'CBSE',
    subjects: ['Biology', 'Chemistry', 'Physics'],
    studyStyle: 'Visual',
    timezone: 'IST',
    languages: ['Hindi', 'English'],
    strengthSubject: 'Biology',
    weakSubject: 'Physics',
    matchScore: 76,
    xpLevel: 4,
    sessionPref: 'Evening (6-9 PM)',
    bio: 'Targeting NEET 2025. Memorize using diagrams and flowcharts.',
  },
  {
    id: '6',
    name: 'Kabir Ahmed',
    class: 'Class 10',
    board: 'State',
    subjects: ['Mathematics', 'Hindi', 'Social Science'],
    studyStyle: 'Auditory',
    timezone: 'IST',
    languages: ['Hindi', 'Urdu'],
    strengthSubject: 'Hindi',
    weakSubject: 'Mathematics',
    matchScore: 71,
    xpLevel: 2,
    sessionPref: 'Afternoon (2-5 PM)',
    bio: 'First-generation student. Interested in preparing for government exams.',
  },
];

const STUDY_GROUPS = [
  {
    id: 'g1',
    name: 'CBSE Science Warriors',
    members: 24,
    subject: 'Science',
    board: 'CBSE',
    active: true,
    lang: 'Hindi/English',
  },
  {
    id: 'g2',
    name: 'Maths Ka Zor',
    members: 18,
    subject: 'Mathematics',
    board: 'All',
    active: true,
    lang: 'Hinglish',
  },
  {
    id: 'g3',
    name: 'NEET Aspirants 2025',
    members: 41,
    subject: 'Biology/Chemistry',
    board: 'CBSE',
    active: true,
    lang: 'Hindi',
  },
  {
    id: 'g4',
    name: 'SST Discussion Group',
    members: 12,
    subject: 'Social Science',
    board: 'CBSE',
    active: false,
    lang: 'Hindi',
  },
  {
    id: 'g5',
    name: 'English Speaking Practice',
    members: 29,
    subject: 'English',
    board: 'All',
    active: true,
    lang: 'English/Hinglish',
  },
];

export default function PeersPage() {
  const [data, setData] = useState<ReturnType<typeof getLXCStudentData> | null>(null);
  const [tab, setTab] = useState<'match' | 'groups' | 'study-tips'>('match');
  const [connectedPeers, setConnectedPeers] = useState<Set<string>>(new Set());
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    setData(getLXCStudentData());
  }, []);

  const myCode = `LXC-${data?.profile?.name?.substring(0, 3).toUpperCase() || 'STU'}-${Math.floor(Math.random() * 9000) + 1000}`;

  const filteredPeers = MOCK_PEERS.filter(
    (p) =>
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const joinGroup = async (groupId: string, name: string) => {
    try {
      await fetch('/api/lxc/peers/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupName: name }),
      });
      setJoinedGroups((prev) => new Set([...prev, groupId]));
    } catch (err) {
      console.error('Failed to join study group on server', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c1522] text-white">
      <LXCNav />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full px-4 py-1 text-sm text-cyan-300 mb-4">
            <Users className="w-4 h-4" />
            Module 19 — Peer Intelligence Network
          </div>
          <h1 className="text-3xl font-bold mb-2">Study Partner Network</h1>
          <p className="text-white/60">Find the right study partner — excel together</p>
        </div>

        {/* Your Code */}
        <div className="bg-[#1a6fd8]/20 border border-[#1a6fd8]/40 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/50 mb-1">Your LXC Connect Code</p>
            <p className="font-mono font-bold text-lg text-[#1a6fd8]">{myCode}</p>
          </div>
          <button
            onClick={() => copyCode(myCode)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a6fd8]/30 hover:bg-[#1a6fd8]/40 rounded-xl text-sm transition-all"
          >
            {copiedCode === myCode ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-400" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy
              </>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'match', label: '🤝 AI Match', count: filteredPeers.length },
            { key: 'groups', label: '👥 Study Groups', count: STUDY_GROUPS.length },
            { key: 'study-tips', label: '💡 Group Tips', count: null },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.key ? 'bg-[#1a6fd8] text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
            >
              {t.label}
              {t.count !== null && (
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'match' && (
          <div>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or subject..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-4">
              {filteredPeers.map((peer) => (
                <div
                  key={peer.id}
                  className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a6fd8] to-[#5cc21a] flex items-center justify-center text-xl font-bold">
                        {peer.name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold">{peer.name}</h3>
                        <p className="text-sm text-white/50">
                          {peer.class} • {peer.board} • Level {peer.xpLevel}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">{peer.matchScore}%</div>
                      <p className="text-xs text-white/40">match</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/70 mb-3">{peer.bio}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {peer.subjects.map((s) => (
                      <span key={s} className="text-xs bg-white/10 px-2 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                      {peer.studyStyle}
                    </span>
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {peer.sessionPref}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
                    <span className="text-green-400">✓ Strong: {peer.strengthSubject}</span>
                    <span className="mx-2">|</span>
                    <span className="text-orange-400">↑ Needs: {peer.weakSubject}</span>
                  </div>
                  <div className="flex gap-2">
                    {connectedPeers.has(peer.id) ? (
                      <div className="flex-1 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 text-sm text-center flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Connected! Share your code: {myCode}
                      </div>
                    ) : (
                      <button
                        onClick={() => setConnectedPeers((prev) => new Set([...prev, peer.id]))}
                        className="flex-1 py-2 bg-[#1a6fd8]/30 hover:bg-[#1a6fd8]/50 border border-[#1a6fd8]/40 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" /> Connect
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'groups' && (
          <div className="space-y-4">
            {STUDY_GROUPS.map((group) => (
              <div key={group.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold">{group.name}</h3>
                      {group.active && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/50">
                      {group.subject} • {group.board} • {group.lang}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{group.members}</p>
                    <p className="text-xs text-white/40">members</p>
                  </div>
                </div>
                {joinedGroups.has(group.id) ? (
                  <div className="py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 text-sm text-center">
                    ✅ Joined! WhatsApp link via LXC admin
                  </div>
                ) : (
                  <button
                    onClick={() => joinGroup(group.id, group.name)}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition-all"
                  >
                    <Users className="w-4 h-4 inline mr-2" /> Join Group
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'study-tips' && (
          <div className="space-y-4">
            {[
              {
                title: 'Study Group Rules',
                icon: Star,
                color: 'text-yellow-400',
                tips: [
                  'Plan by 8 AM — who studied what',
                  'One topic, one expert — each member owns a subject',
                  'Phone free hour — no distraction in the first hour',
                  'Daily 15-minute doubt clearing session',
                  'Weekly mock tests together — then discuss',
                ],
              },
              {
                title: 'Partner Learning',
                icon: Users,
                color: 'text-blue-400',
                tips: [
                  'Feynman technique — explain the concept to your partner',
                  'Alternate questioning — one asks, the other answers',
                  'Notes swap — share notes and find gaps',
                  'Virtual pomodoro — 25-min focus, 5-min break together',
                  'Share resources instantly — no hoarding knowledge',
                ],
              },
              {
                title: 'Online Tools',
                icon: TrendingUp,
                color: 'text-green-400',
                tips: [
                  'Google Meet / Jitsi — free video call for group study',
                  'Notion / Google Docs — make shared notes',
                  'Kahoot — play fun quizzes together',
                  'Khan Academy — create shared playlists',
                  'WhatsApp groups — for instant doubt clearing',
                ],
              },
              {
                title: 'Stay Motivated Together',
                icon: Zap,
                color: 'text-purple-400',
                tips: [
                  'Weekly leaderboard — compare XP for friendly competition',
                  'Celebrate wins — celebrate milestones together as a group',
                  'Accountability partner — daily check-in',
                  'Support in failure — don\'t judge, lift each other up',
                  'Shared goals — set a group goal (e.g. everyone targets 80%+)',
                ],
              },
            ].map((section) => (
              <div
                key={section.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <section.icon className={`w-5 h-5 ${section.color}`} />
                  <h3 className="font-bold">{section.title}</h3>
                </div>
                <ul className="space-y-2">
                  {section.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <BookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5 text-white/30" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
