import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { DollarSign, Download, Calculator, TrendingUp, TrendingDown, Edit } from 'lucide-react';
import { toast } from 'sonner';
import type { Employee } from '../../types/crm';
import { DashboardHeader } from '../../components/shared/DashboardHeader';
import { StatCard } from '../../components/shared/StatCard';
import { cls } from '../../styles/classes';
import { useEmployees } from '../../context/EmployeeContext';

type PaymentStatus = 'paid' | 'pending' | 'partial';

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  partial: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
};

const CALC_FIELDS: { k: string; label: string; placeholder: string }[] = [
  { k: 'base', label: 'Base Salary', placeholder: '5000' },
  { k: 'bonus', label: 'Bonuses', placeholder: '500' },
  { k: 'deductions', label: 'Deductions', placeholder: '200' },
  { k: 'advances', label: 'Advances', placeholder: '300' },
];

const PKR = (n: number) => `₨ ${n.toLocaleString()}`;

const EDIT_FIELDS: { k: 'baseSalary' | 'advancePayments' | 'accruedPayments'; label: string }[] = [
  { k: 'baseSalary', label: 'Base Salary (PKR) *' },
  { k: 'advancePayments', label: 'Advance Payments (PKR)' },
  { k: 'accruedPayments', label: 'Accrued Payments (PKR)' },
];

const EXPENSES = [
  { id: '1', category: 'Office Rent', amount: 150000, date: '2026-03-01', status: 'paid' as const },
  { id: '2', category: 'Utilities', amount: 25000, date: '2026-03-05', status: 'paid' as const },
  { id: '3', category: 'Software Licences', amount: 45000, date: '2026-03-08', status: 'pending' as const },
  { id: '4', category: 'Marketing Budget', amount: 80000, date: '2026-03-10', status: 'pending' as const },
  { id: '5', category: 'Equipment', amount: 60000, date: '2026-03-12', status: 'paid' as const },
];

type EditForm = { baseSalary: string; advancePayments: string; accruedPayments: string; paymentStatus: PaymentStatus };
const EMPTY_EDIT: EditForm = { baseSalary: '', advancePayments: '', accruedPayments: '', paymentStatus: 'pending' };

