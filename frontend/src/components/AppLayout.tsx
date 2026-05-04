import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";

type AppLayoutProps = {
    children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 px-4 py-3 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                            <span className="text-sm font-bold text-primary-foreground">G</span>
                        </div>
                        <span className="font-semibold text-foreground">Grind</span>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
