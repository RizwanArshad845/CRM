import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiFetch } from '../utils/api';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface ManagedClient {
    id: number;
    name: string;
    healthScore: number;
    lastInteraction: string;
    nextCheckIn: string;
    assignedAgent: string;
    isActive: boolean;
    status: 'onboarding' | 'active' | 'flagged' | 'deactivated';
    flag_type?: 'red-flag' | 'yellow-flag' | 'black-flag';
    stage?: string;
    onboardingProgress?: number;
}

export interface DeactivationRequest {
    id: number;
    clientId: number;
    clientName: string;
    requestedBy: string;  // agent name
    requestedAt: string;  // ISO string
}

interface ClientContextType {
    clients: ManagedClient[];
    deactivationRequests: DeactivationRequest[];
    toggleActive: (id: number) => void;
    requestDeactivation: (clientId: number, clientName: string, agentName: string) => void;
    resolveDeactivationRequest: (requestId: number, approve: boolean, clientId: number) => void;
    flagClient: (id: number, type: string, reason: string) => Promise<void>;
    unflagClient: (id: number) => Promise<void>;
    fetchData: () => Promise<void>;
}

// ── Context ────────────────────────────────────────────────────────────────────
const ClientContext = createContext<ClientContextType | null>(null);

export function ClientProvider({ children }: { children: ReactNode }) {
    const [clients, setClients] = useState<ManagedClient[]>([]);
    const [deactivationRequests, setDeactivationRequests] = useState<DeactivationRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [clientsRes, requestsRes] = await Promise.all([
                apiFetch('/clients'),
                apiFetch('/clients/deactivation-requests')
            ]);

            if (clientsRes.success) {
                const mapped: ManagedClient[] = clientsRes.data.map((c: any) => ({
                    id: Number(c.id),
                    name: c.company_name,
                    healthScore: 85, // Placeholder
                    lastInteraction: c.updated_at?.split('T')[0] || 'N/A',
                    nextCheckIn: 'Next Week',
                    assignedAgent: c.assigned_name || 'Unassigned',
                    isActive: c.status !== 'deactivated',
                    status: c.status,
                    flag_type: c.flag_type,
                    stage: c.onboarding_stage || 'N/A',
                    onboardingProgress: c.onboarding_progress || 0
                }));
                setClients(mapped);
            }

            if (requestsRes.success) {
                const mapped = requestsRes.data.map((r: any) => ({
                    id: Number(r.id),
                    clientId: Number(r.client_id),
                    clientName: r.company_name,
                    requestedBy: r.requested_by,
                    requestedAt: r.created_at
                }));
                setDeactivationRequests(mapped);
            }
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleActive = async (id: number) => {
        const client = clients.find(c => c.id === id);
        if (!client) return;
        
        try {
            const res = await apiFetch(`/clients/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: client.isActive ? 'deactivated' : 'active' })
            });

            if (res.success) {
                setClients(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive, status: client.isActive ? 'deactivated' : 'active' } : c));
                toast.success(`Client ${client.isActive ? 'deactivated' : 'activated'}`);
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const requestDeactivation = async (clientId: number, clientName: string, agentName: string) => {
        try {
            const res = await apiFetch(`/cst/deactivation-requests`, {
                method: 'POST',
                body: JSON.stringify({ 
                    client_id: clientId, 
                    requested_by: agentName, 
                    reason: 'Requested by agent' 
                })
            });

            if (res.success) {
                // We'll refetch to get the ID from DB
                await fetchData();
                toast.success('Deactivation request sent to manager');
            }
        } catch (error) {
            toast.error('Failed to send request');
        }
    };

    const resolveDeactivationRequest = async (requestId: number, approve: boolean, clientId: number) => {
        try {
            const res = await apiFetch(`/cst-manager/deactivation-requests/${requestId}/resolve`, {
                method: 'PATCH',
                body: JSON.stringify({ 
                    status: approve ? 'approved' : 'rejected',
                    reviewed_by: 1 // Defaulting to admin review for now
                })
            });

            if (res.success) {
                if (approve) {
                    setClients(prev => prev.map(c => c.id === clientId ? { ...c, isActive: false, status: 'deactivated' } : c));
                }
                setDeactivationRequests(prev => prev.filter(r => r.id !== requestId));
                toast.success(`Request ${approve ? 'approved' : 'rejected'}`);
            }
        } catch (error) {
            console.error('Resolution error:', error);
            toast.error('Failed to resolve request');
        }
    };

    const flagClient = async (id: number, type: string, reason: string) => {
        try {
            const res = await apiFetch(`/clients/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'flagged', flag_type: type, reason })
            });

            if (res.success) {
                setClients(prev => prev.map(c => c.id === id ? { ...c, status: 'flagged', flag_type: type as any } : c));
                toast.success('Client flagged successfully');
            }
        } catch (error) {
            toast.error('Failed to flag client');
        }
    };

    const unflagClient = async (id: number) => {
        try {
            const res = await apiFetch(`/clients/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'active', flag_type: null })
            });

            if (res.success) {
                setClients(prev => prev.map(c => c.id === id ? { ...c, status: 'active', flag_type: undefined } : c));
                toast.success('Client flag resolved');
            }
        } catch (error) {
            toast.error('Failed to unflag client');
        }
    };

    return (
        <ClientContext.Provider value={{ clients, deactivationRequests, toggleActive, requestDeactivation, resolveDeactivationRequest, flagClient, unflagClient, fetchData }}>
            {children}
        </ClientContext.Provider>
    );
}

export function useClients() {
    const ctx = useContext(ClientContext);
    if (!ctx) throw new Error('useClients must be used inside ClientProvider');
    return ctx;
}
