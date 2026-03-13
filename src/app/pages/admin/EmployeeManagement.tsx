import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { UserPlus, Edit, Trash2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import type { Employee } from '../../types/crm';
import { cls } from '../../styles/classes';
import { DEPARTMENTS } from '../../data/mockData';
import { useEmployees } from '../../context/EmployeeContext';

type EmpForm = { name: string; email: string; department: string; role: string; baseSalary: string };
const EMPTY_EMP: EmpForm = { name: '', email: '', department: '', role: '', baseSalary: '' };

const FIELDS: { k: keyof EmpForm; label: string; placeholder: string; type?: string }[] = [
  { k: 'name', label: 'Full Name *', placeholder: 'John Doe' },
  { k: 'email', label: 'Email *', placeholder: 'john@nexuswave.com', type: 'email' },
  { k: 'role', label: 'Role *', placeholder: 'e.g. Sales Agent' },
  { k: 'baseSalary', label: 'Base Salary ($) *', placeholder: '5000', type: 'number' },
];

export function EmployeeManagement() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmpForm>(EMPTY_EMP);

  const setField = (k: keyof EmpForm, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleAdd = () => {
    const emp: Employee = {
      id: Date.now().toString(),
      name: form.name,
      employeeId: `EMP${String(employees.length + 1).padStart(3, '0')}`,
      email: form.email,
      department: form.department,
      role: form.role,
      isActive: true,
      baseSalary: Number(form.baseSalary),
      advancePayments: 0,
      accruedPayments: 0,
      totalSalary: Number(form.baseSalary),
      paymentStatus: 'pending',
      hireDate: new Date().toISOString().split('T')[0],
      tardies: 0,
    };
    addEmployee(emp);
    toast.success(`${form.name} added!`);
    setIsAddOpen(false);
    setForm(EMPTY_EMP);
  };

  const handleEdit = () => {
    if (!editTarget) return;
    updateEmployee({
      ...editTarget,
      name: form.name, email: form.email, department: form.department,
      role: form.role, baseSalary: Number(form.baseSalary),
      totalSalary: Number(form.baseSalary) + editTarget.accruedPayments - editTarget.advancePayments,
    });
    toast.success('Employee updated!');
    setIsEditOpen(false);
    setForm(EMPTY_EMP);
  };

  const openEdit = (emp: Employee) => {
    setEditTarget(emp);
    setForm({ name: emp.name, email: emp.email, department: emp.department, role: emp.role, baseSalary: String(emp.baseSalary) });
    setIsEditOpen(true);
  };

  const toggleStatus = (emp: Employee) => updateEmployee({ ...emp, isActive: !emp.isActive });

  function EmpFormFields({ prefix = '' }: { prefix?: string }) {
    return (
      <div className={cls.section}>
        {FIELDS.map(({ k, label, placeholder, type = 'text' }) => (
          <div key={k} className={cls.field}>
            <Label htmlFor={`${prefix}${k}`}>{label}</Label>
            <Input id={`${prefix}${k}`} type={type} placeholder={placeholder}
              value={form[k]} onChange={e => setField(k, e.target.value)} />
          </div>
        ))}
        <div className={cls.field}>
          <Label>Department *</Label>
          <Select value={form.department} onValueChange={v => setField('department', v)}>
            <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
            <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className={cls.row}>
          <div>
            <CardTitle>Employee Management</CardTitle>
            <CardDescription>Full CRUD for all employees — changes sync to Finance payroll</CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button><UserPlus className="h-4 w-4 mr-2" />Add Employee</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>Employee will be added to payroll automatically</DialogDescription>
              </DialogHeader>
              <EmpFormFields />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd}>Add Employee</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b-2">
              <tr>
                {['Employee', 'ID', 'Email', 'Department', 'Role', 'Status', 'Salary', 'Tardies', 'Actions'].map(h => (
                  <th key={h} className={cls.tableHead}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} className={cls.tableRow}>
                  <td className={`${cls.tableCell} ${cls.heading}`}>{emp.name}</td>
                  <td className={`${cls.tableCell} ${cls.mono}`}>{emp.employeeId}</td>
                  <td className={cls.tableCell}>
                    <div className={cls.inline}>
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{emp.email}</span>
                    </div>
                  </td>
                  <td className={cls.tableCell}>{emp.department}</td>
                  <td className={cls.tableCell}><span className="text-sm">{emp.role}</span></td>
                  <td className={cls.tableCell}>
                    <Badge variant={emp.isActive ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => toggleStatus(emp)}>
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className={`${cls.tableCell} ${cls.heading}`}>${emp.baseSalary.toLocaleString()}</td>
                  <td className={cls.tableCell}>
                    <Badge variant={emp.tardies === 0 ? 'outline' : 'destructive'}>{emp.tardies ?? 0}</Badge>
                  </td>
                  <td className={cls.tableCell}>
                    <div className={cls.iconRow}>
                      <Button variant="outline" size="sm" onClick={() => openEdit(emp)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => deleteEmployee(emp.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>Update employee information</DialogDescription>
            </DialogHeader>
            <EmpFormFields prefix="edit-" />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={handleEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
