import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Download, TrendingUp, Mic, Search, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { cls } from '../../styles/classes';
import { apiFetch } from '../../utils/api';
import { toast } from 'sonner';

// This interface mirrors exactly what the new getAgentPerformanceMetrics backend query returns
interface AgentPerformanceMetrics {
    agent_id: number;
    first_name: string;
    last_name: string;
    user_status: string;
    total_target: number;
    total_achieved: number;
    recording_count: number;
}

function formatCurrency(amount: number) {
    return `₨ ${(amount || 0).toLocaleString()}`;
}

function calcPercentage(achieved: number, target: number) {
    if (!target) return 0;
    return Math.round((achieved / target) * 100);
}

function percentageColor(pct: number) {
    if (pct >= 100) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (pct >= 75) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
}

export function AgentPerformance() {
    const [agents, setAgents] = useState<AgentPerformanceMetrics[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState('performance');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        console.log('Fetching performance metrics from: /sales-manager/agent-performance');
        try {
            const res = await apiFetch('/sales-manager/agent-performance');
            console.log('Performance metrics response received successfully:', res);
            if (res.success && Array.isArray(res.data)) {
                setAgents(res.data.map((a: any) => ({
                    ...a,
                    total_target: Number(a.total_target),
                    total_achieved: Number(a.total_achieved),
                    recording_count: Number(a.recording_count)
                })));
                console.log(`Loaded ${res.data.length} sales agents into state.`);
            } else {
                console.warn('Performance metrics data was missing or invalid:', res);
            }
        } catch (error) {
            console.error('Failed to fetch performance metrics:', error);
            toast.error('Failed to load performance metrics');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    let list = [...agents];
    if (filterStatus !== 'all') {
        const fs = filterStatus.toLowerCase();
        list = list.filter(a => (a.user_status || '').toLowerCase() === fs);
    }
    if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        list = list.filter(a => 
            a.first_name.toLowerCase().includes(q) || 
            a.last_name.toLowerCase().includes(q)
        );
    }
    
    if (sortBy === 'performance') list.sort((a, b) => calcPercentage(b.total_achieved, b.total_target) - calcPercentage(a.total_achieved, a.total_target));
    else if (sortBy === 'achieved') list.sort((a, b) => b.total_achieved - a.total_achieved);
    else if (sortBy === 'recordings') list.sort((a, b) => b.recording_count - a.recording_count);

    return (
        <div className={cls.page}>
            <Card>
                <CardHeader>
                    <div className={cls.row}>
                        <div>
                            <CardTitle>Sales Team Performance ({list.length} agents visible / {agents.length} total)</CardTitle>
                            <CardDescription>Automated performance tracking based on achieved goals and recording logs</CardDescription>
                        </div>
                        <div className={cls.actions}>
                            <Button variant="outline" size="sm" onClick={() => fetchData()}>
                                <TrendingUp className="h-4 w-4 mr-2" />Refresh Stats
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="relative mt-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search agents..." 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)} 
                                className="pl-10" 
                            />
                        </div>
                        <div className="flex-1">
                            <label className={`${cls.label} mb-2 block`}>Sort By</label>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="performance">Goal Completion %</SelectItem>
                                    <SelectItem value="achieved">Amount Achieved</SelectItem>
                                    <SelectItem value="recordings">Recordings Uploaded</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1">
                            <label className={`${cls.label} mb-2 block`}>Filter by Status</label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Agents</SelectItem>
                                    <SelectItem value="active">Active Only</SelectItem>
                                    <SelectItem value="deactivated">Deactivated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center py-20 gap-3">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className={cls.hint}>Syncing live metrics from Supabase...</p>
                        </div>
                    ) : list.length === 0 ? (
                        <div className="text-center py-20">
                            <p className={cls.hint}>No sales performance data found.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table view of dynamic stats */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b-2">
                                        <tr>
                                            {['Agent Name', 'Status', 'Total Targets', 'Total Achieved', 'Goal %', 'Recordings'].map(h => (
                                                <th key={h} className={cls.tableHead}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {list.map(agent => {
                                            const pct = calcPercentage(agent.total_achieved, agent.total_target);
                                            return (
                                                <tr key={agent.agent_id} className={cls.tableRow}>
                                                    <td className={cls.tableCell}>
                                                        <div className={cls.inline}>
                                                            <div className={cls.avatar}>
                                                                <span className={cls.avatarText}>{agent.first_name[0]}{agent.last_name[0]}</span>
                                                            </div>
                                                            <span className={cls.heading}>{agent.first_name} {agent.last_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className={cls.tableCell}>
                                                        <Badge variant={agent.user_status === 'active' ? 'default' : 'secondary'}>
                                                            {agent.user_status}
                                                        </Badge>
                                                    </td>
                                                    <td className={`${cls.tableCell} font-medium`}>{formatCurrency(agent.total_target)}</td>
                                                    <td className={cls.tableCell}>{formatCurrency(agent.total_achieved)}</td>
                                                    <td className={cls.tableCell}>
                                                        <div className={`px-2 py-1 rounded-md inline-flex font-bold text-sm items-center ${percentageColor(pct)}`}>
                                                            <TrendingUp className="w-3.5 h-3.5 mr-1" />
                                                            {pct}%
                                                        </div>
                                                    </td>
                                                    <td className={cls.tableCell}>
                                                        <div className={cls.inline}>
                                                            <Mic className="h-4 w-4 text-muted-foreground mr-1" />
                                                            <span className={cls.heading}>{agent.recording_count}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards View */}
                            <div className="lg:hidden space-y-4">
                                {list.map(agent => {
                                    const pct = calcPercentage(agent.total_achieved, agent.total_target);
                                    return (
                                        <Card key={agent.agent_id}>
                                            <CardHeader className="pb-2">
                                                <div className={cls.row}>
                                                    <div className={cls.inline}>
                                                        <div className={cls.avatar}>
                                                            <span className={cls.avatarText}>{agent.first_name[0]}{agent.last_name[0]}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className={cls.heading}>{agent.first_name} {agent.last_name}</h4>
                                                            <Badge variant={agent.user_status === 'active' ? 'default' : 'secondary'}>{agent.user_status}</Badge>
                                                        </div>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded-md font-bold text-sm ${percentageColor(pct)}`}>
                                                        {pct}%
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-2">
                                                <div className={cls.grid2}>
                                                    <div>
                                                        <p className={`${cls.hint} mb-1`}>Targets</p>
                                                        <p className={cls.heading}>{formatCurrency(agent.total_target)}</p>
                                                    </div>
                                                    <div>
                                                        <p className={`${cls.hint} mb-1`}>Achieved</p>
                                                        <p className={cls.heading}>{formatCurrency(agent.total_achieved)}</p>
                                                    </div>
                                                    <div className="col-span-2 mt-2">
                                                        <div className={cls.inline}>
                                                            <Mic className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm font-medium">{agent.recording_count} uploads logged</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
