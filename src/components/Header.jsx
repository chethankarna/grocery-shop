import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { searchProducts } from '../services/productsService'
import { useAuth } from '../context/AuthContext'
import './Header.css'

function Header() {
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const { user, isAdmin } = useAuth()

    // Debounced search handler
    useEffect(() => {
        if (searchQuery.trim().length === 0) {
            return
        }

        setIsSearching(true)
        const timer = setTimeout(() => {
            // Navigate to home with search query
            navigate(`/?search=${encodeURIComponent(searchQuery)}`)
            setIsSearching(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery, navigate])

    // Clear search when navigating away from home
    useEffect(() => {
        if (location.pathname !== '/') {
            setSearchQuery('')
        }
    }, [location.pathname])

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery)}`)
        }
    }

    return (
        <header className="header">
            <div className="header-container">
                {/* Profile Icon (top-left, for all authenticated users) */}
                {user && (
                    <button
                        onClick={() => navigate('/account')}
                        className="header-profile-btn"
                        aria-label="My Account"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </button>
                )}

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="search-form">
                    <div>
                        <input
                            type="search"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="search-input"
                            aria-label="Search products"
                        />
                        <svg
                            className="search-icon"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {isSearching && (
                            <div className="search-loading">
                                <div className="search-spinner"></div>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </header>
    )
}

export default Header
