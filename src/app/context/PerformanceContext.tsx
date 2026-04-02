import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '../utils/api';

export interface SalesStat {
    id: number;
    name: string;
    role: string;
    monthly_revenue: number;
    target_revenue: number;
    deals_closed: number;
    calls_made: number;
    tasks_completed: number;
    tasks_missed: number;
    attendance_score: number;
    overall_score: number;
}

export interface CSTStat {
    id: number;
    name: string;
    role: string;
    clients_managed: number;
    satisfaction_score: number;
    tasks_completed: number;
    tasks_missed: number;
    attendance_score: number;
    overall_score: number;
}

export interface FinanceStat {
    id: number;
    name: string;
    role: string;
    payments_processed: number;
    tasks_completed: number;
    tasks_missed: number;
    attendance_score: number;
    overall_score: number;
}

export interface TaskDetail {
    id: number;
    employee_name: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
    status: 'completed' | 'in-progress' | 'missed' | 'pending';
    due_date: string;
    category: string;
}

export interface CompanyMetrics {
    total_revenue: number;
    revenue_target: number;
    active_clients: number;
    total_employees: number;
    client_retention: number;
    employee_satisfaction: number;
}

interface PerformanceContextType {
    stats: {
        sales: SalesStat[];
        cst: CSTStat[];
        finance: FinanceStat[];
        qa: any[];
    };
    taskDetails: TaskDetail[];
    companyMetrics: CompanyMetrics | null;
    isLoading: boolean;
    fetchStats: () => Promise<void>;
    fetchTaskDetails: () => Promise<void>;
    fetchCompanyMetrics: () => Promise<void>;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function PerformanceProvider({ children }: { children: ReactNode }) {
    const [stats, setStats] = useState<{ sales: SalesStat[]; cst: CSTStat[]; finance: FinanceStat[]; qa: any[] }>({
        sales: [],
        cst: [],
        finance: [],
        qa: []
    });
    const [taskDetails, setTaskDetails] = useState<TaskDetail[]>([]);
    const [companyMetrics, setCompanyMetrics] = useState<CompanyMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch('/admin/performance-stats');
            if (res.success) {
                setStats(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch performance stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTaskDetails = async () => {
        try {
            const res = await apiFetch('/admin/task-details');
            if (res.success) {
                setTaskDetails(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch task details:', error);
        }
    };

    const fetchCompanyMetrics = async () => {
        try {
            const res = await apiFetch('/admin/company-metrics');
            if (res.success) {
                setCompanyMetrics(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch company metrics:', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('crm_token');
        if (token) {
            fetchStats();
            fetchTaskDetails();
            fetchCompanyMetrics();
        } else {
            setIsLoading(false);
        }
    }, []);

    return (
        <PerformanceContext.Provider value={{ stats, taskDetails, companyMetrics, isLoading, fetchStats, fetchTaskDetails, fetchCompanyMetrics }}>
            {children}
        </PerformanceContext.Provider>
    );
}

export function usePerformance() {
    const context = useContext(PerformanceContext);
    if (!context) throw new Error('usePerformance must be used within PerformanceProvider');
    return context;
}
