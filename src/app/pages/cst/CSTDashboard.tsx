import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  Users, Calendar, Flag, UserPlus, Clock,
  PowerOff, Power, AlertTriangle, CheckCircle2, Search,
  Plus, Edit, Trash2
} from 'lucide-react';
import { DashboardHeader } from '../../components/shared/DashboardHeader';
import { cls } from '../../styles/classes';
import { useClients } from '../../context/ClientContext';
import { useAuth } from '../../context/AuthContext';
import { useCSTSchedule, Schedule as CSTSchedule } from '../../context/CSTScheduleContext';
import { toast } from 'sonner';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';

// ── Schedule type matching DB: schedules(id, user_id, title, description, start_time, end_time)
type ScheduleForm = { title: string; description: string; start_time: string; end_time: string };
const EMPTY_SCHEDULE_FORM: ScheduleForm = { title: '', description: '', start_time: '', end_time: '' };

const FLAG_BORDER_COLORS: Record<string, string> = {
  'red-flag': '#ef4444',
  'yellow-flag': '#eab308',
  'black-flag': '#111827',
  'flagged': '#ef4444'
};

const FLAG_OPTIONS: { value: string; label: string }[] = [
  { value: 'red-flag', label: '🔴 Red Flag — Urgent issue' },
  { value: 'yellow-flag', label: '🟡 Yellow Flag — Watch closely' },
  { value: 'black-flag', label: '⚫ Black Flag — Churn / Cancel' },
];

// ── Flag dialog (CST Agent only) ──────────────────────────────────────────────
interface FlagDialogProps {
  clientName: string;
  clientId: number;
  open: boolean;
  onClose: () => void;
}

