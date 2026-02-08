import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Problem } from './api';

interface User {
    id: string;
    username: string;
    email: string;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface AppState {
    // Auth
    user: User | null;
    setUser: (user: User | null) => void;

    // UI
    showArabic: boolean;
    toggleArabic: () => void;

    // Chat
    problemSolvingChat: ChatMessage[];
    roboticsChat: ChatMessage[];
    addMessage: (track: 'problem_solving' | 'robotics', message: ChatMessage) => void;
    clearChat: (track: 'problem_solving' | 'robotics') => void;

    // Current context
    currentCode: string;
    setCurrentCode: (code: string) => void;

    // Generated problem (from AI)
    generatedProblem: Problem | null;
    setGeneratedProblem: (problem: Problem | null) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Auth
            user: null,
            setUser: (user) => set({ user }),

            // UI
            showArabic: true,
            toggleArabic: () => set((state) => ({ showArabic: !state.showArabic })),

            // Chat
            problemSolvingChat: [],
            roboticsChat: [],
            addMessage: (track, message) =>
                set((state) => ({
                    [track === 'problem_solving' ? 'problemSolvingChat' : 'roboticsChat']: [
                        ...state[track === 'problem_solving' ? 'problemSolvingChat' : 'roboticsChat'],
                        message,
                    ],
                })),
            clearChat: (track) =>
                set({
                    [track === 'problem_solving' ? 'problemSolvingChat' : 'roboticsChat']: [],
                }),

            // Current context
            currentCode: '',
            setCurrentCode: (code) => set({ currentCode: code }),

            // Generated problem
            generatedProblem: null,
            setGeneratedProblem: (problem) => set({ generatedProblem: problem }),
        }),
        {
            name: 'codebot-storage',
            partialize: (state) => ({
                user: state.user,
                showArabic: state.showArabic,
            }),
        }
    )
);

