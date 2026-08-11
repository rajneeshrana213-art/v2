import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Save,
    ArrowLeft,
    Plus,
    Trash2,
    CheckCircle2,
    Settings,
    LayoutList
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const QuizCreator = () => {
    const router = useRouter();
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        classId: "",
        subjectId: "",
        timeLimit: 30,
        difficulty: "MEDIUM",
        points: 100,
        startDate: "",
        endDate: "",
    });

    const [questions, setQuestions] = useState<any[]>([
        { questionText: "", options: ["", "", "", ""], correctAnswer: "" }
    ]);

    const [allSubjects, setAllSubjects] = useState<any[]>([]);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const res = await client.get("/v1/dashboard/teacher/homework/metadata");

                const teacherSubjects = res.data.subjects || [];
                const assignedClassIds = new Set(teacherSubjects.map((s: any) => s.classId));
                const teacherClasses = (res.data.classes || []).filter((cls: any) => assignedClassIds.has(cls.id));

                setClasses(teacherClasses);
                setAllSubjects(teacherSubjects);
            } catch (error) {
                toast.error("Failed to load metadata");
            }
        };
        fetchMetadata();
    }, []);

    useEffect(() => {
        if (formData.classId) {
            const filtered = allSubjects.filter(s => s.classId === formData.classId);
            setSubjects(filtered);
            if (!filtered.find(s => s.id === formData.subjectId)) {
                setFormData(prev => ({ ...prev, subjectId: "" }));
            }
        } else {
            setSubjects([]);
        }
    }, [formData.classId, allSubjects]);

    const handleAddQuestion = () => {
        setQuestions([...questions, { questionText: "", options: ["", "", "", ""], correctAnswer: "" }]);
    };

    const handleRemoveQuestion = (index: number) => {
        if (questions.length <= 1) {
            toast.error("You must have at least one question");
            return;
        }
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const handleQuestionChange = (index: number, field: string, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.classId || !formData.subjectId || !formData.startDate || !formData.endDate) {
            return toast.error("Please fill all quiz settings");
        }

        const now = new Date();
        now.setSeconds(0, 0);
        now.setMilliseconds(0);

        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);

        if (start < now) {
            return toast.error("Start date cannot be in the past");
        }
        if (end <= start) {
            return toast.error("End date must be after start date");
        }

        if (questions.length === 0) {
            return toast.error("Add at least one question");
        }

        for (const [i, q] of questions.entries()) {
            if (!q.questionText.trim()) {
                return toast.error(`Question ${i + 1} text is empty`);
            }
            if (!q.correctAnswer) {
                return toast.error(`Please select a correct answer for Question ${i + 1}`);
            }
            if (q.options.some((o: string) => !o.trim())) {
                return toast.error(`Please fill all options for Question ${i + 1}`);
            }
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                questions: questions.map(q => ({
                    ...q,
                    options: q.options.map((o: string) => o.trim())
                }))
            };

            await client.post("/v1/dashboard/teacher/enhancement/quiz", payload);
            toast.success("Quiz created successfully!");
            router.push("/dashboard/teacher/enhancement");
        } catch (error: any) {
            console.error("Quiz creation error:", error);
            toast.error(error.response?.data?.error || "Failed to create quiz. Please check all fields.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all";
    const labelClass = "text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block";

    return (
        <DashboardLayout role="teacher">
            <form onSubmit={handleSubmit} className="p-6 max-w-5xl mx-auto pb-20">
                <div className="flex items-center justify-between mb-8">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 disabled:opacity-50"
                    >
                        {loading ? "Creating..." : (
                            <>
                                <Save className="h-5 w-5" />
                                Save Quiz
                            </>
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Meta Section */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/10">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Settings className="h-5 w-5 text-indigo-600" />
                                Quiz Settings
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Quiz Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Modern Physics Quiz"
                                        className={inputClass}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className={labelClass}>Class</label>
                                        <select
                                            required
                                            value={formData.classId}
                                            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                            className={inputClass}
                                        >
                                            <option value="">Select Class</option>
                                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Subject</label>
                                        <select
                                            required
                                            disabled={!formData.classId}
                                            value={formData.subjectId}
                                            onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                            className={`${inputClass} disabled:opacity-50`}
                                        >
                                            <option value="">{formData.classId ? (subjects.length > 0 ? "Select Subject" : "No subjects assigned") : "Select Class first"}</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Time (Min)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.timeLimit}
                                            onChange={(e) => setFormData({ ...formData, timeLimit: Number(e.target.value) })}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>XP Points</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.points}
                                            onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Start Date</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        min={new Date().toISOString().slice(0, 16)}
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>End Date</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        min={formData.startDate || new Date().toISOString().slice(0, 16)}
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <LayoutList className="h-6 w-6 text-indigo-600" />
                                {questions.length} Questions
                            </h2>
                            <button
                                type="button"
                                onClick={handleAddQuestion}
                                className="flex items-center gap-1.5 text-indigo-600 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-4 py-2 rounded-xl transition-all"
                            >
                                <Plus className="h-5 w-5" />
                                Add New Question
                            </button>
                        </div>

                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-white/10 relative group animate-in fade-in slide-in-from-bottom-4">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveQuestion(qIndex)}
                                    className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 bg-gray-50 dark:bg-gray-800 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center font-bold text-lg">
                                            {qIndex + 1}
                                        </div>
                                        <textarea
                                            placeholder="Enter your question here..."
                                            value={q.questionText}
                                            onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
                                            className="w-full text-lg font-medium border-none focus:ring-0 outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600 dark:text-white dark:bg-transparent min-h-[60px] resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {q.options.map((opt: string, oIndex: number) => (
                                            <div
                                                key={oIndex}
                                                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${q.correctAnswer === opt && opt !== ""
                                                    ? "border-green-500 bg-green-50/50 dark:bg-green-900/10 ring-2 ring-green-100 dark:ring-green-900/20"
                                                    : "border-gray-100 dark:border-white/10 bg-gray-50/30 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuestionChange(qIndex, "correctAnswer", opt)}
                                                    className={`h-6 w-6 rounded-lg flex items-center justify-center border-2 transition-all ${q.correctAnswer === opt && opt !== ""
                                                        ? "bg-green-500 border-green-500 text-white"
                                                        : "border-gray-200 dark:border-gray-600 text-transparent"
                                                        }`}
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </button>
                                                <input
                                                    type="text"
                                                    placeholder={`Option ${oIndex + 1}`}
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                    className="w-full bg-transparent border-none focus:ring-0 outline-none text-gray-700 dark:text-gray-300 py-1"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {!q.correctAnswer && q.options.some((o: string) => o) && (
                                        <p className="text-amber-500 text-xs font-medium flex items-center gap-1.5 px-1">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Select the correct option to enable auto-grading
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
};

export default QuizCreator;
