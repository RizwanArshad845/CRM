import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { TrendingUp, Users, Target, ClipboardCheck, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DashboardHeader } from '../../components/shared/DashboardHeader';
import { cls } from '../../styles/classes';
import { AgentPerformance } from '../sales/AgentPerformance';
import { ManagerTaskBoard } from './ManagerTaskBoard';
import { useAgentTargets } from '../../context/AgentTargetContext';
import { useEmployees } from '../../context/EmployeeContext';
import { toast } from 'sonner';

function pctColor(pct: number) {
    if (pct >= 90) return 'text-green-600';
    if (pct >= 70) return 'text-yellow-600';
    return 'text-red-600';
}

function TargetsOverview() {
    const { targets, assignTarget } = useAgentTargets();
    const { employees, isLoading } = useEmployees();
    const [assignAgentId, setAssignAgentId] = useState<number>(0);
    const [assignAmount, setAssignAmount] = useState('');
    const [targetSearch, setTargetSearch] = useState('');

    // Case-insensitive role filter to avoid 'sales' vs 'Sales Agent' issues
    const salesAgents = employees.filter(e => {
        const roleName = String(e.role || '').toLowerCase().trim();
        return roleName === 'sales' || roleName === 'sales_manager' || roleName === 'sales agent' || roleName === 'sales manager';
    });

    const filteredTargets = targets.filter(t => !targetSearch || t.agentName.toLowerCase().includes(targetSearch.toLowerCase()));

    const handleAssign = () => {
        if (!assignAgentId || !assignAmount) { toast.error('Select an agent and enter a target amount'); return; }
        const agent = salesAgents.find(a => Number(a.id) === assignAgentId);
        assignTarget(agent?.name || 'Agent', assignAgentId, Number(assignAmount));
        toast.success(`Target of Rs ${Number(assignAmount).toLocaleString()} assigned to ${agent?.name}`);
        setAssignAgentId(0); setAssignAmount('');
    };

    if (isLoading) return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading team data...</div>;

    return (
        <div className={cls.page}>
            {/* Assign Target */}
            <Card>
                <CardHeader>
                    <CardTitle className={cls.inline}><Target className="h-5 w-5" />Assign Targets</CardTitle>
                    <CardDescription>Assign monthly revenue targets to sales agents</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 flex-wrap items-end">
                        <div className={`${cls.field} flex-1 min-w-[200px]`}>
                            <Label>Agent</Label>
                            <Select value={assignAgentId.toString()} onValueChange={v => setAssignAgentId(Number(v))}>
                                <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                                <SelectContent>
                                    {salesAgents.length > 0 ? (
                                        salesAgents.map(a => (
                                            <SelectItem key={a.id} value={a.id.toString()}>{a.name} — {a.role}</SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="0" disabled>No agents found</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className={`${cls.field} flex-1 min-w-[200px]`}>
                            <Label>Target Amount (Rs)</Label>
                            <Input type="number" placeholder="150000" value={assignAmount} onChange={e => setAssignAmount(e.target.value)} />
                        </div>
                        <Button onClick={handleAssign}><Target className="h-4 w-4 mr-2" />Assign Target</Button>
                    </div>
                </CardContent>
            </Card>

            {/* All agents target history */}
            <Card>
                <CardHeader>
                    <div className={cls.row}>
                        <div>
                            <CardTitle>All Agents — Target History</CardTitle>
                            <CardDescription>Monthly targets and achievement across the full team</CardDescription>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search agent..." value={targetSearch} onChange={e => setTargetSearch(e.target.value)} className="pl-9 h-9 text-sm w-[250px]" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    {['Agent', 'Month', 'Target', 'Achieved', '% Hit'].map(h => (
                                        <th key={h} className={cls.tableHead}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredTargets.length > 0 ? (
                                    filteredTargets.map((t, idx) => {
                                        const pct = t.target > 0 ? Math.round((t.achieved / t.target) * 100) : 0;
                                        return (
                                            <tr key={t.id || idx} className={cls.tableRow}>
                                                <td className={`${cls.tableCell} ${cls.heading}`}>{t.agentName}</td>
                                                <td className={cls.tableCell}>{t.month}</td>
                                                <td className={`${cls.tableCell} font-mono`}>Rs {t.target.toLocaleString()}</td>
                                                <td className={`${cls.tableCell} font-mono`}>{t.achieved > 0 ? `Rs ${t.achieved.toLocaleString()}` : <span className={cls.hint}>—</span>}</td>
                                                <td className={cls.tableCell}>
                                                    {t.achieved > 0
                                                        ? <span className={`font-bold ${pctColor(pct)}`}>{pct}%</span>
                                                        : <span className={cls.hint}>In progress</span>}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-muted-foreground">No target history found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function SalesManagerDashboard() {
    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader title="Sales Manager Portal" bgColor="bg-[#1a3a5c]" />
            <main className="container mx-auto px-4 py-8">
                <Tabs defaultValue="targets" className="w-full">
                    <TabsList className="mb-6 flex-wrap h-auto gap-1">
                        <TabsTrigger value="targets"><TrendingUp className="h-4 w-4 mr-2" />Targets & Assignment</TabsTrigger>
                        <TabsTrigger value="performance"><Users className="h-4 w-4 mr-2" />Agent Performance</TabsTrigger>
                        <TabsTrigger value="mytasks"><ClipboardCheck className="h-4 w-4 mr-2" />My Tasks</TabsTrigger>
                    </TabsList>
                    <TabsContent value="targets"><TargetsOverview /></TabsContent>
                    <TabsContent value="performance"><AgentPerformance /></TabsContent>
                    <TabsContent value="mytasks"><ManagerTaskBoard /></TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
