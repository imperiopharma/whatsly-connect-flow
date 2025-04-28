
import PageLayout from "@/components/common/PageLayout";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default function Chats() {
  return (
    <PageLayout>
      <div className="whatsly-fade-in h-[calc(100vh-4rem)] flex gap-4">
        <ChatList />
        <ChatWindow />
      </div>
    </PageLayout>
  );
}
