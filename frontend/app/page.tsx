'use client';

import { Code, Cpu, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
                {/* Background decorations */}
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse-soft" />
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-soft" />

                <div className="relative max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
                        <Sparkles className="w-4 h-4 text-accent-400" />
                        <span className="text-sm text-white/80">منصة تعليمية ذكية</span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
                        <span className="bg-gradient-to-r from-white via-primary-200 to-accent-200 bg-clip-text text-transparent">
                            تعلم البرمجة
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                            بطريقة ممتعة
                        </span>
                    </h1>

                    <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 animate-fade-in">
                        مع CodeBot Academy، ستتعلم أساسيات لغة C++ والروبوتات بمساعدة مدرس ذكي
                        يتحدث العربية ويشرح لك كل شيء بطريقة بسيطة وممتعة
                    </p>
                </div>
            </section>

            {/* Track Selection */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-4">اختر مسارك</h2>
                    <p className="text-white/60 text-center mb-12">ابدأ رحلتك التعليمية في المسار المناسب لك</p>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Problem Solving Track */}
                        <Link href="/problems" className="group">
                            <div className="card gradient-border h-full p-8 cursor-pointer hover:scale-[1.02] transition-all duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Code className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">حل المسائل</h3>
                                <p className="text-white/60 mb-6">
                                    تعلم أساسيات لغة C++ من خلال حل مسائل برمجية متدرجة الصعوبة.
                                    يشمل المسار: المتغيرات، الشروط، الحلقات، والمصفوفات.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm">C++</span>
                                    <span className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm">Variables</span>
                                    <span className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm">Loops</span>
                                    <span className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm">Arrays</span>
                                </div>
                                <div className="flex items-center text-primary-400 group-hover:gap-3 gap-2 transition-all">
                                    <span>ابدأ الآن</span>
                                    <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform" />
                                </div>
                            </div>
                        </Link>

                        {/* Robotics Track */}
                        <Link href="/robotics" className="group">
                            <div className="card gradient-border h-full p-8 cursor-pointer hover:scale-[1.02] transition-all duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Cpu className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">الروبوتات</h3>
                                <p className="text-white/60 mb-6">
                                    اكتشف عالم الإلكترونيات والروبوتات باستخدام Arduino وTinkercad.
                                    تعلم كيفية بناء دوائر كهربائية وبرمجتها.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-3 py-1 bg-accent-500/20 text-accent-300 rounded-full text-sm">Arduino</span>
                                    <span className="px-3 py-1 bg-accent-500/20 text-accent-300 rounded-full text-sm">LEDs</span>
                                    <span className="px-3 py-1 bg-accent-500/20 text-accent-300 rounded-full text-sm">Sensors</span>
                                    <span className="px-3 py-1 bg-accent-500/20 text-accent-300 rounded-full text-sm">Tinkercad</span>
                                </div>
                                <div className="flex items-center text-accent-400 group-hover:gap-3 gap-2 transition-all">
                                    <span>ابدأ الآن</span>
                                    <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="glass p-6 text-center">
                            <div className="text-4xl mb-4">🎯</div>
                            <h3 className="text-lg font-semibold mb-2">مسائل متدرجة</h3>
                            <p className="text-white/60 text-sm">مسائل مصممة خصيصاً للمبتدئين مع تدرج في الصعوبة</p>
                        </div>
                        <div className="glass p-6 text-center">
                            <div className="text-4xl mb-4">🤖</div>
                            <h3 className="text-lg font-semibold mb-2">مدرس ذكي</h3>
                            <p className="text-white/60 text-sm">مساعد ذكي يتحدث العربية ويشرح لك بطريقة بسيطة</p>
                        </div>
                        <div className="glass p-6 text-center">
                            <div className="text-4xl mb-4">⚡</div>
                            <h3 className="text-lg font-semibold mb-2">تقييم فوري</h3>
                            <p className="text-white/60 text-sm">احصل على تقييم فوري لكودك مع نصائح للتحسين</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-white/10">
                <div className="max-w-7xl mx-auto text-center text-white/40">
                    <p>© 2026 CodeBot Academy. جميع الحقوق محفوظة.</p>
                </div>
            </footer>
        </div>
    );
}
