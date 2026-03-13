import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Download } from 'lucide-react';
import { cls } from '../../styles/classes';
import {
  SALES_TEAM_PERFORMANCE, CST_TEAM_PERFORMANCE,
  FINANCE_TEAM_PERFORMANCE, QA_TEAM_PERFORMANCE,
  ATTENDANCE_LOG,
} from '../../data/mockData';
import type { AttendanceEntry } from '../../data/mockData';

function scoreColor(score: number) {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-yellow-600';
  return 'text-red-600';
}

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

function AttendanceTable({ employeeId, employeeName }: { employeeId: string; employeeName: string }) {
  const records = ATTENDANCE_LOG.filter(r => r.employeeId === employeeId);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Attendance Log</p>
        <Button variant="outline" size="sm" onClick={() => exportCSV(employeeName, records)}>
          <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {['Date', 'Clock In', 'Clock Out', 'Hours', 'Status'].map(h => (
                <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={cls.muted}>
      <p className={`${cls.hintXs} mb-1`}>{label}</p>
      <p className={cls.metricSm}>{value}</p>
    </div>
  );
}

function MemberHeader({ name, role, overallScore }: { name: string; role: string; overallScore: number }) {
  return (
    <div className={cls.row}>
      <div>
        <h4 className="text-lg font-semibold">{name}</h4>
        <p className={cls.hint}>{role}</p>
      </div>
      <div className="text-right">
        <div className={`text-3xl font-bold ${scoreColor(overallScore)}`}>{overallScore}</div>
        <p className={cls.hintXs}>Overall Score</p>
      </div>
    </div>
  );
}

function TaskBadges({ completed, missed }: { completed: number; missed: number }) {
  return (
    <div className={cls.grid2}>
      <div className={`${cls.row} ${cls.itemSm}`}>
        <span className={cls.label}>Completed</span>
        <Badge variant="outline" className="bg-green-100 text-green-800">{completed}</Badge>
      </div>
      <div className={`${cls.row} ${cls.itemSm}`}>
        <span className={cls.label}>Missed</span>
        <Badge variant="outline" className="bg-red-100 text-red-800">{missed}</Badge>
      </div>
    </div>
  );
}

// Employee ID mapping (matches INITIAL_EMPLOYEES in mockData)
const EMP_ID: Record<string, string> = {
  'John Smith': 'EMP001',
  'Sarah Johnson': 'EMP002',
  'Mike Chen': 'EMP003',
  'Emily Davis': 'EMP004',
  'Robert Wilson': 'EMP005',
  'Sarah Martinez': 'EMP006',
};

export function PerformanceReviews() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Reviews by Team</CardTitle>
        <CardDescription>Comprehensive performance metrics and full attendance records</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="cst">CST</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="qa">QA</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className={`${cls.section} mt-6`}>
            {SALES_TEAM_PERFORMANCE.map(m => (
              <Card key={m.id} className="border-2">
                <CardHeader><MemberHeader name={m.name} role={m.role} overallScore={m.overallScore} /></CardHeader>
                <CardContent className={cls.section}>
                  <div className={cls.gridResponsive4}>
                    <StatTile label="Revenue" value={`$${m.monthlyRevenue.toLocaleString()}`} />
                    <StatTile label="Calls" value={m.callsMade} />
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
                  <AttendanceTable employeeId={EMP_ID[m.name] ?? ''} employeeName={m.name} />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="cst" className={`${cls.section} mt-6`}>
            {CST_TEAM_PERFORMANCE.map(m => (
              <Card key={m.id} className="border-2">
                <CardHeader><MemberHeader name={m.name} role={m.role} overallScore={m.overallScore} /></CardHeader>
                <CardContent className={cls.section}>
                  <div className={cls.gridResponsive4}>
                    <StatTile label="Clients" value={m.clientsManaged} />
                    <StatTile label="Satisfaction" value={`${m.satisfactionScore}/5`} />
                    <StatTile label="Response Time" value={m.responseTime} />
                    <StatTile label="Tasks Done" value={m.tasksCompleted} />
                  </div>
                  <TaskBadges completed={m.tasksCompleted} missed={m.tasksMissed} />
                  <AttendanceTable employeeId={EMP_ID[m.name] ?? ''} employeeName={m.name} />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="finance" className={`${cls.section} mt-6`}>
            {FINANCE_TEAM_PERFORMANCE.map(m => (
              <Card key={m.id} className="border-2">
                <CardHeader><MemberHeader name={m.name} role={m.role} overallScore={m.overallScore} /></CardHeader>
                <CardContent className={cls.section}>
                  <div className={cls.gridResponsive4}>
                    <StatTile label="Payments" value={m.paymentsProcessed} />
                    <StatTile label="Accuracy" value={`${m.accuracyRate}%`} />
                    <StatTile label="Reports" value={m.reportsGenerated} />
                    <StatTile label="Tasks Done" value={m.tasksCompleted} />
                  </div>
                  <TaskBadges completed={m.tasksCompleted} missed={m.tasksMissed} />
                  <AttendanceTable employeeId={EMP_ID[m.name] ?? ''} employeeName={m.name} />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="qa" className={`${cls.section} mt-6`}>
            {QA_TEAM_PERFORMANCE.map(m => (
              <Card key={m.id} className="border-2">
                <CardHeader><MemberHeader name={m.name} role={m.role} overallScore={m.overallScore} /></CardHeader>
                <CardContent className={cls.section}>
                  <div className={cls.gridResponsive4}>
                    <StatTile label="Evaluations" value={m.evaluationsCompleted} />
                    <StatTile label="Issues Found" value={m.issuesIdentified} />
                    <StatTile label="Resolution" value={`${m.resolutionRate}%`} />
                    <StatTile label="Tasks Done" value={m.tasksCompleted} />
                  </div>
                  <TaskBadges completed={m.tasksCompleted} missed={m.tasksMissed} />
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
