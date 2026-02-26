// src/pages/Login.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import "./Auth.css";

export default function Login() {
    const { login, loginWithGoogle } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();
    const location = useLocation();

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);

            // Check if user came from checkout
            const state = location.state;
            if (state?.intent === 'PLACE_ORDER' && state?.next === '/checkout') {
                nav('/checkout', { replace: true, state: { orderType: state.orderType } });
            } else {
                nav("/", { replace: true });
            }
        } catch (err) {
            setError(err.message || "Failed to login. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleLogin() {
        setLoading(true);
        setError("");

        try {
            await loginWithGoogle();

            // Check if user came from checkout
            const state = location.state;
            if (state?.intent === 'PLACE_ORDER' && state?.next === '/checkout') {
                nav('/checkout', { replace: true, state: { orderType: state.orderType } });
            } else {
                nav("/", { replace: true });
            }
        } catch (err) {
            setError(err.message || "Failed to login with Google. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container container">
                <div className="auth-card card animate-fade-in-up">
                    {/* Header Section */}
                    <div className="auth-header text-center mb-xl">
                        <div className="auth-logo mb-md">
                            <span className="logo-icon text-h1 d-block mb-xs">🛒</span>
                            <span className="logo-text text-h3 text-bold">Much Shop</span>
                        </div>
                        <h1 className="auth-title text-h2 mb-xs">Welcome Back</h1>
                        <p className="auth-subtitle text-secondary">Sign in to your account to continue</p>
                    </div>

                    {/* Alerts */}
                    {location.state?.intent === 'PLACE_ORDER' && (
                        <div className="alert alert--info mb-lg">
                            <span className="alert-icon">🔒</span>
                            <span className="alert-message">Please sign in to complete your order</span>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert--danger mb-lg">
                            <span className="alert-icon">⚠️</span>
                            <span className="alert-message">{error}</span>
                        </div>
                    )}

                    {/* Social Login */}
                    <button
                        onClick={handleGoogleLogin}
                        className="btn btn--secondary w-full mb-lg d-flex items-center justify-center gap-sm"
                        disabled={loading}
                    >
                        <FcGoogle size={20} />
                        <span>Continue with Google</span>
                    </button>

                    <div className="auth-divider mb-lg">
                        <span className="divider-line"></span>
                        <span className="divider-text text-tiny text-tertiary">OR EMAIL</span>
                        <span className="divider-line"></span>
                    </div>

                    {/* Login Form */}
                    <form className="auth-form" onSubmit={handleLogin}>
                        <div className="form-group mb-md">
                            <label className="input-label">Email Address</label>
                            <input
                                type="email"
                                className="input-field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group mb-xl">
                            <div className="d-flex justify-between items-center mb-xs">
                                <label className="input-label mb-0">Password</label>
                                <Link to="/forgot-password" size="sm" className="btn-link text-tiny">Forgot?</Link>
                            </div>
                            <input
                                type="password"
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className={`btn btn--primary btn--large w-full ${loading ? 'is-loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="auth-footer mt-xl text-center">
                        <p className="text-small text-secondary">
                            New to Much Shop?{' '}
                            <Link to="/signup" className="btn-link text-bold">Create an account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
