import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import QuantitySelector from '../components/QuantitySelector'
import { getCart, updateQuantity, removeFromCart, clearCart, getCartTotal } from '../services/cartService'
import { formatCurrency } from '../utils/currency'

function Cart() {
    const navigate = useNavigate()
    const [cartItems, setCartItems] = useState([])
    const [total, setTotal] = useState(0)

    // Load cart on mount and listen for updates
    useEffect(() => {
        const loadCart = () => {
            const items = getCart()
            setCartItems(items)
            setTotal(getCartTotal())
        }

        loadCart()

        window.addEventListener('cartUpdated', loadCart)
        return () => window.removeEventListener('cartUpdated', loadCart)
    }, [])

    const handleQuantityChange = (productId, newQuantity) => {
        updateQuantity(productId, newQuantity)
        const items = getCart()
        setCartItems(items)
        setTotal(getCartTotal())
    }

    const handleRemoveItem = (productId) => {
        removeFromCart(productId)
        const items = getCart()
        setCartItems(items)
        setTotal(getCartTotal())
    }

    const handleClearCart = () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            clearCart()
            setCartItems([])
            setTotal(0)
        }
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">
                        Your cart is empty
                    </h2>
                    <p className="text-text-secondary mb-6">
                        Add some fresh products to get started!
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                    >
                        Start Shopping
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white pb-32">
            <div className="max-w-3xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-text-primary">
                        Shopping Cart
                    </h1>
                    <button
                        onClick={handleClearCart}
                        className="text-sm text-red-500 hover:text-red-700 font-medium"
                    >
                        Clear Cart
                    </button>
                </div>

                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white border border-neutral-200 rounded-card p-4 shadow-sm"
                        >
                            <div className="flex gap-4">
                                {/* Product Image */}
                                <button
                                    onClick={() => navigate(`/product/${item.id}`)}
                                    className="flex-shrink-0 w-24 h-24 bg-neutral-100 rounded-lg overflow-hidden"
                                >
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect fill="%23f0f0f0" width="96" height="96"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-family="sans-serif" font-size="12"%3ENo image%3C/text%3E%3C/svg%3E'
                                        }}
                                    />
                                </button>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <button
                                        onClick={() => navigate(`/product/${item.id}`)}
                                        className="font-semibold text-text-primary hover:text-primary text-left mb-1 line-clamp-2"
                                    >
                                        {item.name}
                                    </button>

                                    <div className="text-sm text-text-secondary mb-3">
                                        {formatCurrency(item.price)}/{item.unit}
                                    </div>

                                    {/* Quantity Selector */}
                                    <div className="flex items-center justify-between">
                                        <QuantitySelector
                                            initialQuantity={item.quantity}
                                            min={1}
                                            max={99}
                                            onChange={(qty) => handleQuantityChange(item.id, qty)}
                                        />

                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="text-red-500 hover:text-red-700 p-2"
                                            aria-label="Remove item"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Item Total */}
                                    <div className="mt-2 text-right">
                                        <span className="text-lg font-bold text-text-primary">
                                            {formatCurrency(item.price * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cart Summary */}
                <div className="bg-neutral-50 rounded-card p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-text-secondary">
                            Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
                        </span>
                        <span className="text-2xl font-bold text-text-primary">
                            {formatCurrency(total)}
                        </span>
                    </div>

                    <p className="text-sm text-text-secondary text-center mb-4">
                        Choose pickup or delivery
                    </p>

                    <button
                        onClick={() => navigate('/checkout')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                        style={{ minHeight: '52px' }}
                    >
                        Proceed to Checkout
                    </button>
                </div>

                {/* Continue Shopping */}
                <button
                    onClick={() => navigate('/')}
                    className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold py-3 rounded-lg transition-colors"
                >
                    Continue Shopping
                </button>
            </div>
        </div>
    )
}

export default Cart
