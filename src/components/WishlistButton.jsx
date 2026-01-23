import { useState } from 'react'
import { useWishlist } from '../context/WishlistContext'
import './WishlistButton.css'

function WishlistButton({ productId, size = 'normal' }) {
    const { isInWishlist, toggleWishlist } = useWishlist()
    const [isAnimating, setIsAnimating] = useState(false)

    const isSaved = isInWishlist(productId)

    const handleClick = (e) => {
        e.stopPropagation() // Prevent card click
        setIsAnimating(true)
        toggleWishlist(productId)
        setTimeout(() => setIsAnimating(false), 300)
    }

    return (
        <button
            onClick={handleClick}
            className={`wishlist-button wishlist-button--${size} ${isAnimating ? 'wishlist-button--animating' : ''}`}
            aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            <svg
                className="wishlist-icon"
                viewBox="0 0 24 24"
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
        </button>
    )
}

export default WishlistButton
