import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { DollarSign, Download, Calculator, TrendingUp, TrendingDown, Edit, Search, Plus, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { Employee } from '../../types/crm';
import { DashboardHeader } from '../../components/shared/DashboardHeader';
import { StatCard } from '../../components/shared/StatCard';
import { cls } from '../../styles/classes';
import { useEmployees } from '../../context/EmployeeContext';
import { useFinance, Expense as FinanceExpense } from '../../context/FinanceContext';
import { apiFetch } from '../../utils/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ==========================================
// Types — aligned with backend DB schema
// ==========================================

// payrolls.status can be 'pending' | 'processed' | 'paid'
// Frontend maps 'processed' → 'partial' for display, keeps 'pending'/'paid' as-is
type PaymentStatus = 'paid' | 'pending' | 'partial';
type ExpenseStatus = 'paid' | 'pending';

type Expense = {
  id: number;
  category: string;
  amount: number;
  expense_date: string;
  status: ExpenseStatus;
};

// Shape returned by GET /finance/salary-slip/:id (generateSalarySlip)
type SalarySlip = {
  id: number;
  employeeName: string;
  employeeId: string;
  email: string;
  department: string;
  role: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  baseSalary: number;
  advancePayments: number;
  accruedPayments: number;
  totalSalary: number;
  paymentStatus: PaymentStatus;
  processedAt: string;
};

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

type EditForm = { baseSalary: string; advancePayments: string; accruedPayments: string; paymentStatus: PaymentStatus };
const EMPTY_EDIT: EditForm = { baseSalary: '', advancePayments: '', accruedPayments: '', paymentStatus: 'pending' };

/** Helper: get current pay period start/end (matches backend updateEmployeeSalary logic) */
const getCurrentPayPeriod = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};

