import { createContext, useContext, useState, useEffect } from 'react'

const WishlistContext = createContext()
const WISHLIST_KEY = 'muchshop_wishlist'

export function WishlistProvider({ children }) {
    const [wishlistIds, setWishlistIds] = useState([])

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(WISHLIST_KEY)
            if (stored) {
                const data = JSON.parse(stored)
                setWishlistIds(data.items || [])
            }
        } catch (err) {
            console.error('Error loading wishlist:', err)
        }
    }, [])

    // Save to localStorage on change
    useEffect(() => {
        try {
            localStorage.setItem(WISHLIST_KEY, JSON.stringify({
                items: wishlistIds,
                lastUpdated: new Date().toISOString()
            }))
            window.dispatchEvent(new Event('wishlistUpdated'))
        } catch (err) {
            console.error('Error saving wishlist:', err)
        }
    }, [wishlistIds])

    const addToWishlist = (productId) => {
        setWishlistIds(prev =>
            prev.includes(productId) ? prev : [...prev, productId]
        )
    }

    const removeFromWishlist = (productId) => {
        setWishlistIds(prev => prev.filter(id => id !== productId))
    }

    const toggleWishlist = (productId) => {
        setWishlistIds(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
    }

    const isInWishlist = (productId) => {
        return wishlistIds.includes(productId)
    }

    const clearWishlist = () => {
        setWishlistIds([])
    }

    const value = {
        wishlistIds,
        wishlistCount: wishlistIds.length,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist
    }

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const context = useContext(WishlistContext)
    if (!context) {
        throw new Error('useWishlist must be used within WishlistProvider')
    }
    return context
}
