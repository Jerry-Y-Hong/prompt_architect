import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AppPhase = 'landing' | 'analyzing' | 'refining' | 'engineering' | 'completed';

interface AppState {
    phase: AppPhase;
    userInput: string;
    selectedTemplate: string | null;
    engineeredPrompt: string | null;
    architectureType: string;
    inputHistory: string[];
    setPhase: (phase: AppPhase) => void;
    setUserInput: (input: string) => void;
    setSelectedTemplate: (id: string | null) => void;
    setEngineeredPrompt: (prompt: string | null) => void;
    setArchitectureType: (type: string) => void;
    addToHistory: (input: string) => void;
    clearHistory: () => void;
    reset: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            phase: 'landing',
            userInput: '',
            selectedTemplate: null,
            engineeredPrompt: null,
            architectureType: 'default',
            inputHistory: [],
            setPhase: (phase) => set({ phase }),
            setUserInput: (userInput) => set({ userInput }),
            setSelectedTemplate: (id) => set({ selectedTemplate: id }),
            setEngineeredPrompt: (engineeredPrompt) => set({ engineeredPrompt }),
            setArchitectureType: (architectureType) => set({ architectureType }),
            addToHistory: (input) => set((state) => {
                const trimmed = input.trim();
                if (!trimmed) return state;
                // Add to start, unique values only, limit to 5 items
                const newHistory = [trimmed, ...state.inputHistory.filter(item => item !== trimmed)].slice(0, 5);
                return { inputHistory: newHistory };
            }),
            clearHistory: () => set({ inputHistory: [] }),
            reset: () => set({ phase: 'landing', userInput: '', selectedTemplate: null, engineeredPrompt: null, architectureType: 'default' }),
        }),
        {
            name: 'prompt-architect-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                userInput: state.userInput,
                inputHistory: state.inputHistory,
                architectureType: state.architectureType
            }),
        }
    )
);
