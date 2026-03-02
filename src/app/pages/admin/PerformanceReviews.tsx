import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Clock } from 'lucide-react';
import { cls } from '../../styles/classes';
import {
  SALES_TEAM_PERFORMANCE, CST_TEAM_PERFORMANCE,
  FINANCE_TEAM_PERFORMANCE, QA_TEAM_PERFORMANCE,
} from '../../data/mockData';

function scoreColor(score: number) {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-yellow-600';
  return 'text-red-600';
}

function attendanceColor(rate: number) {
  if (rate >= 95) return 'text-green-600';
  if (rate >= 85) return 'text-yellow-600';
  return 'text-red-600';
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={cls.muted}>
      <p className={`${cls.hintXs} mb-1`}>{label}</p>
      <p className={cls.metricSm}>{value}</p>
    </div>
  );
}

function AttendanceRow({ attendanceRate, tardies }: { attendanceRate: number; tardies: number }) {
  return (
    <div className={cls.grid2}>
      <div className={`${cls.row} ${cls.itemSm}`}>
        <span className={cls.label}>Attendance</span>
        <span className={`font-bold ${attendanceColor(attendanceRate)}`}>{attendanceRate}%</span>
      </div>
      <div className={`${cls.row} ${cls.itemSm}`}>
        <div className={cls.inline}>
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className={cls.label}>Tardies</span>
        </div>
        <Badge variant={tardies === 0 ? 'outline' : 'destructive'}>{tardies}</Badge>
      </div>
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

export function PerformanceReviews() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Reviews by Team</CardTitle>
        <CardDescription>Comprehensive performance metrics and attendance tracking</CardDescription>
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
                  <AttendanceRow attendanceRate={m.attendanceRate} tardies={m.tardies} />
                  <div>
                    <div className={`${cls.row} text-sm mb-2`}>
                      <span className={cls.label}>Revenue Progress</span>
                      <span className={cls.hint}>{Math.round((m.monthlyRevenue / m.targetRevenue) * 100)}%</span>
                    </div>
                    <Progress value={(m.monthlyRevenue / m.targetRevenue) * 100} />
                  </div>
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
                  <AttendanceRow attendanceRate={m.attendanceRate} tardies={m.tardies} />
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
                  <AttendanceRow attendanceRate={m.attendanceRate} tardies={m.tardies} />
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
                  <AttendanceRow attendanceRate={m.attendanceRate} tardies={m.tardies} />
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
