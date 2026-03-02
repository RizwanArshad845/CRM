import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Star, Edit, Eye, Download, Trash2, X, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { cls } from '../../styles/classes';
import { INITIAL_AGENTS, type Agent, type TrainingStatus } from '../../data/mockData';

const TRAINING_COLORS: Record<TrainingStatus, string> = {
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  pending: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

function scoreColor(score: number) {
  if (score >= 85) return 'text-green-600 dark:text-green-400';
  if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

function Stars({ rating }: { rating: number }) {
  if (rating === 0) return <span className={cls.hint}>Not rated</span>;
  return (
    <div className={cls.actions}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`h-4 w-4 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

export function AgentPerformance() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [sortBy, setSortBy] = useState('overall');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null);
  const [editForm, setEditForm] = useState<Agent | null>(null);

  const handleSave = () => {
    if (!editForm) return;
    setAgents(prev => prev.map(a => a.id === editForm.id ? editForm : a));
    setEditForm(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setAgents(prev => prev.filter(a => a.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const setField = (field: keyof Agent, value: string | number) => {
    if (editForm) setEditForm({ ...editForm, [field]: value });
  };

  let list = [...agents];
  if (filterStatus !== 'all') list = list.filter(a => a.floorTrainingStatus === filterStatus);
  if (sortBy === 'overall') list.sort((a, b) => b.overallScore - a.overallScore);
  else if (sortBy === 'calls') list.sort((a, b) => b.numberOfCalls - a.numberOfCalls);
  else if (sortBy === 'behavior') list.sort((a, b) => b.behaviorRating - a.behaviorRating);

  return (
    <div className={cls.page}>
      <Card>
        <CardHeader>
          <div className={cls.row}>
            <div>
              <CardTitle>Agent Performance Sheet</CardTitle>
              <CardDescription>Track and evaluate agent performance metrics</CardDescription>
            </div>
            <div className={cls.actions}>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />Export to Excel
              </Button>
              <Button size="sm">Add New Agent</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className={`${cls.label} mb-2 block`}>Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">Overall Score</SelectItem>
                  <SelectItem value="calls">Number of Calls</SelectItem>
                  <SelectItem value="behavior">Behavior Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className={`${cls.label} mb-2 block`}>Filter by Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  <SelectItem value="completed">Training Completed</SelectItem>
                  <SelectItem value="in-progress">Training In Progress</SelectItem>
                  <SelectItem value="pending">Training Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="border-b-2">
                <tr>
                  {['Agent Name', 'Behavior', 'Training Status', 'Tech Coord.', 'Calls', 'Recording', 'Overall', 'Actions'].map(h => (
                    <th key={h} className={cls.tableHead}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map(agent => (
                  <tr key={agent.id} className={cls.tableRow}>
                    <td className={cls.tableCell}>
                      <div className={cls.inline}>
                        <div className={cls.avatar}>
                          <span className={cls.avatarText}>{agent.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <span className={cls.heading}>{agent.name}</span>
                      </div>
                    </td>
                    <td className={cls.tableCell}><Stars rating={agent.behaviorRating} /></td>
                    <td className={cls.tableCell}>
                      <Badge className={TRAINING_COLORS[agent.floorTrainingStatus]}>
                        {agent.floorTrainingStatus.replace('-', ' ')}
                      </Badge>
                    </td>
                    <td className={cls.tableCell}><Stars rating={agent.techCoordination} /></td>
                    <td className={cls.tableCell}><span className={cls.heading}>{agent.numberOfCalls}</span></td>
                    <td className={cls.tableCell}><Stars rating={agent.recordingPerformance} /></td>
                    <td className={cls.tableCell}>
                      <span className={`${cls.metric} ${scoreColor(agent.overallScore)}`}>{agent.overallScore}</span>
                    </td>
                    <td className={cls.tableCell}>
                      <div className={cls.iconRow}>
                        <Button variant="ghost" size="sm" onClick={() => setEditForm({ ...agent })} title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => setDeleteTarget(agent)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {list.map(agent => (
              <Card key={agent.id}>
                <CardHeader>
                  <div className={cls.row}>
                    <div className={cls.inline}>
                      <div className={cls.avatar}>
                        <span className={cls.avatarText}>{agent.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <h4 className={cls.heading}>{agent.name}</h4>
                        <Badge className={TRAINING_COLORS[agent.floorTrainingStatus]} variant="outline">
                          {agent.floorTrainingStatus}
                        </Badge>
                      </div>
                    </div>
                    <div className={`${cls.metric} ${scoreColor(agent.overallScore)}`}>{agent.overallScore}</div>
                  </div>
                </CardHeader>
                <CardContent className={cls.section}>
                  <div className={cls.grid2}>
                    <div><p className={`${cls.hint} mb-1`}>Behavior</p><Stars rating={agent.behaviorRating} /></div>
                    <div><p className={`${cls.hint} mb-1`}>Tech Coord.</p><Stars rating={agent.techCoordination} /></div>
                    <div><p className={`${cls.hint} mb-1`}>Calls</p><p className={cls.heading}>{agent.numberOfCalls}</p></div>
                    <div><p className={`${cls.hint} mb-1`}>Recording</p><Stars rating={agent.recordingPerformance} /></div>
                  </div>
                  <div className={cls.actions}>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditForm({ ...agent })}>
                      <Edit className="h-4 w-4 mr-2" />Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />Details
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      className="flex-1 text-red-500 hover:text-red-700 border-red-200 hover:bg-red-50"
                      onClick={() => setDeleteTarget(agent)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <div className={`${cls.inline} mb-4`}>
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Delete Agent</h3>
                <p className={cls.hint}>This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm mb-6">
              Are you sure you want to delete <span className={cls.heading}>{deleteTarget.name}</span>? All their data will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className={`${cls.row} mb-6`}>
              <h3 className="font-semibold text-lg">Edit — {editForm.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setEditForm(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className={cls.section}>
              {([
                { label: 'Agent Name', field: 'name' as keyof Agent, type: 'text' },
                { label: 'Behavior Rating (0–5)', field: 'behaviorRating' as keyof Agent, type: 'number', step: 0.1, min: 0, max: 5 },
                { label: 'Tech Coordination (0–5)', field: 'techCoordination' as keyof Agent, type: 'number', step: 0.1, min: 0, max: 5 },
                { label: 'Number of Calls', field: 'numberOfCalls' as keyof Agent, type: 'number', min: 0 },
                { label: 'Recording Quality (0–5)', field: 'recordingPerformance' as keyof Agent, type: 'number', step: 0.1, min: 0, max: 5 },
                { label: 'Overall Score (0–100)', field: 'overallScore' as keyof Agent, type: 'number', min: 0, max: 100 },
              ]).map(({ label, field, type, ...rest }) => (
                <div key={field}>
                  <label className={`${cls.label} mb-1 block`}>{label}</label>
                  <input
                    type={type}
                    className={cls.input}
                    value={editForm[field] as string | number}
                    onChange={e => setField(field, type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                    {...rest}
                  />
                </div>
              ))}
              <div>
                <label className={`${cls.label} mb-1 block`}>Training Status</label>
                <Select value={editForm.floorTrainingStatus} onValueChange={v => setField('floorTrainingStatus', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="outline" onClick={() => setEditForm(null)}>Cancel</Button>
              <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
