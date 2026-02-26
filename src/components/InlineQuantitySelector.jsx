import { useState, useEffect } from 'react'
import { getCart, addToCart, updateQuantity, removeFromCart } from '../services/cartService'
import './InlineQuantitySelector.css'

function InlineQuantitySelector({ product, variant = 'default' }) {
    const [quantity, setQuantity] = useState(0)
    const [isRemoving, setIsRemoving] = useState(false)

    // Check cart on mount and when cart updates
    useEffect(() => {
        const updateQuantityFromCart = () => {
            const cart = getCart()
            const cartItem = cart.find(item => item.id === product.id)
            setQuantity(cartItem ? cartItem.quantity : 0)
        }

        updateQuantityFromCart()

        // Listen for cart updates
        window.addEventListener('cartUpdated', updateQuantityFromCart)
        return () => window.removeEventListener('cartUpdated', updateQuantityFromCart)
    }, [product.id])

    const handleAdd = (e) => {
        e.stopPropagation()
        addToCart(product, 1)
    }

    const handleIncrement = (e) => {
        e.stopPropagation()
        const newQuantity = quantity + 1
        updateQuantity(product.id, newQuantity)
    }

    const handleDecrement = (e) => {
        e.stopPropagation()
        const newQuantity = quantity - 1

        if (newQuantity === 0) {
            // Trigger remove animation
            setIsRemoving(true)
            setTimeout(() => {
                removeFromCart(product.id)
                setIsRemoving(false)
            }, 200) // Match animation duration
        } else {
            updateQuantity(product.id, newQuantity)
        }
    }

    const isOutOfStock = product.stock <= 0
    const isMaxStock = product.stock && quantity >= product.stock

    // Show ADD button when not in cart
    if (quantity === 0 && !isRemoving) {
        const buttonClass = isOutOfStock
            ? 'out-of-stock-button'
            : variant === 'floating'
                ? 'add-button-floating'
                : 'add-button-transform';

        return (
            <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={buttonClass}
                aria-label={`Add ${product.name} to cart`}
            >
                {variant === 'floating' ? '+' : (isOutOfStock ? 'Out of Stock' : 'ADD')}
            </button>
        )
    }

    // Show inline quantity selector when in cart
    const selectorClass = `inline-quantity-selector ${variant === 'floating' ? 'inline-quantity-selector--floating' : ''} ${isRemoving ? 'removing' : ''}`;

    return (
        <div className={selectorClass}>
            <button
                onClick={handleDecrement}
                className="inline-qty-button"
                aria-label="Decrease quantity"
            >
                −
            </button>

            <div className="inline-qty-display" aria-live="polite">
                {quantity}
            </div>

            <button
                onClick={handleIncrement}
                disabled={isMaxStock}
                className="inline-qty-button"
                aria-label="Increase quantity"
            >
                +
            </button>
        </div>
    )
}

export default InlineQuantitySelector
