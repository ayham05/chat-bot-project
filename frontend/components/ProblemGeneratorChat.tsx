'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, Sparkles, Bot, User } from 'lucide-react';
import { generateApi, Problem } from '@/lib/api';
import { useAppStore } from '@/lib/store';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    problem?: Problem;
}

export default function ProblemGeneratorChat() {
    const router = useRouter();
    const { setGeneratedProblem } = useAppStore();
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'مرحباً! 👋 أنا مساعدك لإنشاء مسائل البرمجة. أخبرني ماذا تريد:\n\n• "أريد مسألة سهلة عن الحلقات"\n• "give me a hard array problem"\n• "مسألة متوسطة عن الشروط"'
        }
    ]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const parseRequest = (text: string): { topic: string; difficulty: string; custom_request: string } => {
        const lowerText = text.toLowerCase();

        // Detect topic
        let topic = 'IO';
        if (lowerText.includes('loop') || lowerText.includes('حلق') || lowerText.includes('for') || lowerText.includes('while')) {
            topic = 'LOOP';
        } else if (lowerText.includes('if') || lowerText.includes('شرط') || lowerText.includes('condition')) {
            topic = 'IF';
        } else if (lowerText.includes('array') || lowerText.includes('مصفوف')) {
            topic = 'ARRAY';
        } else if (lowerText.includes('input') || lowerText.includes('output') || lowerText.includes('إدخال') || lowerText.includes('إخراج') || lowerText.includes('cout') || lowerText.includes('cin')) {
            topic = 'IO';
        }

        // Detect difficulty
        let difficulty = 'Easy';
        if (lowerText.includes('hard') || lowerText.includes('صعب') || lowerText.includes('difficult')) {
            difficulty = 'Hard';
        } else if (lowerText.includes('medium') || lowerText.includes('متوسط') || lowerText.includes('moderate')) {
            difficulty = 'Medium';
        } else if (lowerText.includes('easy') || lowerText.includes('سهل') || lowerText.includes('simple') || lowerText.includes('بسيط')) {
            difficulty = 'Easy';
        }

        return { topic, difficulty, custom_request: text };
    };

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsGenerating(true);

        try {
            const request = parseRequest(userMessage);
            const problem = await generateApi.problem(request);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `✨ تم إنشاء مسألة جديدة!\n\n**${problem.title_ar || problem.title_en}**\n\nالموضوع: ${problem.topic} | المستوى: ${problem.difficulty}\n\nاضغط على الزر أدناه لحل المسألة 👇`,
                problem
            }]);
        } catch (error) {
            console.error('Failed to generate problem:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ عذراً، حدث خطأ في إنشاء المسألة. تأكد من تكوين API Key وحاول مرة أخرى.'
            }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSolveProblem = (problem: Problem) => {
        setGeneratedProblem(problem);
        router.push('/problems/generated');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="glass h-[500px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold">مولّد المسائل الذكي</h3>
                    <p className="text-xs text-white/50">اطلب أي مسألة وسأنشئها لك</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                                ? 'bg-primary-500/20'
                                : 'bg-gradient-to-br from-primary-500 to-purple-600'
                            }`}>
                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-left' : ''}`}>
                            <div className={`p-3 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-primary-500/20 rounded-tr-sm'
                                    : 'bg-white/5 rounded-tl-sm'
                                }`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            {msg.problem && (
                                <button
                                    onClick={() => handleSolveProblem(msg.problem!)}
                                    className="mt-2 btn-primary text-sm py-2 px-4 flex items-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    ابدأ حل المسألة
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {isGenerating && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-white/5 p-3 rounded-2xl rounded-tl-sm">
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm text-white/60">جاري إنشاء المسألة...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="اكتب طلبك هنا... (مثال: مسألة سهلة عن الحلقات)"
                        className="input-field flex-1"
                        disabled={isGenerating}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isGenerating}
                        className="btn-primary px-4"
                    >
                        {isGenerating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
