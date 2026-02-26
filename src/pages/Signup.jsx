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

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            await signup(email, password);

            const state = location.state;
            if (state?.intent === 'PLACE_ORDER' && state?.next === '/checkout') {
                nav('/checkout', { replace: true, state: { orderType: state.orderType } });
            } else {
                nav("/", { replace: true });
            }
        } catch (err) {
            setError(err.message || "Failed to create account. Please try again.");
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
                        <h1 className="auth-title text-h2 mb-xs">Create Account</h1>
                        <p className="auth-subtitle text-secondary">Join us to start ordering fresh products</p>
                    </div>

                    {/* Alerts */}
                    {location.state?.intent === 'PLACE_ORDER' && (
                        <div className="alert alert--info mb-lg">
                            <span className="alert-icon">🔒</span>
                            <span className="alert-message">Please create an account to complete your order</span>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert--danger mb-lg">
                            <span className="alert-icon">⚠️</span>
                            <span className="alert-message">{error}</span>
                        </div>
                    )}

                    {/* Signup Form */}
                    <form className="auth-form" onSubmit={handleSignup}>
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

                        <div className="form-group mb-md">
                            <label className="input-label">Password</label>
                            <input
                                type="password"
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 6 characters"
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        <div className="form-group mb-xl">
                            <label className="input-label">Confirm Password</label>
                            <input
                                type="password"
                                className="input-field"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter password"
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className={`btn btn--primary btn--large w-full ${loading ? 'is-loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="auth-footer mt-xl text-center">
                        <p className="text-small text-secondary">
                            Already have an account?{' '}
                            <Link to="/login" className="btn-link text-bold">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
