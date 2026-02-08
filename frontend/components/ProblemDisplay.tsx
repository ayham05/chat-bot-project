'use client';

import { useState } from 'react';
import { Eye, EyeOff, FileText } from 'lucide-react';
import { Problem } from '@/lib/api';

interface ProblemDisplayProps {
    problem: Problem;
}

export default function ProblemDisplay({ problem }: ProblemDisplayProps) {
    const [showArabic, setShowArabic] = useState(false);

    const difficultyColors: Record<string, string> = {
        Easy: 'bg-green-500/20 text-green-400',
        Medium: 'bg-yellow-500/20 text-yellow-400',
        Hard: 'bg-red-500/20 text-red-400',
    };

    const topicLabels: Record<string, string> = {
        IO: 'Input/Output',
        IF: 'Conditionals',
        LOOP: 'Loops',
        ARRAY: 'Arrays',
    };

    return (
        <div className="glass-dark p-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${difficultyColors[problem.difficulty] || 'bg-white/10'}`}>
                            {problem.difficulty}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-primary-500/20 text-primary-400">
                            {topicLabels[problem.topic] || problem.topic}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold">{problem.title_en}</h1>
                    {showArabic && problem.title_ar && (
                        <h2 className="text-lg text-white/70 mt-1">{problem.title_ar}</h2>
                    )}
                </div>

                {problem.desc_ar && (
                    <button
                        onClick={() => setShowArabic(!showArabic)}
                        className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-sm"
                    >
                        {showArabic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span>{showArabic ? 'إخفاء العربية' : 'عرض بالعربية'}</span>
                    </button>
                )}
            </div>

            {/* Description */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-white/50 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Problem Description
                </h3>
                <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-white/80 whitespace-pre-wrap">{problem.desc_en}</p>
                    {showArabic && problem.desc_ar && (
                        <p className="text-white/70 mt-4 p-4 bg-white/5 rounded-lg border-r-4 border-primary-500">
                            {problem.desc_ar}
                        </p>
                    )}
                </div>
            </div>

            {/* Input/Output Format */}
            {(problem.input_format || problem.output_format) && (
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {problem.input_format && (
                        <div className="p-4 bg-white/5 rounded-xl">
                            <h4 className="text-sm font-semibold text-white/50 mb-2">Input Format</h4>
                            <p className="text-white/80 text-sm">{problem.input_format}</p>
                        </div>
                    )}
                    {problem.output_format && (
                        <div className="p-4 bg-white/5 rounded-xl">
                            <h4 className="text-sm font-semibold text-white/50 mb-2">Output Format</h4>
                            <p className="text-white/80 text-sm">{problem.output_format}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Constraints */}
            {problem.constraints && (
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-white/50 mb-2">Constraints</h3>
                    <p className="text-white/80 text-sm font-mono bg-white/5 p-3 rounded-lg">
                        {problem.constraints}
                    </p>
                </div>
            )}

            {/* Sample I/O */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white/50">Examples</h3>
                {problem.sample_io.map((sample, idx) => (
                    <div key={idx} className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h4 className="text-xs font-semibold text-white/50 mb-2">Sample Input {idx + 1}</h4>
                            <pre className="text-white/80 text-sm font-mono whitespace-pre-wrap">
                                {sample.input}
                            </pre>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <h4 className="text-xs font-semibold text-white/50 mb-2">Sample Output {idx + 1}</h4>
                            <pre className="text-white/80 text-sm font-mono whitespace-pre-wrap">
                                {sample.output}
                            </pre>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
