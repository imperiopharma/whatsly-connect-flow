
import PageLayout from "@/components/common/PageLayout";
import { ContactList } from "@/components/contacts/ContactList";
import { WhatsAppConnection } from "@/components/whatsapp/WhatsAppConnection";

export default function Contacts() {
  return (
    <PageLayout>
      <div className="space-y-6">
        <WhatsAppConnection />
        <ContactList />
      </div>
    </PageLayout>
  );
}
