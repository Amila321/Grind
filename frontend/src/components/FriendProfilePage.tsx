import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type FriendUser = {
    id: number;
    username: string;
};

interface LocationState {
    friend?: FriendUser;
}

export function FriendProfilePage() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState | null;

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    const friendUsername = state?.friend?.username ?? `User ${userId}`;

    useEffect(() => {
        if (!token || !storedUser) {
            navigate("/login");
        }
    }, [token, storedUser, navigate]);

    return (
        <div className="min-h-screen p-8 bg-background">
            <div className="mx-auto max-w-2xl space-y-6">
                <button
                    onClick={() => navigate("/mainapp")}
                    className="flex items-center gap-2 text-primary hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </button>

                <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Friend Profile</h1>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-semibold text-primary-foreground">
                                {friendUsername.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Username</p>
                                <p className="text-2xl font-bold text-foreground">{friendUsername}</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">User ID</p>
                                <p className="text-lg text-foreground font-medium">{userId ?? "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
