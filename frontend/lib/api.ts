import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Types
export interface Problem {
    id: number;
    topic: string;
    difficulty: string;
    title_en: string;
    title_ar?: string;
    desc_en: string;
    desc_ar?: string;
    constraints?: string;
    input_format?: string;
    output_format?: string;
    sample_io: Array<{ input: string; output: string; explanation?: string }>;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface GradeResponse {
    submission_id: string;
    status: string;
    is_correct: boolean;
    feedback_en: string;
    feedback_ar: string;
    hint?: string;
}

export interface ChatResponse {
    message: string;
    message_ar: string;
    code_snippet?: string;
    suggestions: string[];
}

// API functions
export const problemsApi = {
    list: async (topic?: string, difficulty?: string) => {
        const params = new URLSearchParams();
        if (topic) params.append('topic', topic);
        if (difficulty) params.append('difficulty', difficulty);
        const { data } = await api.get(`/problems?${params}`);
        return data;
    },
    get: async (id: number): Promise<Problem> => {
        const { data } = await api.get(`/problems/${id}`);
        return data;
    },
};

export const submissionsApi = {
    submit: async (
        problemId: number | null,
        code: string,
        problemDesc?: string,
        constraints?: string,
        sampleIo?: Array<{ input: string; output: string }>
    ): Promise<GradeResponse> => {
        const payload: any = { code };
        if (problemId && problemId < 1000000000000) { // Simple check if it's likely a DB ID or timestamp
            payload.problem_id = problemId;
        }

        if (problemDesc) payload.problem_description = problemDesc;
        if (constraints) payload.problem_constraints = constraints;
        if (sampleIo) payload.problem_sample_io = sampleIo;

        const { data } = await api.post('/submissions', payload);
        return data;
    },
    list: async (problemId?: number) => {
        const params = problemId ? `?problem_id=${problemId}` : '';
        const { data } = await api.get(`/submissions${params}`);
        return data;
    },
};

export const chatApi = {
    send: async (
        track: 'problem_solving' | 'robotics',
        message: string,
        problemId?: number,
        codeContext?: string
    ): Promise<ChatResponse> => {
        const { data } = await api.post('/chat', {
            track,
            message,
            problem_id: problemId,
            code_context: codeContext,
        });
        return data;
    },
    clearHistory: async (track: string) => {
        await api.delete(`/chat/history?track=${track}`);
    },
};

export const authApi = {
    register: async (username: string, email: string, password: string) => {
        const { data } = await api.post('/auth/register', {
            username,
            email,
            password,
        });
        return data;
    },
    login: async (email: string, password: string) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        const { data } = await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', data.access_token);
        }
        return data;
    },
    me: async () => {
        const { data } = await api.get('/auth/me');
        return data;
    },
    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
    },
};

export interface GenerateProblemRequest {
    topic?: string;
    difficulty?: string;
    custom_request?: string;
}

export const generateApi = {
    problem: async (request: GenerateProblemRequest = {}): Promise<Problem> => {
        const topic = request.topic || 'IO';
        const difficulty = request.difficulty || 'Easy';
        const { data } = await api.post('/generate/problem', {
            topic,
            difficulty,
            custom_request: request.custom_request,
        });
        // Map backend response to frontend Problem interface
        // Handle both old format (title/description/examples) and new format (title_en/desc_en/sample_io)
        const examples = data.examples || data.sample_io || [];
        const sampleIo = examples.map((ex: any) => ({
            input: ex.input || '',
            output: ex.output || '',
            explanation: ex.explanation || '',
        }));
        return {
            id: Date.now(),
            title_en: data.title_en || data.title || 'Untitled Problem',
            title_ar: data.title_ar || '',
            topic: data.topic || topic,
            difficulty: data.difficulty || difficulty,
            desc_en: data.desc_en || data.description || '',
            desc_ar: data.desc_ar || '',
            constraints: data.constraints || '',
            input_format: data.input_format || '',
            output_format: data.output_format || '',
            sample_io: sampleIo,
        };
    },
};

export default api;
