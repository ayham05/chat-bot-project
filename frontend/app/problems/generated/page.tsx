'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Upload, CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { submissionsApi, GradeResponse } from '@/lib/api';
import dynamic from 'next/dynamic';
import ChatBot from '@/components/ChatBot';
import ProblemDisplay from '@/components/ProblemDisplay';

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[400px] flex items-center justify-center bg-slate-900 rounded-xl">
            <div className="text-white/50">جاري التحميل...</div>
        </div>
    ),
});

const DEFAULT_CODE = `#include <iostream>
using namespace std;

int main() {
    // اكتب كودك هنا
    // Write your code here
    
    return 0;
}
`;

export default function GeneratedProblemPage() {
    const router = useRouter();
    const { generatedProblem } = useAppStore();

    const [code, setCode] = useState(DEFAULT_CODE);
    const [result, setResult] = useState<GradeResponse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showChat, setShowChat] = useState(true);

    useEffect(() => {
        // Redirect if no generated problem
        if (!generatedProblem) {
            router.push('/problems');
        }
    }, [generatedProblem, router]);

    const handleSubmit = async () => {
        if (!generatedProblem || isSubmitting) return;

        setIsSubmitting(true);
        setResult(null);

        try {
            // For generated problems, we use AI grading directly
            const gradeResult = await submissionsApi.submit(
                null, // No DB ID for generated problems
                code,
                generatedProblem.desc_en,
                generatedProblem.constraints,
                generatedProblem.sample_io
            );
            setResult(gradeResult);
        } catch (error) {
            console.error('Failed to grade submission:', error);
            alert('فشل في تقييم الكود. الرجاء التأكد من اتصال الخادم.');
            setResult({
                submission_id: 'error',
                status: 'ERROR',
                is_correct: false,
                feedback_en: 'Server Error',
                feedback_ar: 'حدث خطأ في الاتصال بالخادم.',
                hint: undefined
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!generatedProblem) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="glass-dark border-b border-white/10 px-4 py-3">
                <div className="max-w-[1800px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/problems"
                            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>العودة</span>
                        </Link>
                        <span className="text-white/30">|</span>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary-400" />
                            <h1 className="font-semibold">{generatedProblem.title_en}</h1>
                            <span className="text-xs px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded-full">
                                AI Generated
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowChat(!showChat)}
                        className="btn-secondary text-sm py-2"
                    >
                        {showChat ? 'إخفاء المساعد' : 'عرض المساعد'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-8rem)]">
                {/* Problem & Editor */}
                <div className={`flex-1 flex ${showChat ? 'lg:w-2/3' : 'w-full'} transition-all`}>
                    {/* Problem Display */}
                    <div className="w-1/2 border-l border-white/10 overflow-hidden">
                        <ProblemDisplay problem={generatedProblem} />
                    </div>

                    {/* Code Editor */}
                    <div className="w-1/2 flex flex-col min-h-0">
                        <div className="flex-1 p-4 min-h-0 flex flex-col">
                            <CodeEditor value={code} onChange={setCode} height="100%" />
                        </div>

                        {/* Submit Button & Result */}
                        <div className="p-4 border-t border-white/10">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>جاري التقييم...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4" />
                                            <span>تشغيل وإرسال</span>
                                        </>
                                    )}
                                </button>

                                <label className="btn-secondary flex items-center gap-2 cursor-pointer">
                                    <Upload className="w-4 h-4" />
                                    <span>رفع ملف</span>
                                    <input type="file" accept=".cpp" className="hidden" />
                                </label>
                            </div>

                            {/* Result */}
                            {result && (
                                <div
                                    className={`mt-4 p-4 rounded-xl ${result.is_correct
                                        ? 'bg-green-500/20 border border-green-500/30'
                                        : 'bg-red-500/20 border border-red-500/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {result.is_correct ? (
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-400" />
                                        )}
                                        <span className={`font-semibold ${result.is_correct ? 'text-green-400' : 'text-red-400'}`}>
                                            {result.status}
                                        </span>
                                    </div>
                                    <p className="text-white/80">{result.feedback_ar}</p>
                                    {result.hint && (
                                        <p className="text-white/60 mt-2 text-sm">💡 {result.hint}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chat Panel */}
                {showChat && (
                    <div className="w-1/3 border-r border-white/10">
                        <ChatBot track="problem_solving" />
                    </div>
                )}
            </div>
        </div>
    );
}
