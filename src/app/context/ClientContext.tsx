import { createContext, useContext, useState, type ReactNode } from 'react';
import { ACTIVE_CLIENTS } from '../data/mockData';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface ManagedClient {
    id: string;
    name: string;
    healthScore: number;
    lastInteraction: string;
    nextCheckIn: string;
    assignedAgent: string;
    isActive: boolean;
}

export interface DeactivationRequest {
    clientId: string;
    clientName: string;
    requestedBy: string;  // agent name
    requestedAt: string;  // ISO string
}

interface ClientContextType {
    clients: ManagedClient[];
    deactivationRequests: DeactivationRequest[];
    toggleActive: (id: string) => void;
    requestDeactivation: (clientId: string, clientName: string, agentName: string) => void;
    resolveDeactivationRequest: (clientId: string, approve: boolean) => void;
}

// ── Context ────────────────────────────────────────────────────────────────────
const ClientContext = createContext<ClientContextType | null>(null);

export function ClientProvider({ children }: { children: ReactNode }) {
    const [clients, setClients] = useState<ManagedClient[]>(
        ACTIVE_CLIENTS.map(c => ({ ...c, isActive: true }))
    );
    const [deactivationRequests, setDeactivationRequests] = useState<DeactivationRequest[]>([]);

    const toggleActive = (id: string) => {
        setClients(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
    };

    const requestDeactivation = (clientId: string, clientName: string, agentName: string) => {
        // Prevent duplicate requests for same client
        setDeactivationRequests(prev => {
            if (prev.some(r => r.clientId === clientId)) return prev;
            return [...prev, { clientId, clientName, requestedBy: agentName, requestedAt: new Date().toISOString() }];
        });
    };

    const resolveDeactivationRequest = (clientId: string, approve: boolean) => {
        if (approve) {
            setClients(prev => prev.map(c => c.id === clientId ? { ...c, isActive: false } : c));
        }
        setDeactivationRequests(prev => prev.filter(r => r.clientId !== clientId));
    };

    return (
        <ClientContext.Provider value={{ clients, deactivationRequests, toggleActive, requestDeactivation, resolveDeactivationRequest }}>
            {children}
        </ClientContext.Provider>
    );
}

export function useClients() {
    const ctx = useContext(ClientContext);
    if (!ctx) throw new Error('useClients must be used inside ClientProvider');
    return ctx;
}
