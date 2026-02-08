'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Filter, Code, ArrowLeft, Sparkles, X, Loader2 } from 'lucide-react';
import { problemsApi, generateApi, Problem } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import ProblemGeneratorChat from '@/components/ProblemGeneratorChat';

// Sample problems for demo
const sampleProblems: Problem[] = [
    {
        id: 1,
        topic: 'IO',
        difficulty: 'Easy',
        title_en: 'Hello World',
        title_ar: 'مرحباً بالعالم',
        desc_en: 'Write a program that prints "Hello, World!" to the console.',
        desc_ar: 'اكتب برنامجاً يطبع "Hello, World!" على الشاشة.',
        sample_io: [{ input: '', output: 'Hello, World!' }],
    },
    {
        id: 2,
        topic: 'IO',
        difficulty: 'Easy',
        title_en: 'Sum of Two Numbers',
        title_ar: 'مجموع رقمين',
        desc_en: 'Read two integers and print their sum.',
        desc_ar: 'اقرأ رقمين صحيحين واطبع مجموعهما.',
        sample_io: [{ input: '5 3', output: '8' }],
    },
    {
        id: 3,
        topic: 'IF',
        difficulty: 'Easy',
        title_en: 'Even or Odd',
        title_ar: 'زوجي أم فردي',
        desc_en: 'Read an integer and determine if it is even or odd.',
        desc_ar: 'اقرأ رقماً صحيحاً وحدد إذا كان زوجياً أم فردياً.',
        sample_io: [{ input: '4', output: 'Even' }, { input: '7', output: 'Odd' }],
    },
    {
        id: 4,
        topic: 'LOOP',
        difficulty: 'Medium',
        title_en: 'Print Numbers 1 to N',
        title_ar: 'اطبع الأرقام من 1 إلى N',
        desc_en: 'Read N and print all numbers from 1 to N, each on a new line.',
        desc_ar: 'اقرأ N واطبع كل الأرقام من 1 إلى N، كل رقم في سطر جديد.',
        sample_io: [{ input: '5', output: '1\n2\n3\n4\n5' }],
    },
    {
        id: 5,
        topic: 'LOOP',
        difficulty: 'Medium',
        title_en: 'Factorial',
        title_ar: 'المضروب',
        desc_en: 'Calculate the factorial of a given number N.',
        desc_ar: 'احسب مضروب الرقم N.',
        sample_io: [{ input: '5', output: '120' }],
    },
    {
        id: 6,
        topic: 'ARRAY',
        difficulty: 'Hard',
        title_en: 'Find Maximum',
        title_ar: 'أوجد الأكبر',
        desc_en: 'Read N numbers and find the maximum value.',
        desc_ar: 'اقرأ N رقماً وأوجد أكبر قيمة.',
        sample_io: [{ input: '5\n3 7 2 9 4', output: '9' }],
    },
];

