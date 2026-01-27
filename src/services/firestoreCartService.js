import { doc, setDoc, deleteDoc, collection, getDocs, query, updateDoc, serverTimestamp, increment } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Add item to user's cart in Firestore
 * @param {string} userId - User ID
 * @param {Object} product - Product object with id, name, price, image, unit
 * @param {number} quantity - Quantity to add
 * @returns {Promise<void>}
 */
export async function addToFirestoreCart(userId, product, quantity = 1) {
    try {
        const cartItemRef = doc(db, 'users', userId, 'cart', product.id)

        // Snapshot current price and product details
        await setDoc(cartItemRef, {
            productId: product.id,
            name: product.name,
            price: product.price, // Snapshot price at time of add
            image: product.image,
            unit: product.unit,
            quantity: quantity,
            addedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }, { merge: true })

        console.log('✅ Added to Firestore cart:', product.id)
    } catch (error) {
        console.error('Error adding to Firestore cart:', error)
        throw new Error('Failed to add to cart')
    }
}

/**
 * Update cart item quantity in Firestore
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {number} newQuantity - New quantity
 * @returns {Promise<void>}
 */
export async function updateFirestoreCartQuantity(userId, productId, newQuantity) {
    try {
        const cartItemRef = doc(db, 'users', userId, 'cart', productId)

        if (newQuantity <= 0) {
            // Remove item if quantity is 0 or less
            await deleteDoc(cartItemRef)
        } else {
            await updateDoc(cartItemRef, {
                quantity: newQuantity,
                updatedAt: serverTimestamp()
            })
        }

        console.log('✅ Updated cart quantity:', productId, newQuantity)
    } catch (error) {
        console.error('Error updating cart quantity:', error)
        throw new Error('Failed to update cart')
    }
}

/**
 * Remove item from Firestore cart
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<void>}
 */
export async function removeFromFirestoreCart(userId, productId) {
    try {
        const cartItemRef = doc(db, 'users', userId, 'cart', productId)
        await deleteDoc(cartItemRef)

        console.log('✅ Removed from Firestore cart:', productId)
    } catch (error) {
        console.error('Error removing from cart:', error)
        throw new Error('Failed to remove from cart')
    }
}

/**
 * Get user's cart from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of cart items
 */
export async function getFirestoreCart(userId) {
    try {
        const cartRef = collection(db, 'users', userId, 'cart')
        const q = query(cartRef)
        const snapshot = await getDocs(q)

        const cartItems = []
        snapshot.forEach(doc => {
            cartItems.push({
                id: doc.id,
                ...doc.data()
            })
        })

        return cartItems
    } catch (error) {
        console.error('Error fetching Firestore cart:', error)
        return []
    }
}

/**
 * Clear entire cart (for after order placement)
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function clearFirestoreCart(userId) {
    try {
        const cartRef = collection(db, 'users', userId, 'cart')
        const snapshot = await getDocs(cartRef)

        // Delete all cart items
        const deletePromises = []
        snapshot.forEach(doc => {
            deletePromises.push(deleteDoc(doc.ref))
        })

        await Promise.all(deletePromises)

        console.log('✅ Cleared Firestore cart')
    } catch (error) {
        console.error('Error clearing cart:', error)
        throw new Error('Failed to clear cart')
    }
}

/**
 * Increment cart item quantity
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<void>}
 */
export async function incrementFirestoreCartItem(userId, productId) {
    try {
        const cartItemRef = doc(db, 'users', userId, 'cart', productId)

        await updateDoc(cartItemRef, {
            quantity: increment(1),
            updatedAt: serverTimestamp()
        })

        console.log('✅ Incremented cart item:', productId)
    } catch (error) {
        console.error('Error incrementing cart item:', error)
        throw new Error('Failed to increment quantity')
    }
}

/**
 * Decrement cart item quantity
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<void>}
 */
export async function decrementFirestoreCartItem(userId, productId) {
    try {
        const cartItemRef = doc(db, 'users', userId, 'cart', productId)

        // Note: Use updateDoc with increment(-1)
        // If you need to check if quantity becomes 0, fetch first then update
        await updateDoc(cartItemRef, {
            quantity: increment(-1),
            updatedAt: serverTimestamp()
        })

        console.log('✅ Decremented cart item:', productId)
    } catch (error) {
        console.error('Error decrementing cart item:', error)
        throw new Error('Failed to decrement quantity')
    }
}
