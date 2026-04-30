import { useState } from "react";
import { RefreshCw, Users, Inbox, Send } from "lucide-react";
import { useFriendship } from "../../hooks/useFriendship";
import { SendInvitation } from "./SendInvitation";
import { FriendsList } from "./FriendsList";
import { IncomingInvitations } from "./IncomingInvitations";
import { SentInvitations } from "./SentInvitations";

type TabId = "friends" | "incoming" | "sent";

interface Tab {
    id: TabId;
    label: string;
    icon: typeof Users;
}

const tabs: Tab[] = [
    { id: "friends", label: "Friends", icon: Users },
    { id: "incoming", label: "Incoming", icon: Inbox },
    { id: "sent", label: "Sent", icon: Send },
];

export function FriendshipDashboard() {
    const [activeTab, setActiveTab] = useState<TabId>("friends");
    const {
        friends,
        receivedInvitations,
        sentInvitations,
        isLoading,
        error,
        sendInvitation,
        acceptInvitation,
        rejectInvitation,
        refreshAll,
        removeFriend,
    } = useFriendship();

    const [isRefreshing, setIsRefreshing] = useState(false);

    async function handleRefresh() {
        setIsRefreshing(true);
        await refreshAll();
        setIsRefreshing(false);
    }

    function getTabCount(tabId: TabId): number {
        switch (tabId) {
            case "friends":
                return friends.length;
            case "incoming":
                return receivedInvitations.length;
            case "sent":
                return sentInvitations.length;
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Friends</h2>
                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={isLoading || isRefreshing}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Refresh"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                    Refresh
                </button>
            </div>

            {/* Send Invitation */}
            <SendInvitation onSend={sendInvitation} />

            {/* Error Banner */}
            {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                    <p className="text-sm text-destructive">{error}</p>
                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="mt-2 text-sm font-medium text-destructive underline-offset-4 hover:underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border">
                    <nav className="flex" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const count = getTabCount(tab.id);
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${
                                        isActive
                                            ? "border-primary text-foreground"
                                            : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                                    }`}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                    {count > 0 && (
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                isActive
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-secondary text-secondary-foreground"
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === "friends" && (
                        <FriendsList friends={friends} isLoading={isLoading} onRemove={removeFriend} />
                    )}
                    {activeTab === "incoming" && (
                        <IncomingInvitations
                            invitations={receivedInvitations}
                            onAccept={acceptInvitation}
                            onReject={rejectInvitation}
                            isLoading={isLoading}
                        />
                    )}
                    {activeTab === "sent" && (
                        <SentInvitations invitations={sentInvitations} isLoading={isLoading} />
                    )}
                </div>
            </div>
        </div>
    );
}
