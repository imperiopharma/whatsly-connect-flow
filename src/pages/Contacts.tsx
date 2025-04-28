
import PageLayout from "@/components/common/PageLayout";
import { ContactList } from "@/components/contacts/ContactList";

export default function Contacts() {
  return (
    <PageLayout>
      <div className="whatsly-fade-in space-y-6">
        <h1 className="whatsly-section-title">Contatos</h1>
        <ContactList />
      </div>
    </PageLayout>
  );
}
