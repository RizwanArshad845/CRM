import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { ClipboardCheck, TrendingUp, TrendingDown, FileText, Target } from 'lucide-react';
import { DashboardHeader } from '../../components/shared/DashboardHeader';
import { cls } from '../../styles/classes';
import {
  CST_CLIENT_EVALUATIONS, AGENT_EVALUATIONS, DAILY_CALL_METRICS,
  SALES_CALL_NOTES, CLIENT_LIFESPAN_DATA, MANAGER_TASK_METRICS, QA_UPCOMING_EVENTS,
} from '../../data/mockData';

function ratingColor(rating: number) {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 3.5) return 'text-yellow-600';
  return 'text-red-600';
}

export function QADashboard() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Quality Assurance Portal" bgColor="bg-gradient-to-r from-purple-600 to-indigo-600" />
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="evaluations" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="evaluations"><ClipboardCheck className="h-4 w-4 mr-2" />Evaluations</TabsTrigger>
            <TabsTrigger value="metrics"><TrendingUp className="h-4 w-4 mr-2" />Daily Metrics</TabsTrigger>
            <TabsTrigger value="lifespan"><TrendingDown className="h-4 w-4 mr-2" />Lifespan</TabsTrigger>
            <TabsTrigger value="notes"><FileText className="h-4 w-4 mr-2" />Notes</TabsTrigger>
            <TabsTrigger value="strategy"><Target className="h-4 w-4 mr-2" />Strategy</TabsTrigger>
          </TabsList>

          {/* Evaluations */}
          <TabsContent value="evaluations" className={cls.page}>
            <Card>
              <CardHeader><CardTitle>CST Client Evaluations</CardTitle><CardDescription>Service quality ratings</CardDescription></CardHeader>
              <CardContent className={cls.list}>
                {CST_CLIENT_EVALUATIONS.map(ev => (
                  <div key={ev.id} className={cls.itemHover}>
                    <div className={`${cls.row} mb-2`}>
                      <div>
                        <h4 className={cls.heading}>{ev.clientName}</h4>
                        <p className={cls.hint}>Agent: {ev.agentName}</p>
                      </div>
                      <div className={`${cls.metric} ${ratingColor(ev.rating)}`}>{ev.rating.toFixed(1)}</div>
                    </div>
                    <p className="text-sm mb-1">{ev.notes}</p>
                    <p className={cls.hintXs}>{new Date(ev.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Agent Evaluations</CardTitle></CardHeader>
              <CardContent className={cls.section}>
                {AGENT_EVALUATIONS.map(agent => (
                  <Card key={agent.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className={cls.row}>
                        <div>
                          <h4 className={cls.heading}>{agent.agentName}</h4>
                          <p className={cls.hint}>{agent.department}</p>
                        </div>
                        <div className={`text-3xl font-bold ${ratingColor(agent.overallScore / 20)}`}>{agent.overallScore}</div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: 'Call Quality', value: agent.callQuality },
                          { label: 'Response', value: agent.responseTime },
                          { label: 'Satisfaction', value: agent.clientSatisfaction },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className={cls.hintXs}>{label}</p>
                            <p className={cls.metricSm}>{value}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Metrics */}
          <TabsContent value="metrics">
            <Card>
              <CardHeader><CardTitle>Daily Call Metrics</CardTitle><CardDescription>QA performance by day</CardDescription></CardHeader>
              <CardContent className={cls.list}>
                {DAILY_CALL_METRICS.map(m => (
                  <div key={m.date} className={cls.item}>
                    <div className={`${cls.row} mb-3`}>
                      <h4 className={cls.heading}>{new Date(m.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</h4>
                      <Badge variant="outline" className={ratingColor(m.qualityScore)}>{m.qualityScore} / 5</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div><p className={cls.hint}>Total Calls</p><p className={cls.metricSm}>{m.totalCalls}</p></div>
                      <div><p className={cls.hint}>Quality Score</p><p className={cls.metricSm}>{m.qualityScore}</p></div>
                      <div><p className={cls.hint}>Avg Duration</p><p className={cls.metricSm}>{m.avgDuration}</p></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lifespan */}
          <TabsContent value="lifespan" className={cls.page}>
            {[
              { title: '🟢 Long-term Clients', clients: CLIENT_LIFESPAN_DATA.longTerm, isChargeback: false },
              { title: '🟡 Short-term Clients', clients: CLIENT_LIFESPAN_DATA.shortTerm, isChargeback: false },
              { title: '🔴 Chargebacks', clients: CLIENT_LIFESPAN_DATA.chargebacks, isChargeback: true },
            ].map(({ title, clients, isChargeback }) => (
              <Card key={title}>
                <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
                <CardContent className={cls.list}>
                  {clients.map((c: any) => (
                    <div key={c.id} className={cls.item}>
                      <div className={`${cls.row} mb-2`}>
                        <h4 className={cls.heading}>{c.name}</h4>
                        <span className={`font-bold ${c.revenue < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${Math.abs(c.revenue).toLocaleString()}
                        </span>
                      </div>
                      <div className={cls.grid2}>
                        <div><p className={cls.hint}>Lifespan</p><p className={cls.heading}>{c.lifespan} months</p></div>
                        {isChargeback ? (
                          <div><p className={cls.hint}>Mistake By</p><Badge variant="outline" className="mt-1">{c.mistakeType?.toUpperCase()}</Badge></div>
                        ) : (
                          <div><p className={cls.hint}>Status</p><Badge variant="outline">{c.status}</Badge></div>
                        )}
                      </div>
                      {isChargeback && <p className={`text-sm mt-2 pt-2 border-t ${cls.hint}`}>Reason: {c.reason}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Notes */}
          <TabsContent value="notes">
            <Card>
              <CardHeader><CardTitle>Sales Call Notes for CST</CardTitle><CardDescription>Forwarded notes from Sales calls</CardDescription></CardHeader>
              <CardContent className={cls.list}>
                {SALES_CALL_NOTES.map(note => (
                  <div key={note.id} className={cls.item}>
                    <div className={`${cls.row} mb-2`}>
                      <div>
                        <h4 className={cls.heading}>{note.clientName}</h4>
                        <p className={cls.hint}>Agent: {note.agentName}</p>
                      </div>
                      <div className="text-right">
                        <p className={cls.hintXs}>{new Date(note.date).toLocaleDateString()}</p>
                        {note.forCSTTeam && <Badge variant="outline" className="mt-1">For CST</Badge>}
                      </div>
                    </div>
                    <p className="text-sm">{note.notes}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategy */}
          <TabsContent value="strategy" className={cls.page}>
            <Card>
              <CardHeader><CardTitle>Manager Task Performance</CardTitle><CardDescription>Monthly task completion overview</CardDescription></CardHeader>
              <CardContent className={cls.list}>
                {MANAGER_TASK_METRICS.map(m => {
                  const pct = Math.round((m.completedTasks / m.totalTasks) * 100);
                  return (
                    <div key={m.id} className={cls.item}>
                      <div className={`${cls.row} mb-3`}>
                        <div>
                          <h4 className={cls.heading}>{m.managerName}</h4>
                          <p className={cls.hint}>{m.department} — {m.month}</p>
                        </div>
                        <span className={`${cls.metric} ${pct >= 90 ? 'text-green-600' : pct >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>{pct}%</span>
                      </div>
                      <Progress value={pct} className="mb-3" />
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div><p className={cls.hint}>Total</p><p className={cls.heading}>{m.totalTasks}</p></div>
                        <div><p className={cls.hint}>Completed</p><p className={`${cls.heading} text-green-600`}>{m.completedTasks}</p></div>
                        <div><p className={cls.hint}>Missed</p><p className={`${cls.heading} text-red-600`}>{m.missedTasks}</p></div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Upcoming QA Events</CardTitle></CardHeader>
              <CardContent className={cls.list}>
                {QA_UPCOMING_EVENTS.map(ev => (
                  <div key={ev.id} className={`${cls.row} ${cls.itemSm}`}>
                    <p className={cls.heading}>{ev.title}</p>
                    <div className={cls.inline}>
                      <p className={cls.hint}>{new Date(ev.date).toLocaleDateString()}</p>
                      <Badge variant="outline">{ev.type}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}