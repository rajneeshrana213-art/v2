'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Sliders,
  Plus,
  Clock,
  Trash2,
  Eye,
  X,
  Send,
  Paperclip,
  Calendar,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock3,
  HelpCircle,
  HelpCircle as QuestionIcon,
  Home,
  User,
  Settings,
  Bug,
  CheckSquare,
  Sparkles,
  Sun,
  Moon,
  Bell,
  ChevronRight,
  Globe,
  LogOut,
  LogIn,
  GraduationCap,
} from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/hooks/use-theme';
import { useUserProfileStore } from '@/lib/store/user-profile';
import {
  loadStudentData,
  saveStudentData,
  type StudentProfile,
  type LXCStudentData,
  PREDEFINED_BADGES,
  unlockBadge,
} from '@/lib/lxc/student-store';

interface Ticket {
  id: string;
  ticketNumber: number;
  title: string;
  description: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  attachment?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  author: 'Team' | 'User';
  text: string;
  timestamp: string;
}

const CATEGORIES = ['Tech', 'Academic', 'Billing', 'Other'];
const PRIORITIES: ('LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUSES: ('OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED')[] = [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'CANCELLED',
];

const SUBJECTS_CBSE = [
  'Mathematics',
  'Science',
  'Social Science',
  'English',
  'Hindi',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Geography',
  'Economics',
  'Computer Science',
  'Physical Education',
];

const CLASSES = ['6', '7', '8', '9', '10', '11', '12'];
const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB'];

const LANGUAGES = [
  { code: 'en', label: 'English - EN' },
  { code: 'hi', label: 'Hindi - हिंदी' },
  { code: 'pa', label: 'Punjabi - ਪੰਜਾਬੀ' },
  { code: 'gu', label: 'Gujarati - ગુજરાਤੀ' },
  { code: 'mr', label: 'Marathi - मराठी' },
  { code: 'bn', label: 'Bengali - বাংলা' },
  { code: 'ta', label: 'Tamil - தமிழ்' },
  { code: 'te', label: 'Telugu - తెలుగు' },
  { code: 'kn', label: 'Kannada - ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam - മലയാളം' },
  { code: 'ur', label: 'Urdu - اردو' },
];


