
import PageLayout from "@/components/common/PageLayout";
import { AutomationList } from "@/components/automation/AutomationList";

export default function Automations() {
  return (
    <PageLayout>
      <div className="whatsly-fade-in space-y-6">
        <h1 className="whatsly-section-title">Automações</h1>
        <AutomationList />
      </div>
    </PageLayout>
  );
}
