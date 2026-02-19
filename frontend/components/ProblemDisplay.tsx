'use client';

import { useState, ReactNode } from 'react';
import { Eye, EyeOff, FileText, Info } from 'lucide-react';
import { Problem } from '@/lib/api';
import 'katex/dist/katex.min.css';
// @ts-ignore — react-katex has no built-in types
import { InlineMath } from 'react-katex';

interface ProblemDisplayProps {
    problem: Problem;
}

/**
 * Parse a text string with $...$ delimited LaTeX expressions and render them
 * using KaTeX <InlineMath>. Non-math text is rendered as plain spans.
 * Also handles \\n as line breaks.
 */
function RichText({ text, className }: { text: string; className?: string }): JSX.Element {
    // First split by literal \n for line breaks
    const lines = text.split(/\\n/);

    const renderLine = (line: string): ReactNode[] => {
        // Split by $...$ delimiters, keeping the delimiters
        const parts = line.split(/(\$[^$]+\$)/g);
        return parts.map((part, i) => {
            if (part.startsWith('$') && part.endsWith('$')) {
                const latex = part.slice(1, -1);
                try {
                    return <InlineMath key={i} math={latex} />;
                } catch {
                    // Fallback: render raw if KaTeX can't parse it
                    return (
                        <code key={i} className="text-sky-300 text-sm">
                            {latex}
                        </code>
                    );
                }
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <span className={className}>
            {lines.map((line, i) => (
                <span key={i}>
                    {renderLine(line)}
                    {i < lines.length - 1 && <br />}
                </span>
            ))}
        </span>
    );
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
        <div className="glass-dark p-6 h-full overflow-y-auto" dir="ltr">
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
                        <h2 className="text-lg text-white/70 mt-1" dir="rtl">{problem.title_ar}</h2>
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
                    <p className="text-white/80 leading-relaxed">
                        <RichText text={problem.desc_en} />
                    </p>
                    {showArabic && problem.desc_ar && (
                        <p className="text-white/70 mt-4 p-4 bg-white/5 rounded-lg border-r-4 border-primary-500" dir="rtl">
                            {problem.desc_ar}
                        </p>
                    )}
                </div>
            </div>

            {/* Input/Output Format */}
            {(problem.input_format || problem.output_format) && (
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {problem.input_format && (
                        <div className="p-4 bg-white/5 rounded-xl overflow-hidden">
                            <h4 className="text-sm font-semibold text-white/50 mb-2">Input Format</h4>
                            <div className="text-white/80 text-sm leading-relaxed break-words">
                                <RichText text={problem.input_format} />
                            </div>
                        </div>
                    )}
                    {problem.output_format && (
                        <div className="p-4 bg-white/5 rounded-xl overflow-hidden">
                            <h4 className="text-sm font-semibold text-white/50 mb-2">Output Format</h4>
                            <div className="text-white/80 text-sm leading-relaxed break-words">
                                <RichText text={problem.output_format} />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Constraints */}
            {problem.constraints && (
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-white/50 mb-2">Constraints</h3>
                    <div className="text-white/80 text-sm bg-white/5 p-3 rounded-lg break-words">
                        <RichText text={problem.constraints} />
                    </div>
                </div>
            )}

            {/* Sample I/O */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white/50">Examples</h3>
                {problem.sample_io.map((sample, idx) => (
                    <div key={idx} className="space-y-2">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-800/50 rounded-xl">
                                <h4 className="text-xs font-semibold text-white/50 mb-2">Sample Input {idx + 1}</h4>
                                <pre className="text-white/80 text-sm font-mono whitespace-pre-wrap io-block" dir="ltr">
                                    {sample.input}
                                </pre>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-xl">
                                <h4 className="text-xs font-semibold text-white/50 mb-2">Sample Output {idx + 1}</h4>
                                <pre className="text-white/80 text-sm font-mono whitespace-pre-wrap io-block" dir="ltr">
                                    {sample.output}
                                </pre>
                            </div>
                        </div>
                        {/* Explanation */}
                        {sample.explanation && (
                            <div className="flex items-start gap-2 px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sm text-sky-300/80">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{sample.explanation}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
