import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiFetch } from '../utils/api';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

export interface AgentTarget {
    id: number;
    agentId: number;
    agentName: string;
    month: string;
    target: number;
    achieved: number;
}

interface AgentTargetContextType {
    targets: AgentTarget[];
    assignTarget: (agentName: string, agentId: number, amount: number) => void;
    updateAchieved: (targetId: number, achieved: number) => void;
}

const AgentTargetContext = createContext<AgentTargetContextType | null>(null);

export function AgentTargetProvider({ children }: { children: ReactNode }) {
    const [targets, setTargets] = useState<AgentTarget[]>([]);
    const { user } = useAuth();

    const fetchData = async () => {
        try {
            const [salesRes, cstRes] = await Promise.all([
                apiFetch('/sales-manager/targets'),
                apiFetch('/cst-manager/targets')
            ]);
            
            const formatMonth = (dateStr: string) => {
                const d = new Date(dateStr);
                return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            };

            let allTargets: AgentTarget[] = [];
            
            if (salesRes.success) {
                const salesMapped = salesRes.data.map((t: any) => ({
                    id: t.id,
                    agentId: Number(t.user_id),
                    agentName: t.agent_name || 'Sales Agent',
                    month: formatMonth(t.target_month),
                    target: Number(t.target_amount),
                    achieved: Number(t.achieved_amount) || 0
                }));
                allTargets = [...allTargets, ...salesMapped];
            }
            
            if (cstRes.success) {
                const cstMapped = cstRes.data.map((t: any) => ({
                    id: t.id,
                    agentId: Number(t.agent_id || t.user_id),
                    agentName: t.agent_name || 'CST Agent',
                    month: formatMonth(t.month || t.target_month),
                    target: Number(t.target_clients || t.target_amount),
                    achieved: Number(t.achievedClients || t.achieved_amount) || 0
                }));
                allTargets = [...allTargets, ...cstMapped];
            }
            
            setTargets(allTargets);
        } catch (error) {
            console.error('Failed to fetch targets:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const assignTarget = async (agentName: string, agentId: number, amount: number) => {
        const now = new Date();
        const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        
        try {
            const res = await apiFetch('/sales-manager/targets', {
                method: 'POST',
                body: JSON.stringify({
                    user_id: agentId,
                    assigned_by: user?.id,
                    target_month: monthStr,
                    target_amount: amount
                })
            });

            if (res.success) {
                fetchData();
                toast.success(`Target set for ${agentName}`);
            }
        } catch (error) {
            toast.error('Failed to assign target');
        }
    };

    const updateAchieved = async (targetId: number, achieved: number) => {
        try {
            const res = await apiFetch(`/sales-manager/targets/${targetId}/achieved`, {
                method: 'PATCH',
                body: JSON.stringify({ achieved })
            });
            if (res.success) {
                setTargets(prev => prev.map(t => t.id === targetId ? { ...t, achieved } : t));
                toast.success('Progress updated');
            }
        } catch (error) {
            toast.error('Failed to update progress');
        }
    };

    return (
        <AgentTargetContext.Provider value={{ targets, assignTarget, updateAchieved }}>
            {children}
        </AgentTargetContext.Provider>
    );
}

export function useAgentTargets() {
    const ctx = useContext(AgentTargetContext);
    if (!ctx) throw new Error('useAgentTargets must be used inside AgentTargetProvider');
    return ctx;
}