function FlagDialog({ clientName, clientId, open, onClose }: FlagDialogProps) {
  const [flagType, setFlagType] = useState<string>('yellow-flag');
  const [issue, setIssue] = useState('');
  const { flagClient } = useClients();

  const handleSubmit = async () => {
    if (!issue.trim()) { toast.error('Please describe the issue'); return; }
    await flagClient(clientId, flagType, issue);
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
            <Select value={flagType} onValueChange={v => setFlagType(v)}>
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

  const [flagTarget, setFlagTarget] = useState<{ id: number; name: string } | null>(null);
  const [search, setSearch] = useState('');

  const handleRequestDeactivation = (clientId: number, clientName: string) => {
    if (!user) return;
    requestDeactivation(clientId, clientName, user.first_name);
    toast.info(`Deactivation request for "${clientName}" sent to CST Manager.`);
  };

  const activeClients = clients.filter(c => c.isActive && c.status === 'active');

  return (
    <div className={cls.section}>
      {/* Active Clients */}
      <Card>
        <CardHeader>
          <div className={cls.row}>
            <div>
              <CardTitle className={cls.inline}>
                <div className="h-3 w-3 rounded-full bg-green-500" />
                Active Clients
              </CardTitle>
              <CardDescription>
                {isCSTManager
                  ? 'Activate or deactivate clients'
                  : isCSTAgent
                  ? 'Flag clients or request deactivation'
                  : `${activeClients.length} currently active clients`}
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search active clients..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm w-[250px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent className={cls.list}>
          {activeClients.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase())).map(c => (
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
                  { label: 'Last Interaction', value: c.lastInteraction || 'N/A' },
                  { label: 'Next Check-in', value: c.nextCheckIn || 'N/A' },
                  { label: 'Assigned Agent', value: c.assignedAgent || 'Unassigned' },
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
                      resolveDeactivationRequest(req.id, true, req.clientId);
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Approve &amp; Deactivate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      resolveDeactivationRequest(req.id, false, req.clientId);
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
  const { user } = useAuth();
  const { clients, unflagClient } = useClients();
  const { schedules, addSchedule, updateSchedule, deleteSchedule } = useCSTSchedule();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>(EMPTY_SCHEDULE_FORM);

  // Filters
  const onboardingClients = clients.filter(c => c.status === 'onboarding');
  const flaggedClients = clients.filter(c => c.status === 'flagged');

  // Schedule helpers
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString();
  const getDuration = (start: string, end: string) => {
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
    return diff >= 60 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : `${diff}m`;
  };
  const isUpcoming = (start: string) => new Date(start) > new Date();

  const openScheduleModal = (sch?: CSTSchedule) => {
    if (sch) {
      setEditingScheduleId(sch.id);
      setScheduleForm({
        title: sch.title,
        description: sch.description,
        start_time: sch.start_time.slice(0, 16), // for datetime-local input
        end_time: sch.end_time.slice(0, 16),
      });
    } else {
      setEditingScheduleId(null);
      setScheduleForm(EMPTY_SCHEDULE_FORM);
    }
    setIsScheduleOpen(true);
  };

  const handleScheduleSubmit = async () => {
    if (!scheduleForm.title || !scheduleForm.start_time || !scheduleForm.end_time) {
      toast.error('Title, start time and end time are required');
      return;
    }
    if (new Date(scheduleForm.end_time) <= new Date(scheduleForm.start_time)) {
      toast.error('End time must be after start time');
      return;
    }

    if (editingScheduleId !== null) {
      await updateSchedule(editingScheduleId, {
          title: scheduleForm.title,
          description: scheduleForm.description,
          start_time: scheduleForm.start_time,
          end_time: scheduleForm.end_time
      });
    } else {
      await addSchedule({
          user_id: user?.id as number,
          title: scheduleForm.title,
          description: scheduleForm.description,
          start_time: scheduleForm.start_time,
          end_time: scheduleForm.end_time
      });
    }
    setIsScheduleOpen(false);
  };

  const handleDeleteScheduleRow = async (id: number) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    await deleteSchedule(id);
  };

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
                    <CardDescription>{onboardingClients.length} clients in onboarding</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search client..." value={onboardSearch} onChange={e => setOnboardSearch(e.target.value)} className="pl-9 h-9 text-sm w-[250px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className={cls.section}>
                {onboardingClients.length === 0 ? (
                    <p className={`${cls.hint} text-center py-4`}>No clients currently in onboarding.</p>
                ) : (
                    onboardingClients.filter(c => !onboardSearch || c.name.toLowerCase().includes(onboardSearch.toLowerCase())).map(c => (
                        <div key={c.id} className={cls.item}>
                          <div className={`${cls.row} mb-3`}>
                            <div>
                              <h4 className={cls.heading}>{c.name}</h4>
                              <p className={cls.hint}>Stage: {c.status}</p>
                            </div>
                            <Badge variant="outline">{c.onboardingProgress || 0}%</Badge>
                          </div>
                          <Progress value={c.onboardingProgress || 0} className="mb-3" />
                          <div className={cls.grid2}>
                            <div><p className={cls.hint}>Assigned Agent</p><p className={cls.heading}>{c.assignedAgent || 'Unassigned'}</p></div>
                            <div><p className={cls.hint}>Last Interaction</p><p className={cls.heading}>{c.lastInteraction || 'N/A'}</p></div>
                          </div>
                        </div>
                    ))
                )}
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
                    <Input placeholder="Search client..." value={flaggedSearch} onChange={e => setFlaggedSearch(e.target.value)} className="pl-9 h-9 text-sm w-[250px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className={cls.list}>
                {flaggedClients.length === 0 ? (
                    <p className={`${cls.hint} text-center py-4`}>No flagged clients.</p>
                ) : (
                    flaggedClients.filter(c => !flaggedSearch || c.name.toLowerCase().includes(flaggedSearch.toLowerCase())).map(c => (
                        <div key={c.id} className={cls.item} style={{ borderLeft: `6px solid ${FLAG_BORDER_COLORS[c.flag_type || 'flagged']}` }}>
                          <div className={`${cls.row} mb-2`}>
                            <div>
                                <h4 className={cls.heading}>{c.name}</h4>
                                <p className={cls.hint}>Flag Type: <span className="capitalize font-bold" style={{ color: FLAG_BORDER_COLORS[c.flag_type || 'flagged'] }}>{(c.flag_type || 'flagged').replace('-', ' ')}</span></p>
                            </div>
                            <Badge variant="destructive">FLAGGED</Badge>
                          </div>
                          <div className={`${cls.grid2} mt-3`}>
                            <div><p className={cls.hint}>Assigned Agent</p><p className={cls.heading}>{c.assignedAgent || 'Unassigned'}</p></div>
                            <div>
                                <p className={cls.hint}>Last interaction</p>
                                <p className={cls.heading}>{c.lastInteraction || 'N/A'}</p>
                            </div>
                          </div>
                          <div className={`${cls.actions} mt-3 justify-end`}>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                                onClick={() => unflagClient(c.id)}
                            >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Unflag (Resolved)
                            </Button>
                          </div>
                        </div>
                    ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Schedule */}
          <TabsContent value="schedule" className={cls.page}>
            <Card>
              <CardHeader>
                <div className={cls.row}>
                  <div>
                    <CardTitle className={cls.inline}><Calendar className="h-5 w-5 text-blue-500" />Daily Schedule</CardTitle>
                    <CardDescription>{schedules.length} scheduled items · {formatDate(new Date().toISOString())}</CardDescription>
                  </div>
                  <Button onClick={() => openScheduleModal()} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />Add Schedule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {schedules.length === 0 ? (
                  <p className={`${cls.hint} text-center py-8`}>No schedules for today. Click "Add Schedule" to create one.</p>
                ) : (
                  <div className="space-y-3">
                    {schedules.map(sch => (
                      <div key={sch.id} className={`${cls.item} ${!isUpcoming(sch.start_time) ? 'opacity-60' : ''}`}>
                        <div className={`${cls.row} mb-2 flex-wrap gap-2`}>
                          <div className="flex-1 min-w-0">
                            <h4 className={cls.heading}>{sch.title}</h4>
                            {sch.description && <p className={`${cls.hint} mt-1`}>{sch.description}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={isUpcoming(sch.start_time) ? 'default' : 'secondary'}>
                              {isUpcoming(sch.start_time) ? 'Upcoming' : 'Passed'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className={cls.heading}>{formatTime(sch.start_time)} — {formatTime(sch.end_time)}</span>
                            </div>
                            <span className={cls.hint}>({getDuration(sch.start_time, sch.end_time)})</span>
                            <span className={`${cls.hintXs}`}>{formatDate(sch.start_time)}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="border-blue-500 text-blue-700 hover:bg-blue-50" onClick={() => openScheduleModal(sch)}>
                              <Edit className="h-3.5 w-3.5 mr-1" />Edit
                            </Button>
                            <Button variant="outline" size="sm" className="border-red-500 text-red-700 hover:bg-red-50" onClick={() => handleDeleteScheduleRow(sch.id)}>
                              <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Schedule Modal */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={cls.inline}>
              {editingScheduleId ? <Edit className="h-5 w-5 text-blue-500" /> : <Plus className="h-5 w-5 text-blue-500" />}
              {editingScheduleId ? 'Edit Schedule Entry' : 'Add New Schedule Entry'}
            </DialogTitle>
            <DialogDescription>Plan your daily tasks and interactions.</DialogDescription>
          </DialogHeader>
          <div className={cls.section}>
            <div className={cls.field}>
              <Label>Title *</Label>
              <Input placeholder="E.g. Morning Briefing" value={scheduleForm.title} onChange={e => setScheduleForm({ ...scheduleForm, title: e.target.value })} />
            </div>
            <div className={cls.field}>
              <Label>Description</Label>
              <Input placeholder="Optional details..." value={scheduleForm.description} onChange={e => setScheduleForm({ ...scheduleForm, description: e.target.value })} />
            </div>
            <div className={cls.grid2}>
              <div className={cls.field}>
                <Label>Start Time *</Label>
                <Input type="datetime-local" value={scheduleForm.start_time} onChange={e => setScheduleForm({ ...scheduleForm, start_time: e.target.value })} />
              </div>
              <div className={cls.field}>
                <Label>End Time *</Label>
                <Input type="datetime-local" value={scheduleForm.end_time} onChange={e => setScheduleForm({ ...scheduleForm, end_time: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleScheduleSubmit}>
              {editingScheduleId ? 'Update Entry' : 'Save Entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
