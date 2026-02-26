import { getProductPricing } from './offersService'
import {
    addToFirestoreCart,
    updateFirestoreCartQuantity,
    removeFromFirestoreCart,
    getFirestoreCart,
    clearFirestoreCart
} from './firestoreCartService'

const CART_KEY = 'muchshop_cart'

let currentUser = null

export function setCartUser(user) {
    currentUser = user
}

export function getCart() {
    try {
        const cart = localStorage.getItem(CART_KEY)
        return cart ? JSON.parse(cart) : []
    } catch (error) {
        console.error('Error reading cart:', error)
        return []
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart))
        window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
        console.error('Error saving cart:', error)
    }
}

export async function loadCartFromFirestore() {
    if (currentUser && !currentUser.isAnonymous) {
        try {
            const firestoreCart = await getFirestoreCart(currentUser.uid)
            saveCart(firestoreCart || [])
            return firestoreCart || []
        } catch (error) {
            console.error('Error loading cart from Firestore:', error)
            return getCart()
        }
    }
    return getCart()
}

export async function addToCart(product, quantity = 0) {
    const cart = getCart()
    const existingItem = cart.find(item => String(item.id) === String(product.id))
    const pricing = getProductPricing(product)

    if (currentUser && !currentUser.isAnonymous) {
        try {
            await addToFirestoreCart(
                currentUser.uid,
                {
                    id: product.id,
                    name: product.name,
                    price: pricing.currentPrice,
                    image: product.image,
                    unit: product.unit
                },
                existingItem ? existingItem.quantity + quantity : quantity
            )

            await loadCartFromFirestore()
        } catch (error) {
            console.error('Firestore add failed, using localStorage:', error)
            addToLocalStorageCart(product, pricing, existingItem, quantity)
        }
    } else {
        addToLocalStorageCart(product, pricing, existingItem, quantity)
    }
}

function addToLocalStorageCart(product, pricing, existingItem, quantity) {
    const cart = getCart()

    const index = cart.findIndex(item => String(item.id) === String(product.id))

    if (index !== -1) {
        cart[index].quantity += quantity
        cart[index].price = pricing.currentPrice
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
    const index = cart.findIndex(item => String(item.id) === String(productId))

    if (index !== -1) {
        if (newQuantity <= 0) {
            removeFromLocalStorageCart(productId)
        } else {
            cart[index].quantity = newQuantity
            saveCart(cart)
        }
    }
}

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
    const cart = getCart()
    const updatedCart = cart.filter(item => String(item.id) !== String(productId))
    saveCart(updatedCart)
    return updatedCart
}

export async function clearCart() {
    if (currentUser && !currentUser.isAnonymous) {
        try {
            await clearFirestoreCart(currentUser.uid)
        } catch (error) {
            console.error('Firestore clear failed, clearing localStorage:', error)
        }
    }
    saveCart([])
    return []
}

export function getCartTotal() {
    const cart = getCart()
    return cart.reduce((total, item) => total + (Number(item.price) * Number(item.quantity)), 0)
}

export function getCartItemCount() {
    const cart = getCart()
    return cart.reduce((count, item) => count + Number(item.quantity), 0)
}