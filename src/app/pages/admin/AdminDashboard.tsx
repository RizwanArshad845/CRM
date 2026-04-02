import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Calendar, UserCog, Target, ClipboardList, Globe, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { DashboardHeader } from '../../components/shared/DashboardHeader';
import { cls } from '../../styles/classes';
import { EmployeeManagement } from './EmployeeManagement';
import { PerformanceReviews } from './PerformanceReviews';
import { TaskDelegation } from './TaskDelegation';
import { usePerformance } from '../../context/PerformanceContext';
import { eventsApi } from '../../../api/client';
import { useClients } from '../../context/ClientContext';
import { EVENT_TYPES } from '../../constants/crm';
import { toast } from 'sonner';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const EVENT_COLORS: Record<string, string> = {
  meeting: 'bg-blue-100 text-blue-800',
  training: 'bg-purple-100 text-purple-800',
  deadline: 'bg-red-100 text-red-800',
  other: 'bg-gray-100 text-gray-800',
  celebration: 'bg-green-100 text-green-800',
};

function healthColor(score: number) {
  if (score >= 85) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
}

// Active Clients tab — admin view-only
function ActiveClientsPanel() {
  const { clients } = useClients();
  const onboardingClients = clients.filter(c => c.status === 'onboarding');

  return (
    <div className={cls.page}>
      <Card>
        <CardHeader>
          <CardTitle className={cls.inline}><Globe className="h-5 w-5" />Active Clients</CardTitle>
          <CardDescription>View client active/inactive status across all departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {['Client', 'Health Score', 'Assigned Agent', 'Last Interaction', 'Next Check-In', 'Status'].map(h => (
                    <th key={h} className={cls.tableHead}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {clients.map(c => (
                  <tr key={c.id} className={cls.tableRow}>
                    <td className={`${cls.tableCell} ${cls.heading}`}>{c.name}</td>
                    <td className={cls.tableCell}>
                      <span className={`font-bold ${healthColor(c.healthScore || 0)}`}>{c.healthScore || '—'}</span>
                    </td>
                    <td className={cls.tableCell}>{c.assignedAgent}</td>
                    <td className={`${cls.tableCell} ${cls.mono} text-xs`}>{c.lastInteraction || '—'}</td>
                    <td className={`${cls.tableCell} ${cls.mono} text-xs`}>{c.nextCheckIn || '—'}</td>
                    <td className={cls.tableCell}>
                      <Badge variant={c.isActive ? 'default' : 'secondary'}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No clients found in database</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Onboarding Clients</CardTitle>
          <CardDescription>Clients currently being onboarded by CST</CardDescription>
        </CardHeader>
        <CardContent className={cls.section}>
          {onboardingClients.map(c => (
            <div key={c.id} className={`${cls.item} ${cls.itemHover}`}>
              <div className={cls.row}>
                <div>
                  <h4 className={cls.heading}>{c.name}</h4>
                  <p className={cls.hint}>Agent: {c.assignedAgent} · Stage: {c.stage || 'Initial'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{c.onboardingProgress ?? 0}%</p>
                  <p className={cls.hintXs}>Due {c.nextCheckIn || 'N/A'}</p>
                </div>
              </div>
              <Progress value={c.onboardingProgress ?? 0} className="h-2 mt-2" />
            </div>
          ))}
          {onboardingClients.length === 0 && (
            <p className="text-center py-4 text-muted-foreground">No clients currently in onboarding</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'meeting', created_by_user_id: 1 });
  const [editForm, setEditForm] = useState({ title: '', date: '', type: 'meeting' });
  const { companyMetrics, isLoading } = usePerformance();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventsApi.getAll();
      setEvents(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      toast.error('Event title and date are required');
      return;
    }
    try {
      const res = await eventsApi.create(newEvent);
      if (res.success) {
        setIsAddingEvent(false);
        setNewEvent({ title: '', date: '', type: 'meeting', created_by_user_id: 1 });
        fetchEvents();
        toast.success('Event created successfully');
      } else {
        toast.error(res.error || 'Failed to create event');
      }
    } catch (err) {
      console.error("Failed to create event", err);
      toast.error('Connection error while creating event');
    }
  };

  const handleStartEdit = (ev: any) => {
    setEditingEventId(ev.id);
    setEditForm({
      title: ev.title,
      date: ev.date.split('T')[0],
      type: ev.type
    });
  };

  const handleUpdateEvent = async () => {
    if (!editingEventId) return;
    if (!editForm.title || !editForm.date) {
      toast.error('Title and Date are required');
      return;
    }
    try {
      const res = await eventsApi.update(editingEventId, editForm);
      if (res.success) {
        setEditingEventId(null);
        fetchEvents();
        toast.success('Event updated successfully');
      } else {
        toast.error(res.error || 'Failed to update event');
      }
    } catch (err) {
      console.error("Failed to update event", err);
      toast.error('Connection error while updating event');
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventsApi.delete(id);
      fetchEvents();
      toast.success('Event deleted');
    } catch (err) {
      console.error("Failed to delete event", err);
      toast.error('Failed to delete event');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading Admin Dashboard...</div>;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Admin Portal" bgColor="bg-[#2C3E50]" />
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="employees"><UserCog className="h-4 w-4 mr-2" />Employee Directory</TabsTrigger>
            <TabsTrigger value="performance"><ClipboardList className="h-4 w-4 mr-2" />Performance Metrics</TabsTrigger>
            <TabsTrigger value="tasks"><Target className="h-4 w-4 mr-2" />Task Delegation</TabsTrigger>
            <TabsTrigger value="clients"><Globe className="h-4 w-4 mr-2" />Active Clients</TabsTrigger>
            <TabsTrigger value="events"><Calendar className="h-4 w-4 mr-2" />Company Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="employees"><EmployeeManagement /></TabsContent>
          <TabsContent value="performance"><PerformanceReviews /></TabsContent>
          <TabsContent value="tasks"><TaskDelegation /></TabsContent>
          <TabsContent value="clients"><ActiveClientsPanel /></TabsContent>
          
          <TabsContent value="events" className={cls.page}>
            <Card>
              <CardHeader>
                <div className={cls.row}>
                  <div>
                    <CardTitle>Event Calendar</CardTitle>
                    <CardDescription>Manage company events and important dates</CardDescription>
                  </div>
                  {!isAddingEvent && (
                    <Button size="sm" onClick={() => setIsAddingEvent(true)}>
                      <Plus className="h-4 w-4 mr-2" />Add Event
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className={cls.section}>
                {events.map(ev => (
                  <div key={ev.id} className={`${cls.item} border-l-4 ${ev.id === editingEventId ? 'border-blue-500' : 'border-slate-200'}`}>
                    {editingEventId === ev.id ? (
                      <div className="space-y-3 p-2">
                        <div className={cls.grid2}>
                          <div className={cls.field}>
                            <Label className="text-xs">Title</Label>
                            <Input size={1} value={editForm.title} onChange={(e: any) => setEditForm({...editForm, title: e.target.value})} />
                          </div>
                          <div className={cls.field}>
                            <Label className="text-xs">Date</Label>
                            <Input type="date" value={editForm.date} onChange={(e: any) => setEditForm({...editForm, date: e.target.value})} />
                          </div>
                        </div>
                        <div className={cls.field}>
                          <Label className="text-xs">Category</Label>
                          <Select value={editForm.type} onValueChange={(v: string) => setEditForm({...editForm, type: v})}>
                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2 pt-2">
                           <Button size="sm" onClick={handleUpdateEvent}>Save Changes</Button>
                           <Button size="sm" variant="outline" onClick={() => setEditingEventId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className={cls.row}>
                        <div>
                          <h4 className={cls.heading}>{ev.title}</h4>
                          <p className={cls.hint}>{new Date(ev.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                          <Badge className={`${EVENT_COLORS[ev.type] ?? EVENT_COLORS.other} mt-1`}>{ev.type}</Badge>
                        </div>
                        <div className={cls.actions}>
                          <Button variant="outline" size="sm" onClick={() => handleStartEdit(ev)}>
                            <Edit className="h-3.5 w-3.5 mr-1" />Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 border-red-200" onClick={() => handleDeleteEvent(ev.id)}>
                            <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isAddingEvent && (
                  <div className="border-2 border-dashed rounded-lg p-4 bg-muted/20 space-y-3">
                    <h4 className="font-semibold text-sm">Create New Event</h4>
                    <div className={cls.grid2}>
                      <div className={cls.field}>
                        <Label>Event Title</Label>
                        <Input placeholder="E.g. Strategy Meeting" value={newEvent.title} onChange={(e: any) => setNewEvent({...newEvent, title: e.target.value})} />
                      </div>
                      <div className={cls.field}>
                        <Label>Event Date</Label>
                        <Input type="date" value={newEvent.date} onChange={(e: any) => setNewEvent({...newEvent, date: e.target.value})} />
                      </div>
                    </div>
                    <div className={cls.field}>
                      <Label>Category</Label>
                      <Select value={newEvent.type} onValueChange={(v: string) => setNewEvent({...newEvent, type: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-2">
                       <Button onClick={handleCreateEvent}>Create Event</Button>
                       <Button variant="outline" onClick={() => setIsAddingEvent(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
                
                {!isAddingEvent && events.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                    <p className="text-muted-foreground">No events scheduled. Click "Add Event" to start.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
