import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Create a new user profile in Firestore
 * @param {string} uid - User ID from Firebase Auth
 * @param {Object} userData - User profile data
 * @returns {Promise<void>}
 */
export async function createUserProfile(uid, userData) {
    try {
        const userRef = doc(db, 'users', uid)

        await setDoc(userRef, {
            name: userData.name || '',
            email: userData.email,
            phone: userData.phone || '',
            role: 'customer', // Default role
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            photoURL: userData.photoURL || null,
            isActive: true
        })

        console.log('✅ User profile created:', uid)
    } catch (error) {
        console.error('Error creating user profile:', error)
        throw new Error('Failed to create user profile')
    }
}

/**
 * Get user profile from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>} User profile data or null
 */
export async function getUserProfile(uid) {
    try {
        const userRef = doc(db, 'users', uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
            return {
                uid,
                ...userSnap.data()
            }
        }

        return null
    } catch (error) {
        console.error('Error fetching user profile:', error)
        throw new Error('Failed to fetch user profile')
    }
}

/**
 * Update user profile in Firestore
 * @param {string} uid - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateUserProfile(uid, updates) {
    try {
        const userRef = doc(db, 'users', uid)

        await updateDoc(userRef, {
            ...updates,
            updatedAt: serverTimestamp()
        })

        console.log('✅ User profile updated:', uid)
    } catch (error) {
        console.error('Error updating user profile:', error)
        throw new Error('Failed to update user profile')
    }
}

/**
 * Get or create user profile (for social logins)
 * @param {string} uid - User ID
 * @param {Object} userData - User data from auth provider
 * @returns {Promise<Object>} User profile
 */
export async function getOrCreateUserProfile(uid, userData) {
    try {
        // Try to get existing profile
        let profile = await getUserProfile(uid)

        // If doesn't exist, create it
        if (!profile) {
            await createUserProfile(uid, userData)
            profile = await getUserProfile(uid)
        }

        return profile
    } catch (error) {
        console.error('Error in getOrCreateUserProfile:', error)
        throw error
    }
}

/**
 * Check if user has admin role
 * @param {string} uid - User ID
 * @returns {Promise<boolean>}
 */
export async function isUserAdmin(uid) {
    try {
        const profile = await getUserProfile(uid)
        return profile?.role === 'admin'
    } catch (error) {
        console.error('Error checking admin status:', error)
        return false
    }
}

/**
 * Update user role (admin only operation)
 * @param {string} uid - User ID to update
 * @param {string} role - New role ('customer' | 'admin')
 * @returns {Promise<void>}
 */
export async function updateUserRole(uid, role) {
    try {
        const userRef = doc(db, 'users', uid)

        await updateDoc(userRef, {
            role,
            updatedAt: serverTimestamp()
        })

        console.log(`✅ User role updated to ${role}:`, uid)
    } catch (error) {
        console.error('Error updating user role:', error)
        throw new Error('Failed to update user role')
    }
}
