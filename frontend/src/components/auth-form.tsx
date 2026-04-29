import {type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface AuthFormProps {
    mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
    const navigate = useNavigate();
    const { login, register } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
    const [touched, setTouched] = useState<{ username?: boolean; password?: boolean }>({});
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isLogin = mode === "login";

    const validateUsername = (value: string) => {
        if (value.length > 0 && value.length < 3) {
            return "Username must be at least 3 characters";
        }
        if (value.length > 40) {
            return "Username must be 40 characters or less";
        }
        return undefined;
    };

    const validatePassword = (value: string) => {
        if (value.length > 0 && value.length < 6) {
            return "Password must be at least 6 characters";
        }
        if (value.length > 20) {
            return "Password must be 20 characters or less";
        }
        return undefined;
    };

    const handleUsernameChange = (value: string) => {
        setUsername(value);
        if (touched.username) {
            setErrors((prev) => ({ ...prev, username: validateUsername(value) }));
        }
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        if (touched.password) {
            setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
        }
    };

    const handleBlur = (field: "username" | "password") => {
        setTouched((prev) => ({ ...prev, [field]: true }));

        if (field === "username") {
            setErrors((prev) => ({ ...prev, username: validateUsername(username) }));
        } else {
            setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
        }
    };

    const isFormValid =
        username.length >= 3 &&
        username.length <= 40 &&
        password.length >= 6 &&
        password.length <= 20;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setSubmitError("");

        if (!isFormValid) {
            setTouched({ username: true, password: true });
            setErrors({
                username: validateUsername(username),
                password: validatePassword(password),
            });
            return;
        }

        try {
            setIsSubmitting(true);

            if (isLogin) {
                await login({
                    username,
                    password,
                });
            } else {
                await register({
                    username,
                    password,
                });

                await login({
                    username,
                    password,
                });
            }

            navigate("/mainapp");
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                        <span className="text-xl font-bold text-primary-foreground">G</span>
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        {isLogin ? "Welcome back" : "Create an account"}
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        {isLogin
                            ? "Enter your credentials to access your account"
                            : "Enter your details to get started"}
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-foreground"
                            >
                                Username
                            </label>

                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                </div>

                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => handleUsernameChange(e.target.value)}
                                    onBlur={() => handleBlur("username")}
                                    placeholder="Enter your username"
                                    className={`w-full rounded-lg border bg-input py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 ${
                                        errors.username
                                            ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                                            : "border-border focus:border-ring focus:ring-ring/20"
                                    }`}
                                />
                            </div>

                            {errors.username && (
                                <p className="text-xs text-destructive">{errors.username}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-foreground"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                </div>

                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    onBlur={() => handleBlur("password")}
                                    placeholder="Enter your password"
                                    className={`w-full rounded-lg border bg-input py-3 pl-10 pr-12 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 ${
                                        errors.password
                                            ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                                            : "border-border focus:border-ring focus:ring-ring/20"
                                    }`}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-foreground"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            {errors.password && (
                                <p className="text-xs text-destructive">{errors.password}</p>
                            )}
                        </div>

                        {submitError && (
                            <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                {submitError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={!isFormValid || isSubmitting}
                            className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
                        >
                            {isSubmitting
                                ? "Loading..."
                                : isLogin
                                    ? "Log in"
                                    : "Sign up"}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-card px-3 text-muted-foreground">or</span>
                        </div>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                        <Link
                            to={isLogin ? "/signup" : "/login"}
                            className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
                        >
                            {isLogin ? "Sign up" : "Log in"}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}