import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Calendar, FileText, Users, TrendingUp, UserCog, Target, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { DashboardHeader } from '../../components/shared/DashboardHeader';
import { cls } from '../../styles/classes';
import { EmployeeManagement } from './EmployeeManagement';
import { PerformanceReviews } from './PerformanceReviews';
import { TaskDelegation } from './TaskDelegation';
import { UPCOMING_EVENTS, MANAGER_PERFORMANCE, COMPANY_METRICS } from '../../data/mockData';

const EVENT_COLORS: Record<string, string> = {
  meeting: 'bg-blue-100 text-blue-800',
  training: 'bg-purple-100 text-purple-800',
  deadline: 'bg-red-100 text-red-800',
  other: 'bg-gray-100 text-gray-800',
};

const STRATEGY_ITEMS = [
  { color: 'bg-green-500', text: 'Increase customer retention by 15%' },
  { color: 'bg-blue-500', text: 'Improve CST response time' },
  { color: 'bg-purple-500', text: 'Launch new training program' },
];

function perfColor(pct: number) {
  if (pct >= 90) return 'text-green-600';
  if (pct >= 70) return 'text-yellow-600';
  return 'text-red-600';
}

export function AdminDashboard() {
  const revenuePct = Math.round((COMPANY_METRICS.totalRevenue / COMPANY_METRICS.revenueTarget) * 100);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Admin Portal" bgColor="bg-[#2C3E50]" />
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview"><TrendingUp className="h-4 w-4 mr-2" />Overview</TabsTrigger>
            <TabsTrigger value="employees"><UserCog className="h-4 w-4 mr-2" />Employees</TabsTrigger>
            <TabsTrigger value="performance"><ClipboardList className="h-4 w-4 mr-2" />Performance</TabsTrigger>
            <TabsTrigger value="tasks"><Target className="h-4 w-4 mr-2" />Task Delegation</TabsTrigger>
            <TabsTrigger value="events"><Calendar className="h-4 w-4 mr-2" />Events</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className={cls.page}>
            <Card>
              <CardHeader>
                <CardTitle>Company Health Overview</CardTitle>
                <CardDescription>High-level performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={cls.item}>
                    <p className={`${cls.hint} mb-1`}>Monthly Revenue</p>
                    <p className={cls.metric}>${COMPANY_METRICS.totalRevenue.toLocaleString()}</p>
                    <Progress value={revenuePct} className="mt-2 h-2" />
                    <p className={`${cls.hintXs} mt-1`}>{revenuePct}% of ${COMPANY_METRICS.revenueTarget.toLocaleString()} target</p>
                  </div>
                  <div className={cls.item}>
                    <p className={`${cls.hint} mb-1`}>Active Clients</p>
                    <p className={`${cls.metric} text-blue-600`}>{COMPANY_METRICS.activeClients}</p>
                    <p className={`${cls.hintXs} mt-2`}>{COMPANY_METRICS.clientRetention}% retention rate</p>
                  </div>
                  <div className={cls.item}>
                    <p className={`${cls.hint} mb-1`}>Avg Task Completion</p>
                    <p className={`${cls.metric} text-green-600`}>{COMPANY_METRICS.avgTaskCompletion}%</p>
                    <Progress value={COMPANY_METRICS.avgTaskCompletion} className="mt-2 h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className={cls.inline}><Calendar className="h-5 w-5" />Upcoming Events</CardTitle>
                  <CardDescription>Next 7 days</CardDescription>
                </CardHeader>
                <CardContent className={cls.section}>
                  {UPCOMING_EVENTS.slice(0, 4).map(ev => (
                    <div key={ev.id} className={`${cls.row} ${cls.itemHover}`}>
                      <div>
                        <h4 className={cls.heading}>{ev.title}</h4>
                        <p className={cls.hint}>{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <Badge className={EVENT_COLORS[ev.type] ?? EVENT_COLORS.other}>{ev.type}</Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">View All Events</Button>
                </CardContent>
              </Card>

              {/* Current Strategy */}
              <Card>
                <CardHeader>
                  <CardTitle className={cls.inline}><FileText className="h-5 w-5" />Current Strategy</CardTitle>
                  <CardDescription>Q1 2026 Strategy Document</CardDescription>
                </CardHeader>
                <CardContent className={cls.section}>
                  <div className={cls.mutedLg}>
                    <h4 className={`${cls.heading} mb-2`}>Focus Areas</h4>
                    <ul className={cls.list}>
                      {STRATEGY_ITEMS.map(({ color, text }) => (
                        <li key={text} className={cls.inline}>
                          <div className={`h-1.5 w-1.5 rounded-full ${color}`} />
                          <span className="text-sm">{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`${cls.row} text-sm`}>
                    <span className={cls.hint}>Last updated:</span>
                    <span className={cls.label}>Feb 1, 2026</span>
                  </div>
                  <div className={cls.actions}>
                    <Button variant="outline" className="flex-1">View Document</Button>
                    <Button variant="outline" className="flex-1">Download</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Manager Performance */}
            <Card>
              <CardHeader>
                <CardTitle className={cls.inline}><Users className="h-5 w-5" />Manager Performance</CardTitle>
                <CardDescription>Monthly task completion metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={cls.gridResponsive2}>
                  {MANAGER_PERFORMANCE.map(mgr => (
                    <Card key={mgr.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className={cls.inline}>
                          <div className={cls.avatar}>
                            <span className={cls.avatarText}>{mgr.name.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className={cls.heading}>{mgr.name}</h4>
                            <p className={cls.hint}>{mgr.role}</p>
                          </div>
                          <div className={`${cls.metric} ${perfColor(mgr.percentage)}`}>{mgr.percentage}%</div>
                        </div>
                      </CardHeader>
                      <CardContent className={cls.list}>
                        <Progress value={mgr.percentage} className="h-2" />
                        <div className={cls.grid2}>
                          <div><p className={cls.hint}>Assigned</p><p className={cls.metricSm}>{mgr.assigned}</p></div>
                          <div><p className={cls.hint}>Completed</p><p className={`${cls.metricSm} text-green-600`}>{mgr.completed}</p></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees"><EmployeeManagement /></TabsContent>
          <TabsContent value="performance"><PerformanceReviews /></TabsContent>
          <TabsContent value="tasks"><TaskDelegation /></TabsContent>

          {/* Events & Strategy */}
          <TabsContent value="events" className={cls.page}>
            <Card>
              <CardHeader>
                <CardTitle>Event Calendar</CardTitle>
                <CardDescription>Manage company events and important dates</CardDescription>
              </CardHeader>
              <CardContent className={cls.section}>
                {UPCOMING_EVENTS.map(ev => (
                  <div key={ev.id} className={`${cls.row} ${cls.item}`}>
                    <div>
                      <h4 className={cls.heading}>{ev.title}</h4>
                      <p className={cls.hint}>{new Date(ev.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className={cls.inline}>
                      <Badge className={EVENT_COLORS[ev.type] ?? EVENT_COLORS.other}>{ev.type}</Badge>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
                <Button className="w-full"><Calendar className="h-4 w-4 mr-2" />Add New Event</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strategy Documents</CardTitle>
                <CardDescription>View and manage company strategy documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 border-2 border-dashed rounded-lg text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className={`${cls.heading} mb-2`}>Q1 2026 Strategy Document</h3>
                  <p className={`${cls.hint} mb-4`}>Comprehensive strategy outlining goals and initiatives for Q1</p>
                  <div className={`${cls.actions} justify-center`}>
                    <Button>View Document</Button>
                    <Button variant="outline">Download PDF</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
