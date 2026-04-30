import { useNavigate } from "react-router-dom";
import { FriendshipDashboard } from "./friendship/FriendshipDashboard";

type StoredUser = {
    id: number;
    username: string;
};

export function MainAppPage() {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    const user: StoredUser | null = storedUser ? JSON.parse(storedUser) : null;

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    }

    return (
        <main className="min-h-screen p-8">
            <div className="mx-auto max-w-3xl space-y-8">
                {/* User Profile Section */}
                <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                                {user?.username?.charAt(0).toUpperCase() ?? "?"}
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-foreground">
                                    {user?.username ?? "No user"}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Welcome back
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Friendship Dashboard */}
                <FriendshipDashboard />
            </div>
        </main>
    );
}
