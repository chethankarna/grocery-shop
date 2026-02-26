import { db } from '../firebase'
import {
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore'

// Collection reference
const COLLECTION_NAME = 'categories'

/**
 * Get all categories from Firestore
 * @returns {Promise<Array>} Array of category objects
 */
export async function getAllCategories() {
    try {
        const categoriesRef = collection(db, COLLECTION_NAME)
        const q = query(categoriesRef, orderBy('name'))
        const snapshot = await getDocs(q)

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
    } catch (error) {
        console.error('Error fetching categories:', error)
        return []
    }
}

/**
 * Listen to categories in real-time
 * @param {Function} callback 
 */
export function listenCategoriesRealtime(callback) {
    const categoriesRef = collection(db, COLLECTION_NAME)
    const q = query(categoriesRef, orderBy('name'))

    return onSnapshot(q, (snapshot) => {
        const categories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
        callback(categories)
    })
}

/**
 * Upload category image to Cloudinary
 * @param {File} file - Image file
 * @param {string} categoryId - Optional category ID for naming
 * @returns {Promise<string>} Cloudinary URL
 */
export async function uploadCategoryImage(file, categoryId = null) {
    if (!file) throw new Error('No file provided')

    try {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dqdbw0aab'
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'grocery_products'

        console.log('Uploading category image to Cloudinary...')

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', uploadPreset)

        // Optional: Add folder and public_id for organization
        if (categoryId) {
            formData.append('public_id', `category_${categoryId}`)
        }
        formData.append('folder', 'categories')

        // Upload to Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        )

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || 'Upload failed')
        }

        const data = await response.json()
        console.log('Category image upload successful:', data.secure_url)

        // Return the secure URL
        return data.secure_url
    } catch (error) {
        console.error('Error uploading category image to Cloudinary:', error)
        throw error
    }
}

/**
 * Add a new category
 * @param {Object} categoryData 
 */
export async function addCategory(categoryData) {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...categoryData,
            productCount: 0, // Initial count
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        })
        return docRef.id
    } catch (error) {
        console.error('Error adding category:', error)
        throw error
    }
}

import { updateProductsCategory } from './productsService'

// ... existing imports ...

/**
 * Update a category
 * @param {string} id 
 * @param {Object} categoryData 
 */
export async function updateCategory(id, categoryData) {
    try {
        const categoryRef = doc(db, COLLECTION_NAME, id)

        // If name is changing, we need to update all associated products
        if (categoryData.name) {
            const oldDoc = await getDoc(categoryRef)
            if (oldDoc.exists()) {
                const oldName = oldDoc.data().name
                if (oldName && oldName !== categoryData.name) {
                    // Trigger batch update for products
                    // We don't await this to keep UI snappy, or we SHOULD await to ensure consistency?
                    // Better to await so we know it finished.
                    await updateProductsCategory(oldName, categoryData.name)
                }
            }
        }

        await updateDoc(categoryRef, {
            ...categoryData,
            updatedAt: serverTimestamp()
        })
    } catch (error) {
        console.error('Error updating category:', error)
        throw error
    }
}

/**
 * Delete a category
 * @param {string} id 
 */
export async function deleteCategory(id) {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id))
    } catch (error) {
        console.error('Error deleting category:', error)
        throw error
    }
}
