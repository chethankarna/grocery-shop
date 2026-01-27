import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProductById } from '../services/productsService'
import { addToCart } from '../services/cartService'
import { getProductPricing } from '../services/offersService'
import QuantitySelector from '../components/QuantitySelector'
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
    const [quantity, setQuantity] = useState(1)
    const [showAddFeedback, setShowAddFeedback] = useState(false)

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true)
                const productData = await getProductById(id)
                if (productData) {
                    setProduct(productData)
                } else {
                    // Product not found
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

    const handleAddToCart = () => {
        addToCart(product, quantity)
        setShowAddFeedback(true)
        setTimeout(() => setShowAddFeedback(false), 2000)
    }



    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-3xl mx-auto px-4 py-6">
                    <div className="aspect-square bg-neutral-100 rounded-card mb-6 skeleton"></div>
                    <div className="h-8 bg-neutral-100 rounded mb-4 skeleton w-3/4"></div>
                    <div className="h-6 bg-neutral-100 rounded mb-6 skeleton w-1/2"></div>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">
                        Product Not Found
                    </h2>
                    <p className="text-text-secondary mb-4">
                        Redirecting to home page...
                    </p>
                </div>
            </div>
        )
    }

    const isOutOfStock = product.stock <= 0

    return (
        <div className="min-h-screen bg-white pb-6">
            <div className="max-w-3xl mx-auto">
                {/* Product Image */}
                <div className="relative aspect-square bg-neutral-100 mb-6">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-family="sans-serif" font-size="20"%3ENo image%3C/text%3E%3C/svg%3E'
                        }}
                    />

                    {/* Wishlist Button */}
                    {!isOutOfStock && (
                        <div className="absolute top-4 right-4 z-10">
                            <WishlistButton productId={product.id} size="large" />
                        </div>
                    )}

                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-bold text-xl bg-red-500 px-6 py-2 rounded-full">
                                Out of Stock
                            </span>
                        </div>
                    )}

                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-text-primary hover:bg-neutral-100"
                        aria-label="Go back"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                <div className="px-4">
                    {/* Product Info */}
                    <div className="mb-6">
                        {/* Offer Badges */}
                        <div className="mb-3">
                            <OfferBadges product={product} maxBadges={3} />
                        </div>

                        <div className="flex items-start justify-between mb-2">
                            <h1 className="text-2xl font-bold text-text-primary flex-1">
                                {product.name}
                            </h1>
                            {product.stock > 0 && product.stock <= 10 && (
                                <span className="text-sm text-orange-500 font-medium bg-orange-50 px-3 py-1 rounded-full ml-2">
                                    Only {product.stock} left
                                </span>
                            )}
                        </div>

                        {/* Price Display */}
                        <div className="mb-4">
                            <PriceDisplay product={product} size="large" />
                        </div>

                        {product.description && (
                            <p className="text-text-secondary leading-relaxed mb-4">
                                {product.description}
                            </p>
                        )}

                        <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center text-text-secondary">
                                <span className="font-medium mr-1">Category:</span>
                                <span className="text-primary font-medium">{product.category}</span>
                            </div>
                            {!isOutOfStock && (
                                <div className="flex items-center text-text-secondary">
                                    <span className="font-medium mr-1">In Stock:</span>
                                    <span className="text-primary font-medium">{product.stock}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {!isOutOfStock && (
                        <>
                            {/* Quantity Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-text-primary mb-3">
                                    Quantity
                                </label>
                                <QuantitySelector
                                    initialQuantity={quantity}
                                    min={1}
                                    max={Math.min(product.stock, 99)}
                                    onChange={setQuantity}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleAddToCart}
                                    className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    style={{ minHeight: '52px' }}
                                >
                                    {showAddFeedback ? '✓ Added to Cart!' : `Add to Cart - ${formatCurrency(getProductPricing(product).currentPrice * quantity)} `}
                                </button>


                            </div>
                        </>
                    )}

                    {isOutOfStock && (
                        <div className="text-center py-8">
                            <p className="text-text-secondary text-lg">
                                This product is currently out of stock. Please check back later.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Product
