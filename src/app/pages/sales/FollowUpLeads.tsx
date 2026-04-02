import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Plus, Edit, Trash2, Phone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cls } from '../../styles/classes';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { PRODUCTS, SERVICE_AREAS } from '../../constants/crm';

type FollowUpStatus = 'pending' | 'contacted' | 'closed';

interface FollowUpLead {
    id: number;
    clientId: number;
    clientName: string;
    agentName: string;
    contactNo: string;
    product: string;
    area: string;
    status: FollowUpStatus;
    dueDate: string;
    notes: string;
}

const STATUS_COLORS: Record<FollowUpStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    contacted: 'bg-blue-100 text-blue-800',
    closed: 'bg-green-100 text-green-800',
};

const EMPTY: Omit<FollowUpLead, 'id'> = {
    clientId: 0, clientName: '', agentName: '', contactNo: '', product: '',
    area: '', status: 'pending', dueDate: '', notes: '',
};

export function FollowUpLeads() {
    const { user } = useAuth();
    const [leads, setLeads] = useState<FollowUpLead[]>([]);
    const [clients, setClients] = useState<{ id: number, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [editing, setEditing] = useState<FollowUpLead | null>(null);
    const [form, setForm] = useState<Omit<FollowUpLead, 'id'>>(EMPTY);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [leadsRes, clientsRes] = await Promise.all([
                apiFetch('/sales/follow-ups'),
                apiFetch('/clients')
            ]);

            if (leadsRes.success) {
                setLeads(leadsRes.data.map((l: any) => ({
                    id: Number(l.id),
                    clientId: Number(l.client_id) || 0,
                    clientName: l.client_name,
                    agentName: l.agent_name || 'System',
                    contactNo: l.contact_no,
                    product: l.product,
                    area: l.area,
                    status: l.status as FollowUpStatus,
                    dueDate: l.due_date?.split('T')[0] || '',
                    notes: l.notes
                })));
            }

            if (clientsRes.success) {
                setClients(clientsRes.data.map((c: any) => ({
                    id: Number(c.id),
                    name: c.name || c.company_name
                })));
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const set = (k: keyof typeof EMPTY, v: any) => setForm(prev => ({ ...prev, [k]: v }));

    const openAdd = () => { setEditing(null); setForm({ ...EMPTY, agentName: user?.first_name ? `${user.first_name} ${user.last_name || ''}` : '' }); setIsOpen(true); };
    const openEdit = (l: FollowUpLead) => { setEditing(l); setForm(l); setIsOpen(true); };

    const handleSave = async () => {
        if (!form.clientId || !form.dueDate) { toast.error('Client and due date are required'); return; }
        
        try {
            const method = editing ? 'PUT' : 'POST';
            const url = editing ? `/sales/follow-ups/${editing.id}` : '/sales/follow-ups';
            
            const res = await apiFetch(url, {
                method,
                body: JSON.stringify({
                    client_id: form.clientId,
                    user_id: user?.id,
                    due_date: form.dueDate,
                    notes: form.notes,
                    status: form.status,
                    product: form.product,
                    area: form.area
                })
            });

            if (res.success) {
                toast.success(editing ? 'Follow-up updated!' : 'Follow-up added!');
                fetchData();
                setIsOpen(false);
            }
        } catch (error) {
            toast.error('Failed to save follow-up');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this follow-up?')) return;
        try {
            const res = await apiFetch(`/sales/follow-ups/${id}`, { method: 'DELETE' });
            if (res.success) {
                toast.success('Deleted!');
                fetchData();
            }
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className={cls.row}>
                    <div>
                        <CardTitle>Follow-Up Leads</CardTitle>
                        <CardDescription>Track and manage client follow-ups</CardDescription>
                    </div>
                    <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Follow-Up</Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex flex-col items-center py-10 gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className={cls.hint}>Loading leads from Supabase...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    {['Client', 'Agent', 'Contact', 'Product', 'Area', 'Due Date', 'Status', 'Notes', 'Actions'].map(h => (
                                        <th key={h} className={cls.tableHead}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {leads.map(l => (
                                    <tr key={l.id} className={cls.tableRow}>
                                        <td className={`${cls.tableCell} ${cls.heading}`}>{l.clientName}</td>
                                        <td className={cls.tableCell}>{l.agentName}</td>
                                        <td className={cls.tableCell}>
                                            <div className={cls.inline}><Phone className="h-3 w-3 text-muted-foreground" /><span>{l.contactNo}</span></div>
                                        </td>
                                        <td className={cls.tableCell}>{l.product}</td>
                                        <td className={cls.tableCell}>{l.area}</td>
                                        <td className={`${cls.tableCell} ${cls.mono} text-xs`}>{l.dueDate}</td>
                                        <td className={cls.tableCell}>
                                            <Badge className={`${STATUS_COLORS[l.status]} border-0`}>{l.status}</Badge>
                                        </td>
                                        <td className={`${cls.tableCell} max-w-[160px] truncate`} title={l.notes}>{l.notes || '—'}</td>
                                        <td className={cls.tableCell}>
                                            <div className={cls.iconRow}>
                                                <Button variant="outline" size="sm" onClick={() => openEdit(l)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="outline" size="sm" onClick={() => handleDelete(l.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {leads.length === 0 && (
                                    <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">No follow-ups yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Follow-Up' : 'Add Follow-Up'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div className={cls.field}>
                            <Label>Select Client *</Label>
                            <Select value={form.clientId.toString()} onValueChange={v => set('clientId', Number(v))}>
                                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                                <SelectContent>
                                    {clients.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className={cls.field}>
                            <Label>Agent Name</Label>
                            <Input value={form.agentName} onChange={e => set('agentName', e.target.value)} placeholder="John Smith" />
                        </div>
                        <div className={cls.field}>
                            <Label>Contact No.</Label>
                            <Input value={form.contactNo} onChange={e => set('contactNo', e.target.value)} placeholder="+1 555-0000" />
                        </div>
                        <div className={cls.field}>
                            <Label>Due Date *</Label>
                            <Input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
                        </div>
                        <div className={cls.field}>
                            <Label>Product</Label>
                            <Select value={form.product} onValueChange={v => set('product', v)}>
                                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                                <SelectContent>{PRODUCTS.map((p: string) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className={cls.field}>
                            <Label>Area</Label>
                            <Select value={form.area} onValueChange={v => set('area', v)}>
                                <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                                <SelectContent>{SERVICE_AREAS.map((a: string) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className={cls.field}>
                            <Label>Status</Label>
                            <Select value={form.status} onValueChange={v => set('status', v as FollowUpStatus)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className={`${cls.field} col-span-2`}>
                            <Label>Notes</Label>
                            <Textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>{editing ? 'Save Changes' : 'Add Follow-Up'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
