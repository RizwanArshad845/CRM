import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Send, ShieldCheck, Users } from 'lucide-react';
import { toast } from 'sonner';
import { cls } from '../../styles/classes';
import { useManagerTasks, type TaskPriority } from '../../context/ManagerTaskContext';
import { useCSTManagerTasks, type CSTTaskPriority } from '../../context/CSTManagerTaskContext';

// ── Shared constants ──────────────────────────────────────────────────────────
const MGR_CATEGORIES = ['Management', 'Sales', 'Report', 'HR', 'Admin', 'Coaching', 'Strategy', 'Other'];
const CST_CATEGORIES = ['Management', 'Onboarding', 'Escalation', 'Client', 'Report', 'Admin', 'QA', 'Other'];

// ── Admin → Sales Manager task card ──────────────────────────────────────────
const EMPTY_MGR_TASK = { title: '', priority: 'medium' as TaskPriority, dueDate: '', category: 'Management', notes: '' };

function AssignToSalesManagerPanel() {
  const { addTask } = useManagerTasks();
  const [form, setForm] = useState(EMPTY_MGR_TASK);

  const set = <K extends keyof typeof EMPTY_MGR_TASK>(k: K, v: (typeof EMPTY_MGR_TASK)[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleAssign = () => {
    if (!form.title.trim() || !form.dueDate) {
      toast.error('Please fill in title and due date');
      return;
    }
    addTask({ ...form, status: 'pending', assignedBy: 'admin' });
    toast.success('Task assigned to Sales Manager!');
    setForm(EMPTY_MGR_TASK);
  };

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className={`${cls.inline} text-blue-700 dark:text-blue-400`}>
          <ShieldCheck className="h-5 w-5" />
          Assign Task to Sales Manager
        </CardTitle>
        <CardDescription>Add a task directly to the Sales Manager&apos;s board</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`${cls.field} sm:col-span-2`}>
            <Label>Task Title *</Label>
            <Input
              placeholder="e.g. Submit Q2 forecast"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </div>
          <div className={cls.field}>
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={v => set('priority', v as TaskPriority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={cls.field}>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={v => set('category', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MGR_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className={cls.field}>
            <Label>Due Date *</Label>
            <Input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          </div>
          <div className={`${cls.field} sm:col-span-2 lg:col-span-3`}>
            <Label>Notes</Label>
            <Textarea
              rows={2}
              placeholder="Instructions for the Sales Manager..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>
        </div>
        <Button className="mt-4" onClick={handleAssign}>
          <Send className="h-4 w-4 mr-2" />
          Assign to Sales Manager
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Admin → CST Manager task card ────────────────────────────────────────────
const EMPTY_CST_TASK = { title: '', priority: 'medium' as CSTTaskPriority, dueDate: '', category: 'Management', notes: '' };

function AssignToCSTManagerPanel() {
  const { addTask } = useCSTManagerTasks();
  const [form, setForm] = useState(EMPTY_CST_TASK);

  const set = <K extends keyof typeof EMPTY_CST_TASK>(k: K, v: (typeof EMPTY_CST_TASK)[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleAssign = () => {
    if (!form.title.trim() || !form.dueDate) {
      toast.error('Please fill in title and due date');
      return;
    }
    addTask({ ...form, status: 'pending', assignedBy: 'admin' });
    toast.success('Task assigned to CST Manager!');
    setForm(EMPTY_CST_TASK);
  };

  return (
    <Card className="border-2 border-emerald-200 dark:border-emerald-800">
      <CardHeader>
        <CardTitle className={`${cls.inline} text-emerald-700 dark:text-emerald-400`}>
          <Users className="h-5 w-5" />
          Assign Task to CST Manager
        </CardTitle>
        <CardDescription>Add a task directly to the CST Manager&apos;s board</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`${cls.field} sm:col-span-2`}>
            <Label>Task Title *</Label>
            <Input
              placeholder="e.g. Monthly client health audit"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </div>
          <div className={cls.field}>
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={v => set('priority', v as CSTTaskPriority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={cls.field}>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={v => set('category', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CST_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className={cls.field}>
            <Label>Due Date *</Label>
            <Input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          </div>
          <div className={`${cls.field} sm:col-span-2 lg:col-span-3`}>
            <Label>Notes</Label>
            <Textarea
              rows={2}
              placeholder="Instructions for the CST Manager..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>
        </div>
        <Button
          className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={handleAssign}
        >
          <Send className="h-4 w-4 mr-2" />
          Assign to CST Manager
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function TaskDelegation() {
  return (
    <div className={cls.page}>
      <AssignToSalesManagerPanel />
      <AssignToCSTManagerPanel />
    </div>
  );
}
