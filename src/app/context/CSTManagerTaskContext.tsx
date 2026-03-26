import { createContext, useContext, useState, type ReactNode } from 'react';

export type CSTTaskPriority = 'high' | 'medium' | 'low';
export type CSTTaskStatus   = 'pending' | 'in-progress' | 'completed' | 'missed';
export type CSTTaskOrigin   = 'self' | 'admin';

export interface CSTManagerTask {
    id: string;
    title: string;
    priority: CSTTaskPriority;
    status: CSTTaskStatus;
    dueDate: string;
    category: string;
    notes: string;
    assignedBy: CSTTaskOrigin;
    month: string;
}

// ── Seed data ──────────────────────────────────────────────────────────────────
const SEED_CST_TASKS: CSTManagerTask[] = [
    { id: 'ct1', title: 'Monthly CST team performance review', priority: 'high', status: 'completed', dueDate: '2026-03-07', category: 'Management', notes: '', assignedBy: 'self', month: 'March 2026' },
    { id: 'ct2', title: 'Client onboarding checklist audit', priority: 'high', status: 'in-progress', dueDate: '2026-03-28', category: 'Onboarding', notes: '', assignedBy: 'self', month: 'March 2026' },
    { id: 'ct3', title: 'Escalation review for flagged clients', priority: 'medium', status: 'pending', dueDate: '2026-03-25', category: 'Escalation', notes: '', assignedBy: 'self', month: 'March 2026' },
    { id: 'ct4', title: 'Update CST process documentation', priority: 'low', status: 'missed', dueDate: '2026-03-15', category: 'Admin', notes: '', assignedBy: 'self', month: 'March 2026' },
    { id: 'ct5', title: 'Submit March client health report to admin', priority: 'high', status: 'completed', dueDate: '2026-03-10', category: 'Report', notes: 'Due by EOD', assignedBy: 'admin', month: 'March 2026' },
];

// ── Context ────────────────────────────────────────────────────────────────────
interface CSTManagerTaskContextType {
    tasks: CSTManagerTask[];
    addTask: (task: Omit<CSTManagerTask, 'id' | 'month'>) => void;
    updateTaskStatus: (id: string, status: CSTTaskStatus) => void;
}

const CSTManagerTaskContext = createContext<CSTManagerTaskContextType | null>(null);

export function CSTManagerTaskProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<CSTManagerTask[]>(SEED_CST_TASKS);

    const addTask = (task: Omit<CSTManagerTask, 'id' | 'month'>) => {
        const month = new Date(task.dueDate).toLocaleString('en-US', { month: 'long', year: 'numeric' });
        setTasks(prev => [...prev, { ...task, id: `ct${Date.now()}`, month }]);
    };

    const updateTaskStatus = (id: string, status: CSTTaskStatus) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    };

    return (
        <CSTManagerTaskContext.Provider value={{ tasks, addTask, updateTaskStatus }}>
            {children}
        </CSTManagerTaskContext.Provider>
    );
}

export function useCSTManagerTasks() {
    const ctx = useContext(CSTManagerTaskContext);
    if (!ctx) throw new Error('useCSTManagerTasks must be used inside CSTManagerTaskProvider');
    return ctx;
}
