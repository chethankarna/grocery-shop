import { getProductPricing } from './offersService'

const CART_KEY = 'muchshop_cart'

/**
 * Get current cart from localStorage
 * @returns {Array} Cart items
 */
export function getCart() {
    try {
        const cart = localStorage.getItem(CART_KEY)
        return cart ? JSON.parse(cart) : []
    } catch (error) {
        console.error('Error reading cart:', error)
        return []
    }
}

/**
 * Save cart to localStorage and dispatch event
 * @param {Array} cart - Cart items
 */
function saveCart(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart))
        // Dispatch custom event for cart updates
        window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
        console.error('Error saving cart:', error)
    }
}

/**
 * Add product to cart (uses discounted price if available)
 * @param {Object} product - Product object
 * @param {number} quantity - Quantity to add
 */
export function addToCart(product, quantity = 1) {
    const cart = getCart()
    const existingItem = cart.find(item => item.id === product.id)

    // Get the current price (discounted if available)
    const pricing = getProductPricing(product)

    if (existingItem) {
        existingItem.quantity += quantity
        // Update price in case it changed
        existingItem.price = pricing.currentPrice
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: pricing.currentPrice, // Use current (discounted) price
            unit: product.unit,
            image: product.image,
            quantity: quantity,
            stock: product.stock,
            category: product.category
        })
    }

    saveCart(cart)
}

/**
 * Update quantity of a cart item
 * @param {string} productId - Product ID
 * @param {number} newQuantity - New quantity
 */
export function updateQuantity(productId, newQuantity) {
    const cart = getCart()
    const item = cart.find(item => item.id === productId)

    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId)
        } else {
            item.quantity = newQuantity
            saveCart(cart)
        }
    }
}

/**
 * Remove item from cart
 * @param {string} productId - Product ID
 */
export function removeFromCart(productId) {
    const cart = getCart().filter(item => item.id !== productId)
    saveCart(cart)
    return cart
}

/**
 * Clear entire cart
 */
export function clearCart() {
    saveCart([])
    return []
}

/**
 * Get cart total amount
 * @returns {number} Total amount
 */
export function getCartTotal() {
    const cart = getCart()
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
}

/**
 * Get total number of items in cart
 * @returns {number} Total item count
 */
export function getCartItemCount() {
    const cart = getCart()
    return cart.reduce((count, item) => count + item.quantity, 0)
}
