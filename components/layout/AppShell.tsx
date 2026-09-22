import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import InstallPrompt from "@/components/pwa/InstallPrompt";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:flex lg:min-h-screen">
      {/* First tab stop: jump past the sidebar to the page content. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-surface focus:px-4 focus:py-3 focus:text-body focus:font-bold focus:text-accent focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Sidebar />
      <div className="relative mx-auto max-w-[420px] min-h-screen bg-cream shadow-xl lg:mx-0 lg:max-w-none lg:flex-1 lg:shadow-none">
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-[420px] lg:hidden">
          <BottomNav />
        </div>
      </div>
      <InstallPrompt />
    </div>
  );
}
