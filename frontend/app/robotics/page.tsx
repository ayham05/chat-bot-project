'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import ChatBot from '@/components/ChatBot';

const TINKERCAD_URL = 'https://www.tinkercad.com/circuits';

export default function RoboticsPage() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentProject, setCurrentProject] = useState('');

    const projects = [
        {
            id: 'blink',
            title: 'LED وامض',
            title_en: 'Blinking LED',
            description: 'تعلم كيفية توصيل LED وجعله يومض',
            difficulty: 'مبتدئ',
        },
        {
            id: 'traffic',
            title: 'إشارة مرور',
            title_en: 'Traffic Light',
            description: 'أنشئ إشارة مرور بثلاثة ألوان',
            difficulty: 'مبتدئ',
        },
        {
            id: 'sensor',
            title: 'مستشعر المسافة',
            title_en: 'Distance Sensor',
            description: 'استخدم مستشعر الموجات فوق الصوتية لقياس المسافة',
            difficulty: 'متوسط',
        },
        {
            id: 'servo',
            title: 'محرك سيرفو',
            title_en: 'Servo Motor',
            description: 'تحكم في زاوية محرك السيرفو',
            difficulty: 'متوسط',
        },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="glass-dark border-b border-white/10 px-4 py-3">
                <div className="max-w-[1800px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>العودة</span>
                        </Link>
                        <span className="text-white/30">|</span>
                        <h1 className="font-semibold">معمل الروبوتات</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={TINKERCAD_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-sm py-2 flex items-center gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>فتح Tinkercad</span>
                        </a>
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="btn-secondary text-sm py-2 px-3"
                        >
                            {isFullscreen ? (
                                <Minimize2 className="w-4 h-4" />
                            ) : (
                                <Maximize2 className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex flex-1 ${isFullscreen ? '' : 'h-[calc(100vh-8rem)]'}`}>
                {/* Projects Sidebar */}
                {!isFullscreen && (
                    <div className="w-64 border-l border-white/10 glass-dark overflow-y-auto">
                        <div className="p-4">
                            <h2 className="font-semibold mb-4">المشاريع</h2>
                            <div className="space-y-2">
                                {projects.map((project) => (
                                    <button
                                        key={project.id}
                                        onClick={() => setCurrentProject(project.id)}
                                        className={`w-full p-3 rounded-xl text-right transition-all ${currentProject === project.id
                                                ? 'bg-accent-500/20 border border-accent-500/30'
                                                : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                            }`}
                                    >
                                        <h3 className="font-medium text-sm">{project.title}</h3>
                                        <p className="text-xs text-white/60 mt-1">{project.title_en}</p>
                                        <span className="text-xs text-accent-400 mt-2 inline-block">
                                            {project.difficulty}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tinkercad Iframe */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 relative bg-slate-900">
                        <iframe
                            src={TINKERCAD_URL}
                            className="w-full h-full border-0"
                            title="Tinkercad Circuits"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />

                        {/* Overlay for first time */}
                        {!currentProject && (
                            <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center">
                                <div className="text-center max-w-md p-8">
                                    <div className="text-6xl mb-4">🤖</div>
                                    <h2 className="text-2xl font-bold mb-4">مرحباً بك في معمل الروبوتات!</h2>
                                    <p className="text-white/60 mb-6">
                                        اختر مشروعاً من القائمة الجانبية للبدء، أو افتح Tinkercad مباشرة لإنشاء مشروع جديد.
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <button
                                            onClick={() => setCurrentProject('blink')}
                                            className="btn-primary"
                                        >
                                            ابدأ أول مشروع
                                        </button>
                                        <a
                                            href={TINKERCAD_URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary flex items-center gap-2"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Tinkercad
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Panel */}
                {!isFullscreen && (
                    <div className="w-96 border-r border-white/10">
                        <ChatBot track="robotics" />
                    </div>
                )}
            </div>
        </div>
    );
}
