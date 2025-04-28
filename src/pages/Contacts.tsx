
import PageLayout from "@/components/common/PageLayout";
import { ContactList } from "@/components/contacts/ContactList";
import { WhatsAppConnection } from "@/components/whatsapp/WhatsAppConnection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bug } from "lucide-react";

export default function Contacts() {
  return (
    <PageLayout>
      <div className="space-y-6">
        <Alert className="border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400">
          <Bug className="h-4 w-4" />
          <AlertTitle>Configuração necessária</AlertTitle>
          <AlertDescription>
            É necessário configurar a URL do backend no arquivo <code>src/config/api.ts</code> para apontar para a sua VPS.
          </AlertDescription>
        </Alert>
        
        <WhatsAppConnection />
        <ContactList />
      </div>
    </PageLayout>
  );
}
