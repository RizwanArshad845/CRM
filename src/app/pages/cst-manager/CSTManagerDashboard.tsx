import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Inbox, Users, BookOpen, Target, Globe } from 'lucide-react';
import { DashboardHeader } from '../../components/shared/DashboardHeader';
import { useClientInbox } from '../../context/ClientInboxContext';

import { InboxPanel }         from './InboxPanel';
import { AssignedPanel }      from './AssignedPanel';
import { ActiveClientsPanel } from './ActiveClientsPanel';
import { StrategiesPanel }    from './StrategiesPanel';
import { TargetsPanel }       from './TargetsPanel';

export function CSTManagerDashboard() {
    const { inboxClients } = useClientInbox();
    const pendingCount = inboxClients.filter(c => c.status === 'pending').length;

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader title="CST Manager Portal" bgColor="bg-[#1a3a5c]" />
            <main className="container mx-auto px-4 py-8">
                <Tabs defaultValue="inbox" className="w-full">
                    <TabsList className="mb-6 flex-wrap h-auto gap-1">
                        <TabsTrigger value="inbox" className="relative">
                            <Inbox className="h-4 w-4 mr-2" />
                            Client Inbox
                            {pendingCount > 0 && (
                                <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
                                    {pendingCount}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="assigned">
                            <Users className="h-4 w-4 mr-2" />Assigned Clients
                        </TabsTrigger>
                        <TabsTrigger value="active">
                            <Globe className="h-4 w-4 mr-2" />Active Clients
                        </TabsTrigger>
                        <TabsTrigger value="strategies">
                            <BookOpen className="h-4 w-4 mr-2" />Strategies
                        </TabsTrigger>
                        <TabsTrigger value="targets">
                            <Target className="h-4 w-4 mr-2" />Agent Targets
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="inbox">    <InboxPanel />         </TabsContent>
                    <TabsContent value="assigned"> <AssignedPanel />      </TabsContent>
                    <TabsContent value="active">   <ActiveClientsPanel /> </TabsContent>
                    <TabsContent value="strategies"><StrategiesPanel />   </TabsContent>
                    <TabsContent value="targets">  <TargetsPanel />       </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
