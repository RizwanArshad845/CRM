import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────
export type InboxStatus = 'pending' | 'assigned' | 'reviewed';

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
    overview: string;
    steps: string[];
    updatedAt: string;
}

export interface CSTAgentTarget {
    id: number;
    agentId: number;
    agentName: string;
    month: string;
    targetClients: number;
    achievedClients: number;
}

// ── Seed data ──────────────────────────────────────────────────────────────────
const SEED_CLIENTS: InboxClient[] = [
    {
        id: 101, companyName: 'Bright Media Inc', customerName: 'James Turner',
        paymentAmount: '6500', productSold: 'SEO Services', email: 'james@brightmedia.com',
        serviceArea: 'North America', contactNo1: '+1 555-1001', contactNo2: '',
        clientConcerns: 'Wants monthly ranking reports', tipsForTech: 'Focus on local SEO',
        notes: 'Very engaged client', submittedBy: 'John Smith',
        submittedDate: '2026-03-20', status: 'pending',
    },
    {
        id: 102, companyName: 'Nova Digital Ltd', customerName: 'Priya Sharma',
        paymentAmount: '9200', productSold: 'Web Development', email: 'priya@novadigital.com',
        serviceArea: 'Europe', contactNo1: '+44 20-4567', contactNo2: '+44 20-7890',
        clientConcerns: 'Needs full redesign', tipsForTech: 'Has existing WordPress site',
        notes: 'High priority', submittedBy: 'Sarah Johnson',
        submittedDate: '2026-03-21', status: 'pending',
    },
    {
        id: 103, companyName: 'PeakAds Agency', customerName: 'Carlos Mendez',
        paymentAmount: '4800', productSold: 'Google Ads', email: 'carlos@peakads.com',
        serviceArea: 'Latin America', contactNo1: '+52 55-3412', contactNo2: '',
        clientConcerns: 'Low conversion rate', tipsForTech: 'Budget is $500/month ad spend',
        notes: '', submittedBy: 'John Smith',
        submittedDate: '2026-03-22', status: 'assigned',
        assignedTo: 2, assignedName: 'Mike Chen',
    },
];

const SEED_STRATEGIES: ClientStrategy[] = [
    {
        clientId: 103,
        overview: 'Focus on Google Shopping campaigns and remarketing.',
        steps: ['Set up conversion tracking', 'Launch Shopping campaign', 'Review after 2 weeks'],
        updatedAt: '2026-03-22',
    },
];

const SEED_TARGETS: CSTAgentTarget[] = [
    { id: 1, agentId: 1, agentName: 'Emily Davis', month: 'March 2026', targetClients: 12, achievedClients: 9 },
    { id: 2, agentId: 2, agentName: 'Mike Chen', month: 'March 2026', targetClients: 10, achievedClients: 7 },
    { id: 3, agentId: 3, agentName: 'Lisa Johnson', month: 'March 2026', targetClients: 8, achievedClients: 8 },
];

const SEED_IDS = new Set([101, 102, 103]);
const LS_KEY = 'crm_client_inbox';

function loadFromStorage(): InboxClient[] {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? (JSON.parse(raw) as InboxClient[]) : [];
    } catch { return []; }
}

function saveToStorage(clients: InboxClient[]) {
    // Only persist clients submitted by sales (not the seeds)
    const salesSubmitted = clients.filter(c => !SEED_IDS.has(c.id));
    localStorage.setItem(LS_KEY, JSON.stringify(salesSubmitted));
}

// ── Context ────────────────────────────────────────────────────────────────────
interface ClientInboxContextType {
    inboxClients: InboxClient[];
    strategies: ClientStrategy[];
    targets: CSTAgentTarget[];
    addInboxClient: (client: Omit<InboxClient, 'id' | 'submittedDate' | 'status'>) => void;
    assignClient: (clientId: number, agentId: number, agentName: string) => void;
    unassignClient: (clientId: number) => void;
    updateStrategy: (strategy: ClientStrategy) => void;
    upsertTarget: (agentId: number, agentName: string, month: string, targetClients: number) => void;
}

const ClientInboxContext = createContext<ClientInboxContextType | null>(null);

export function ClientInboxProvider({ children }: { children: ReactNode }) {
    const [inboxClients, setInboxClients] = useState<InboxClient[]>(() => {
        const stored = loadFromStorage();
        const storedIds = new Set(stored.map(c => c.id));
        return [...SEED_CLIENTS, ...stored.filter(c => !SEED_IDS.has(c.id) && !storedIds.has(c.id))];
    });
    const [strategies, setStrategies] = useState<ClientStrategy[]>(SEED_STRATEGIES);
    const [targets, setTargets] = useState<CSTAgentTarget[]>(SEED_TARGETS);

    useEffect(() => { saveToStorage(inboxClients); }, [inboxClients]);

    const addInboxClient = (client: Omit<InboxClient, 'id' | 'submittedDate' | 'status'>) => {
        const newClient: InboxClient = {
            ...client,
            id: Date.now(),
            submittedDate: new Date().toISOString().split('T')[0],
            status: 'pending',
        };
        setInboxClients(prev => [...prev, newClient]);
    };

    const assignClient = (clientId: number, agentId: number, agentName: string) => {
        setInboxClients(prev =>
            prev.map(c => c.id === clientId
                ? { ...c, status: 'assigned', assignedTo: agentId, assignedName: agentName }
                : c)
        );
    };

    const unassignClient = (clientId: number) => {
        setInboxClients(prev =>
            prev.map(c => c.id === clientId
                ? { ...c, status: 'pending' as InboxStatus, assignedTo: undefined, assignedName: undefined }
                : c)
        );
    };

    const updateStrategy = (strategy: ClientStrategy) => {
        setStrategies(prev => {
            const exists = prev.find(s => s.clientId === strategy.clientId);
            return exists
                ? prev.map(s => s.clientId === strategy.clientId ? strategy : s)
                : [...prev, strategy];
        });
    };

    const upsertTarget = (agentId: number, agentName: string, month: string, targetClients: number) => {
        setTargets(prev => {
            const exists = prev.find(t => t.agentId === agentId && t.month === month);
            if (exists) {
                return prev.map(t => t.agentId === agentId && t.month === month
                    ? { ...t, targetClients } : t);
            }
            return [...prev, {
                id: Date.now(), agentId, agentName, month, targetClients, achievedClients: 0,
            }];
        });
    };

    return (
        <ClientInboxContext.Provider value={{
            inboxClients, strategies, targets,
            addInboxClient, assignClient, unassignClient, updateStrategy, upsertTarget,
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
