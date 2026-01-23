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
                // Redirect back to checkout to complete order
                nav('/checkout', { replace: true, state: { orderType: state.orderType } });
            } else {
                // Normal login - go to home
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
        <div className="auth-container">
            <div className="auth-card">
                {/* Logo & Header */}
                <div className="auth-header">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">🛒</div>
                        <span className="auth-logo-text">Much Shop</span>
                    </div>
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Login to continue shopping</p>
                </div>

                {/* Checkout Alert */}
                {location.state?.intent === 'PLACE_ORDER' && (
                    <div className="auth-alert">
                        <span className="auth-alert-icon">🔒</span>
                        <span className="auth-alert-text">
                            Please sign in to complete your order
                        </span>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="auth-error">
                        <div className="auth-error-text">{error}</div>
                    </div>
                )}

                {/* Login Form */}
                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="auth-form-group">
                        <label className="auth-label" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="auth-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="auth-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button auth-button-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <span>Login</span>
                                <span>→</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="auth-divider">
                    <span className="auth-divider-text">or</span>
                </div>

                {/* Google Login Button */}
                <button
                    onClick={handleGoogleLogin}
                    className="auth-button auth-button-google"
                    disabled={loading}
                >
                    <FcGoogle size={24} />
                    <span>Continue with Google</span>
                </button>

                {/* Footer Link */}
                <div className="auth-footer">
                    <p className="auth-footer-text">
                        Don't have an account?{' '}
                        <Link to="/signup" className="auth-link">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
