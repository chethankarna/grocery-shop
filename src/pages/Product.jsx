import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProductById } from '../services/productsService'
import { addToCart } from '../services/cartService'
import { generateProductOrderUrl } from '../utils/whatsapp'
import QuantitySelector from '../components/QuantitySelector'
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

    const handleOrderWhatsApp = () => {
        const url = generateProductOrderUrl(product, quantity)
        window.open(url, '_blank')
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

                        <div className="flex items-baseline mb-4">
                            <span className="text-3xl font-bold text-text-primary mr-2">
                                {formatCurrency(product.price)}
                            </span>
                            <span className="text-lg text-text-secondary">
                                /{product.unit}
                            </span>
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
                                    {showAddFeedback ? '✓ Added to Cart!' : `Add to Cart - ${formatCurrency(product.price * quantity)} `}
                                </button>

                                <button
                                    onClick={handleOrderWhatsApp}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 flex items-center justify-center space-x-2"
                                    style={{ minHeight: '52px' }}
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    <span>Order on WhatsApp</span>
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
