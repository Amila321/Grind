import { useNavigate } from "react-router-dom";

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
            <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-sm">
                <h1 className="text-2xl font-semibold">Main App</h1>

                <div className="mt-6 space-y-4">
                    <div>
                        <h2 className="text-sm font-medium text-muted-foreground">
                            Logged username
                        </h2>
                        <p className="text-lg font-semibold">
                            {user?.username ?? "No user in localStorage"}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-sm font-medium text-muted-foreground">
                            Token
                        </h2>
                        <pre className="mt-2 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-border bg-muted p-4 text-xs">
                            {token ?? "No token in localStorage"}
                        </pre>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </main>
    );
}