export function FinanceDashboard() {
  const { payrolls, expenses, isLoading, addExpense, updateExpense, deleteExpense, updatePayroll } = useFinance();
  const [filterDept, setFilterDept] = useState('all');
  const [showCalc, setShowCalc] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_EDIT);
  const [calc, setCalc] = useState({ base: '', bonus: '', deductions: '', advances: '' });
  const [employeeSearch, setEmployeeSearch] = useState('');

  // Salary Slip State
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [currentSlip, setCurrentSlip] = useState<SalarySlip | null>(null);

  // Expense State
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [expenseForm, setExpenseForm] = useState({ category: '', amount: '', expense_date: '', status: 'pending' as any });

  const active = payrolls; // Backend returns active employees primarily or handles it
  const displayed = (filterDept === 'all' ? payrolls : payrolls.filter(e => e.department.toLowerCase() === filterDept))
    .filter(e => !employeeSearch || e.name.toLowerCase().includes(employeeSearch.toLowerCase()) || e.employee_id.toLowerCase().includes(employeeSearch.toLowerCase()));

  const totalSalaries = payrolls.reduce((s, e) => s + (e.total_salary || 0), 0);
  const totalAdvances = payrolls.reduce((s, e) => s + (e.advance_payments || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const calcTotal = Number(calc.base || 0) + Number(calc.bonus || 0) - Number(calc.deductions || 0) - Number(calc.advances || 0);

  // ==========================================
  // Salary Edit — maps to PATCH /finance/salary/:id (updateEmployeeSalary)
  // ==========================================

  const openEdit = (emp: any) => {
    // Standardize ID from multiple sources (table row or slip object)
    const userId = Number(emp.id || emp.user_id || (typeof emp === 'object' && emp.id));
    if (!userId) {
        console.error('No employee ID found for editing', emp);
        toast.error('Could not identify employee record');
        return;
    }
    
    setEditingEmp({ ...emp, id: userId });
    setEditForm({
      baseSalary: String(emp.baseSalary ?? emp.base_salary ?? 0),
      advancePayments: String(emp.advancePayments ?? emp.advance_payments ?? 0),
      accruedPayments: String(emp.accruedPayments ?? emp.accrued_payments ?? 0),
      paymentStatus: (emp.paymentStatus ?? emp.payment_status ?? 'pending') as PaymentStatus,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingEmp) return;

    await updatePayroll(editingEmp.id, {
      base_salary: Number(editForm.baseSalary),
      advance_payments: Number(editForm.advancePayments),
      accrued_payments: Number(editForm.accruedPayments),
      payment_status: editForm.paymentStatus
    });

    setIsEditOpen(false);
  };

  const handleDownloadPDF = async () => {
    const original = document.getElementById('salary-slip-content');
    if (!original) return;

    // Create a clone to strip unsupported colors
    const clone = original.cloneNode(true) as HTMLElement;
    clone.style.position = 'fixed';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    document.body.appendChild(clone);

    // Helper to convert computed oklab/oklch to RGB if needed
    const fixColors = (el: HTMLElement) => {
        const style = window.getComputedStyle(el);
        // Force basic colors for capture
        el.style.color = style.color;
        el.style.backgroundColor = style.backgroundColor;
        el.style.borderColor = style.borderColor;
        
        // Remove any problematic var-based colors if they contain oklch/oklab
        if (style.backgroundColor.includes('okl') || style.color.includes('okl')) {
            el.style.backgroundColor = '#ffffff';
            el.style.color = '#252525';
        }
        
        for (let i = 0; i < el.children.length; i++) {
            fixColors(el.children[i] as HTMLElement);
        }
    };
    fixColors(clone);

    try {
        const canvas = await html2canvas(clone, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: 'a4'
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Salary_Slip_${currentSlip?.employeeName.replace(/\s+/g, '_')}_${currentSlip?.payPeriodStart}.pdf`);
        toast.success('Salary slip downloaded successfully!');
    } catch (error) {
        console.error('PDF generation error:', error);
        toast.error('Failed to download PDF');
    } finally {
        document.body.removeChild(clone);
    }
  };

  // ==========================================
  // Salary Slip — maps to GET /finance/salary-slip/:id (generateSalarySlip)
  // ==========================================

  const openSalarySlip = async (emp: any) => {
    try {
        const res = await apiFetch(`/finance/salary-slip/${emp.id}`);
        if (res.success) {
            const s = res.data;
            const slip: SalarySlip = {
                id: emp.id,
                employeeName: s.employee_name,
                employeeId: s.employee_id,
                email: s.email,
                department: s.department,
                role: s.role,
                payPeriodStart: s.pay_period_start.split('T')[0],
                payPeriodEnd: s.pay_period_end.split('T')[0],
                baseSalary: parseFloat(s.base_salary),
                advancePayments: parseFloat(s.advance_payments),
                accruedPayments: parseFloat(s.accrued_payments),
                totalSalary: parseFloat(s.total_salary),
                paymentStatus: s.payment_status,
                processedAt: s.processed_at,
            };
            setCurrentSlip(slip);
            setIsSlipOpen(true);
        }
    } catch (error) {
        toast.error('Failed to generate salary slip');
    }
  };

  // ==========================================
  // Expense CRUD — maps to /finance/expenses endpoints
  // ==========================================

  const openExpenseModal = (exp?: Expense) => {
    if (exp) {
      setEditingExpenseId(exp.id);
      setExpenseForm({ category: exp.category, amount: String(exp.amount), expense_date: exp.expense_date, status: exp.status });
    } else {
      setEditingExpenseId(null);
      setExpenseForm({ category: '', amount: '', expense_date: new Date().toISOString().split('T')[0], status: 'pending' });
    }
    setIsExpenseOpen(true);
  };

  const handleExpenseSubmit = async () => {
    if (!expenseForm.category || !expenseForm.amount || !expenseForm.expense_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingExpenseId !== null) {
      await updateExpense(editingExpenseId, {
          category: expenseForm.category,
          amount: Number(expenseForm.amount),
          expense_date: expenseForm.expense_date,
          status: expenseForm.status
      });
    } else {
      await addExpense({
          category: expenseForm.category,
          amount: Number(expenseForm.amount),
          expense_date: expenseForm.expense_date,
          status: expenseForm.status
      });
    }
    setIsExpenseOpen(false);
  };

  const handleDeleteExpenseRow = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    await deleteExpense(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Finance Team Portal" bgColor="bg-[#2C3E50]" />
      <main className="container mx-auto px-4 py-8 space-y-6">


        {/* Auto Salary Calculator — standalone tool, maps to processPayroll formula */}
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

        {/* Employee Salary Table — data from GET /finance/employees (getEmployeesWithPayroll) */}
        <Card>
          <CardHeader>
            <div className={cls.row}>
              <div>
                <CardTitle>Employee Salary Management</CardTitle>
                <CardDescription>Payroll syncs automatically with Admin employee additions</CardDescription>
              </div>
              <div className={cls.actions}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search employee..." value={employeeSearch} onChange={e => setEmployeeSearch(e.target.value)} className="pl-9 h-9 text-sm w-[200px]" />
                </div>
                <Select value={filterDept} onValueChange={setFilterDept}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {['sales', 'cst', 'finance'].map(d => <SelectItem key={d} value={d}>{d.toUpperCase()}</SelectItem>)}
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
                      <td className={`${cls.tableCell} ${cls.mono}`}>{emp.employee_id}</td>
                      <td className={cls.tableCell}>{emp.department}</td>
                      <td className={cls.tableCell}>
                        <Badge variant={emp.total_salary > 0 ? 'default' : 'secondary'}>{emp.total_salary > 0 ? 'Active' : 'Awaiting'}</Badge>
                      </td>
                      <td className={cls.tableCell}>{PKR(emp.base_salary)}</td>
                      <td className={`${cls.tableCell} text-orange-600`}>{PKR(emp.advance_payments)}</td>
                      <td className={`${cls.tableCell} text-green-600`}>{PKR(emp.accrued_payments)}</td>
                      <td className={`${cls.tableCell} ${cls.heading}`}>{PKR(emp.total_salary)}</td>
                      <td className={cls.tableCell}>
                        <Badge className={PAYMENT_COLORS[emp.payment_status as PaymentStatus] || PAYMENT_COLORS.pending}>{emp.payment_status}</Badge>
                      </td>
                      <td className={cls.tableCell}>
                        <div className={cls.iconRow}>
                          <Button variant="outline" size="sm" onClick={() => openEdit({
                              id: emp.id,
                              name: emp.name,
                              baseSalary: emp.base_salary,
                              advancePayments: emp.advance_payments,
                              accruedPayments: emp.accrued_payments,
                              paymentStatus: emp.payment_status
                          } as any)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="outline" size="sm" onClick={() => openSalarySlip(emp)}>
                            <FileText className="h-4 w-4 mr-1" />Slip
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Table — data from GET /finance/expenses (getExpenses) */}
        <Card>
          <CardHeader>
            <div className={cls.row}>
              <div>
                <CardTitle>Monthly Expenses</CardTitle>
                <CardDescription>Operational expenses for the current month</CardDescription>
              </div>
              <Button onClick={() => openExpenseModal()} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg">
                <Plus className="h-5 w-5 mr-2" /> ADD NEW EXPENSE
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <p className={`${cls.hint} text-center py-6`}>No expenses recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b-2">
                    <tr>
                      {['Category', 'Amount (PKR)', 'Date', 'Status', 'Actions'].map(h => (
                        <th key={h} className={cls.tableHead}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(exp => (
                      <tr key={exp.id} className={cls.tableRow}>
                        <td className={`${cls.tableCell} ${cls.heading}`}>{exp.category}</td>
                        <td className={`${cls.tableCell} font-mono`}>{PKR(Number(exp.amount))}</td>
                        <td className={`${cls.tableCell} ${cls.mono} text-xs`}>{exp.expense_date?.split('T')[0]}</td>
                        <td className={cls.tableCell}>
                          <Badge className={exp.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {exp.status}
                          </Badge>
                        </td>
                        <td className={cls.tableCell}>
                          <div className="flex gap-2 items-center">
                            <Button variant="outline" size="sm" className="border-blue-500 text-blue-700 hover:bg-blue-50" onClick={() => openExpenseModal(exp as any)}>
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button variant="outline" size="sm" className="border-red-500 text-red-700 hover:bg-red-50" onClick={() => handleDeleteExpenseRow(exp.id)}>
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 font-semibold">
                      <td className={`${cls.tableCell} ${cls.heading}`}>Total</td>
                      <td className={`${cls.tableCell} font-mono`}>{PKR(totalExpenses)}</td>
                      <td colSpan={3} />
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ==========================================
            Salary Edit Dialog — PATCH /finance/salary/:id
            ========================================== */}
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
                <p className={cls.hint}>Total Salary (Base + Accrued − Advances)</p>
                <p className={cls.metric}>{PKR(Number(editForm.baseSalary) + Number(editForm.accruedPayments) - Number(editForm.advancePayments))}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ==========================================
            Salary Slip Dialog — GET /finance/salary-slip/:id
            ========================================== */}
        <Dialog open={isSlipOpen} onOpenChange={setIsSlipOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Salary Slip
              </DialogTitle>
              <DialogDescription>
                {currentSlip && `Pay period: ${currentSlip.payPeriodStart} to ${currentSlip.payPeriodEnd}`}
              </DialogDescription>
            </DialogHeader>
            {currentSlip && (
              <div id="salary-slip-content" className="space-y-4 p-6 bg-white rounded-xl">
                <div className="flex justify-between items-start border-b pb-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-[#2C3E50]">Official Salary Slip</h2>
                        <p className="text-sm font-medium text-muted-foreground uppercase opacity-75">Private & Confidential</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold">CRM PORTAL FINANCE</p>
                        <p className="text-xs text-muted-foreground">Generated on {new Date(currentSlip.processedAt).toLocaleDateString()}</p>
                    </div>
                </div>
                {/* Employee Info */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-muted/50 border">
                  <div>
                    <p className="text-xs text-muted-foreground">Employee Name</p>
                    <p className="font-semibold">{currentSlip.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Employee ID</p>
                    <p className="font-mono text-sm">{currentSlip.employeeId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="text-sm">{currentSlip.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="text-sm">{currentSlip.role}</p>
                  </div>
                </div>

                {/* Salary Breakdown */}
                <div className="space-y-2 p-4 rounded-lg border">
                  <div className="flex justify-between items-center py-1.5 border-b">
                    <span className="text-sm text-muted-foreground">Base Salary</span>
                    <span className="font-mono font-medium">{PKR(currentSlip.baseSalary)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b">
                    <span className="text-sm text-green-600">+ Accrued Payments (Bonuses)</span>
                    <span className="font-mono font-medium text-green-600">{PKR(currentSlip.accruedPayments)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b">
                    <span className="text-sm text-orange-600">− Advance Payments (Deductions)</span>
                    <span className="font-mono font-medium text-orange-600">{PKR(currentSlip.advancePayments)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t-2 mt-2">
                    <span className="font-semibold">Net Pay</span>
                    <span className="font-mono font-bold text-lg">{PKR(currentSlip.totalSalary)}</span>
                  </div>
                </div>

                {/* Status & Meta */}
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Status:</span>
                    <Badge className={PAYMENT_COLORS[currentSlip.paymentStatus]}>{currentSlip.paymentStatus}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Generated: {new Date(currentSlip.processedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
            <DialogFooter className="border-t pt-4 flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsSlipOpen(false)}>Close</Button>
                <Button variant="outline" onClick={() => { setIsSlipOpen(false); openEdit(currentSlip); }}>
                  <Edit className="h-4 w-4 mr-2" /> Edit Salary
                </Button>
              </div>
              <Button onClick={handleDownloadPDF} className="bg-[#2C3E50] hover:bg-[#1a252f] text-white">
                <Download className="h-4 w-4 mr-2" />Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ==========================================
            Expense Edit Dialog — POST /finance/expenses or PUT /finance/expenses/:id
            ========================================== */}
        <Dialog open={isExpenseOpen} onOpenChange={setIsExpenseOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingExpenseId ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
              <DialogDescription>Record an operational expense</DialogDescription>
            </DialogHeader>
            <div className={cls.section}>
              <div className={cls.field}>
                <Label>Category / Description *</Label>
                <Input value={expenseForm.category} placeholder="e.g. Office Rent" onChange={e => setExpenseForm(p => ({ ...p, category: e.target.value }))} />
              </div>
              <div className={cls.field}>
                <Label>Amount (PKR) *</Label>
                <Input type="number" value={expenseForm.amount} placeholder="150000" onChange={e => setExpenseForm(p => ({ ...p, amount: e.target.value }))} />
              </div>
              <div className={cls.field}>
                <Label>Date *</Label>
                <Input type="date" value={expenseForm.expense_date} onChange={e => setExpenseForm(p => ({ ...p, expense_date: e.target.value }))} />
              </div>
              <div className={cls.field}>
                <Label>Status *</Label>
                <Select value={expenseForm.status} onValueChange={(v: ExpenseStatus) => setExpenseForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExpenseOpen(false)}>Cancel</Button>
              <Button onClick={handleExpenseSubmit}>{editingExpenseId ? 'Save Changes' : 'Add Expense'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}
