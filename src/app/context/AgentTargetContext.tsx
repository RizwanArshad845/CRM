import { createContext, useContext, useState, type ReactNode } from 'react';
import { AGENT_TARGETS, type AgentTarget } from '../data/mockData';

interface AgentTargetContextType {
    targets: AgentTarget[];
    assignTarget: (agentName: string, agentId: string, amount: number) => void;
    updateAchieved: (targetId: string, achieved: number) => void;
}

const AgentTargetContext = createContext<AgentTargetContextType | null>(null);

export function AgentTargetProvider({ children }: { children: ReactNode }) {
    const [targets, setTargets] = useState<AgentTarget[]>(AGENT_TARGETS);

    const assignTarget = (agentName: string, agentId: string, amount: number) => {
        const month = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
        setTargets(prev => {
            const exists = prev.find(t => t.agentName === agentName && t.month === month);
            if (exists) {
                return prev.map(t =>
                    t.agentName === agentName && t.month === month
                        ? { ...t, target: amount }
                        : t
                );
            }
            return [...prev, {
                id: String(Date.now()),
                agentId,
                agentName,
                month,
                target: amount,
                achieved: 0,
            }];
        });
    };

    const updateAchieved = (targetId: string, achieved: number) => {
        setTargets(prev => prev.map(t => t.id === targetId ? { ...t, achieved } : t));
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
