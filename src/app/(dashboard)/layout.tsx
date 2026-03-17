import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { ChatWidget } from "@/components/chat-widget";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const showChat = session.role === "ADMIN" || session.role === "TEACHER";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={{ name: session.name, email: session.email, role: session.role }} />
      <main className="flex-1 overflow-y-auto bg-muted/30">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
      {showChat && <ChatWidget />}
    </div>
  );
}
