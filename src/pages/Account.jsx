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
        // whatsapp: '919876543210',
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

    // const handleContactWhatsApp = () => {
    //     const message = 'Hi Much Shop, I have a query about your products and services.'
    //     const url = `https://wa.me/${shopInfo.whatsapp}?text=${encodeURIComponent(message)}`
    //     window.open(url, '_blank')
    // }

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
            <div className="account-container container">

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
                    <div className="orders-wrapper">
                        <MyOrders />
                    </div>
                )}

                {/* Profile Tab Content */}
                {activeTab === 'profile' && (
                    <div className="profile-content">

                        {/* ================= USER PROFILE SECTION ================= */}
                        {user && (
                            <section className="profile-section card">
                                <div className="profile-header">
                                    <div className="profile-title-group">
                                        <h2 className="section-title">My Profile</h2>
                                        <p className="text-secondary">Manage your account information</p>
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
                                                <label className="text-secondary">Name</label>
                                                <p className="font-semibold">{name || 'Not set'}</p>
                                            </div>

                                            <div className="profile-field">
                                                <label className="text-secondary">Phone</label>
                                                <p className="font-semibold">{phone || 'Not set'}</p>
                                            </div>

                                            <div className="profile-field">
                                                <label className="text-secondary">Email</label>
                                                <p className="font-semibold">{user.email}</p>
                                            </div>

                                            <div className="profile-field">
                                                <label className="text-secondary">Member Since</label>
                                                <p className="font-semibold">{formatDate(userProfile?.createdAt)}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setEditing(true)}
                                            className="btn btn--primary"
                                        >
                                            Edit Profile
                                        </button>
                                    </div>
                                ) : (
                                    /* Edit Form */
                                    <form onSubmit={handleUpdateProfile} className="edit-form">
                                        <div className="form-group">
                                            <label className="font-medium mb-xs">Full Name</label>
                                            <input
                                                type="text"
                                                className="input"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Enter your name"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="font-medium mb-xs">Phone Number</label>
                                            <input
                                                type="tel"
                                                className="input"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="Enter phone number"
                                                maxLength={10}
                                            />
                                        </div>

                                        <div className="button-group">
                                            <button
                                                type="submit"
                                                className="btn btn--primary"
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
                                                className="btn btn--secondary"
                                                disabled={loading}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Success/Error Message */}
                                {message.text && (
                                    <div className={`message mt-md ${message.type}`}>
                                        {message.text}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* ================= AUTH SECTION ================= */}
                        <section className="profile-section card mt-lg">
                            <h2 className="section-title">Account Actions</h2>

                            {/* NOT LOGGED IN */}
                            {!user && (
                                <div className="profile-info">
                                    <p className="text-secondary mb-md">You are not logged in</p>

                                    <div className="button-group">
                                        <Link to="/login">
                                            <button className="btn btn--primary">Login</button>
                                        </Link>

                                        <Link to="/signup">
                                            <button className="btn btn--secondary">Signup</button>
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
                                            className="btn btn--secondary"
                                        >
                                            Logout
                                        </button>

                                        {/* ADMIN BUTTON */}
                                        {isAdmin && (
                                            <Link to="/admin">
                                                <button className="btn btn--primary">
                                                    Admin Panel
                                                </button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* ================= SHOP INFO ================= */}

                        <div className="shop-info-wrapper mt-2xl">
                            <div className="shop-icon-circle">
                                <span>M</span>
                            </div>
                            <h1 className="shop-name-title mt-md">{shopInfo.name}</h1>
                            <p className="shop-tagline-text">{shopInfo.tagline || 'Your trusted grocery partner'}</p>
                        </div>

                        {/* Contact Information */}
                        <section className="contact-section mt-xl">
                            <h2 className="section-title mb-md">Contact Us</h2>

                            <div className="contact-list">
                                {/* Phone */}
                                <div className="contact-card card">
                                    <div className="text-secondary mb-xs">Phone</div>
                                    <a href={`tel:+${shopInfo.phone}`} className="contact-link-accent font-semibold">
                                        +{shopInfo.phone}
                                    </a>
                                </div>

                                {/* Email */}
                                <div className="contact-card card">
                                    <div className="text-secondary mb-xs">Email</div>
                                    <a href={`mailto:${shopInfo.email}`} className="contact-link-accent font-semibold">
                                        {shopInfo.email}
                                    </a>
                                </div>

                                {/* Address */}
                                <div className="contact-card card">
                                    <div className="text-secondary mb-xs">Address</div>
                                    <p className="font-medium">{shopInfo.address}</p>
                                </div>
                            </div>
                        </section>

                        {/* Business Hours */}
                        <section className="hours-section mt-xl">
                            <h2 className="section-title mb-md">Business Hours</h2>
                            <div className="hours-list">
                                <div className="hours-item card mb-xs">
                                    <span className="font-semibold">Monday - Friday</span>
                                    <span className="text-secondary">{shopInfo.hours.weekdays}</span>
                                </div>
                                <div className="hours-item card">
                                    <span className="font-semibold">Saturday - Sunday</span>
                                    <span className="text-secondary">{shopInfo.hours.weekends}</span>
                                </div>
                            </div>
                        </section>

                        {/* About */}
                        <section className="about-section mt-xl">
                            <h2 className="section-title mb-md">About Us</h2>
                            <div className="about-card card bg-surface">
                                <p className="text-secondary mb-sm">
                                    Much Shop is your trusted neighborhood grocery store, committed to bringing you the freshest fruits, vegetables, and daily essentials right to your doorstep.
                                </p>
                                <p className="text-secondary">
                                    We source directly from local farms and trusted suppliers to ensure you get the best quality products at competitive prices.
                                </p>
                            </div>
                        </section>

                        {/* App Version */}
                        <div className="app-footer mt-2xl text-center">
                            <p className="text-tertiary">Much Shop PWA v1.1.0</p>
                            <p className="text-tertiary mt-xs">Made with ❤️ for fresh food lovers</p>
                        </div>

                    </div>
                )}
                {/* End Profile Tab Content */}

            </div>
        </div>
    )
}

export default Account
