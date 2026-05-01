import { BrowserRouter, Routes, Route } from "react-router-dom"
import { HomePage } from "./home-page"
import { LoginPage } from "./login-page"
import { SignupPage } from "./signup-page"
import { MainAppPage } from "./mainapp-page"
import { HabitSetupPage } from "./habit-setup-page"

export function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/mainapp" element={<MainAppPage />} />
                <Route path="/habits/setup" element={<HabitSetupPage />} />
            </Routes>
        </BrowserRouter>
    )
}
