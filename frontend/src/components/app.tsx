import { BrowserRouter, Routes, Route } from "react-router-dom"
import { HomePage } from "./home-page"
import { LoginPage } from "./login-page"
import { SignupPage } from "./signup-page"
import { MainAppPage } from "./mainapp-page"
import { HabitSetupPage } from "./habit-setup-page"
import { FriendsPage } from "./FriendsPage"
import { ProfilePage } from "./ProfilePage"
import { AppLayout } from "./AppLayout"

export function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Protected routes with AppLayout */}
                <Route
                    path="/mainapp"
                    element={
                        <AppLayout>
                            <MainAppPage />
                        </AppLayout>
                    }
                />
                <Route
                    path="/habits/setup"
                    element={
                        <AppLayout>
                            <HabitSetupPage />
                        </AppLayout>
                    }
                />
                <Route
                    path="/friends"
                    element={
                        <AppLayout>
                            <FriendsPage />
                        </AppLayout>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <AppLayout>
                            <ProfilePage />
                        </AppLayout>
                    }
                />
                <Route
                    path="/profile/:userId"
                    element={
                        <AppLayout>
                            <ProfilePage />
                        </AppLayout>
                    }
                />
            </Routes>
        </BrowserRouter>
    )
}
