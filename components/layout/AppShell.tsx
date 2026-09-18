import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:flex lg:min-h-screen">
      <Sidebar />
      <div className="relative mx-auto max-w-[420px] min-h-screen bg-cream shadow-xl lg:mx-0 lg:max-w-none lg:flex-1 lg:shadow-none">
        {children}
        <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-[420px] lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
