import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProductById } from '../services/productsService'
import { addToCart, updateQuantity, removeFromCart, getCart } from '../services/cartService'
import { getProductPricing } from '../services/offersService'
import PriceDisplay from '../components/PriceDisplay'
import OfferBadges from '../components/OfferBadges'
import WishlistButton from '../components/WishlistButton'
import { formatCurrency } from '../utils/currency'
import './Product.css'

function Product() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isInCart, setIsInCart] = useState(false)
    const [cartQuantity, setCartQuantity] = useState(0)
    const [busy, setBusy] = useState(false) // prevent rapid-click races

    // Sync local state from cart
    const syncCart = useCallback((prod) => {
        const p = prod || product
        if (!p) return
        const cart = getCart()
        const item = cart.find(i => String(i.id) === String(p.id))
        setIsInCart(!!item)
        setCartQuantity(item ? Number(item.quantity) : 0)
    }, [product])

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true)
                const productData = await getProductById(id)
                if (productData) {
                    setProduct(productData)
                    // Sync cart state once product is loaded
                    const cart = getCart()
                    const item = cart.find(i => String(i.id) === String(productData.id))
                    setIsInCart(!!item)
                    setCartQuantity(item ? Number(item.quantity) : 0)
                } else {
                    setTimeout(() => navigate('/'), 2000)
                }
            } catch (error) {
                console.error('Error loading product:', error)
            } finally {
                setLoading(false)
            }
        }
        loadProduct()
    }, [id, navigate])

    // Keep in sync whenever cart changes from any source
    useEffect(() => {
        const handleCartUpdate = () => syncCart()
        window.addEventListener('cartUpdated', handleCartUpdate)
        return () => window.removeEventListener('cartUpdated', handleCartUpdate)
    }, [syncCart])

    const handleAdd = async () => {
        if (!product || busy) return
        setBusy(true)
        await addToCart(product, 1)
        syncCart(product)
        setBusy(false)
    }

    const handleIncrease = async () => {
        if (!product || busy) return
        setBusy(true)
        const next = cartQuantity + 1
        await updateQuantity(String(product.id), next)
        syncCart(product)
        setBusy(false)
    }

    const handleDecrease = async () => {
        if (!product || busy) return
        setBusy(true)
        if (cartQuantity <= 1) {
            await removeFromCart(String(product.id))
        } else {
            await updateQuantity(String(product.id), cartQuantity - 1)
        }
        syncCart(product)
        setBusy(false)
    }

    if (loading) {
        return (
            <div className="product-page loading">
                <div className="product-container container">
                    <div className="loading-skeleton skeleton-image"></div>
                    <div className="loading-skeleton skeleton-title"></div>
                    <div className="loading-skeleton skeleton-text"></div>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="product-page not-found">
                <div className="status-container text-center">
                    <div className="status-icon">❌</div>
                    <h2 className="status-title">Product Not Found</h2>
                    <p className="status-message">Redirecting to home page...</p>
                </div>
            </div>
        )
    }

    const isOutOfStock = product.stock <= 0
    const pricing = getProductPricing(product)

    return (
        <div className="product-page">
            <div className="product-container container">
                {/* Product Image Section */}
                <div className="product-image-section">
                    <div className="product-image-wrapper">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="product-image"
                            onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-family="sans-serif" font-size="20"%3ENo image%3C/text%3E%3C/svg%3E'
                            }}
                        />

                        {/* Overlays */}
                        {!isOutOfStock && (
                            <div className="wishlist-overlay">
                                <WishlistButton productId={product.id} size="large" />
                            </div>
                        )}

                        {isOutOfStock && (
                            <div className="out-of-stock-overlay">
                                <span className="badge badge--danger badge--large">
                                    Out of Stock
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Back Button Floating */}
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-floating back-btn"
                        aria-label="Go back"
                    >
                        <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {/* Product Info Section */}
                <div className="product-info-section animate-fade-in-up">
                    <div className="product-core-info">
                        <div className="badge-group mb-xs">
                            <OfferBadges product={product} maxBadges={3} />
                        </div>

                        <div className="product-title-row">
                            <h1 className="product-title">{product.name}</h1>
                            {product.stock > 0 && product.stock <= 10 && (
                                <span className="stock-warning">
                                    Only {product.stock} left
                                </span>
                            )}
                        </div>

                        <div className="price-section mb-md">
                            <PriceDisplay product={product} size="large" />
                        </div>

                        {product.description && (
                            <div className="product-description-card card mb-md">
                                <h3 className="section-subtitle mb-xs">About this product</h3>
                                <p className="description-text">{product.description}</p>
                            </div>
                        )}

                        <div className="product-meta-grid">
                            <div className="meta-item">
                                <span className="meta-label">Category</span>
                                <span className="meta-value">{product.category}</span>
                            </div>
                            {!isOutOfStock && (
                                <div className="meta-item">
                                    <span className="meta-label">Availability</span>
                                    <span className="meta-value text-accent-teal">In Stock ({product.stock})</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Panel */}
                    {!isOutOfStock ? (
                        <div className="product-action-panel card">
                            {isInCart ? (
                                /* ── Zepto-style inline qty control ── */
                                <div className="cart-qty-control">
                                    <button
                                        className="cart-qty-btn cart-qty-btn--minus"
                                        onClick={handleDecrease}
                                        disabled={busy}
                                        aria-label="Decrease quantity"
                                    >
                                        −
                                    </button>
                                    <span className="cart-qty-value">{cartQuantity}</span>
                                    <button
                                        className="cart-qty-btn cart-qty-btn--plus"
                                        onClick={handleIncrease}
                                        disabled={busy}
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                /* ── Not in cart: simple Add button ── */
                                <button
                                    onClick={handleAdd}
                                    disabled={busy}
                                    className="btn btn--primary btn--large w-full"
                                >
                                    {busy ? 'Adding…' : `Add to Cart • ${formatCurrency(pricing.currentPrice)}`}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="out-of-stock-notice card">
                            <p className="notice-text">
                                This product is currently out of stock. Please check back later or browse similar items.
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="btn btn--secondary w-full"
                            >
                                Back to Shop
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Product
