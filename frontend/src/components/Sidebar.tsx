import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, User, LogOut, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";

type SidebarProps = {
    isCollapsed: boolean;
    onToggle: () => void;
    isMobileOpen: boolean;
    onMobileClose: () => void;
};

export function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { label: "Dashboard", icon: Home, path: "/mainapp" },
        { label: "Friends", icon: Users, path: "/friends" },
        { label: "Profile", icon: User, path: "/profile" },
    ];

    // Close mobile sidebar on route change
    useEffect(() => {
        onMobileClose();
    }, [location.pathname, onMobileClose]);

    // Handle escape key to close mobile sidebar
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isMobileOpen) {
                onMobileClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isMobileOpen, onMobileClose]);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    }

    function handleNavClick(path: string) {
        navigate(path);
    }

    return (
        <aside
            className={`
                fixed md:relative z-50
                ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                ${isCollapsed ? "md:w-16" : "md:w-64"}
                w-64 bg-card border-r border-border h-screen flex flex-col
                transition-all duration-200 ease-out
            `}
            aria-expanded={!isCollapsed}
            aria-label="Main navigation"
        >
            {/* Logo/Header */}
            <div className={`p-4 border-b border-border flex items-center ${isCollapsed ? "md:justify-center" : "justify-between"}`}>
                <div className={`flex items-center gap-3 ${isCollapsed ? "md:hidden" : ""}`}>
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                        G
                    </div>
                    <h1 className="text-xl font-bold text-foreground">Grind</h1>
                </div>
                
                {/* Collapsed logo - desktop only */}
                <div className={`hidden ${isCollapsed ? "md:flex" : "md:hidden"} items-center justify-center`}>
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                        G
                    </div>
                </div>

                {/* Mobile close button */}
                <button
                    onClick={onMobileClose}
                    className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    aria-label="Close navigation"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-3 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.path}
                            onClick={() => handleNavClick(item.path)}
                            title={isCollapsed ? item.label : undefined}
                            className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                                ${isCollapsed ? "md:justify-center md:px-0" : ""}
                                ${active
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-foreground hover:bg-secondary"
                                }
                            `}
                        >
                            <Icon className={`h-5 w-5 shrink-0 ${isCollapsed ? "md:h-5 md:w-5" : ""}`} />
                            <span className={`font-medium whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? "md:hidden" : ""}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            {/* Footer with collapse toggle and logout */}
            <div className="p-3 border-t border-border space-y-1">
                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    title={isCollapsed ? "Logout" : undefined}
                    className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-secondary transition-all
                        ${isCollapsed ? "md:justify-center md:px-0" : ""}
                    `}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span className={`font-medium whitespace-nowrap ${isCollapsed ? "md:hidden" : ""}`}>
                        Logout
                    </span>
                </button>

                {/* Desktop collapse toggle */}
                <button
                    onClick={onToggle}
                    className="hidden md:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <>
                            <ChevronLeft className="h-4 w-4" />
                            <span className="text-sm font-medium">Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
