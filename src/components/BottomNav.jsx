import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getCartItemCount } from '../services/cartService'
import { useWishlist } from '../context/WishlistContext'
import './BottomNav.css'

function BottomNav() {
    const location = useLocation()
    const [cartCount, setCartCount] = useState(0)
    const { wishlistCount } = useWishlist()

    // Update cart count on mount and when cart changes
    useEffect(() => {
        const updateCartCount = () => {
            setCartCount(getCartItemCount())
        }

        updateCartCount()

        // Listen for cart updates
        window.addEventListener('cartUpdated', updateCartCount)

        return () => {
            window.removeEventListener('cartUpdated', updateCartCount)
        }
    }, [])

    const navItems = [
        {
            path: '/',
            label: 'Home',
            icon: (active) => (
                <svg className={`nav-icon ${active ? 'active' : 'inactive'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            path: '/categories',
            label: 'Categories',
            icon: (active) => (
                <svg className={`nav-icon ${active ? 'active' : 'inactive'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0  24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            path: '/wishlist',
            label: 'Favorites',
            icon: (active) => (
                <div style={{ position: 'relative' }}>
                    <svg className={`nav-icon ${active ? 'active' : 'inactive'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {wishlistCount > 0 && (
                        <span className="cart-badge">
                            {wishlistCount > 9 ? '9+' : wishlistCount}
                        </span>
                    )}
                </div>
            )
        },
        {
            path: '/cart',
            label: 'Cart',
            icon: (active) => (
                <div style={{ position: 'relative' }}>
                    <svg className={`nav-icon ${active ? 'active' : 'inactive'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cartCount > 0 && (
                        <span className="cart-badge">
                            {cartCount > 9 ? '9+' : cartCount}
                        </span>
                    )}
                </div>
            )
        },
        {
            path: '/account',
            label: 'Account',
            icon: (active) => (
                <svg className={`nav-icon ${active ? 'active' : 'inactive'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        }
    ]

    return (
        <nav className="bottom-nav">
            <div className="bottom-nav-container">
                <div className="bottom-nav-items">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                aria-label={`Navigate to ${item.label}`}
                            >
                                {item.icon(isActive)}
                                <span className={`nav-label ${isActive ? 'active' : 'inactive'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}

export default BottomNav
