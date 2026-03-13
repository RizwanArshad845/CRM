import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Plus, Edit, Trash2, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { cls } from '../../styles/classes';
import { FOLLOW_UP_LEADS, PRODUCTS, SERVICE_AREAS, type FollowUpLead, type FollowUpStatus } from '../../data/mockData';

const STATUS_COLORS: Record<FollowUpStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    contacted: 'bg-blue-100 text-blue-800',
    closed: 'bg-green-100 text-green-800',
};

const EMPTY: Omit<FollowUpLead, 'id'> = {
    clientName: '', agentName: '', contactNo: '', product: '',
    area: '', status: 'pending', dueDate: '', notes: '',
};

export function FollowUpLeads() {
    const [leads, setLeads] = useState<FollowUpLead[]>(FOLLOW_UP_LEADS);
    const [isOpen, setIsOpen] = useState(false);
    const [editing, setEditing] = useState<FollowUpLead | null>(null);
    const [form, setForm] = useState<Omit<FollowUpLead, 'id'>>(EMPTY);

    const set = (k: keyof typeof EMPTY, v: string) => setForm(prev => ({ ...prev, [k]: v }));

    const openAdd = () => { setEditing(null); setForm(EMPTY); setIsOpen(true); };
    const openEdit = (l: FollowUpLead) => { setEditing(l); setForm(l); setIsOpen(true); };

    const handleSave = () => {
        if (!form.clientName || !form.dueDate) { toast.error('Client name and due date are required'); return; }
        if (editing) {
            setLeads(prev => prev.map(l => l.id === editing.id ? { ...form, id: editing.id } : l));
            toast.success('Follow-up updated!');
        } else {
            setLeads(prev => [...prev, { ...form, id: Date.now().toString() }]);
            toast.success('Follow-up added!');
        }
        setIsOpen(false);
    };

    const handleDelete = (id: string) => {
        if (!confirm('Delete this follow-up?')) return;
        setLeads(prev => prev.filter(l => l.id !== id));
        toast.success('Deleted!');
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
            </CardContent>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Follow-Up' : 'Add Follow-Up'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div className={cls.field}>
                            <Label>Client Name *</Label>
                            <Input value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="ABC Corp" />
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
                                <SelectContent>{PRODUCTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className={cls.field}>
                            <Label>Area</Label>
                            <Select value={form.area} onValueChange={v => set('area', v)}>
                                <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                                <SelectContent>{SERVICE_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
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
