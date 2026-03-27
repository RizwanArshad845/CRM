import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Download, Search, TrendingUp } from 'lucide-react';
import { cls } from '../../styles/classes';
import {
  SALES_TEAM_PERFORMANCE, CST_TEAM_PERFORMANCE,
  FINANCE_TEAM_PERFORMANCE, QA_TEAM_PERFORMANCE,
  ATTENDANCE_LOG, EMPLOYEE_TASK_DETAILS,
  SALES_MANAGER_PERFORMANCE,
  type EmployeeTaskItem, type TaskItemStatus, type TaskPriority,
} from '../../data/mockData';
import type { AttendanceEntry } from '../../data/mockData';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scoreColor(s: number) {
  return s >= 90 ? 'text-green-600' : s >= 75 ? 'text-yellow-600' : 'text-red-600';
}

const TASK_STATUS_STYLE: Record<TaskItemStatus, string> = {
  completed: 'bg-green-100 text-green-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  missed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

const PRIORITY_STYLE: Record<TaskPriority, string> = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-orange-50 text-orange-700 border-orange-200',
  low: 'bg-gray-50 text-gray-600 border-gray-200',
};

const EMP_ID: Record<string, string> = {
  'John Smith': 'EMP001', 'Sarah Johnson': 'EMP002',
  'Mike Chen': 'EMP003', 'Emily Davis': 'EMP004',
  'Robert Wilson': 'EMP005', 'Sarah Martinez': 'EMP006',
};

function statusBadge(status: AttendanceEntry['status']) {
  if (status === 'on-time') return <Badge className="bg-green-100 text-green-800 border-0">On Time</Badge>;
  if (status === 'tardy') return <Badge className="bg-yellow-100 text-yellow-800 border-0">Tardy</Badge>;
  return <Badge className="bg-red-100 text-red-800 border-0">Absent</Badge>;
}

