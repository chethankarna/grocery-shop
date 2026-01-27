import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { getUserFavorites, toggleFavorite as toggleFirestoreFavorite } from '../services/favoritesService'

const WishlistContext = createContext()
const WISHLIST_KEY = 'muchshop_wishlist'

export function WishlistProvider({ children }) {
    const { user } = useAuth()
    const [wishlistIds, setWishlistIds] = useState([])
    const [loading, setLoading] = useState(true)

    // Load favorites when user changes
    useEffect(() => {
        const loadFavorites = async () => {
            if (user && !user.isAnonymous) {
                // Load from Firestore for authenticated users
                try {
                    setLoading(true)
                    const firebaseFavorites = await getUserFavorites(user.uid)
                    setWishlistIds(firebaseFavorites)
                } catch (error) {
                    console.error('Error loading favorites from Firestore:', error)
                    // Fallback to localStorage
                    loadFromLocalStorage()
                } finally {
                    setLoading(false)
                }
            } else {
                // Load from localStorage for guests
                loadFromLocalStorage()
                setLoading(false)
            }
        }

        loadFavorites()
    }, [user])

    const loadFromLocalStorage = () => {
        try {
            const stored = localStorage.getItem(WISHLIST_KEY)
            if (stored) {
                const data = JSON.parse(stored)
                setWishlistIds(data.items || [])
            }
        } catch (err) {
            console.error('Error loading wishlist from localStorage:', err)
        }
    }

    // Save to localStorage for guests (backup for auth users)
    useEffect(() => {
        if (!user || user.isAnonymous) {
            try {
                localStorage.setItem(WISHLIST_KEY, JSON.stringify({
                    items: wishlistIds,
                    lastUpdated: new Date().toISOString()
                }))
            } catch (err) {
                console.error('Error saving wishlist to localStorage:', err)
            }
        }

        // Dispatch event for count updates
        window.dispatchEvent(new Event('wishlistUpdated'))
    }, [wishlistIds, user])

    const toggleWishlist = async (productId) => {
        const isCurrentlyInWishlist = wishlistIds.includes(productId)

        if (user && !user.isAnonymous) {
            // Sync with Firestore for authenticated users
            try {
                await toggleFirestoreFavorite(user.uid, productId, isCurrentlyInWishlist)

                // Update local state
                setWishlistIds(prev =>
                    isCurrentlyInWishlist
                        ? prev.filter(id => id !== productId)
                        : [...prev, productId]
                )
            } catch (error) {
                console.error('Error toggling favorite in Firestore:', error)
                // Still update local state as fallback
                setWishlistIds(prev =>
                    isCurrentlyInWishlist
                        ? prev.filter(id => id !== productId)
                        : [...prev, productId]
                )
            }
        } else {
            // For guests, just update localStorage
            setWishlistIds(prev =>
                isCurrentlyInWishlist
                    ? prev.filter(id => id !== productId)
                    : [...prev, productId]
            )
        }
    }

    const addToWishlist = async (productId) => {
        if (!wishlistIds.includes(productId)) {
            if (user && !user.isAnonymous) {
                try {
                    await toggleFirestoreFavorite(user.uid, productId, false)
                    setWishlistIds(prev => [...prev, productId])
                } catch (error) {
                    console.error('Error adding to favorites:', error)
                    setWishlistIds(prev => [...prev, productId])
                }
            } else {
                setWishlistIds(prev => [...prev, productId])
            }
        }
    }

    const removeFromWishlist = async (productId) => {
        if (wishlistIds.includes(productId)) {
            if (user && !user.isAnonymous) {
                try {
                    await toggleFirestoreFavorite(user.uid, productId, true)
                    setWishlistIds(prev => prev.filter(id => id !== productId))
                } catch (error) {
                    console.error('Error removing from favorites:', error)
                    setWishlistIds(prev => prev.filter(id => id !== productId))
                }
            } else {
                setWishlistIds(prev => prev.filter(id => id !== productId))
            }
        }
    }

    const isInWishlist = (productId) => {
        return wishlistIds.includes(productId)
    }

    const clearWishlist = () => {
        setWishlistIds([])
        // Note: This doesn't clear Firestore - we keep favorites in cloud
        // Only clears local state
    }

    const value = {
        wishlistIds,
        wishlistCount: wishlistIds.length,
        loading,
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
