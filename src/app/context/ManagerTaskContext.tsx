import { createContext, useContext, useState, type ReactNode } from 'react';

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus   = 'pending' | 'in-progress' | 'completed' | 'missed';
export type TaskOrigin   = 'self' | 'admin';

export interface ManagerTask {
    id: string;
    title: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string;
    category: string;
    notes: string;
    assignedBy: TaskOrigin;
    month: string; // "March 2026"
}

// ── Seed data ──────────────────────────────────────────────────────────────────
const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

const SEED_TASKS: ManagerTask[] = [
    { id: 'mt1', title: 'Weekly sales pipeline review', priority: 'high', status: 'completed', dueDate: '2026-03-07', category: 'Management', notes: '', assignedBy: 'self', month: 'March 2026' },
    { id: 'mt2', title: 'Q1 target report submission', priority: 'high', status: 'in-progress', dueDate: '2026-03-28', category: 'Report', notes: '', assignedBy: 'self', month: 'March 2026' },
    { id: 'mt3', title: 'Agent performance coaching session', priority: 'medium', status: 'pending', dueDate: '2026-03-25', category: 'HR', notes: '', assignedBy: 'self', month: 'March 2026' },
    { id: 'mt4', title: 'Update CRM lead statuses', priority: 'low', status: 'missed', dueDate: '2026-03-15', category: 'Admin', notes: '', assignedBy: 'self', month: 'March 2026' },
    { id: 'mt5', title: 'Submit March revenue forecast to admin', priority: 'high', status: 'completed', dueDate: '2026-03-10', category: 'Report', notes: 'Due by EOD', assignedBy: 'admin', month: 'March 2026' },
    { id: 'mt6', title: 'Conduct new hire sales orientation', priority: 'medium', status: 'pending', dueDate: '2026-03-27', category: 'HR', notes: 'Two new hires starting next week', assignedBy: 'admin', month: 'March 2026' },
];

// ── Context ────────────────────────────────────────────────────────────────────
interface ManagerTaskContextType {
    tasks: ManagerTask[];
    addTask: (task: Omit<ManagerTask, 'id' | 'month'>) => void;
    updateTaskStatus: (id: string, status: TaskStatus) => void;
}

const ManagerTaskContext = createContext<ManagerTaskContextType | null>(null);

export function ManagerTaskProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<ManagerTask[]>(SEED_TASKS);

    const addTask = (task: Omit<ManagerTask, 'id' | 'month'>) => {
        const month = new Date(task.dueDate).toLocaleString('en-US', { month: 'long', year: 'numeric' });
        setTasks(prev => [...prev, { ...task, id: `mt${Date.now()}`, month }]);
    };

    const updateTaskStatus = (id: string, status: TaskStatus) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    };

    return (
        <ManagerTaskContext.Provider value={{ tasks, addTask, updateTaskStatus }}>
            {children}
        </ManagerTaskContext.Provider>
    );
}

export function useManagerTasks() {
    const ctx = useContext(ManagerTaskContext);
    if (!ctx) throw new Error('useManagerTasks must be used inside ManagerTaskProvider');
    return ctx;
}
