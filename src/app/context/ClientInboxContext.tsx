import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiFetch } from '../utils/api';
import { toast } from 'sonner';
import { useClients } from './ClientContext';

// ── Types ──────────────────────────────────────────────────────────────────────
export type InboxStatus = 'onboarding' | 'active' | 'flagged' | 'deactivated';

export interface InboxClient {
    id: number;
    companyName: string;
    customerName: string;
    paymentAmount: string;
    productSold: string;
    email: string;
    serviceArea: string;
    contactNo1: string;
    contactNo2: string;
    clientConcerns: string;
    tipsForTech: string;
    notes: string;
    submittedBy: string;
    submittedDate: string;
    status: InboxStatus;
    assignedTo?: number;   // agentId
    assignedName?: string; // agent display name
}

export interface ClientStrategy {
    clientId: number;
    strategyText: string;
    createdAt: string;
}

export interface CSTAgentTarget {
    id: number;
    agentId: number;
    agentName: string;
    month: string;
    targetClients: number;
    achievedClients: number;
}

// ── Mapping Helpers ───────────────────────────────────────────────────────────
function mapBackendToClient(b: any): InboxClient {
    return {
        id: b.id,
        companyName: b.company_name,
        customerName: b.customer_name,
        paymentAmount: b.payment_amount?.toString() || '0',
        productSold: b.product_sold,
        email: b.email,
        serviceArea: b.service_area,
        contactNo1: b.contact_no1,
        contactNo2: b.contact_no2,
        clientConcerns: b.client_concerns,
        tipsForTech: b.tips_for_tech,
        notes: b.notes,
        submittedBy: b.submitted_by_name || 'System',
        submittedDate: b.created_at?.split('T')[0] || '',
        status: b.status as InboxStatus,
        assignedTo: b.cst_agent_id,
        assignedName: b.assigned_name
    };
}

function mapBackendToStrategy(b: any): ClientStrategy {
    return {
        clientId: b.client_id,
        strategyText: b.strategy_text || '',
        createdAt: b.created_at || b.updated_at
    };
}

function mapBackendToTarget(b: any): CSTAgentTarget {
    return {
        id: b.id,
        agentId: b.agent_id,
        agentName: b.agent_name,
        month: b.target_month,
        targetClients: b.target_clients,
        achievedClients: b.achievedClients || 0
    };
}

// ── Context ────────────────────────────────────────────────────────────────────
interface ClientInboxContextType {
    inboxClients: InboxClient[];
    strategies: ClientStrategy[];
    targets: CSTAgentTarget[];
    assignClient: (clientId: number, agentId: number, agentName: string) => void;
    unassignClient: (clientId: number) => void;
    updateStrategy: (clientId: number, strategyText: string) => void;
    deleteStrategy: (clientId: number) => void;
    upsertTarget: (agentId: number, agentName: string, month: string, targetClients: number) => void;
}

const ClientInboxContext = createContext<ClientInboxContextType | null>(null);

export function ClientInboxProvider({ children }: { children: ReactNode }) {
    const [inboxClients, setInboxClients] = useState<InboxClient[]>([]);
    const [strategies, setStrategies] = useState<ClientStrategy[]>([]);
    const [targets, setTargets] = useState<CSTAgentTarget[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { fetchData: fetchActiveClients } = useClients();

    const fetchData = async () => {
        try {
            const [clientsRes, strategiesRes, targetsRes] = await Promise.all([
                apiFetch('/clients'),
                apiFetch('/cst-manager/strategies'),
                apiFetch('/cst-manager/targets')
            ]);

            if (clientsRes.success) setInboxClients(clientsRes.data.map(mapBackendToClient));
            if (strategiesRes.success) setStrategies(strategiesRes.data.map(mapBackendToStrategy));
            if (targetsRes.success) setTargets(targetsRes.data.map(mapBackendToTarget));
        } catch (error) {
            console.error('Failed to fetch inbox data:', error);
            toast.error('Could not load live data from server');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const assignClient = async (clientId: number, agentId: number, agentName: string) => {
        try {
            const res = await apiFetch(`/clients/${clientId}/assign`, {
                method: 'PATCH',
                body: JSON.stringify({ agentId })
            });

            if (res.success) {
                setInboxClients(prev =>
                    prev.map(c => c.id === clientId
                        ? { ...c, status: 'active', assignedTo: agentId, assignedName: agentName }
                        : c)
                );
                // Refresh both the inbox and the active clients list
                await Promise.all([fetchData(), fetchActiveClients()]); 
                toast.success(`Assigned to ${agentName}`);
            }
        } catch (error) {
            toast.error('Assignment failed');
        }
    };

    const unassignClient = async (clientId: number) => {
        try {
            const res = await apiFetch(`/clients/${clientId}/unassign`, {
                method: 'PATCH'
            });

            if (res.success) {
                setInboxClients(prev =>
                    prev.map(c => c.id === clientId
                        ? { ...c, status: 'onboarding' as InboxStatus, assignedTo: undefined, assignedName: undefined }
                        : c)
                );
                toast.success('Client unassigned');
            }
        } catch (error) {
            toast.error('Failed to unassign client');
        }
    };

    const updateStrategy = async (clientId: number, strategyText: string) => {
        try {
            const res = await apiFetch('/cst-manager/strategies', {
                method: 'POST',
                body: JSON.stringify({
                    client_id: clientId,
                    strategy_text: strategyText
                })
            });

            if (res.success) {
                fetchData(); // Refresh strategies
                toast.success('Strategy saved');
            }
        } catch (error) {
            toast.error('Failed to save strategy');
        }
    };

    const deleteStrategy = async (clientId: number) => {
        try {
            const res = await apiFetch(`/cst-manager/strategies/${clientId}`, {
                method: 'DELETE'
            });

            if (res.success) {
                setStrategies(prev => prev.filter(s => s.clientId !== clientId));
                toast.success('Strategy deleted');
            }
        } catch (error) {
            toast.error('Failed to delete strategy');
        }
    };

    const upsertTarget = async (agentId: number, agentName: string, month: string, targetClients: number) => {
        try {
            const res = await apiFetch('/cst-manager/targets', {
                method: 'POST',
                body: JSON.stringify({
                    agent_id: agentId,
                    target_month: month,
                    target_clients: targetClients
                })
            });

            if (res.success) {
                fetchData(); // Refresh to get active/achieved counts
                toast.success('Target updated');
            }
        } catch (error) {
            toast.error('Failed to update target');
        }
    };

    return (
        <ClientInboxContext.Provider value={{
            inboxClients, strategies, targets,
            assignClient, unassignClient, updateStrategy, deleteStrategy, upsertTarget,
        }}>
            {children}
        </ClientInboxContext.Provider>
    );
}

export function useClientInbox() {
    const ctx = useContext(ClientInboxContext);
    if (!ctx) throw new Error('useClientInbox must be used inside ClientInboxProvider');
    return ctx;
}