export default function ProblemsPage() {
    const router = useRouter();
    const { setGeneratedProblem } = useAppStore();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ topic: '', difficulty: '' });
    const [search, setSearch] = useState('');

    // Generate problem modal state
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [generateForm, setGenerateForm] = useState({
        topic: 'IO',
        difficulty: 'Easy',
        custom_request: ''
    });

    useEffect(() => {
        loadProblems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const loadProblems = async () => {
        setLoading(true);
        try {
            const data = await problemsApi.list(filter.topic, filter.difficulty);
            setProblems(data.problems || []);
        } catch (error) {
            console.error('Failed to load problems:', error);
            setProblems(sampleProblems);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateProblem = async () => {
        setGenerating(true);
        try {
            const problem = await generateApi.problem(generateForm);
            setGeneratedProblem(problem);
            setShowGenerateModal(false);
            router.push(`/problems/generated`);
        } catch (error) {
            console.error('Failed to generate problem:', error);
            alert('فشل في إنشاء المسألة. تأكد من تكوين API Key.');
        } finally {
            setGenerating(false);
        }
    };

    const filteredProblems = problems.filter((p) =>
        p.title_en.toLowerCase().includes(search.toLowerCase())
    );

    const difficultyColors: Record<string, string> = {
        Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
        Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        Hard: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    const topicIcons: Record<string, string> = {
        IO: '📝',
        IF: '🔀',
        LOOP: '🔄',
        ARRAY: '📊',
    };

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>العودة</span>
                        </Link>
                        <h1 className="text-3xl font-bold mb-2">مسائل البرمجة</h1>
                        <p className="text-white/60">اختر مسألة وابدأ في حلها</p>
                    </div>
                    <button
                        onClick={() => setShowGenerateModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>إنشاء مسألة جديدة</span>
                    </button>
                </div>

                {/* Generate Problem Modal */}
                {showGenerateModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="glass p-6 w-full max-w-md mx-4">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary-400" />
                                    إنشاء مسألة بالذكاء الاصطناعي
                                </h2>
                                <button
                                    onClick={() => setShowGenerateModal(false)}
                                    className="text-white/60 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-white/70 mb-2">الموضوع</label>
                                    <select
                                        value={generateForm.topic}
                                        onChange={(e) => setGenerateForm({ ...generateForm, topic: e.target.value })}
                                        className="input-field w-full"
                                    >
                                        <option value="IO">Input/Output - الإدخال والإخراج</option>
                                        <option value="IF">Conditionals - الشروط</option>
                                        <option value="LOOP">Loops - الحلقات</option>
                                        <option value="ARRAY">Arrays - المصفوفات</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/70 mb-2">المستوى</label>
                                    <select
                                        value={generateForm.difficulty}
                                        onChange={(e) => setGenerateForm({ ...generateForm, difficulty: e.target.value })}
                                        className="input-field w-full"
                                    >
                                        <option value="Easy">سهل</option>
                                        <option value="Medium">متوسط</option>
                                        <option value="Hard">صعب</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/70 mb-2">طلب مخصص (اختياري)</label>
                                    <textarea
                                        value={generateForm.custom_request}
                                        onChange={(e) => setGenerateForm({ ...generateForm, custom_request: e.target.value })}
                                        placeholder="مثال: أريد مسألة عن جمع أرقام من 1 إلى N"
                                        className="input-field w-full h-24 resize-none"
                                    />
                                </div>

                                <button
                                    onClick={handleGenerateProblem}
                                    disabled={generating}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    {generating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>جاري الإنشاء...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            <span>إنشاء المسألة</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content with Chat Sidebar */}
                <div className="flex gap-6">
                    {/* Chat Sidebar */}
                    <div className="w-[400px] flex-shrink-0">
                        <ProblemGeneratorChat />
                    </div>

                    {/* Problems Section */}
                    <div className="flex-1">
                        {/* Filters */}
                        <div className="glass p-4 mb-6">
                            <div className="flex flex-wrap gap-4 items-center">
                                <div className="flex-1 min-w-[200px]">
                                    <div className="relative">
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                        <input
                                            type="text"
                                            placeholder="ابحث عن مسألة..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="input-field pr-10"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-white/40" />
                                    <select
                                        value={filter.topic}
                                        onChange={(e) => setFilter({ ...filter, topic: e.target.value })}
                                        className="input-field w-auto"
                                    >
                                        <option value="">كل المواضيع</option>
                                        <option value="IO">Input/Output</option>
                                        <option value="IF">Conditionals</option>
                                        <option value="LOOP">Loops</option>
                                        <option value="ARRAY">Arrays</option>
                                    </select>

                                    <select
                                        value={filter.difficulty}
                                        onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
                                        className="input-field w-auto"
                                    >
                                        <option value="">كل المستويات</option>
                                        <option value="Easy">سهل</option>
                                        <option value="Medium">متوسط</option>
                                        <option value="Hard">صعب</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Problems Grid */}
                        {loading ? (
                            <div className="grid md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="glass p-6 animate-pulse">
                                        <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
                                        <div className="h-6 bg-white/10 rounded w-2/3 mb-2" />
                                        <div className="h-4 bg-white/10 rounded w-full" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {filteredProblems.map((problem) => (
                                    <Link key={problem.id} href={`/problems/${problem.id}`}>
                                        <div className="card group cursor-pointer h-full">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-2xl">{topicIcons[problem.topic] || '📝'}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs border ${difficultyColors[problem.difficulty]}`}>
                                                    {problem.difficulty}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                                                {problem.title_en}
                                            </h3>
                                            {problem.title_ar && (
                                                <p className="text-sm text-white/60 mb-3">{problem.title_ar}</p>
                                            )}
                                            <p className="text-sm text-white/50 line-clamp-2">
                                                {problem.desc_en.slice(0, 100)}...
                                            </p>
                                            <div className="flex items-center gap-2 mt-4 text-primary-400 text-sm">
                                                <Code className="w-4 h-4" />
                                                <span>ابدأ الحل</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {!loading && filteredProblems.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-white/60">لا توجد مسائل متطابقة مع البحث</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
