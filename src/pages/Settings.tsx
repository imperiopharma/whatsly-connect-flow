
import PageLayout from "@/components/common/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { AutomationSettings } from "@/components/settings/AutomationSettings";
import { ConnectionSettings } from "@/components/settings/ConnectionSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";

export default function Settings() {
  return (
    <PageLayout>
      <div className="whatsly-fade-in space-y-6">
        <h1 className="whatsly-section-title">Configurações</h1>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-4 md:w-[600px] mb-6">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="automation">Automações</TabsTrigger>
            <TabsTrigger value="connection">Conexão</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <GeneralSettings />
          </TabsContent>
          <TabsContent value="automation">
            <AutomationSettings />
          </TabsContent>
          <TabsContent value="connection">
            <ConnectionSettings />
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
