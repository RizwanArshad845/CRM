import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Users, Calendar, Flag, Phone, Mail, UserPlus,
  PowerOff, Power, AlertTriangle, CheckCircle2, Search
} from 'lucide-react';
import { DashboardHeader } from '../../components/shared/DashboardHeader';
import { cls } from '../../styles/classes';
import {
  ONBOARDING_CLIENTS, FLAGGED_CLIENTS,
  DAILY_TASKS, SCHEDULED_CALLS, SCHEDULED_EMAILS, type FlagType,
} from '../../data/mockData';
import { useClients } from '../../context/ClientContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

// ── Flag dialog (client selecton) ─────────────────────────────────────────────
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';

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

const FLAG_OPTIONS: { value: FlagType; label: string }[] = [
  { value: 'red-flag', label: '🔴 Red Flag — Urgent issue' },
  { value: 'yellow-flag', label: '🟡 Yellow Flag — Watch closely' },
  { value: 'black-flag', label: '⚫ Black Flag — Churn / Cancel' },
];

function healthColor(score: number) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

// ── Flag dialog (CST Agent only) ──────────────────────────────────────────────
interface FlagDialogProps {
  clientName: string;
  clientId: string;
  open: boolean;
  onClose: () => void;
}

function FlagDialog({ clientName, open, onClose }: FlagDialogProps) {
  const [flagType, setFlagType] = useState<FlagType>('yellow-flag');
  const [issue, setIssue] = useState('');

  const handleSubmit = () => {
    if (!issue.trim()) { toast.error('Please describe the issue'); return; }
    toast.success(`${clientName} flagged as "${flagType.replace('-', ' ')}" — CST Manager notified.`);
    setIssue('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className={cls.inline}><Flag className="h-5 w-5 text-red-500" />Flag Client</DialogTitle>
          <DialogDescription>Flagging <strong>{clientName}</strong> — this will notify the CST Manager.</DialogDescription>
        </DialogHeader>
        <div className={cls.section}>
          <div className={cls.field}>
            <Label>Flag Type</Label>
            <Select value={flagType} onValueChange={v => setFlagType(v as FlagType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FLAG_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className={cls.field}>
            <Label>Issue Description *</Label>
            <Input placeholder="Describe the issue..." value={issue} onChange={e => setIssue(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleSubmit}><Flag className="h-4 w-4 mr-2" />Submit Flag</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Active Clients panel (role-aware) ─────────────────────────────────────────
function ActiveClientsPanel() {
  const { user } = useAuth();
  const { clients, deactivationRequests, toggleActive, requestDeactivation, resolveDeactivationRequest } = useClients();
  const isCSTManager = user?.role === 'cst_manager';
  const isCSTAgent   = user?.role === 'cst';

  const [flagTarget, setFlagTarget] = useState<{ id: string; name: string } | null>(null);

  const handleRequestDeactivation = (clientId: string, clientName: string) => {
    if (!user) return;
    requestDeactivation(clientId, clientName, user.name);
    toast.info(`Deactivation request for "${clientName}" sent to CST Manager.`);
  };

  return (
    <div className={cls.section}>
      {/* Active Clients */}
      <Card>
        <CardHeader>
          <CardTitle className={cls.inline}>
            <div className="h-3 w-3 rounded-full bg-green-500" />
            Active Clients
          </CardTitle>
          <CardDescription>
            {isCSTManager
              ? 'Activate or deactivate clients'
              : isCSTAgent
              ? 'Flag clients or request deactivation'
              : `${clients.filter(c => c.isActive).length} currently active clients`}
          </CardDescription>
        </CardHeader>
        <CardContent className={cls.list}>
          {clients.map(c => (
            <div
              key={c.id}
              className={`${cls.itemHover} ${!c.isActive ? 'opacity-60' : ''}`}
            >
              <div className={`${cls.row} mb-2 flex-wrap gap-2`}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <h4 className={cls.heading}>{c.name}</h4>
                  <Badge variant={c.isActive ? 'default' : 'secondary'} className="text-xs">
                    {c.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {deactivationRequests.some(r => r.clientId === c.id) && (
                    <Badge variant="outline" className="text-xs text-yellow-700 border-yellow-400 bg-yellow-50">
                      <AlertTriangle className="h-3 w-3 mr-1" />Deactivation Requested
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-3">
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

              {/* CST Manager: activate / deactivate */}
              {isCSTManager && (
                <div className={`${cls.actions} flex-wrap`}>
                  <Button
                    size="sm"
                    variant={c.isActive ? 'destructive' : 'default'}
                    onClick={() => {
                      toggleActive(c.id);
                      toast.success(`${c.name} ${c.isActive ? 'deactivated' : 'activated'}.`);
                    }}
                  >
                    {c.isActive
                      ? <><PowerOff className="h-3.5 w-3.5 mr-1.5" />Deactivate</>
                      : <><Power className="h-3.5 w-3.5 mr-1.5" />Activate</>}
                  </Button>
                </div>
              )}

              {/* CST Agent: flag + request deactivation */}
              {isCSTAgent && (
                <div className={`${cls.actions} flex-wrap`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-orange-400 text-orange-700 hover:bg-orange-50"
                    onClick={() => setFlagTarget({ id: c.id, name: c.name })}
                  >
                    <Flag className="h-3.5 w-3.5 mr-1.5" />Flag
                  </Button>
                  {c.isActive && !deactivationRequests.some(r => r.clientId === c.id) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-400 text-red-700 hover:bg-red-50"
                      onClick={() => handleRequestDeactivation(c.id, c.name)}
                    >
                      <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />Request Deactivation
                    </Button>
                  )}
                  {deactivationRequests.some(r => r.clientId === c.id) && (
                    <span className={`${cls.hintXs} text-yellow-700`}>Deactivation request pending…</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pending Deactivation Requests — CST Manager only */}
      {isCSTManager && deactivationRequests.length > 0 && (
        <Card className="border-2 border-yellow-300 dark:border-yellow-700">
          <CardHeader>
            <CardTitle className={`${cls.inline} text-yellow-700 dark:text-yellow-400`}>
              <AlertTriangle className="h-5 w-5" />
              Pending Deactivation Requests
            </CardTitle>
            <CardDescription>Requests submitted by CST agents — review and approve or dismiss</CardDescription>
          </CardHeader>
          <CardContent className={cls.list}>
            {deactivationRequests.map(req => (
              <div key={req.clientId} className={`${cls.item} border-yellow-200 dark:border-yellow-800`}>
                <div className={`${cls.row} mb-3 flex-wrap gap-2`}>
                  <div>
                    <p className={cls.heading}>{req.clientName}</p>
                    <p className={cls.hint}>
                      Requested by <strong>{req.requestedBy}</strong> · {new Date(req.requestedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className={`${cls.actions} flex-wrap`}>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      resolveDeactivationRequest(req.clientId, true);
                      toast.success(`${req.clientName} has been deactivated.`);
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Approve &amp; Deactivate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      resolveDeactivationRequest(req.clientId, false);
                      toast.info(`Request for ${req.clientName} dismissed.`);
                    }}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Flag dialog */}
      {flagTarget && (
        <FlagDialog
          clientId={flagTarget.id}
          clientName={flagTarget.name}
          open={!!flagTarget}
          onClose={() => setFlagTarget(null)}
        />
      )}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export function CSTDashboard() {
  const [onboardSearch, setOnboardSearch] = useState('');
  const [flaggedSearch, setFlaggedSearch] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Customer Success Team Portal" bgColor="bg-[#2C3E50]" />
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="clients"><Users className="h-4 w-4 mr-2" />Client Management</TabsTrigger>
            <TabsTrigger value="schedule"><Calendar className="h-4 w-4 mr-2" />Daily Schedule</TabsTrigger>
          </TabsList>

          {/* Client Management */}
          <TabsContent value="clients" className={cls.page}>
            {/* Active Clients (role-gated) */}
            <ActiveClientsPanel />

            {/* Onboarding */}
            <Card>
              <CardHeader>
                <div className={cls.row}>
                  <div>
                    <CardTitle className={cls.inline}><UserPlus className="h-5 w-5 text-blue-500" />Clients to be Onboarded</CardTitle>
                    <CardDescription>{ONBOARDING_CLIENTS.length} clients in onboarding</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search client..." value={onboardSearch} onChange={e => setOnboardSearch(e.target.value)} className="pl-9 h-9 text-sm w-[250px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className={cls.section}>
                {ONBOARDING_CLIENTS.filter(c => !onboardSearch || c.name.toLowerCase().includes(onboardSearch.toLowerCase()) || c.assignedAgent.toLowerCase().includes(onboardSearch.toLowerCase())).map(c => (
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
                <div className={cls.row}>
                  <div>
                    <CardTitle className={cls.inline}><Flag className="h-5 w-5 text-red-500" />Flagged Clients</CardTitle>
                    <CardDescription>Clients requiring immediate attention</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search client or issue..." value={flaggedSearch} onChange={e => setFlaggedSearch(e.target.value)} className="pl-9 h-9 text-sm w-[250px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className={cls.list}>
                {FLAGGED_CLIENTS.filter(c => !flaggedSearch || c.name.toLowerCase().includes(flaggedSearch.toLowerCase()) || c.issue.toLowerCase().includes(flaggedSearch.toLowerCase())).map(c => (
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
                <CardHeader><CardTitle>Daily Tasks</CardTitle><CardDescription>Today&apos;s checklist</CardDescription></CardHeader>
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
                  <CardDescription>Today&apos;s call schedule</CardDescription>
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
                      <div className={cls.inline}>
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
