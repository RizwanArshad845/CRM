import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { UserPlus, Send } from 'lucide-react';
import { toast } from 'sonner';
import { cls } from '../../styles/classes';
import { CST_MEMBERS, SALES_LEADS } from '../../data/mockData';

type Lead = typeof SALES_LEADS[0];
const EMPTY_FORM = { leadId: '', assignedTo: '', priority: 'medium', dueDate: '', notes: '' };

const LEAD_DETAIL_KEYS: { label: string; key: keyof Lead }[] = [
  { label: 'Payment', key: 'paymentAmount' },
  { label: 'Product', key: 'productSold' },
  { label: 'Area', key: 'serviceArea' },
  { label: 'Contact', key: 'contactNo1' },
  { label: 'Submitted By', key: 'submittedBy' },
];

export function TaskDelegation() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const set = (k: keyof typeof EMPTY_FORM, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleAssign = () => {
    if (!form.assignedTo || !form.dueDate) { toast.error('Please fill all required fields'); return; }
    const member = CST_MEMBERS.find(m => m.id === form.assignedTo);
    toast.success(`Task assigned to ${member?.name}!`);
    setIsOpen(false);
    setSelectedLead(null);
    setForm(EMPTY_FORM);
  };

  const openDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setForm({ ...EMPTY_FORM, leadId: lead.id });
    setIsOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Delegation to CST Team</CardTitle>
        <CardDescription>Assign new leads from Sales to CST members</CardDescription>
      </CardHeader>
      <CardContent className={cls.page}>
        {/* CST Workload */}
        <div>
          <h3 className={`${cls.heading} mb-3`}>CST Team Workload</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CST_MEMBERS.map(m => (
              <div key={m.id} className={cls.item}>
                <h4 className={cls.heading}>{m.name}</h4>
                <p className={cls.hint}>{m.role}</p>
                <div className="mt-2">
                  <Badge variant={m.currentTasks > 7 ? 'destructive' : 'outline'}>{m.currentTasks} active tasks</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Leads */}
        <div>
          <h3 className={`${cls.heading} mb-3`}>Pending Sales Leads</h3>
          <div className={cls.list}>
            {SALES_LEADS.map(lead => (
              <Card key={lead.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className={cls.row}>
                    <div>
                      <h4 className={cls.heading}>{lead.companyName}</h4>
                      <p className={cls.hint}>Contact: {lead.customerName}</p>
                    </div>
                    <Badge variant="outline">{lead.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className={cls.list}>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {LEAD_DETAIL_KEYS.map(({ label, key }) => (
                      <div key={label}>
                        <p className={cls.hint}>{label}</p>
                        <p className={cls.heading}>
                          {key === 'paymentAmount' ? `$${(lead[key] as number).toLocaleString()}` : String(lead[key])}
                        </p>
                      </div>
                    ))}
                    <div>
                      <p className={cls.hint}>Date</p>
                      <p className={cls.heading}>{new Date(lead.submittedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => openDialog(lead)}>
                    <UserPlus className="h-4 w-4 mr-2" />Assign to CST Member
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Assignment Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Task to CST Member</DialogTitle>
              <DialogDescription>{selectedLead && `Assign ${selectedLead.companyName} to a CST team member`}</DialogDescription>
            </DialogHeader>
            {selectedLead && (
              <div className={cls.section}>
                <div className={cls.muted}>
                  <p className={cls.label}>{selectedLead.companyName}</p>
                  <p className={cls.hintXs}>Contact: {selectedLead.customerName}</p>
                  <p className={cls.hintXs}>Product: {selectedLead.productSold}</p>
                </div>
                <div className={cls.field}>
                  <Label>Assign To *</Label>
                  <Select value={form.assignedTo} onValueChange={v => set('assignedTo', v)}>
                    <SelectTrigger><SelectValue placeholder="Select CST member" /></SelectTrigger>
                    <SelectContent>
                      {CST_MEMBERS.map(m => <SelectItem key={m.id} value={m.id}>{m.name} ({m.currentTasks} tasks)</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className={cls.field}>
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => set('priority', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className={cls.field}>
                  <Label>Due Date *</Label>
                  <Input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
                </div>
                <div className={cls.field}>
                  <Label>Additional Notes</Label>
                  <Textarea rows={3} placeholder="Special instructions..." value={form.notes} onChange={e => set('notes', e.target.value)} />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleAssign}><Send className="h-4 w-4 mr-2" />Assign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
