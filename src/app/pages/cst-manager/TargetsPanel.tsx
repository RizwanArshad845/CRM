import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Progress } from '../../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Target, Pencil, Clock } from 'lucide-react';
import { cls } from '../../styles/classes';
import { toast } from 'sonner';
import { useClientInbox } from '../../context/ClientInboxContext';
import { useEmployees } from '../../context/EmployeeContext';

function targetPct(achieved: number, target: number) {
    if (target === 0) return 0;
    return Math.round((achieved / target) * 100);
}

function pctColor(pct: number) {
    if (pct >= 80) return 'text-emerald-600';
    if (pct >= 60) return 'text-yellow-600';
    return 'text-red-600';
}

export function TargetsPanel() {
    const { targets, upsertTarget } = useClientInbox();
    const { employees } = useEmployees();
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const [agentId, setAgentId] = useState<number | null>(null);
    const [targetClients, setTargetClients] = useState('');

    const cstAgents = employees.filter(e => e.role === 'cst' || e.role === 'cst_manager');

    const handleSet = () => {
        if (!agentId || !targetClients) { toast.error('Select an agent and enter a target'); return; }
        const agent = cstAgents.find(a => a.id === agentId);
        upsertTarget(agentId, agent?.name ?? '', currentMonth, Number(targetClients));
        toast.success(`Target set for ${agent?.name} — ${currentMonth}`);
        setAgentId(null);
        setTargetClients('');
    };

    const currentTargets = targets.filter(t => t.month === currentMonth);

    return (
        <div className={cls.page}>
            <Card>
                <CardHeader>
                    <CardTitle className={cls.inline}>
                        <Target className="h-5 w-5" />Set Monthly Target
                    </CardTitle>
                    <CardDescription>Assign client onboarding targets to CST agents for {currentMonth}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 flex-wrap items-end">
                        <div className={`${cls.field} flex-1 min-w-[200px]`}>
                            <Label>CST Agent</Label>
                            <Select value={agentId !== null ? String(agentId) : ''} onValueChange={v => setAgentId(Number(v))}>
                                <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                                <SelectContent>
                                    {cstAgents.map(a => (
                                        <SelectItem key={a.id} value={String(a.id)}>{a.name} — {a.role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className={`${cls.field} flex-1 min-w-[160px]`}>
                            <Label>Target (# Clients)</Label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="e.g. 12"
                                value={targetClients}
                                onChange={e => setTargetClients(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleSet}>
                            <Pencil className="h-4 w-4 mr-2" />Set Target
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className={cls.inline}>
                        <Clock className="h-5 w-5" />{currentMonth} — Performance vs Target
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {currentTargets.length === 0 ? (
                        <p className={`${cls.hint} py-6 text-center`}>No targets set for {currentMonth} yet.</p>
                    ) : (
                        <div className={cls.section}>
                            {currentTargets.map(t => {
                                const pct = targetPct(t.achievedClients, t.targetClients);
                                return (
                                    <div key={t.id} className={cls.item}>
                                        <div className={`${cls.row} mb-3`}>
                                            <div>
                                                <p className={cls.heading}>{t.agentName}</p>
                                                <p className={cls.hintXs}>{t.month}</p>
                                            </div>
                                            <span className={`text-2xl font-bold ${pctColor(pct)}`}>{pct}%</span>
                                        </div>
                                        <Progress value={pct} className="h-2 mb-3" />
                                        <div className="grid grid-cols-3 gap-4 text-center text-sm">
                                            <div className={cls.muted}>
                                                <p className={cls.hintXs}>Target</p>
                                                <p className="font-bold text-lg">{t.targetClients}</p>
                                            </div>
                                            <div className={`${cls.muted} bg-emerald-50`}>
                                                <p className={cls.hintXs}>Achieved</p>
                                                <p className="font-bold text-lg text-emerald-600">{t.achievedClients}</p>
                                            </div>
                                            <div className={`${cls.muted} bg-orange-50`}>
                                                <p className={cls.hintXs}>Remaining</p>
                                                <p className="font-bold text-lg text-orange-500">
                                                    {Math.max(0, t.targetClients - t.achievedClients)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
