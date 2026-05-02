import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FriendshipDashboard } from "./friendship";

export function FriendsPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    useEffect(() => {
        if (!token || !storedUser) {
            navigate("/login");
        }
    }, [token, storedUser, navigate]);

    return (
        <div className="min-h-screen p-8 bg-background">
            <div className="mx-auto max-w-3xl">
                <FriendshipDashboard />
            </div>
        </div>
    );
}
