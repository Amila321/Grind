import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, User, LogOut } from "lucide-react";

export function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { label: "Dashboard", icon: Home, path: "/mainapp" },
        { label: "Friends", icon: Users, path: "/friends" },
        { label: "Profile", icon: User, path: "/profile" },
    ];

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    }

    return (
        <aside className="w-64 bg-card border-r border-border h-screen flex flex-col">
            {/* Logo/Header */}
            <div className="p-6 border-b border-border">
                <h1 className="text-xl font-bold text-foreground">Grind</h1>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                active
                                    ? "bg-primary text-primary-foreground"
                                    : "text-foreground hover:bg-secondary"
                            }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-border">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}

