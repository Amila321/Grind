import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

type StoredUser = {
    id: number;
    username: string;
};

export function ProfilePage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    const user: StoredUser | null = useMemo(() => {
        return storedUser ? JSON.parse(storedUser) : null;
    }, [storedUser]);

    useEffect(() => {
        if (!token || !user) {
            navigate("/login");
        }
    }, [token, user, navigate]);

    return (
        <div className="min-h-screen p-8 bg-background">
            <div className="mx-auto max-w-2xl">
                <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-semibold text-primary-foreground">
                                {user?.username?.charAt(0).toUpperCase() ?? "?"}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Username</p>
                                <p className="text-2xl font-bold text-foreground">{user?.username ?? "Unknown"}</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">User ID</p>
                                <p className="text-lg text-foreground font-medium">{user?.id ?? "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
