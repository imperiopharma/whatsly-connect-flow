
import { MessageCircle, Users, BarChart3 } from "lucide-react";
import PageLayout from "@/components/common/PageLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ConnectionStatus } from "@/components/dashboard/ConnectionStatus";
import { RecentChats } from "@/components/dashboard/RecentChats";
import { AutomationOverview } from "@/components/dashboard/AutomationOverview";

export default function Dashboard() {
  return (
    <PageLayout>
      <div className="whatsly-fade-in space-y-6">
        <h1 className="whatsly-section-title">Dashboard</h1>
        
        <div className="whatsly-dashboard-grid">
          <StatsCard 
            title="Mensagens Hoje" 
            value="124" 
            indicator={{ value: 12, positive: true }}
            icon={<MessageCircle className="h-5 w-5" />}
          />
          <StatsCard 
            title="Contatos Ativos" 
            value="85" 
            indicator={{ value: 4, positive: true }}
            icon={<Users className="h-5 w-5" />}
          />
          <StatsCard 
            title="Taxa de Resposta" 
            value="92%" 
            indicator={{ value: 2, positive: true }}
            icon={<BarChart3 className="h-5 w-5" />}
          />
          
          <ConnectionStatus />
          
          <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentChats />
            <AutomationOverview />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
