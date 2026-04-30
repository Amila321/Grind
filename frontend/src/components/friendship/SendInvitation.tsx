import { type FormEvent, useState } from "react";
import { UserPlus } from "lucide-react";

interface SendInvitationProps {
    onSend: (username: string) => Promise<void>;
}

export function SendInvitation({ onSend }: SendInvitationProps) {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const isValid = username.trim().length >= 3;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!isValid) return;

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await onSend(username.trim());
            setSuccess(`Friend request sent to @${username.trim()}`);
            setUsername("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send invitation");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium text-foreground">Add Friend</h3>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setError(null);
                            setSuccess(null);
                        }}
                        placeholder="Enter username"
                        className="w-full rounded-lg border border-border bg-input py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:border-ring focus:ring-ring/20"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!isValid || isLoading}
                    className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isLoading ? "Sending..." : "Send Request"}
                </button>
            </form>

            {error && (
                <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </p>
            )}

            {success && (
                <p className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-foreground">
                    {success}
                </p>
            )}
        </div>
    );
}