export function FinanceDashboard() {
  const { employees, updateEmployee } = useEmployees();
  const [filterDept, setFilterDept] = useState('all');
  const [showCalc, setShowCalc] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_EDIT);
  const [calc, setCalc] = useState({ base: '', bonus: '', deductions: '', advances: '' });

  const active = employees.filter(e => e.isActive);
  const displayed = filterDept === 'all' ? employees : employees.filter(e => e.department.toLowerCase() === filterDept);
  const totalSalaries = active.reduce((s, e) => s + e.totalSalary, 0);
  const totalAdvances = active.reduce((s, e) => s + e.advancePayments, 0);
  const calcTotal = Number(calc.base || 0) + Number(calc.bonus || 0) - Number(calc.deductions || 0) - Number(calc.advances || 0);

  const openEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setEditForm({ baseSalary: String(emp.baseSalary), advancePayments: String(emp.advancePayments), accruedPayments: String(emp.accruedPayments), paymentStatus: emp.paymentStatus });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingEmp) return;
    updateEmployee({
      ...editingEmp,
      baseSalary: Number(editForm.baseSalary),
      advancePayments: Number(editForm.advancePayments),
      accruedPayments: Number(editForm.accruedPayments),
      totalSalary: Number(editForm.baseSalary) + Number(editForm.accruedPayments) - Number(editForm.advancePayments),
      paymentStatus: editForm.paymentStatus,
    });
    toast.success('Salary updated!');
    setIsEditOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Finance Team Portal" bgColor="bg-[#2C3E50]" />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className={cls.gridResponsive4}>
          <StatCard icon={<DollarSign className="h-4 w-4 text-purple-500" />} title="Total Salaries" value={PKR(totalSalaries)} subtitle={`${active.length} active employees`} />
          <StatCard icon={<TrendingDown className="h-4 w-4 text-orange-500" />} title="Advance Payments" value={PKR(totalAdvances)} subtitle="Paid in advance" valueClassName="text-orange-600" />
          <StatCard icon={<TrendingUp className="h-4 w-4 text-green-500" />} title="Total Incoming" value="₨ 2,450,000" subtitle="Revenue this month" valueClassName="text-green-600" />
          <StatCard icon={<Calculator className="h-4 w-4 text-blue-500" />} title="Monthly Expenses" value={PKR(totalSalaries + 360000)} subtitle="Total outgoing" valueClassName="text-blue-600" />
        </div>

        <Card>
          <CardHeader>
            <div className={cls.row}>
              <div>
                <CardTitle>Auto Salary Calculator</CardTitle>
                <CardDescription>Calculate salary with bonuses and deductions</CardDescription>
              </div>
              <Button onClick={() => setShowCalc(v => !v)}>
                <Calculator className="h-4 w-4 mr-2" />{showCalc ? 'Hide' : 'Show'} Calculator
              </Button>
            </div>
          </CardHeader>
          {showCalc && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {CALC_FIELDS.map(({ k, label, placeholder }) => (
                  <div key={k} className={cls.field}>
                    <Label>{label}</Label>
                    <Input type="number" placeholder={placeholder}
                      value={calc[k as keyof typeof calc]}
                      onChange={e => setCalc(prev => ({ ...prev, [k]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className={`mt-4 ${cls.mutedLg}`}>
                <p className={cls.hint}>Total Calculated</p>
                <p className="text-3xl font-bold">₨ {calcTotal.toLocaleString()}</p>
              </div>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div className={cls.row}>
              <div>
                <CardTitle>Employee Salary Management</CardTitle>
                <CardDescription>Payroll syncs automatically with Admin employee additions</CardDescription>
              </div>
              <div className={cls.actions}>
                <Select value={filterDept} onValueChange={setFilterDept}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {['sales', 'cst', 'finance', 'qa'].map(d => <SelectItem key={d} value={d}>{d.toUpperCase()}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b-2">
                  <tr>
                    {['Employee', 'ID', 'Dept', 'Status', 'Base', 'Advances', 'Accrued', 'Total', 'Payment', 'Actions'].map(h => (
                      <th key={h} className={cls.tableHead}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(emp => (
                    <tr key={emp.id} className={cls.tableRow}>
                      <td className={`${cls.tableCell} ${cls.heading}`}>{emp.name}</td>
                      <td className={`${cls.tableCell} ${cls.mono}`}>{emp.employeeId}</td>
                      <td className={cls.tableCell}>{emp.department}</td>
                      <td className={cls.tableCell}>
                        <Badge variant={emp.isActive ? 'default' : 'secondary'}>{emp.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className={cls.tableCell}>{PKR(emp.baseSalary)}</td>
                      <td className={`${cls.tableCell} text-orange-600`}>{PKR(emp.advancePayments)}</td>
                      <td className={`${cls.tableCell} text-green-600`}>{PKR(emp.accruedPayments)}</td>
                      <td className={`${cls.tableCell} ${cls.heading}`}>{PKR(emp.totalSalary)}</td>
                      <td className={cls.tableCell}>
                        <Badge className={PAYMENT_COLORS[emp.paymentStatus]}>{emp.paymentStatus}</Badge>
                      </td>
                      <td className={cls.tableCell}>
                        <div className={cls.iconRow}>
                          <Button variant="outline" size="sm" onClick={() => openEdit(emp)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="outline" size="sm" onClick={() => toast.success('Salary slip generated!')}>Slip</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
            <CardDescription>Operational expenses for the current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b-2">
                  <tr>
                    {['Category', 'Amount (PKR)', 'Date', 'Status'].map(h => (
                      <th key={h} className={cls.tableHead}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {EXPENSES.map(exp => (
                    <tr key={exp.id} className={cls.tableRow}>
                      <td className={`${cls.tableCell} ${cls.heading}`}>{exp.category}</td>
                      <td className={`${cls.tableCell} font-mono`}>{PKR(exp.amount)}</td>
                      <td className={`${cls.tableCell} ${cls.mono} text-xs`}>{exp.date}</td>
                      <td className={cls.tableCell}>
                        <Badge className={exp.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {exp.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 font-semibold">
                    <td className={`${cls.tableCell} ${cls.heading}`}>Total</td>
                    <td className={`${cls.tableCell} font-mono`}>{PKR(EXPENSES.reduce((s, e) => s + e.amount, 0))}</td>
                    <td colSpan={2} />
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Salary</DialogTitle>
              <DialogDescription>{editingEmp && `Update salary for ${editingEmp.name}`}</DialogDescription>
            </DialogHeader>
            <div className={cls.section}>
              {EDIT_FIELDS.map(({ k, label }) => (
                <div key={k} className={cls.field}>
                  <Label>{label}</Label>
                  <Input type="number" value={editForm[k]}
                    onChange={e => setEditForm(prev => ({ ...prev, [k]: e.target.value }))} />
                </div>
              ))}
              <div className={cls.field}>
                <Label>Payment Status *</Label>
                <Select value={editForm.paymentStatus} onValueChange={(v: PaymentStatus) => setEditForm(prev => ({ ...prev, paymentStatus: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className={cls.muted}>
                <p className={cls.hint}>Total Salary</p>
                <p className={cls.metric}>{PKR(Number(editForm.baseSalary) + Number(editForm.accruedPayments) - Number(editForm.advancePayments))}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
