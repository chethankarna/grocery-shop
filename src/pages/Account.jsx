import './Account.css'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile } from '../services/usersService'
import MyOrders from '../components/orders/MyOrders'

function Account() {
    const { user, userProfile, signout, isAdmin } = useAuth()

    //Tab navigation
    const [activeTab, setActiveTab] = useState('profile') // 'profile' or 'orders'

    // Profile editing state
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    const shopInfo = {
        name: 'Much Shop',
        phone: '919876543210',
        whatsapp: '919876543210',
        email: 'contact@muchshop.com',
        address: '123 Main Street Market Area, City - 500001',
        hours: {
            weekdays: '8:00 AM - 9:00 PM',
            weekends: '8:00 AM - 10:00 PM'
        }
    }

    // Load profile data
    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || '')
            setPhone(userProfile.phone || '')
        }
    }, [userProfile])

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setMessage({ type: '', text: '' })

        try {
            setLoading(true)
            await updateUserProfile(user.uid, { name, phone })
            setMessage({ type: 'success', text: '✓ Profile updated successfully!' })
            setEditing(false)

            // Clear message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000)
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
        } finally {
            setLoading(false)
        }
    }

    const handleContactWhatsApp = () => {
        const message = 'Hi Much Shop, I have a query about your products and services.'
        const url = `https://wa.me/${shopInfo.whatsapp}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
    }

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Recently'
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    return (
        <div className="account-page">
            <div className="account-container">

                {/* Tab Navigation */}
                {user && (
                    <div className="account-tabs">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                        >
                            👤 Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
                        >
                            📦 My Orders
                        </button>
                    </div>
                )}

                {/* Orders Tab Content */}
                {activeTab === 'orders' && user && (
                    <MyOrders />
                )}

                {/* Profile Tab Content */}
                {activeTab === 'profile' && (
                    <>

                        {/* ================= USER PROFILE SECTION ================= */}
                        {user && (
                            <section className="profile-section">
                                <div className="profile-header">
                                    <div className="profile-title-group">
                                        <h2>My Profile</h2>
                                        <p>Manage your account information</p>
                                    </div>

                                    {/* Admin Badge */}
                                    {isAdmin && (
                                        <span className="admin-badge">
                                            Admin
                                        </span>
                                    )}
                                </div>

                                {/* Profile Info Display */}
                                {!editing ? (
                                    <div className="profile-info">
                                        <div className="profile-grid">
                                            <div className="profile-field">
                                                <label>Name</label>
                                                <p>{name || 'Not set'}</p>
                                            </div>

                                            <div className="profile-field">
                                                <label>Phone</label>
                                                <p>{phone || 'Not set'}</p>
                                            </div>

                                            <div className="profile-field">
                                                <label>Email</label>
                                                <p>{user.email}</p>
                                            </div>

                                            <div className="profile-field">
                                                <label>Member Since</label>
                                                <p>{formatDate(userProfile?.createdAt)}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setEditing(true)}
                                            className="btn-primary"
                                        >
                                            ✏️ Edit Profile
                                        </button>
                                    </div>
                                ) : (
                                    /* Edit Form */
                                    <form onSubmit={handleUpdateProfile} className="edit-form">
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Enter your name"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input
                                                type="tel"
                                                className="form-input"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="Enter phone number"
                                                maxLength={10}
                                            />
                                        </div>

                                        <div className="button-group">
                                            <button
                                                type="submit"
                                                className="btn-primary"
                                                disabled={loading}
                                            >
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditing(false)
                                                    setName(userProfile?.name || '')
                                                    setPhone(userProfile?.phone || '')
                                                    setMessage({ type: '', text: '' })
                                                }}
                                                className="btn-secondary"
                                                disabled={loading}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Success/Error Message */}
                                {message.text && (
                                    <div className={`message ${message.type}`}>
                                        {message.text}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* ================= AUTH SECTION ================= */}
                        <section className="profile-section">
                            <h2>Account Actions</h2>

                            {/* NOT LOGGED IN */}
                            {!user && (
                                <div className="profile-info">
                                    <p>You are not logged in</p>

                                    <div className="button-group">
                                        <Link to="/login">
                                            <button className="btn-primary">Login</button>
                                        </Link>

                                        <Link to="/signup">
                                            <button className="btn-secondary">Signup</button>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* LOGGED IN */}
                            {user && (
                                <div className="profile-info">
                                    <div className="button-group">
                                        <button
                                            onClick={signout}
                                            className="btn-danger"
                                        >
                                            Logout
                                        </button>

                                        {/* ADMIN BUTTON */}
                                        {isAdmin && (
                                            <Link to="/admin">
                                                <button className="btn-admin">
                                                    Admin Panel
                                                </button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* ================= SHOP INFO ================= */}

                        {/* Header */}
                        <div className="shop-info-section">
                            <div className="shop-icon-wrapper">
                                <span className="shop-icon">M</span>
                            </div>
                            <h1 className="shop-name">{shopInfo.name}</h1>
                            <p className="shop-tagline">Your trusted grocery partner</p>
                        </div>

                        {/* Contact Information */}
                        <section className="contact-section">
                            <h2>Contact Us</h2>

                            <div className="contact-list">
                                {/* WhatsApp */}
                                <button
                                    onClick={handleContactWhatsApp}
                                    className="whatsapp-button"
                                >
                                    <span>Chat on WhatsApp</span>
                                </button>

                                {/* Phone */}
                                <div className="contact-item">
                                    <div className="contact-label">Phone</div>
                                    <a href={`tel:+${shopInfo.phone}`} className="contact-link">
                                        +{shopInfo.phone}
                                    </a>
                                </div>

                                {/* Email */}
                                <div className="contact-item">
                                    <div className="contact-label">Email</div>
                                    <a href={`mailto:${shopInfo.email}`} className="contact-link">
                                        {shopInfo.email}
                                    </a>
                                </div>

                                {/* Address */}
                                <div className="contact-item">
                                    <div className="contact-label">Address</div>
                                    <p className="contact-value">{shopInfo.address}</p>
                                </div>
                            </div>
                        </section>

                        {/* Business Hours */}
                        <section className="hours-section">
                            <h2>Business Hours</h2>
                            <div className="hours-grid">
                                <div className="hours-item">
                                    <span className="hours-day">Monday - Friday</span>
                                    <span className="hours-time">{shopInfo.hours.weekdays}</span>
                                </div>
                                <div className="hours-item">
                                    <span className="hours-day">Saturday - Sunday</span>
                                    <span className="hours-time">{shopInfo.hours.weekends}</span>
                                </div>
                            </div>
                        </section>

                        {/* About */}
                        <section className="about-section">
                            <h2>About Us</h2>
                            <div className="about-content">
                                <p className="about-text">
                                    Much Shop is your trusted neighborhood grocery store, committed to bringing you the freshest fruits, vegetables, and daily essentials right to your doorstep.
                                </p>
                                <p className="about-text">
                                    We source directly from local farms and trusted suppliers to ensure you get the best quality products at competitive prices.
                                </p>
                            </div>
                        </section>

                        {/* App Version */}
                        <div className="app-version">
                            <p>Much Shop PWA v1.0.0</p>
                            <p>Made with ❤️ for fresh food lovers</p>
                        </div>

                    </>
                )}
                {/* End Profile Tab Content */}

            </div>
        </div>
    )
}

export default Account
