import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { BookOpen, Plus } from 'lucide-react';
import { cls } from '../../styles/classes';
import { toast } from 'sonner';
import { useClientInbox, type ClientStrategy } from '../../context/ClientInboxContext';

export function StrategiesPanel() {
    const { inboxClients, strategies, updateStrategy } = useClientInbox();
    const assigned = inboxClients.filter(c => c.status === 'assigned' || c.status === 'reviewed');

    const [expanded, setExpanded] = useState<number | null>(null);
    const [drafts, setDrafts] = useState<Record<number, { overview: string; newStep: string }>>({});

    const getStrategy = (clientId: number): ClientStrategy =>
        strategies.find(s => s.clientId === clientId) ?? { clientId, overview: '', steps: [], updatedAt: '' };

    const getDraft = (id: number) => drafts[id] ?? { overview: getStrategy(id).overview, newStep: '' };
    const setDraft = (id: number, k: 'overview' | 'newStep', v: string) =>
        setDrafts(prev => ({ ...prev, [id]: { ...getDraft(id), [k]: v } }));

    const addStep = (clientId: number) => {
        const step = getDraft(clientId).newStep.trim();
        if (!step) return;
        const existing = getStrategy(clientId);
        updateStrategy({ ...existing, steps: [...existing.steps, step], updatedAt: new Date().toISOString().split('T')[0] });
        setDraft(clientId, 'newStep', '');
    };

    const saveOverview = (clientId: number) => {
        const existing = getStrategy(clientId);
        updateStrategy({ ...existing, overview: getDraft(clientId).overview, updatedAt: new Date().toISOString().split('T')[0] });
        toast.success('Strategy saved!');
    };

    return (
        <div className={cls.page}>
            <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-semibold">Client Strategies</h2>
                <Badge variant="outline">{assigned.length} clients</Badge>
            </div>

            {assigned.length === 0 ? (
                <p className={`${cls.hint} py-8 text-center`}>Assign clients first to define strategies.</p>
            ) : (
                assigned.map(client => {
                    const strat = getStrategy(client.id);
                    const isOpen = expanded === client.id;
                    const draft = getDraft(client.id);

                    return (
                        <Card key={client.id} className="border-2">
                            <CardHeader
                                className="cursor-pointer select-none pb-3"
                                onClick={() => setExpanded(isOpen ? null : client.id)}
                            >
                                <div className={cls.row}>
                                    <div className={cls.inline}>
                                        <BookOpen className="h-4 w-4 text-primary" />
                                        <div>
                                            <CardTitle className="text-base">{client.companyName}</CardTitle>
                                            <CardDescription>Agent: {client.assignedName} · {client.productSold}</CardDescription>
                                        </div>
                                    </div>
                                    <div className={cls.inline}>
                                        {strat.updatedAt && <span className={cls.hintXs}>Updated {strat.updatedAt}</span>}
                                        <Badge variant={strat.overview ? 'default' : 'outline'} className="text-xs">
                                            {strat.overview ? 'Strategy set' : 'No strategy'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>

                            {isOpen && (
                                <CardContent className={cls.section}>
                                    <div className={cls.field}>
                                        <Label>Strategy Overview</Label>
                                        <Textarea
                                            rows={3}
                                            placeholder="Describe the overall strategy for this client..."
                                            value={draft.overview}
                                            onChange={e => setDraft(client.id, 'overview', e.target.value)}
                                        />
                                        <Button size="sm" className="mt-2" onClick={() => saveOverview(client.id)}>
                                            Save Overview
                                        </Button>
                                    </div>

                                    <div className={cls.section}>
                                        <Label>Action Steps</Label>
                                        {strat.steps.length === 0 ? (
                                            <p className={`${cls.hintXs} py-2`}>No steps added yet.</p>
                                        ) : (
                                            <ol className={`${cls.list} list-decimal list-inside`}>
                                                {strat.steps.map((step, i) => (
                                                    <li key={i} className="text-sm py-1 border-b last:border-0">{step}</li>
                                                ))}
                                            </ol>
                                        )}
                                        <div className="flex gap-2 mt-2">
                                            <Input
                                                placeholder="Add a step..."
                                                value={draft.newStep}
                                                onChange={e => setDraft(client.id, 'newStep', e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && addStep(client.id)}
                                            />
                                            <Button size="sm" onClick={() => addStep(client.id)}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {(client.clientConcerns || client.tipsForTech) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {client.clientConcerns && (
                                                <div className={`${cls.muted} text-sm`}>
                                                    <p className={`${cls.hintXs} mb-1`}>Client Concerns (from Sales)</p>
                                                    <p>{client.clientConcerns}</p>
                                                </div>
                                            )}
                                            {client.tipsForTech && (
                                                <div className={`${cls.muted} bg-blue-50 text-sm`}>
                                                    <p className={`${cls.hintXs} mb-1`}>Tips for Tech (from Sales)</p>
                                                    <p>{client.tipsForTech}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    );
                })
            )}
        </div>
    );
}