export default function BugrazierPage() {
  const storeAvatar = useUserProfileStore((s) => s.avatar);
  const storeNickname = useUserProfileStore((s) => s.nickname);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('ALL');
  
  // Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFiltersPopup, setShowFiltersPopup] = useState(false);

  // Detail Drawer
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailTab, setDetailTab] = useState<'comments' | 'description'>('comments');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');

  // Report Form Drawer
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    category: 'Tech',
    priority: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    attachment: '' as string | null,
  });
  const [submittingForm, setSubmittingForm] = useState(false);
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);

  // Sidebar and Profile state
  const [data, setData] = useState<LXCStudentData | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [profile, setProfile] = useState<Partial<StudentProfile>>({
    name: '',
    class: '10',
    board: 'CBSE',
    subjects: [],
    studyHoursPerDay: 3,
    language: 'english',
  });
  const [saving, setSaving] = useState(false);

  const { status: authStatus, user, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isAuthenticated = authStatus === 'authenticated';
  const isAuthLoading = authStatus === 'loading';

  useEffect(() => {
    const loaded = loadStudentData();
    setData(loaded);
  }, []);

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const cookieVal = getCookie('googtrans');
    if (cookieVal) {
      const lang = cookieVal.split('/').pop();
      if (lang) setSelectedLang(lang);
    }
  }, []);

  const changeLanguage = (langCode: string) => {
    setSelectedLang(langCode);
    const domain = window.location.hostname.replace('chat.', '');
    const cookieDomain = domain.startsWith('.') ? domain : `.${domain}`;

    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${cookieDomain};`;
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;";

    if (langCode !== 'en') {
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${cookieDomain};`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=localhost;`;
    }

    window.location.reload();
  };

  useEffect(() => {
    if (data) {
      if (isAuthenticated) {
        const currentName = user?.name || 'Student';
        if (!data.profile) {
          // Auto-create profile
          const newProfile: StudentProfile = {
            name: currentName,
            class: '10',
            board: 'CBSE',
            subjects: ['Mathematics', 'Science', 'Social Science', 'English'],
            studyHoursPerDay: 3,
            language: 'english',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          const updated = { ...data, profile: newProfile };
          const withBadge = unlockBadge(updated, PREDEFINED_BADGES[0]);
          saveStudentData(withBadge);
          setData(withBadge);
          setShowSetup(false);
        } else if (data.profile.name !== currentName) {
          // Sync name with logged-in user
          const updatedProfile = { ...data.profile, name: currentName, updatedAt: Date.now() };
          const updated = { ...data, profile: updatedProfile };
          saveStudentData(updated);
          setData(updated);
        } else {
          setShowSetup(false);
        }
      } else {
        setShowSetup(false);
      }
    }
  }, [isAuthenticated, data, user]);

  const toggleSubject = (sub: string) => {
    setProfile((p) => ({
      ...p,
      subjects: p.subjects?.includes(sub)
        ? p.subjects.filter((s) => s !== sub)
        : [...(p.subjects ?? []), sub],
    }));
  };

  const saveProfile = () => {
    if (!profile.name || !profile.subjects?.length) return;
    setSaving(true);
    const loaded = loadStudentData();
    const newProfile: StudentProfile = {
      name: profile.name!,
      class: profile.class!,
      board: profile.board!,
      subjects: profile.subjects!,
      studyHoursPerDay: profile.studyHoursPerDay ?? 3,
      language: profile.language!,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = { ...loaded, profile: newProfile };

    const withBadge = unlockBadge(updated, PREDEFINED_BADGES[0]);
    saveStudentData(withBadge);
    setData(withBadge);
    setShowSetup(false);
    setSaving(false);
  };

  // Load tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await client.get('/v1/user/tickets');
      setTickets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load bugs tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Comments loading & seeding
  useEffect(() => {
    if (selectedTicket) {
      const stored = localStorage.getItem(`ticket-comments-${selectedTicket.id}`);
      if (stored) {
        setComments(JSON.parse(stored));
      } else {
        // Seeding default Team comment if Resolved to match screenshot
        if (selectedTicket.status === 'RESOLVED') {
          const defaultComment: Comment = {
            author: 'Team',
            text: 'Hi, kindly note that we have rolled out a fix for this, and the issue has been fixed. Feel free to open another bug if you face any difficulties in the future. Thank you!',
            timestamp: new Date(new Date(selectedTicket.updatedAt).getTime() || Date.now()).toLocaleString(),
          };
          setComments([defaultComment]);
          localStorage.setItem(`ticket-comments-${selectedTicket.id}`, JSON.stringify([defaultComment]));
        } else {
          setComments([]);
        }
      }
    }
  }, [selectedTicket]);

  // Handle Form submit
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.title || !reportForm.description) {
      toast.error('Title and description are required');
      return;
    }
    setSubmittingForm(true);
    try {
      await client.post('/v1/user/tickets', reportForm);
      toast.success('Bug reported successfully');
      setShowReportForm(false);
      setReportForm({
        title: '',
        description: '',
        category: 'Tech',
        priority: 'LOW',
        attachment: null,
      });
      fetchTickets();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit bug report');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Handle bug update (inline edit)
  const handleTicketUpdate = async (updatedFields: Partial<Ticket>) => {
    if (!selectedTicket) return;
    try {
      const result = await client.post('/v1/user/tickets', { id: selectedTicket.id, ...updatedFields }, { method: 'PUT' } as any);
      setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? { ...t, ...updatedFields } : t)));
      setSelectedTicket((prev) => (prev ? { ...prev, ...updatedFields } : null));
      toast.success('Bug updated successfully');
    } catch (err: any) {
      toast.error('Failed to update bug');
    }
  };

  // Handle bug deletion
  const handleTicketDelete = (id: string) => {
    setDeletingTicketId(id);
  };

  const confirmTicketDelete = async () => {
    if (!deletingTicketId) return;
    try {
      await client.delete(`/v1/user/tickets?id=${deletingTicketId}`);
      setTickets((prev) => prev.filter((t) => t.id !== deletingTicketId));
      if (selectedTicket?.id === deletingTicketId) {
        setSelectedTicket(null);
      }
      toast.success('Bug deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete bug');
    } finally {
      setDeletingTicketId(null);
    }
  };

  // Add a comment
  const handleAddComment = () => {
    if (!newCommentText.trim() || !selectedTicket) return;

    const newComment: Comment = {
      author: 'User',
      text: newCommentText.trim(),
      timestamp: new Date().toLocaleString(),
    };

    const updated = [...comments, newComment];
    setComments(updated);
    localStorage.setItem(`ticket-comments-${selectedTicket.id}`, JSON.stringify(updated));
    setNewCommentText('');
    toast.success('Comment added');
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Filter logic
  const filteredTickets = tickets.filter((t) => {
    // Search filter
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(t.ticketNumber).includes(searchQuery) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesTab =
      activeTab === 'ALL' ||
      t.status === activeTab ||
      (activeTab === 'OPEN' && t.status === 'OPEN') ||
      (activeTab === 'IN_PROGRESS' && t.status === 'IN_PROGRESS') ||
      (activeTab === 'RESOLVED' && t.status === 'RESOLVED') ||
      (activeTab === 'CLOSED' && t.status === 'CLOSED');

    // Date filters
    const ticketTime = new Date(t.createdAt).getTime();
    const matchesStart = !startDate || ticketTime >= new Date(startDate).getTime();
    const matchesEnd = !endDate || ticketTime <= new Date(endDate).setHours(23, 59, 59, 999);

    return matchesSearch && matchesTab && matchesStart && matchesEnd;
  });

  // Category counts
  const allCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const progressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;
  const closedCount = tickets.filter((t) => t.status === 'CLOSED' || t.status === 'CANCELLED').length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full">
      {/* Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d1a2d] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white transition-colors duration-300 animate-in fade-in zoom-in-95">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#1a6fd8] to-[#5cc21a] flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold">Welcome to LearnXChain!</h2>
              <p className="text-slate-500 dark:text-white/50 text-sm mt-1">Powered by Rit AI — Made for Bharat</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-600 dark:text-white/70 block mb-1">Your Name *</label>
                <input
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#1a6fd8]"
                  placeholder="Enter your name"
                  value={profile.name || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600 dark:text-white/70 block mb-1">Class</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#1a6fd8]"
                    value={profile.class}
                    onChange={(e) => setProfile((p) => ({ ...p, class: e.target.value }))}
                  >
                    {CLASSES.map((c) => (
                      <option key={c} value={c} className="bg-white dark:bg-[#0d1a2d]">
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-600 dark:text-white/70 block mb-1">Board</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#1a6fd8]"
                    value={profile.board}
                    onChange={(e) => setProfile((p) => ({ ...p, board: e.target.value }))}
                  >
                    {BOARDS.map((b) => (
                      <option key={b} value={b} className="bg-white dark:bg-[#0d1a2d]">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600 dark:text-white/70 block mb-1">Study Hours/Day</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none"
                    value={profile.studyHoursPerDay}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, studyHoursPerDay: Number(e.target.value) }))
                    }
                  >
                    {[1, 2, 3, 4, 5, 6, 8].map((h) => (
                      <option key={h} value={h} className="bg-white dark:bg-[#0d1a2d]">
                        {h} hours
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-600 dark:text-white/70 block mb-1">Language</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none"
                    value={profile.language}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        language: e.target.value as StudentProfile['language'],
                      }))
                    }
                  >
                    <option value="english" className="bg-white dark:bg-[#0d1a2d]">
                      English
                    </option>
                    <option value="hindi" className="bg-white dark:bg-[#0d1a2d]">
                      Hindi
                    </option>
                    <option value="hinglish" className="bg-white dark:bg-[#0d1a2d]">
                      Hinglish
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-600 dark:text-white/70 block mb-2">
                  Select Subjects * <span className="text-slate-400 dark:text-white/40">(At least 1)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS_CBSE.map((sub) => {
                    const selected = profile.subjects?.includes(sub);
                    return (
                      <button
                        key={sub}
                        onClick={() => toggleSubject(sub)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          selected
                            ? 'bg-[#1a6fd8] text-white'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                      >
                        {selected && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={saveProfile}
                disabled={!profile.name || !profile.subjects?.length || saving}
                className="w-full py-3 rounded-xl bg-linear-to-r from-[#1a6fd8] to-[#3b8eef] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
              >
                {saving ? 'Saving...' : '🚀 Start LearnXChain'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Center Main Content Container */}
      <div className="flex-1 flex flex-col overflow-y-auto pb-10 w-full">
        {/* Header Bar */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#0a0f1d] z-10 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href="/lxc"
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                Bugrazier <span className="text-[10px] bg-[#1a6fd8]/10 text-[#1a6fd8] dark:text-[#3b8eef] border border-[#1a6fd8]/20 px-2 py-0.5 rounded-md uppercase font-bold">Ticket System</span>
              </h1>
              <span className="text-[10px] text-slate-500 font-bold">Track, resolve, and optimize platform bugs</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Troubleshoot Help Center Link */}
            <Link
              href="/lxc/troubleshoot"
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              title="Troubleshoot & FAQs"
            >
              <HelpCircle className="w-4 h-4" />
            </Link>

            {/* Date range inputs */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Start Date"
                  style={{ colorScheme: resolvedTheme === 'dark' ? 'dark' : 'light' }}
                  className="pl-8 pr-2 py-1.5 bg-slate-100 dark:bg-[#0b101d] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1a6fd8] font-semibold"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End Date"
                  style={{ colorScheme: resolvedTheme === 'dark' ? 'dark' : 'light' }}
                  className="pl-8 pr-2 py-1.5 bg-slate-100 dark:bg-[#0b101d] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1a6fd8] font-semibold"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setShowReportForm(true);
                setSelectedTicket(null);
              }}
              className="bg-linear-to-r from-[#1a6fd8] to-[#3b8eef] hover:opacity-90 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/10 cursor-pointer active:scale-95 transition-transform border-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Report new bug
            </button>
          </div>
        </div>

        {/* Main Grid Area */}
        <div className="flex-1 px-6 mt-6 flex gap-6 overflow-hidden">
          {/* Left Side: Table and stats cards */}
          <div className={`flex-1 flex flex-col gap-6 overflow-y-auto ${selectedTicket || showReportForm ? 'lg:w-[60%] shrink-0' : 'w-full'}`}>
              {/* Filters overlay panel */}
              {showFiltersPopup && (
                <div className="bg-slate-100 dark:bg-[#0b101d] border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Start Date</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{ colorScheme: resolvedTheme === 'dark' ? 'dark' : 'light' }}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-[#070c16] border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">End Date</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{ colorScheme: resolvedTheme === 'dark' ? 'dark' : 'light' }}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-[#070c16] border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setSearchQuery('');
                      setActiveTab('ALL');
                      setShowFiltersPopup(false);
                    }}
                    className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {/* Stat Cards Tab Bar */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  {
                    id: 'ALL',
                    label: 'All bugs',
                    count: allCount,
                    color: 'border-[#1a6fd8]/30 text-[#1a6fd8] dark:text-[#3b8eef] bg-[#1a6fd8]/5 hover:bg-[#1a6fd8]/10',
                    activeColor: 'border-[#1a6fd8] text-[#1a6fd8] dark:text-[#3b8eef] bg-[#1a6fd8]/10 shadow-[0_0_15px_rgba(26,111,216,0.2)]'
                  },
                  {
                    id: 'OPEN',
                    label: 'Open',
                    count: openCount,
                    color: 'border-purple-500/30 text-purple-500 bg-purple-500/5 hover:bg-purple-500/10',
                    activeColor: 'border-purple-500 text-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  },
                  {
                    id: 'IN_PROGRESS',
                    label: 'In Progress',
                    count: progressCount,
                    color: 'border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/5 hover:bg-sky-500/10',
                    activeColor: 'border-sky-500 text-sky-600 dark:text-sky-400 bg-sky-500/10 shadow-[0_0_15px_rgba(14,165,233,0.2)]'
                  },
                  {
                    id: 'RESOLVED',
                    label: 'Resolved',
                    count: resolvedCount,
                    color: 'border-green-500/30 text-green-500 bg-green-500/5 hover:bg-green-500/10',
                    activeColor: 'border-green-500 text-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                  },
                  {
                    id: 'CLOSED',
                    label: 'Awaiting reply',
                    count: closedCount,
                    color: 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10',
                    activeColor: 'border-yellow-500 text-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                  },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <div
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`border rounded-2xl p-4 flex justify-between items-center cursor-pointer transition-all ${
                        isActive ? tab.activeColor : `${tab.color} opacity-60 hover:opacity-100`
                      }`}
                    >
                      <span className="text-xs font-black uppercase tracking-wider">{tab.label}</span>
                      <span className="text-lg font-black">{tab.count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Table Container */}
              <div className="bg-white dark:bg-[#0a0f1d] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden flex flex-col">
                {/* Table Header Controls */}
                <div className="p-4 border-b border-slate-200 dark:border-white/5 flex flex-wrap gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search bugs by ID or Title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#070c16] border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-[#1a6fd8] font-semibold"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Showing {filteredTickets.length} of {tickets.length} bugs
                  </span>
                </div>

                {/* Scrollable Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-wider bg-slate-50/50 dark:bg-white/2">
                        <th className="py-3.5 px-4">Id</th>
                        <th className="py-3.5 px-4">Title</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Priority</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Reported on</th>
                        <th className="py-3.5 px-4">Last updated</th>
                        <th className="py-3.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-xs">
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="py-20 text-center text-slate-500 font-bold">
                            <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2" />
                            Loading bugs...
                          </td>
                        </tr>
                      ) : filteredTickets.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-20 text-center text-slate-500 font-bold">
                            No bugs reported matching the filters.
                          </td>
                        </tr>
                      ) : (
                        filteredTickets.map((t) => {
                          const isSelected = selectedTicket?.id === t.id;
                          return (
                            <tr
                              key={t.id}
                              className={`hover:bg-slate-50 dark:hover:bg-white/2 transition-colors ${
                                isSelected ? 'bg-slate-100 dark:bg-white/3' : ''
                              }`}
                            >
                              <td className="py-4 px-4 font-bold text-slate-500 dark:text-slate-400">
                                #{t.ticketNumber}
                              </td>
                              <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200 max-w-64 truncate" title={t.title}>
                                {t.title}
                              </td>
                              <td className="py-4 px-4">
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                  {t.category}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                    t.priority === 'HIGH' || t.priority === 'URGENT'
                                      ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                                      : t.priority === 'MEDIUM'
                                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                                        : 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                                  }`}
                                >
                                  {t.priority}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                    t.status === 'RESOLVED'
                                      ? 'bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30'
                                      : t.status === 'IN_PROGRESS'
                                        ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30'
                                        : t.status === 'OPEN'
                                          ? 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30'
                                          : 'bg-slate-100 dark:bg-slate-700/30 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50'
                                  }`}
                                >
                                  {t.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-slate-550 dark:text-slate-400">
                                {formatDate(t.createdAt)}
                              </td>
                              <td className="py-4 px-4 text-slate-550 dark:text-slate-400">
                                {formatDate(t.updatedAt)}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center justify-center gap-2.5">
                                  <button
                                    onClick={() => {
                                      setSelectedTicket(t);
                                      setShowReportForm(false);
                                    }}
                                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleTicketDelete(t.id)}
                                    className="text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                                    title="Delete Bug"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Side: Split Drawers */}
            {(selectedTicket || showReportForm) && (
              <div className="w-full lg:w-[40%] flex flex-col bg-white dark:bg-[#0a0f1d] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shrink-0 shadow-2xl animate-in slide-in-from-right-3 duration-250">
                {/* 1. VIEW BUG DETAILS SIDEBAR DRAWER */}
                {selectedTicket && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-start shrink-0">
                      <div className="flex flex-col gap-1">
                        <h2 className="font-black text-slate-800 dark:text-slate-200 line-clamp-1 max-w-70">
                          {selectedTicket.title}
                        </h2>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Bug ID: #{selectedTicket.ticketNumber}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedTicket(null)}
                        className="text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-full w-7 h-7 flex items-center justify-center transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Body Meta Information */}
                    <div className="p-4 bg-slate-50/50 dark:bg-white/1 border-b border-slate-200 dark:border-white/5 grid grid-cols-2 gap-3 text-[10px] shrink-0 text-slate-500 dark:text-slate-400 font-bold">
                      <div>Last Reported: <span className="text-slate-800 dark:text-slate-300 font-black ml-1">{formatDate(selectedTicket.createdAt)}</span></div>
                      <div>Last Updated: <span className="text-slate-800 dark:text-slate-300 font-black ml-1">{formatDate(selectedTicket.updatedAt)}</span></div>
                    </div>

                    {/* Dropdowns selectors inside panel */}
                    <div className="p-4 bg-slate-50/70 dark:bg-white/2 border-b border-slate-200 dark:border-white/5 grid grid-cols-3 gap-3 shrink-0">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Status</span>
                        <select
                          value={selectedTicket.status}
                          onChange={(e) => handleTicketUpdate({ status: e.target.value as any })}
                          className="w-full bg-slate-100 dark:bg-[#070c16] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1a6fd8] font-semibold"
                        >
                          {STATUSES.map((st) => (
                            <option key={st} value={st} className="bg-white dark:bg-[#070c16] text-slate-900 dark:text-white">
                              {st.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Priority</span>
                        <select
                          value={selectedTicket.priority}
                          onChange={(e) => handleTicketUpdate({ priority: e.target.value as any })}
                          className="w-full bg-slate-100 dark:bg-[#070c16] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1a6fd8] font-semibold"
                        >
                          {PRIORITIES.map((pr) => (
                            <option key={pr} value={pr} className="bg-white dark:bg-[#070c16] text-slate-900 dark:text-white">
                              {pr}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Category</span>
                        <select
                          value={selectedTicket.category}
                          onChange={(e) => handleTicketUpdate({ category: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-[#070c16] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1a6fd8] font-semibold"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat} className="bg-white dark:bg-[#070c16] text-slate-900 dark:text-white">
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Comments / Description Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-white/5 shrink-0 bg-slate-50 dark:bg-[#0c1221]">
                      <button
                        onClick={() => setDetailTab('comments')}
                        className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                          detailTab === 'comments' ? 'border-[#f27e52] text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Comments
                      </button>
                      <button
                        onClick={() => setDetailTab('description')}
                        className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                          detailTab === 'description' ? 'border-[#f27e52] text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Description
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
                      {detailTab === 'description' ? (
                        <div className="space-y-4">
                          <div className="bg-slate-50 dark:bg-[#070c16] border border-slate-200 dark:border-white/5 rounded-2xl p-4 leading-relaxed text-slate-700 dark:text-slate-300 font-semibold whitespace-pre-wrap">
                            {selectedTicket.description}
                          </div>
                          {selectedTicket.attachment && (
                            <div className="space-y-1.5">
                              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Screenshot</span>
                              <div className="rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden">
                                <img src={selectedTicket.attachment} alt="attachment" className="w-full max-h-44 object-contain bg-black/40" />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col justify-between overflow-hidden">
                          {/* Comments list timeline */}
                          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 pb-4">
                            {comments.length === 0 ? (
                              <div className="text-center text-slate-500 font-bold py-10">
                                No comments yet. Type below to start the timeline!
                              </div>
                            ) : (
                              comments.map((comment, idx) => (
                                <div key={idx} className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-1">
                                  <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                                      comment.author === 'Team'
                                        ? 'bg-linear-to-r from-[#1a6fd8] to-[#3b8eef] text-white shadow-sm'
                                        : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/10'
                                    }`}
                                  >
                                    {comment.author === 'Team' ? 'T' : 'U'}
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-baseline">
                                      <span className="text-xs font-black text-slate-900 dark:text-slate-200">
                                        {comment.author === 'Team' ? 'Team' : 'User'}
                                      </span>
                                      <span className="text-[9px] text-slate-500 font-semibold">
                                        {comment.timestamp}
                                      </span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-[#070c16]/80 border border-slate-200 dark:border-white/5 rounded-2xl p-3 leading-relaxed text-slate-700 dark:text-slate-300 font-semibold">
                                      {comment.text}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Comment input footer */}
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/5 flex gap-2 shrink-0">
                            <textarea
                              placeholder="Type your comment reply here..."
                              value={newCommentText}
                              onChange={(e) => setNewCommentText(e.target.value)}
                              rows={2}
                              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none font-semibold"
                            />
                            <div className="flex flex-col gap-1.5 justify-end">
                              <button
                                onClick={handleAddComment}
                                className="bg-linear-to-r from-[#1a6fd8] to-[#3b8eef] hover:opacity-90 text-white p-2.5 rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md shadow-blue-500/10 border-0"
                                title="Send Comment"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. REPORT NEW BUG FORM DRAWER */}
                {showReportForm && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center shrink-0">
                      <h2 className="font-black text-slate-800 dark:text-slate-200">
                        Report a new bug
                      </h2>
                      <button
                        onClick={() => setShowReportForm(false)}
                        className="text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-full w-7 h-7 flex items-center justify-center transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Form Body Container */}
                    <div className="flex-1 overflow-y-auto p-5">
                      <form onSubmit={handleReportSubmit} className="space-y-4">
                        {/* Troubleshoot tip */}
                        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-3 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-[#1a6fd8] dark:text-[#3b8eef] shrink-0 mt-0.5 animate-pulse" />
                          <div className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                            For quick bug fixes, check the <Link href="/lxc/troubleshoot" className="text-[#1a6fd8] dark:text-[#3b8eef] font-black underline hover:opacity-80 transition-opacity cursor-pointer">Troubleshoot page</Link>
                          </div>
                        </div>

                        {/* Category input */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">Category</label>
                          <select
                            value={reportForm.category}
                            onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-[#070c16] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1a6fd8] font-semibold"
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat} className="bg-white dark:bg-[#070c16] text-slate-900 dark:text-white">
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Title input */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">Title</label>
                          <input
                            type="text"
                            required
                            placeholder="Enter your bug title here"
                            value={reportForm.title}
                            onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-[#070c16] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1a6fd8] placeholder-slate-400 dark:placeholder-slate-600 font-semibold"
                          />
                        </div>

                        {/* Description input */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">Description</label>
                          <textarea
                            required
                            placeholder="Enter your bug description here"
                            value={reportForm.description}
                            onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                            rows={4}
                            className="w-full bg-slate-50 dark:bg-[#070c16] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1a6fd8] placeholder-slate-400 dark:placeholder-slate-600 resize-none font-semibold"
                          />
                        </div>

                        {/* Priority input with colors */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">Priority</label>
                          <select
                            value={reportForm.priority}
                            onChange={(e) => setReportForm({ ...reportForm, priority: e.target.value as any })}
                            className="w-full bg-slate-50 dark:bg-[#070c16] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1a6fd8] font-semibold"
                          >
                            <option value="LOW" className="bg-white dark:bg-[#070c16] text-slate-900 dark:text-white">🟢 Low - Small, harmless issues</option>
                            <option value="MEDIUM" className="bg-white dark:bg-[#070c16] text-slate-900 dark:text-white">🟡 Medium - Standard issues</option>
                            <option value="HIGH" className="bg-white dark:bg-[#070c16] text-slate-900 dark:text-white">🔴 High - Blockers or urgent issues</option>
                            <option value="URGENT" className="bg-white dark:bg-[#070c16] text-slate-900 dark:text-white">💥 Urgent - Immediate fixes required</option>
                          </select>
                        </div>

                        {/* Mock Screenshot zone */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">Screenshots (optional, max 5)</label>
                          <div className="border border-dashed border-slate-200 dark:border-white/10 hover:border-amber-500/40 rounded-2xl py-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#070c16]/50 hover:bg-slate-100 dark:hover:bg-[#070c16]/80 transition-all cursor-pointer">
                            <Paperclip className="w-5 h-5 text-slate-500 mb-1.5" />
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Click to upload or drag image files</span>
                            <span className="text-[8px] text-slate-600 mt-1 font-bold">PNG, JPG or JPEG (&lt;1 mb)</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setReportForm({ ...reportForm, attachment: reader.result as string });
                                    toast.success('Screenshot attached');
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                              id="bug-upload-input"
                            />
                            <button
                              type="button"
                              onClick={() => document.getElementById('bug-upload-input')?.click()}
                              className="mt-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 text-[9px] font-bold px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 transition-all"
                            >
                              Attach Screenshot
                            </button>
                          </div>
                          {reportForm.attachment && (
                            <div className="mt-2 flex items-center justify-between p-2 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl text-[10px]">
                              <span className="text-slate-550 dark:text-slate-400 truncate max-w-44 font-semibold">✓ Attached Screenshot.png</span>
                              <button
                                type="button"
                                onClick={() => setReportForm({ ...reportForm, attachment: null })}
                                className="text-red-650 dark:text-red-400 font-black hover:text-red-500"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={submittingForm}
                          className="w-full bg-linear-to-r from-[#1a6fd8] to-[#3b8eef] hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-blue-500/15 border-0"
                        >
                          {submittingForm ? 'Submitting report...' : 'Submit'}
                        </button>
                      </form>
                      
                      {/* WhatsApp Support footer */}
                      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5 text-center">
                        <div className="text-[9px] text-slate-500 font-semibold leading-relaxed">
                          For instant support/feedback, just drop us a message on <span className="text-emerald-500 font-bold underline cursor-pointer hover:text-emerald-400">WhatsApp</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      {/* Delete Confirmation Modal */}
      {deletingTicketId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0c1524] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center">
            {/* Alert Icon */}
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-500 shadow-lg shadow-red-500/5">
              <Trash2 className="w-5 h-5 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Delete Bug Report</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                Are you sure you want to delete this bug report? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setDeletingTicketId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmTicketDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-500/10 transition-all cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
