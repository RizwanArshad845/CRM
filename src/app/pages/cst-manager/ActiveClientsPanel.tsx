import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Globe, PowerOff, Power, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cls } from '../../styles/classes';
import { toast } from 'sonner';
import { useClients } from '../../context/ClientContext';

export function ActiveClientsPanel() {
    const { clients, deactivationRequests, toggleActive, resolveDeactivationRequest } = useClients();

    return (
        <div className={cls.page}>
            {/* Pending Deactivation Requests from CST Agents */}
            {deactivationRequests.length > 0 && (
                <Card className="border-2 border-yellow-300 dark:border-yellow-700">
                    <CardHeader>
                        <CardTitle className={`${cls.inline} text-yellow-700 dark:text-yellow-400`}>
                            <AlertTriangle className="h-5 w-5" />
                            Pending Deactivation Requests
                        </CardTitle>
                        <CardDescription>Requests submitted by CST agents — approve or dismiss</CardDescription>
                    </CardHeader>
                    <CardContent className={cls.list}>
                        {deactivationRequests.map(req => (
                            <div key={req.clientId} className={`${cls.item} border-yellow-200`}>
                                <div className={`${cls.row} mb-3 flex-wrap gap-2`}>
                                    <div>
                                        <p className={cls.heading}>{req.clientName}</p>
                                        <p className={cls.hint}>
                                            Requested by <strong>{req.requestedBy}</strong>
                                            {' · '}{new Date(req.requestedAt).toLocaleString()}
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

            {/* All clients table with Activate / Deactivate */}
            <Card>
                <CardHeader>
                    <CardTitle className={cls.inline}>
                        <Globe className="h-5 w-5" />Active Clients
                    </CardTitle>
                    <CardDescription>Activate or deactivate clients directly</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    {['Client', 'Assigned Agent', 'Last Interaction', 'Next Check-In', 'Status', 'Action'].map(h => (
                                        <th key={h} className={cls.tableHead}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {clients.map(c => (
                                    <tr key={c.id} className={`${cls.tableRow} ${!c.isActive ? 'opacity-60' : ''}`}>
                                        <td className={`${cls.tableCell} ${cls.heading}`}>{c.name}</td>
                                        <td className={cls.tableCell}>{c.assignedAgent}</td>
                                        <td className={`${cls.tableCell} ${cls.mono} text-xs`}>{c.lastInteraction}</td>
                                        <td className={`${cls.tableCell} ${cls.mono} text-xs`}>{c.nextCheckIn}</td>
                                        <td className={cls.tableCell}>
                                            <Badge variant={c.isActive ? 'default' : 'secondary'}>
                                                {c.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className={cls.tableCell}>
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
