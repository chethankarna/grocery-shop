import { doc, setDoc, deleteDoc, collection, getDocs, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Add product to user's favorites
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<void>}
 */
export async function addToFavorites(userId, productId) {
    try {
        const favoriteRef = doc(db, 'users', userId, 'favorites', productId)

        await setDoc(favoriteRef, {
            productId,
            addedAt: serverTimestamp()
        })

        console.log('✅ Added to favorites:', productId)
    } catch (error) {
        console.error('Error adding to favorites:', error)
        throw new Error('Failed to add to favorites')
    }
}

/**
 * Remove product from user's favorites
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<void>}
 */
export async function removeFromFavorites(userId, productId) {
    try {
        const favoriteRef = doc(db, 'users', userId, 'favorites', productId)
        await deleteDoc(favoriteRef)

        console.log('✅ Removed from favorites:', productId)
    } catch (error) {
        console.error('Error removing from favorites:', error)
        throw new Error('Failed to remove from favorites')
    }
}

/**
 * Get user's favorite product IDs
 * @param {string} userId - User ID
 * @returns {Promise<string[]>} Array of product IDs
 */
export async function getUserFavorites(userId) {
    try {
        const favoritesRef = collection(db, 'users', userId, 'favorites')
        const q = query(favoritesRef)
        const snapshot = await getDocs(q)

        const favoriteIds = []
        snapshot.forEach(doc => {
            favoriteIds.push(doc.id) // Document ID is the product ID
        })

        return favoriteIds
    } catch (error) {
        console.error('Error fetching favorites:', error)
        return []
    }
}

/**
 * Toggle favorite (add if not exists, remove if exists)
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {boolean} isCurrentlyFavorite - Current favorite status
 * @returns {Promise<boolean>} New favorite status
 */
export async function toggleFavorite(userId, productId, isCurrentlyFavorite) {
    try {
        if (isCurrentlyFavorite) {
            await removeFromFavorites(userId, productId)
            return false
        } else {
            await addToFavorites(userId, productId)
            return true
        }
    } catch (error) {
        console.error('Error toggling favorite:', error)
        throw error
    }
}