function exportCSV(name: string, records: AttendanceEntry[]) {
  const header = 'Employee,Department,Date,Clock In,Clock Out,Hours Worked,Status\n';
  const rows = records.map(r =>
    `${r.employeeName},${r.department},${r.date},${r.clockIn ?? '—'},${r.clockOut ?? '—'},${r.hoursWorked ?? '—'},${r.status}`
  ).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `attendance_${name.replace(/\s+/g, '_').toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={cls.muted}>
      <p className={`${cls.hintXs} mb-1`}>{label}</p>
      <p className={cls.metricSm}>{value}</p>
    </div>
  );
}

function MemberHeader({ name, role, score }: { name: string; role: string; score: number }) {
  return (
    <div className={cls.row}>
      <div><h4 className="text-lg font-semibold">{name}</h4><p className={cls.hint}>{role}</p></div>
      <div className="text-right">
        <div className={`text-3xl font-bold ${scoreColor(score)}`}>{score}</div>
        <p className={cls.hintXs}>Overall Score</p>
      </div>
    </div>
  );
}

function AttendanceTable({ employeeId, employeeName }: { employeeId: string; employeeName: string }) {
  const [showFull, setShowFull] = useState(false);
  const records = ATTENDANCE_LOG.filter(r => r.employeeId === employeeId);
  const onTime = records.filter(r => r.status === 'on-time').length;
  const tardy = records.filter(r => r.status === 'tardy').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const avgHrs = records.length
    ? (records.reduce((s, r) => s + (r.hoursWorked ?? 0), 0) / records.length).toFixed(1)
    : '—';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Attendance</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV(employeeName, records)}>
            <Download className="h-3.5 w-3.5 mr-1" />CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowFull(v => !v)}>
            {showFull ? 'Hide Log' : 'View Full Log'}
          </Button>
        </div>
      </div>

      {/* Summary tiles — always visible */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'On Time', value: onTime, bg: 'bg-green-50 border-green-200', text: 'text-green-700' },
          { label: 'Tardy', value: tardy, bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
          { label: 'Absent', value: absent, bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
          { label: 'Avg Hrs', value: `${avgHrs}h`, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
        ].map(({ label, value, bg, text }) => (
          <div key={label} className={`rounded-lg border ${bg} px-3 py-2 text-center`}>
            <p className={`text-xs font-medium ${text}`}>{label}</p>
            <p className={`text-xl font-bold ${text}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Full table — toggled */}
      {showFull && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>{['Date', 'Clock In', 'Clock Out', 'Hours', 'Status'].map(h => (
                <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 font-mono text-xs">{r.date}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.clockIn ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.clockOut ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.hoursWorked != null ? `${r.hoursWorked}h` : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-3 py-2">{statusBadge(r.status)}</td>
                </tr>
              ))}
              {records.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-muted-foreground text-sm">No attendance records</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


function TaskDetailTable({ employeeName, search, filterStatus, filterPriority }: {
  employeeName: string; search: string; filterStatus: string; filterPriority: string;
}) {
  const tasks = EMPLOYEE_TASK_DETAILS.filter(t => {
    const matchName = t.employeeName === employeeName;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchName && matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Task Details</p>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>{['Task', 'Category', 'Priority', 'Status', 'Due Date'].map(h => (
              <th key={h} className={cls.tableHead}>{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y">
            {tasks.map(t => (
              <tr key={t.id} className={cls.tableRow}>
                <td className={`${cls.tableCell} font-medium max-w-[200px]`}>{t.title}</td>
                <td className={cls.tableCell}><Badge variant="outline" className="text-xs">{t.category}</Badge></td>
                <td className={cls.tableCell}><Badge className={`${PRIORITY_STYLE[t.priority]} border text-xs`}>{t.priority}</Badge></td>
                <td className={cls.tableCell}><Badge className={`${TASK_STATUS_STYLE[t.status]} border-0 text-xs`}>{t.status}</Badge></td>
                <td className={`${cls.tableCell} font-mono text-xs`}>{t.dueDate}</td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr><td colSpan={5} className="text-center py-4 text-muted-foreground text-sm">No tasks match the current filters</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Search / Filter bar (shared) ─────────────────────────────────────────────
function FilterBar({ search, setSearch, filterStatus, setFilterStatus, filterPriority, setFilterPriority }: {
  search: string; setSearch: (v: string) => void;
  filterStatus: string; setFilterStatus: (v: string) => void;
  filterPriority: string; setFilterPriority: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3 items-center mb-4 p-3 rounded-lg bg-muted/40 border">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search tasks or categories…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-sm" />
      </div>
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-[145px] h-8 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="missed">Missed</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterPriority} onValueChange={setFilterPriority}>
        <SelectTrigger className="w-[140px] h-8 text-sm"><SelectValue placeholder="Priority" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function PerformanceReviews() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [agentSearch, setAgentSearch] = useState('');

  const filterProps = { search, setSearch, filterStatus, setFilterStatus, filterPriority, setFilterPriority };

  const filterTeam = <T extends { name: string }>(team: T[]) =>
    team.filter(m => !agentSearch || m.name.toLowerCase().includes(agentSearch.toLowerCase()));

  return (
    <Card>
      <CardHeader>
        <div className={cls.row}>
          <div>
            <CardTitle>Performance Reviews by Team</CardTitle>
            <CardDescription>Comprehensive performance metrics, task details, and full attendance records</CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search employee..." value={agentSearch} onChange={e => setAgentSearch(e.target.value)} className="pl-9 h-9 text-sm w-[250px]" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="sales_manager">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />Sales Manager
            </TabsTrigger>
            <TabsTrigger value="cst">CST</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="qa">QA</TabsTrigger>
          </TabsList>

          {/* Sales Agents */}
          <TabsContent value="sales" className={`${cls.section} mt-6`}>
            <FilterBar {...filterProps} />
            {filterTeam(SALES_TEAM_PERFORMANCE).map(m => (
              <Card key={m.id} className="border-2">
                <CardHeader><MemberHeader name={m.name} role={m.role} score={m.overallScore} /></CardHeader>
                <CardContent className={cls.section}>
                  <div className={cls.gridResponsive4}>
                    <StatTile label="Revenue" value={`$${m.monthlyRevenue.toLocaleString()}`} />
                    <StatTile label="Calls Made" value={m.callsMade} />
                    <StatTile label="Conversion" value={`${m.conversionRate}%`} />
                    <StatTile label="Target" value={`$${m.targetRevenue.toLocaleString()}`} />
                  </div>
                  <div>
                    <div className={`${cls.row} text-sm mb-2`}>
                      <span className={cls.label}>Revenue Progress</span>
                      <span className={cls.hint}>{Math.round((m.monthlyRevenue / m.targetRevenue) * 100)}%</span>
                    </div>
                    <Progress value={(m.monthlyRevenue / m.targetRevenue) * 100} />
                  </div>
                  <TaskDetailTable employeeName={m.name} search={search} filterStatus={filterStatus} filterPriority={filterPriority} />
                  <AttendanceTable employeeId={EMP_ID[m.name] ?? ''} employeeName={m.name} />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Sales Manager */}
          <TabsContent value="sales_manager" className={`${cls.section} mt-6`}>
            <FilterBar {...filterProps} />
            {filterTeam(SALES_MANAGER_PERFORMANCE).map(m => (
              <Card key={m.id} className="border-2 border-blue-200">
                <CardHeader><MemberHeader name={m.name} role={m.role} score={m.overallScore} /></CardHeader>
                <CardContent className={cls.section}>
                  <div className={cls.gridResponsive4}>
                    <StatTile label="Total Revenue" value={`$${m.totalRevenue.toLocaleString()}`} />
                    <StatTile label="Target Revenue" value={`$${m.targetRevenue.toLocaleString()}`} />
                    <StatTile label="Monthly Deals" value={m.monthlyDeals} />
                    <StatTile label="Agent Avg Score" value={`${m.agentPerformanceAvg}%`} />
                  </div>
                  <div>
                    <div className={`${cls.row} text-sm mb-2`}>
                      <span className={cls.label}>Revenue Progress</span>
                      <span className={cls.hint}>{Math.round((m.totalRevenue / m.targetRevenue) * 100)}%</span>
                    </div>
                    <Progress value={(m.totalRevenue / m.targetRevenue) * 100} />
                  </div>
                  <TaskDetailTable employeeName={m.name} search={search} filterStatus={filterStatus} filterPriority={filterPriority} />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* CST */}
          <TabsContent value="cst" className={`${cls.section} mt-6`}>
            <FilterBar {...filterProps} />
            {filterTeam(CST_TEAM_PERFORMANCE).map(m => (
              <Card key={m.id} className="border-2">
                <CardHeader><MemberHeader name={m.name} role={m.role} score={m.overallScore} /></CardHeader>
                <CardContent className={cls.section}>
                  <div className={cls.gridResponsive4}>
                    <StatTile label="Clients" value={m.clientsManaged} />
                    <StatTile label="Satisfaction" value={`${m.satisfactionScore}/5`} />
                    <StatTile label="Response Time" value={m.responseTime} />
                    <StatTile label="Tasks Done" value={m.tasksCompleted} />
                  </div>
                  <TaskDetailTable employeeName={m.name} search={search} filterStatus={filterStatus} filterPriority={filterPriority} />
                  <AttendanceTable employeeId={EMP_ID[m.name] ?? ''} employeeName={m.name} />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Finance */}
          <TabsContent value="finance" className={`${cls.section} mt-6`}>
            <FilterBar {...filterProps} />
            {filterTeam(FINANCE_TEAM_PERFORMANCE).map(m => (
              <Card key={m.id} className="border-2">
                <CardHeader><MemberHeader name={m.name} role={m.role} score={m.overallScore} /></CardHeader>
                <CardContent className={cls.section}>
                  <div className={cls.gridResponsive4}>
                    <StatTile label="Payments" value={m.paymentsProcessed} />
                    <StatTile label="Accuracy" value={`${m.accuracyRate}%`} />
                    <StatTile label="Reports" value={m.reportsGenerated} />
                    <StatTile label="Tasks Done" value={m.tasksCompleted} />
                  </div>
                  <TaskDetailTable employeeName={m.name} search={search} filterStatus={filterStatus} filterPriority={filterPriority} />
                  <AttendanceTable employeeId={EMP_ID[m.name] ?? ''} employeeName={m.name} />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* QA */}
          <TabsContent value="qa" className={`${cls.section} mt-6`}>
            <FilterBar {...filterProps} />
            {filterTeam(QA_TEAM_PERFORMANCE).map(m => (
              <Card key={m.id} className="border-2">
                <CardHeader><MemberHeader name={m.name} role={m.role} score={m.overallScore} /></CardHeader>
                <CardContent className={cls.section}>
                  <div className={cls.gridResponsive4}>
                    <StatTile label="Evaluations" value={m.evaluationsCompleted} />
                    <StatTile label="Issues Found" value={m.issuesIdentified} />
                    <StatTile label="Resolution" value={`${m.resolutionRate}%`} />
                    <StatTile label="Tasks Done" value={m.tasksCompleted} />
                  </div>
                  <TaskDetailTable employeeName={m.name} search={search} filterStatus={filterStatus} filterPriority={filterPriority} />
                  <AttendanceTable employeeId={EMP_ID[m.name] ?? ''} employeeName={m.name} />
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
