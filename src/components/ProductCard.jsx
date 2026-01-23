import { useNavigate } from 'react-router-dom'
import InlineQuantitySelector from './InlineQuantitySelector'
import PriceDisplay from './PriceDisplay'
import OfferBadges from './OfferBadges'
import WishlistButton from './WishlistButton'
import './ProductCard.css'

function ProductCard({ product, showAddButton = true }) {
    const navigate = useNavigate()

    const handleCardClick = () => {
        navigate(`/product/${product.id}`)
    }

    const isOutOfStock = product.stock <= 0

    return (
        <article
            onClick={handleCardClick}
            className="product-card"
            aria-label={`View ${product.name} details`}
        >
            {/* Product Image */}
            <div className="product-image-container">
                <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="product-image"
                    onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f7f7f7" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-family="sans-serif" font-size="14"%3ENo image%3C/text%3E%3C/svg%3E'
                    }}
                />

                {/* Wishlist Button */}
                {!isOutOfStock && (
                    <div className="product-wishlist-button">
                        <WishlistButton productId={product.id} size="small" />
                    </div>
                )}

                {/* Offer Badges (Overlay on image) */}
                {!isOutOfStock && (
                    <div className="product-badges-overlay">
                        <OfferBadges product={product} maxBadges={2} />
                    </div>
                )}

                {isOutOfStock && (
                    <div className="out-of-stock-overlay">
                        <span className="out-of-stock-badge">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="product-info">
                <h3 className="product-name">
                    {product.name}
                </h3>

                {/* Price Display */}
                <PriceDisplay product={product} size="normal" />

                {/* Inline Quantity Selector */}
                {showAddButton && (
                    <InlineQuantitySelector product={product} />
                )}
            </div>
        </article>
    )
}

export default ProductCard
