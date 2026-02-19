'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Maximize2, Minimize2, AlertTriangle } from 'lucide-react';
import ChatBot from '@/components/ChatBot';

const TINKERCAD_BASE = 'https://www.tinkercad.com';

// Each project has an optional embedId for the Tinkercad /embed/ URL.
// To get your embed ID:
//   1. Open the project on tinkercad.com
//   2. Click "Share" → copy the embed URL
//   3. The ID is the part after /things/ (e.g. "abc123xyz")
// If embedId is empty, only a direct link is shown (no iframe).
const projects = [
    {
        id: 'blink',
        title: 'LED وامض',
        title_en: 'Blinking LED',
        description: 'تعلم كيفية توصيل LED وجعله يومض',
        difficulty: 'مبتدئ',
        // Replace with your actual Tinkercad embed ID
        embedId: '',
        tinkercadUrl: `${TINKERCAD_BASE}/circuits`,
    },
    {
        id: 'traffic',
        title: 'إشارة مرور',
        title_en: 'Traffic Light',
        description: 'أنشئ إشارة مرور بثلاثة ألوان',
        difficulty: 'مبتدئ',
        embedId: '',
        tinkercadUrl: `${TINKERCAD_BASE}/circuits`,
    },
    {
        id: 'sensor',
        title: 'مستشعر المسافة',
        title_en: 'Distance Sensor',
        description: 'استخدم مستشعر الموجات فوق الصوتية لقياس المسافة',
        difficulty: 'متوسط',
        embedId: '',
        tinkercadUrl: `${TINKERCAD_BASE}/circuits`,
    },
    {
        id: 'servo',
        title: 'محرك سيرفو',
        title_en: 'Servo Motor',
        description: 'تحكم في زاوية محرك السيرفو',
        difficulty: 'متوسط',
        embedId: '',
        tinkercadUrl: `${TINKERCAD_BASE}/circuits`,
    },
];

export default function RoboticsPage() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentProjectId, setCurrentProjectId] = useState('');
    const [embedError, setEmbedError] = useState(false);

    const currentProject = projects.find((p) => p.id === currentProjectId);

    // Build the embed URL if the project has an embedId
    const getEmbedUrl = (project: typeof projects[0]) => {
        if (!project.embedId) return null;
        return `${TINKERCAD_BASE}/embed/${project.embedId}?editbtn=1`;
    };

    const embedUrl = currentProject ? getEmbedUrl(currentProject) : null;

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
                            href={`${TINKERCAD_BASE}/circuits`}
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
                                        onClick={() => {
                                            setCurrentProjectId(project.id);
                                            setEmbedError(false);
                                        }}
                                        className={`w-full p-3 rounded-xl text-right transition-all ${currentProjectId === project.id
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

                {/* Tinkercad Content Area */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 relative bg-slate-900">
                        {/* Show embed if project has an embedId */}
                        {currentProject && embedUrl && !embedError ? (
                            <iframe
                                src={embedUrl}
                                className="w-full h-full border-0"
                                title={`Tinkercad - ${currentProject.title_en}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                onError={() => setEmbedError(true)}
                            />
                        ) : currentProject ? (
                            /* Fallback: no embed available or embed failed */
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center max-w-lg p-8">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent-500/20 to-blue-500/20 flex items-center justify-center">
                                        <span className="text-4xl">🔧</span>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">
                                        {currentProject.title}
                                    </h2>
                                    <p className="text-lg text-white/70 mb-1">
                                        {currentProject.title_en}
                                    </p>
                                    <p className="text-white/50 mb-6">
                                        {currentProject.description}
                                    </p>

                                    {embedError && (
                                        <div className="flex items-center gap-2 text-yellow-400/80 text-sm mb-4 justify-center">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span>لا يمكن تضمين المشروع مباشرة — يرجى فتحه في Tinkercad</span>
                                        </div>
                                    )}

                                    {!currentProject.embedId && (
                                        <div className="bg-white/5 rounded-xl p-4 mb-6 text-sm text-white/60 text-right leading-relaxed">
                                            <p className="mb-2">
                                                <strong className="text-white/80">💡 لتضمين هذا المشروع:</strong>
                                            </p>
                                            <ol className="list-decimal list-inside space-y-1">
                                                <li>افتح المشروع في Tinkercad</li>
                                                <li>اضغط على &quot;Share&quot; ← ثم انسخ رابط التضمين (Embed)</li>
                                                <li>أضف معرّف المشروع في الكود</li>
                                            </ol>
                                        </div>
                                    )}

                                    <a
                                        href={currentProject.tinkercadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                        فتح في Tinkercad
                                    </a>
                                </div>
                            </div>
                        ) : (
                            /* No project selected */
                            <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center">
                                <div className="text-center max-w-md p-8">
                                    <div className="text-6xl mb-4">🤖</div>
                                    <h2 className="text-2xl font-bold mb-4">مرحباً بك في معمل الروبوتات!</h2>
                                    <p className="text-white/60 mb-6">
                                        اختر مشروعاً من القائمة الجانبية للبدء، أو افتح Tinkercad مباشرة لإنشاء مشروع جديد.
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <button
                                            onClick={() => {
                                                setCurrentProjectId('blink');
                                                setEmbedError(false);
                                            }}
                                            className="btn-primary"
                                        >
                                            ابدأ أول مشروع
                                        </button>
                                        <a
                                            href={`${TINKERCAD_BASE}/circuits`}
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
