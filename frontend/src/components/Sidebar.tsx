import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, User, LogOut, Settings2, X } from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { label: "Dashboard", icon: Home, path: "/mainapp" },
        { label: "Friends", icon: Users, path: "/friends" },
        { label: "Profile", icon: User, path: "/profile" },
        { label: "Manage Habits", icon: Settings2, path: "/habits/setup" },
    ];

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
        onClose();
    }

    function handleNavigate(path: string) {
        navigate(path);
        onClose();
    }

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    lg:relative lg:translate-x-0 lg:w-64
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Logo/Header */}
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                            <span className="text-lg font-bold text-primary-foreground">G</span>
                        </div>
                        <h1 className="text-xl font-bold text-foreground">Grind</h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 -mr-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNavigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                    active
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-foreground hover:bg-secondary"
                                }`}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-3 border-t border-border">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

