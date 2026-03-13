import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Play, Download, Search, Upload, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { StarRating } from '../../components/shared/StarRating';
import { cls } from '../../styles/classes';
import { INITIAL_RECORDINGS, type Recording, type RecordingStatus } from '../../data/mockData';
import { toast } from 'sonner';

const STATUS_COLORS: Record<RecordingStatus, string> = {
  available: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

type LocalRecording = Recording & { objectUrl?: string };

export function SalesRecordings() {
  const [recordings, setRecordings] = useState<LocalRecording[]>(INITIAL_RECORDINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const agentNames = [...new Set(recordings.map(r => r.agentName))];

  const filtered = recordings.filter(r => {
    const term = searchTerm.toLowerCase();
    return (r.clientName.toLowerCase().includes(term) || r.agentName.toLowerCase().includes(term))
      && (filterAgent === 'all' || r.agentName === filterAgent)
      && (filterOutcome === 'all' || r.outcome === filterOutcome);
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const newRec: LocalRecording = {
      id: Date.now().toString(),
      agentName: 'Me',
      clientName: file.name.replace(/\.[^.]+$/, ''),
      date: new Date().toISOString().split('T')[0],
      duration: '—',
      status: 'available',
      qualityRating: 0,
      tags: ['uploaded'],
      outcome: 'pending',
      objectUrl,
    };
    setRecordings(prev => [newRec, ...prev]);
    toast.success(`Recording "${file.name}" uploaded!`);
    e.target.value = '';
  };

  return (
    <div className={cls.page}>
      <Card>
        <CardHeader>
          <div className={cls.row}>
            <div>
              <CardTitle>Call Recordings</CardTitle>
              <CardDescription>Upload, preview, and manage call recordings</CardDescription>
            </div>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />Upload Recording
            </Button>
            <input ref={fileInputRef} type="file" accept="audio/*,video/*" className="hidden" onChange={handleUpload} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(r => (
              <Card key={r.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-4 space-y-3">
                  <div className={cls.row}>
                    <div className="flex-1">
                      <p className={`${cls.heading} mb-0.5`}>{r.clientName}</p>
                      <p className={cls.hint}>{r.agentName}</p>
                    </div>
                    <Badge className={STATUS_COLORS[r.status]}>{r.status}</Badge>
                  </div>

                  <div className={`${cls.inline} text-sm text-muted-foreground`}>
                    <Clock className="h-3.5 w-3.5" />
                    <span>{new Date(r.date).toLocaleDateString()}</span>
                    {r.duration !== '—' && <><span>•</span><span>{r.duration}</span></>}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {r.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                  </div>

                  {r.qualityRating > 0 && (
                    <div>
                      <p className={`${cls.hintXs} mb-1`}>Quality Rating</p>
                      <StarRating rating={r.qualityRating} />
                    </div>
                  )}

                  {/* Audio player for uploaded files */}
                  {r.objectUrl && (
                    <audio controls className="w-full h-8 mt-1" src={r.objectUrl} />
                  )}

                  {/* Play/Download for available mock recordings */}
                  {r.status === 'available' && !r.objectUrl && (
                    <div className={`${cls.actions} pt-1`}>
                      <Button size="sm" className="flex-1" onClick={() => setPlayingId(playingId === r.id ? null : r.id)}>
                        <Play className="h-4 w-4 mr-2" />{playingId === r.id ? 'Playing…' : 'Preview'}
                      </Button>
                      <Button size="sm" variant="outline"><Download className="h-4 w-4" /></Button>
                    </div>
                  )}
                  {r.status === 'processing' && <Button size="sm" className="w-full" disabled>Processing...</Button>}
                  {r.status === 'failed' && <Button size="sm" variant="destructive" className="w-full" disabled>Recording Failed</Button>}
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-12 text-muted-foreground">No recordings found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
