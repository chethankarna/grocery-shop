import { getProductPricing } from './offersService'
import {
    addToFirestoreCart,
    updateFirestoreCartQuantity,
    removeFromFirestoreCart,
    getFirestoreCart,
    clearFirestoreCart,
    incrementFirestoreCartItem,
    decrementFirestoreCartItem
} from './firestoreCartService'

const CART_KEY = 'muchshop_cart'

// Store current user for Firestore operations
let currentUser = null

/**
 * Set current user for cart synchronization
 * Call this from your auth context when user changes
 * @param {Object} user - Firebase user object
 */
export function setCartUser(user) {
    currentUser = user
}

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
 * Load cart from Firestore for authenticated user
 * @returns {Promise<Array>} Cart items
 */
export async function loadCartFromFirestore() {
    if (currentUser && !currentUser.isAnonymous) {
        try {
            const firestoreCart = await getFirestoreCart(currentUser.uid)
            // Save to localStorage for quick access
            saveCart(firestoreCart)
            return firestoreCart
        } catch (error) {
            console.error('Error loading cart from Firestore:', error)
            return getCart()
        }
    }
    return getCart()
}

/**
 * Add product to cart (uses discounted price if available)
 * @param {Object} product - Product object
 * @param {number} quantity - Quantity to add
 */
export async function addToCart(product, quantity = 1) {
    const cart = getCart()
    const existingItem = cart.find(item => item.id === product.id)

    // Get the current price (discounted if available)
    const pricing = getProductPricing(product)

    if (currentUser && !currentUser.isAnonymous) {
        // Add to Firestore for authenticated users
        try {
            await addToFirestoreCart(currentUser.uid, {
                id: product.id,
                name: product.name,
                price: pricing.currentPrice,
                image: product.image,
                unit: product.unit
            }, existingItem ? existingItem.quantity + quantity : quantity)

            // Reload from Firestore
            await loadCartFromFirestore()
        } catch (error) {
            console.error('Firestore add failed, using localStorage:', error)
            // Fallback to localStorage
            addToLocalStorageCart(product, pricing, existingItem, quantity)
        }
    } else {
        // Use localStorage for guests
        addToLocalStorageCart(product, pricing, existingItem, quantity)
    }
}

function addToLocalStorageCart(product, pricing, existingItem, quantity) {
    const cart = getCart()

    if (existingItem) {
        existingItem.quantity += quantity
        existingItem.price = pricing.currentPrice
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: pricing.currentPrice,
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
export async function updateQuantity(productId, newQuantity) {
    if (currentUser && !currentUser.isAnonymous) {
        try {
            await updateFirestoreCartQuantity(currentUser.uid, productId, newQuantity)
            await loadCartFromFirestore()
        } catch (error) {
            console.error('Firestore update failed, using localStorage:', error)
            updateLocalStorageQuantity(productId, newQuantity)
        }
    } else {
        updateLocalStorageQuantity(productId, newQuantity)
    }
}

function updateLocalStorageQuantity(productId, newQuantity) {
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
export async function removeFromCart(productId) {
    if (currentUser && !currentUser.isAnonymous) {
        try {
            await removeFromFirestoreCart(currentUser.uid, productId)
            await loadCartFromFirestore()
        } catch (error) {
            console.error('Firestore remove failed, using localStorage:', error)
            removeFromLocalStorageCart(productId)
        }
    } else {
        removeFromLocalStorageCart(productId)
    }
}

function removeFromLocalStorageCart(productId) {
    const cart = getCart().filter(item => item.id !== productId)
    saveCart(cart)
    return cart
}

/**
 * Clear entire cart
 */
export async function clearCart() {
    if (currentUser && !currentUser.isAnonymous) {
        try {
            await clearFirestoreCart(currentUser.uid)
            saveCart([])
        } catch (error) {
            console.error('Firestore clear failed, clearing localStorage:', error)
            saveCart([])
        }
    } else {
        saveCart([])
    }
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
