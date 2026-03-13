import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Checkbox } from '../../components/ui/checkbox';
import { Users, Calendar, Flag, Phone, Mail, UserPlus } from 'lucide-react';
import { DashboardHeader } from '../../components/shared/DashboardHeader';
import { cls } from '../../styles/classes';
import {
  ACTIVE_CLIENTS, ONBOARDING_CLIENTS, FLAGGED_CLIENTS,
  DAILY_TASKS, SCHEDULED_CALLS, SCHEDULED_EMAILS, type FlagType,
} from '../../data/mockData';

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800',
};

const TASK_STATUS_COLORS = {
  todo: 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-purple-100 text-purple-800',
  done: 'bg-green-100 text-green-800',
};

const FLAG_BORDER_COLORS: Record<FlagType, string> = {
  'red-flag': '#ef4444',
  'yellow-flag': '#eab308',
  'black-flag': '#111827',
};

function healthColor(score: number) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export function CSTDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Customer Success Team Portal" bgColor="bg-[#2C3E50]" />
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="clients"><Users className="h-4 w-4 mr-2" />Client Management</TabsTrigger>
            <TabsTrigger value="schedule"><Calendar className="h-4 w-4 mr-2" />Daily Schedule</TabsTrigger>
          </TabsList>

          {/* Client Management */}
          <TabsContent value="clients" className={cls.page}>
            {/* Active Clients */}
            <Card>
              <CardHeader>
                <CardTitle className={cls.inline}>
                  <div className="h-3 w-3 rounded-full bg-green-500" />Active Clients
                </CardTitle>
                <CardDescription>{ACTIVE_CLIENTS.length} currently active clients</CardDescription>
              </CardHeader>
              <CardContent className={cls.list}>
                {ACTIVE_CLIENTS.map(c => (
                  <div key={c.id} className={cls.itemHover}>
                    <div className={`${cls.row} mb-2`}>
                      <h4 className={cls.heading}>{c.name}</h4>
                      <div className={`${cls.metric} ${healthColor(c.healthScore)}`}>{c.healthScore}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {[
                        { label: 'Last Interaction', value: new Date(c.lastInteraction).toLocaleDateString() },
                        { label: 'Next Check-in', value: new Date(c.nextCheckIn).toLocaleDateString() },
                        { label: 'Assigned Agent', value: c.assignedAgent },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className={cls.hint}>{label}</p>
                          <p className={cls.heading}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Onboarding */}
            <Card>
              <CardHeader>
                <CardTitle className={cls.inline}><UserPlus className="h-5 w-5 text-blue-500" />Clients to be Onboarded</CardTitle>
                <CardDescription>{ONBOARDING_CLIENTS.length} clients in onboarding</CardDescription>
              </CardHeader>
              <CardContent className={cls.section}>
                {ONBOARDING_CLIENTS.map(c => (
                  <div key={c.id} className={cls.item}>
                    <div className={`${cls.row} mb-3`}>
                      <div>
                        <h4 className={cls.heading}>{c.name}</h4>
                        <p className={cls.hint}>Stage: {c.stage}</p>
                      </div>
                      <Badge variant="outline">{c.progress}%</Badge>
                    </div>
                    <Progress value={c.progress} className="mb-3" />
                    <div className={cls.grid2}>
                      <div><p className={cls.hint}>Assigned Agent</p><p className={cls.heading}>{c.assignedAgent}</p></div>
                      <div><p className={cls.hint}>Expected Completion</p><p className={cls.heading}>{new Date(c.expectedCompletion).toLocaleDateString()}</p></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Flagged Clients */}
            <Card>
              <CardHeader>
                <CardTitle className={cls.inline}><Flag className="h-5 w-5 text-red-500" />Flagged Clients</CardTitle>
                <CardDescription>Clients requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent className={cls.list}>
                {FLAGGED_CLIENTS.map(c => (
                  <div key={c.id} className={cls.item} style={{ borderLeft: `6px solid ${FLAG_BORDER_COLORS[c.type]}` }}>
                    <div className={`${cls.row} mb-2`}>
                      <div>
                        <h4 className={cls.heading}>{c.name}</h4>
                        <p className={cls.hint}>{c.issue}</p>
                      </div>
                      <Badge>{c.type.replace('-', ' ').toUpperCase()}</Badge>
                    </div>
                    <div className={`${cls.grid2} mt-3`}>
                      <div><p className={cls.hint}>Assigned Agent</p><p className={cls.heading}>{c.assignedAgent}</p></div>
                      <div>
                        <p className={cls.hint}>{c.type === 'black-flag' ? 'Churn Date' : 'Flagged Date'}</p>
                        <p className={cls.heading}>{new Date((c.type === 'black-flag' ? c.churnDate : c.flaggedDate)!).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {c.churnReason && <p className={`text-sm mt-2 pt-2 border-t ${cls.hint}`}>Reason: {c.churnReason}</p>}
                    <div className={`${cls.actions} mt-3`}>
                      <Button size="sm">Follow-up</Button>
                      <Button size="sm" variant="outline">Escalate</Button>
                      {c.type !== 'black-flag' && <Button size="sm" variant="outline">Resolve</Button>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Schedule */}
          <TabsContent value="schedule" className={cls.page}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Tasks */}
              <Card>
                <CardHeader><CardTitle>Daily Tasks</CardTitle><CardDescription>Today's checklist</CardDescription></CardHeader>
                <CardContent className={cls.list}>
                  {DAILY_TASKS.map(task => (
                    <div key={task.id} className={`${cls.inline} ${cls.itemSm}`}>
                      <Checkbox className="mt-0.5" defaultChecked={task.status === 'done'} />
                      <div className="flex-1">
                        <p className={`${cls.heading} ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
                        <div className={`${cls.actions} mt-1`}>
                          <Badge className={PRIORITY_COLORS[task.priority]} variant="outline">{task.priority}</Badge>
                          <Badge className={TASK_STATUS_COLORS[task.status]} variant="outline">{task.status}</Badge>
                          {task.dueTime && <span className={cls.hintXs}>{task.dueTime}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Scheduled Calls */}
              <Card>
                <CardHeader>
                  <CardTitle className={cls.inline}><Phone className="h-5 w-5" />Scheduled Calls</CardTitle>
                  <CardDescription>Today's call schedule</CardDescription>
                </CardHeader>
                <CardContent className={cls.list}>
                  {SCHEDULED_CALLS.map(call => (
                    <div key={call.id} className={cls.itemSm}>
                      <div className={`${cls.row} mb-2`}>
                        <h4 className={cls.heading}>{call.clientName}</h4>
                        <Badge variant={call.status === 'completed' ? 'default' : 'outline'}>{call.status}</Badge>
                      </div>
                      <p className={`${cls.hint} mb-2`}>{call.purpose}</p>
                      <div className={`${cls.inline} text-sm`}>
                        <span className={cls.heading}>{call.time}</span>
                        <span className={cls.hint}>• {call.duration}</span>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full"><Phone className="h-4 w-4 mr-2" />Schedule New Call</Button>
                </CardContent>
              </Card>

              {/* Scheduled Emails */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className={cls.inline}><Mail className="h-5 w-5" />Scheduled Emails</CardTitle>
                  <CardDescription>Email queue for today</CardDescription>
                </CardHeader>
                <CardContent className={cls.list}>
                  {SCHEDULED_EMAILS.map(email => (
                    <div key={email.id} className={`${cls.row} ${cls.itemSm}`}>
                      <div className="flex-1">
                        <h4 className={cls.heading}>{email.subject}</h4>
                        <p className={cls.hint}>To: {email.clientName}</p>
                        <p className={`${cls.hintXs} mt-1`}>Template: {email.template}</p>
                      </div>
                      <div className={`${cls.inline}`}>
                        <div className="text-right">
                          <p className={cls.label}>{email.scheduledTime}</p>
                          <Badge variant={email.status === 'sent' ? 'default' : 'outline'}>{email.status}</Badge>
                        </div>
                        {email.status === 'draft' && <Button size="sm">Send Now</Button>}
                      </div>
                    </div>
                  ))}
                  <Button className="w-full"><Mail className="h-4 w-4 mr-2" />Compose New Email</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
