const CART_STORAGE_KEY = 'freshmart_cart'

/**
 * Get cart items from localStorage
 * @returns {Array} Array of cart items
 */
export function getCart() {
    try {
        const cart = localStorage.getItem(CART_STORAGE_KEY)
        return cart ? JSON.parse(cart) : []
    } catch (error) {
        console.error('Error reading cart from localStorage:', error)
        return []
    }
}

/**
 * Save cart to localStorage
 * @param {Array} cart - Cart items array
 */
function saveCart(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
        // Dispatch custom event for cart updates
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }))
    } catch (error) {
        console.error('Error saving cart to localStorage:', error)
    }
}

/**
 * Add item to cart or update quantity if exists
 * @param {Object} product - Product object
 * @param {number} quantity - Quantity to add
 */
export function addToCart(product, quantity = 1) {
    const cart = getCart()
    const existingItemIndex = cart.findIndex(item => item.id === product.id)

    if (existingItemIndex > -1) {
        // Update existing item quantity
        cart[existingItemIndex].quantity += quantity
    } else {
        // Add new item
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            unit: product.unit,
            image: product.image,
            quantity: quantity
        })
    }

    saveCart(cart)
    return cart
}

/**
 * Update item quantity in cart
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 */
export function updateQuantity(productId, quantity) {
    const cart = getCart()
    const itemIndex = cart.findIndex(item => item.id === productId)

    if (itemIndex > -1) {
        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            cart.splice(itemIndex, 1)
        } else {
            cart[itemIndex].quantity = quantity
        }
        saveCart(cart)
    }

    return cart
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
