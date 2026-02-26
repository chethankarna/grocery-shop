import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import QuantitySelector from '../components/QuantitySelector'
import { getCart, updateQuantity, removeFromCart, clearCart, getCartTotal } from '../services/cartService'
import { formatCurrency } from '../utils/currency'
import './Cart.css'

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

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity <= 0) {
            // Decrement past 1 → remove the item entirely
            handleRemoveItem(productId)
            return
        }
        // Update state immediately (optimistic)
        setCartItems(prev => prev.map(item =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
        ))
        setTotal(cartItems
            .map(item => item.id === productId ? { ...item, quantity: newQuantity } : item)
            .reduce((sum, item) => sum + item.price * item.quantity, 0)
        )
        // Sync with service
        await updateQuantity(productId, newQuantity)
    }

    const handleRemoveItem = async (productId) => {
        // Remove from state immediately (optimistic)
        const updated = cartItems.filter(item => item.id !== productId)
        setCartItems(updated)
        setTotal(updated.reduce((sum, item) => sum + item.price * item.quantity, 0))
        // Sync with service
        await removeFromCart(productId)
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
            <div className="cart-page empty">
                <div className="empty-cart-container container">
                    <div className="empty-cart-icon">🛒</div>
                    <h2 className="empty-cart-title">
                        Your cart is empty
                    </h2>
                    <p className="empty-cart-description">
                        Add some fresh products to get started!
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn--primary"
                    >
                        Start Shopping
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="cart-page">
            <div className="cart-container container">
                {/* Header */}
                <header className="cart-header">
                    <h1 className="cart-title">
                        Shopping Cart
                    </h1>
                    <button
                        onClick={handleClearCart}
                        className="clear-cart-btn"
                    >
                        Clear Cart
                    </button>
                </header>

                {/* Cart Items */}
                <div className="cart-items">
                    {cartItems.map((item, index) => (
                        <div
                            key={item.id}
                            className="cart-item card animate-fade-in-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="cart-item-content">
                                {/* Product Image */}
                                <div
                                    onClick={() => navigate(`/product/${item.id}`)}
                                    className="cart-item-image-wrapper"
                                >
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="cart-item-image"
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect fill="%23f0f0f0" width="96" height="96"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-family="sans-serif" font-size="12"%3ENo image%3C/text%3E%3C/svg%3E'
                                        }}
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="cart-item-details">
                                    <div className="cart-item-header">
                                        <h3
                                            onClick={() => navigate(`/product/${item.id}`)}
                                            className="cart-item-name"
                                        >
                                            {item.name}
                                        </h3>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="remove-item-btn"
                                            aria-label="Remove item"
                                        >
                                            <svg className="icon-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="cart-item-meta">
                                        <span className="cart-item-price">
                                            {formatCurrency(item.price)}
                                        </span>
                                        <span className="cart-item-unit"> / {item.unit}</span>
                                    </div>

                                    <div className="cart-item-footer">
                                        <QuantitySelector
                                            initialQuantity={item.quantity}
                                            min={0}
                                            max={99}
                                            onChange={(qty) => handleQuantityChange(item.id, qty)}
                                        />
                                        <div className="item-total-price">
                                            {formatCurrency(item.price * item.quantity)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cart Summary */}
                <div className="cart-summary card">
                    <div className="summary-row">
                        <span className="summary-label">
                            Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
                        </span>
                        <span className="summary-value">
                            {formatCurrency(total)}
                        </span>
                    </div>

                    <div className="summary-info">
                        Choose pickup or delivery at checkout
                    </div>

                    <div className="cart-actions">
                        <button
                            onClick={() => navigate('/checkout')}
                            className="btn btn--primary btn--large w-full"
                        >
                            Proceed to Checkout
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="btn btn--secondary w-full"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart
