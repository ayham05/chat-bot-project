import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'CodeBot Academy - تعلم البرمجة',
    description: 'منصة تعليمية لتعلم أساسيات البرمجة والروبوتات للطلاب',
    keywords: ['programming', 'robotics', 'C++', 'Arduino', 'education', 'تعليم', 'برمجة'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className="min-h-screen">
                <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <a href="/" className="flex items-center space-x-3 space-x-reverse">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                    <span className="text-xl">🤖</span>
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                                    CodeBot Academy
                                </span>
                            </a>
                            <div className="flex items-center space-x-4 space-x-reverse">
                                <a href="/problems" className="text-white/70 hover:text-white transition-colors">
                                    المسائل
                                </a>
                                <a href="/robotics" className="text-white/70 hover:text-white transition-colors">
                                    الروبوتات
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>
                <main className="pt-16">
                    {children}
                </main>
            </body>
        </html>
    );
}
