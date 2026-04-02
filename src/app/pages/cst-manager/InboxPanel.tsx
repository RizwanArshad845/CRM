import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { UserCheck, CheckCircle2, Search } from 'lucide-react';
import { cls } from '../../styles/classes';
import { toast } from 'sonner';
import { useClientInbox, type InboxClient } from '../../context/ClientInboxContext';
import { useEmployees } from '../../context/EmployeeContext';

function statusBadge(status: InboxClient['status']) {
    if (status === 'onboarding') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (status === 'active') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'flagged') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
}

export function InboxPanel() {
    const { inboxClients, assignClient } = useClientInbox();
    const { employees } = useEmployees();
    const [search, setSearch] = useState('');
    
    // Filter for onboarding status (pending review)
    const pending = inboxClients.filter(c => c.status === 'onboarding')
        .filter(c => !search || c.companyName.toLowerCase().includes(search.toLowerCase()) || c.customerName.toLowerCase().includes(search.toLowerCase()));

    const cstAgents = employees.filter(e => e.role === 'cst' || e.role === 'cst_manager');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selected, setSelected] = useState<InboxClient | null>(null);
    const [agentId, setAgentId] = useState<number | null>(null);

    const openAssign = (client: InboxClient) => {
        setSelected(client);
        setAgentId(null);
        setDialogOpen(true);
    };

    const handleAssign = () => {
        if (!agentId || !selected) { toast.error('Please select an agent'); return; }
        const agent = cstAgents.find(a => a.id === agentId);
        assignClient(selected.id, agentId, agent?.name ?? '');
        toast.success(`${selected.companyName} assigned to ${agent?.name}!`);
        setDialogOpen(false);
        setSelected(null);
    };

    return (
        <div className={cls.page}>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-lg font-semibold">Pending Client Submissions</h2>
                <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200">
                    {pending.length} pending
                </Badge>
                <div className="relative ml-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search pending..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm w-[250px]" />
                </div>
            </div>

            {pending.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center py-12 gap-3 text-muted-foreground">
                        <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                        <p className="font-medium">All clients have been reviewed!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pending.map(client => (
                        <Card key={client.id} className="border-2 hover:border-primary/40 transition-colors">
                            <CardHeader className="pb-3">
                                <div className={cls.row}>
                                    <div>
                                        <CardTitle className="text-base">{client.companyName}</CardTitle>
                                        <CardDescription>{client.customerName}</CardDescription>
                                    </div>
                                    <Badge className={`border text-xs ${statusBadge(client.status)}`}>
                                        {client.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className={cls.list}>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><p className={cls.hintXs}>Product</p><p className={cls.heading}>{client.productSold}</p></div>
                                    <div><p className={cls.hintXs}>Payment</p><p className={cls.heading}>${Number(client.paymentAmount || 0).toLocaleString()}</p></div>
                                    <div><p className={cls.hintXs}>Area</p><p className={cls.heading}>{client.serviceArea}</p></div>
                                    <div><p className={cls.hintXs}>Submitted By</p><p className={cls.heading}>{client.submittedBy}</p></div>
                                    <div><p className={cls.hintXs}>Contact</p><p className={cls.heading}>{client.contactNo1}</p></div>
                                    <div><p className={cls.hintXs}>Date</p><p className={cls.heading}>{client.submittedDate}</p></div>
                                </div>
                                {client.clientConcerns && (
                                    <div className={cls.muted}>
                                        <p className={cls.hintXs}>Client Concerns</p>
                                        <p className="text-sm mt-1">{client.clientConcerns}</p>
                                    </div>
                                )}
                                {client.tipsForTech && (
                                    <div className={`${cls.muted} bg-blue-50`}>
                                        <p className={cls.hintXs}>Tips for Tech</p>
                                        <p className="text-sm mt-1">{client.tipsForTech}</p>
                                    </div>
                                )}
                                <Button className="w-full" onClick={() => openAssign(client)}>
                                    <UserCheck className="h-4 w-4 mr-2" />Assign to CST Agent
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign Client to CST Agent</DialogTitle>
                        <DialogDescription>
                            {selected && `Assign ${selected.companyName} (${selected.customerName}) to a team member`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className={cls.section}>
                        {selected && (
                            <div className={cls.muted}>
                                <p className={cls.label}>{selected.companyName}</p>
                                <p className={cls.hintXs}>Product: {selected.productSold} · Payment: ${Number(selected.paymentAmount || 0).toLocaleString()}</p>
                            </div>
                        )}
                        <div className={cls.field}>
                            <Label>Select CST Agent *</Label>
                            <Select value={agentId !== null ? String(agentId) : ''} onValueChange={v => setAgentId(Number(v))}>
                                <SelectTrigger><SelectValue placeholder="Choose an agent" /></SelectTrigger>
                                <SelectContent>
                                    {cstAgents.map(a => (
                                        <SelectItem key={a.id} value={String(a.id)}>
                                            {a.name} — {a.role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAssign}><UserCheck className="h-4 w-4 mr-2" />Assign</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
