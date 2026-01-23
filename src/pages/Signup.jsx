// src/pages/Signup.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Auth.css";

export default function Signup() {
    const { signup } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();
    const location = useLocation();

    async function handleSignup(e) {
        e.preventDefault();
        setError("");

        // Validate passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            await signup(email, password);

            // Check if user came from checkout
            const state = location.state;
            if (state?.intent === 'PLACE_ORDER' && state?.next === '/checkout') {
                // Redirect back to checkout to complete order
                nav('/checkout', { replace: true, state: { orderType: state.orderType } });
            } else {
                // Normal signup - go to home
                nav("/", { replace: true });
            }
        } catch (err) {
            setError(err.message || "Failed to create account. Please try again.");
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
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Sign up to start ordering fresh groceries</p>
                </div>

                {/* Checkout Alert */}
                {location.state?.intent === 'PLACE_ORDER' && (
                    <div className="auth-alert">
                        <span className="auth-alert-icon">🔒</span>
                        <span className="auth-alert-text">
                            Please create an account to complete your order
                        </span>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="auth-error">
                        <div className="auth-error-text">{error}</div>
                    </div>
                )}

                {/* Signup Form */}
                <form className="auth-form" onSubmit={handleSignup}>
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
                            placeholder="At least 6 characters"
                            required
                            disabled={loading}
                            minLength={6}
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="auth-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            required
                            disabled={loading}
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button auth-button-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span>Creating account...</span>
                            </>
                        ) : (
                            <>
                                <span>Create Account</span>
                                <span>→</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="auth-footer">
                    <p className="auth-footer-text">
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
