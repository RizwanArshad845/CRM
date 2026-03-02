import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Play, Download, Search, Grid3x3, List, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { StarRating } from '../../components/shared/StarRating';
import { cls } from '../../styles/classes';
import { INITIAL_RECORDINGS, type Recording, type RecordingStatus } from '../../data/mockData';

const STATUS_COLORS: Record<RecordingStatus, string> = {
  available: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export function SalesRecordings() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');

  const agentNames = [...new Set(INITIAL_RECORDINGS.map(r => r.agentName))];

  const filtered = INITIAL_RECORDINGS.filter(r => {
    const term = searchTerm.toLowerCase();
    const matchSearch = r.clientName.toLowerCase().includes(term) || r.agentName.toLowerCase().includes(term);
    const matchAgent = filterAgent === 'all' || r.agentName === filterAgent;
    const matchOutcome = filterOutcome === 'all' || r.outcome === filterOutcome;
    return matchSearch && matchAgent && matchOutcome;
  });

  function RecordingActions({ recording }: { recording: Recording }) {
    if (recording.status === 'available')
      return (
        <div className={`${cls.actions} pt-2`}>
          <Button size="sm" className="flex-1"><Play className="h-4 w-4 mr-2" />Play</Button>
          <Button size="sm" variant="outline"><Download className="h-4 w-4" /></Button>
        </div>
      );
    if (recording.status === 'processing')
      return <Button size="sm" className="w-full" disabled>Processing...</Button>;
    return <Button size="sm" variant="destructive" className="w-full" disabled>Recording Failed</Button>;
  }

  return (
    <div className={cls.page}>
      <Card>
        <CardHeader>
          <div className={cls.row}>
            <div>
              <CardTitle>Monthly Sales Recordings</CardTitle>
              <CardDescription>Access and manage call recordings</CardDescription>
            </div>
            <div className={cls.actions}>
              <Button variant="outline" size="sm" onClick={() => setViewMode('grid')}>
                <Grid3x3 className={`h-4 w-4 ${viewMode === 'grid' ? 'text-primary' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewMode('list')}>
                <List className={`h-4 w-4 ${viewMode === 'list' ? 'text-primary' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by agent or client..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterAgent} onValueChange={setFilterAgent}>
              <SelectTrigger><SelectValue placeholder="Filter by agent" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agentNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterOutcome} onValueChange={setFilterOutcome}>
              <SelectTrigger><SelectValue placeholder="Filter by outcome" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(r => (
                <Card key={r.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className={cls.row}>
                      <div className="flex-1">
                        <h4 className={`${cls.heading} mb-1`}>{r.clientName}</h4>
                        <p className={cls.hint}>{r.agentName}</p>
                      </div>
                      <Badge className={STATUS_COLORS[r.status]}>{r.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className={cls.list}>
                    <div className={`${cls.inline} text-sm`}>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(r.date).toLocaleDateString()}</span>
                      <span className="text-muted-foreground">•</span>
                      <span>{r.duration}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {r.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                    </div>
                    <div>
                      <p className={`${cls.hintXs} mb-1`}>Quality Rating</p>
                      <StarRating rating={r.qualityRating} />
                    </div>
                    <RecordingActions recording={r} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className={cls.list}>
              {filtered.map(r => (
                <div key={r.id} className={`${cls.row} ${cls.itemHover}`}>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div>
                      <p className={cls.heading}>{r.clientName}</p>
                      <p className={cls.hint}>{r.agentName}</p>
                    </div>
                    <div className="text-sm">{new Date(r.date).toLocaleDateString()}</div>
                    <div className={`text-sm ${cls.heading}`}>{r.duration}</div>
                    <Badge className={STATUS_COLORS[r.status]}>{r.status}</Badge>
                    <StarRating rating={r.qualityRating} />
                  </div>
                  {r.status === 'available' && (
                    <div className="flex gap-2 ml-4">
                      <Button size="sm"><Play className="h-4 w-4" /></Button>
                      <Button size="sm" variant="outline"><Download className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No recordings found matching your filters</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
