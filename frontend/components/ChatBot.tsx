'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Bot } from 'lucide-react';
import { chatApi, ChatResponse } from '@/lib/api';
import { useAppStore } from '@/lib/store';

interface ChatBotProps {
    track: 'problem_solving' | 'robotics';
    problemId?: number;
    projectContext?: string;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatBot({ track, problemId, projectContext }: ChatBotProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { currentCode } = useAppStore();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Welcome message
    useEffect(() => {
        if (messages.length === 0) {
            const welcomeMessage = track === 'problem_solving'
                ? 'مرحباً! 👋 أنا CodeBot، مساعدك في تعلم البرمجة. كيف يمكنني مساعدتك اليوم؟'
                : 'مرحباً! 🤖 أنا RoboBot، مساعدك في عالم الروبوتات والإلكترونيات. هل أنت جاهز للبدء؟';

            setMessages([{ role: 'assistant', content: welcomeMessage }]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [track]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await chatApi.send(
                track,
                userMessage,
                problemId,
                currentCode || undefined,
                projectContext
            );

            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: response.message_ar || response.message },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى. 😅',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = async () => {
        try {
            await chatApi.clearHistory(track);
        } catch (e) {
            // Ignore errors
        }
        setMessages([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full glass-dark">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold">
                            {track === 'problem_solving' ? 'CodeBot' : 'RoboBot'}
                        </h3>
                        <p className="text-xs text-white/50">مساعدك الذكي</p>
                    </div>
                </div>
                <button
                    onClick={handleClear}
                    className="p-2 text-white/50 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all"
                    title="مسح المحادثة"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`chat-bubble flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'
                            }`}
                    >
                        <div
                            className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user'
                                ? 'bg-primary-500/20 text-white'
                                : 'bg-white/10 text-white'
                                }`}
                        >
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                {msg.content}
                            </p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-end">
                        <div className="bg-white/10 p-4 rounded-2xl">
                            <div className="loading-dots flex gap-1">
                                <span className="w-2 h-2 bg-white/60 rounded-full"></span>
                                <span className="w-2 h-2 bg-white/60 rounded-full"></span>
                                <span className="w-2 h-2 bg-white/60 rounded-full"></span>
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
                        onKeyDown={handleKeyDown}
                        placeholder="اكتب سؤالك هنا..."
                        className="input-field flex-1"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="btn-primary px-4"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
