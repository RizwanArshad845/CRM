import { useAuth } from '../../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { TrendingUp, FileText, Users, Mic } from 'lucide-react';
import { DashboardHeader } from '../../components/shared/DashboardHeader';
import { ClientEntryForm } from './ClientEntryForm';
import { MonthlyTargets } from './MonthlyTargets';
//import { AgentPerformance } from './AgentPerformance';
import { SalesRecordings } from './SalesRecordings';

export function SalesDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Sales Team Portal" bgColor="bg-[#2C3E50]" />
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="entry" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="entry"><FileText className="h-4 w-4 mr-2" />CST Entry</TabsTrigger>
            <TabsTrigger value="targets"><TrendingUp className="h-4 w-4 mr-2" />Monthly Targets</TabsTrigger>
            {/* <TabsTrigger value="performance"><Users className="h-4 w-4 mr-2" />Agent Performance</TabsTrigger> */}
            <TabsTrigger value="recordings"><Mic className="h-4 w-4 mr-2" />Call Recordings</TabsTrigger>
          </TabsList>
          <TabsContent value="entry"><ClientEntryForm /></TabsContent>
          <TabsContent value="targets"><MonthlyTargets /></TabsContent>
          {/* <TabsContent value="performance"><AgentPerformance /></TabsContent> */}
          <TabsContent value="recordings"><SalesRecordings /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
