import axios from 'axios'
import { db } from '../firebase'
import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore'

// Apps Script URL from environment variable (legacy support)
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || ''
const FALLBACK_DATA_URL = '/data/products.json'
const USE_FIRESTORE = import.meta.env.VITE_USE_FIRESTORE !== 'false' // Default to true

// Cache for products
let productsCache = null
let cacheTimestamp = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch all products from Firestore
 * @returns {Promise<Array>} Array of products
 */
async function fetchProductsFromFirestore() {
    try {
        const productsRef = collection(db, 'products')
        const snapshot = await getDocs(productsRef)
        const products = []

        snapshot.forEach(doc => {
            products.push({
                id: doc.id,
                ...doc.data()
            })
        })

        return products.filter(p => p.visible !== false)
    } catch (error) {
        console.error('Error fetching from Firestore:', error)
        throw error
    }
}

/**
 * Fetch all products from data source
 * @returns {Promise<Array>} Array of products
 */
export async function fetchProducts() {
    // If using Firestore, skip cache and fetch directly
    if (USE_FIRESTORE) {
        try {
            const products = await fetchProductsFromFirestore()
            productsCache = products
            cacheTimestamp = Date.now()
            return products
        } catch (error) {
            console.error('Firestore fetch failed, trying fallback:', error)
            // Fall through to legacy sources
        }
    }

    // Check cache first for legacy sources
    if (productsCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
        return productsCache
    }

    try {
        // Try Apps Script URL first if configured
        if (APPS_SCRIPT_URL) {
            try {
                const response = await axios.get(APPS_SCRIPT_URL, {
                    timeout: 10000,
                    headers: {
                        'Accept': 'application/json'
                    }
                })

                if (response.data && Array.isArray(response.data)) {
                    productsCache = response.data.filter(p => p.visible !== false)
                    cacheTimestamp = Date.now()
                    return productsCache
                }
            } catch (scriptError) {
                console.warn('Apps Script fetch failed, falling back to local data:', scriptError.message)
            }
        }

        // Fallback to local JSON
        const response = await axios.get(FALLBACK_DATA_URL)
        productsCache = response.data.filter(p => p.visible !== false)
        cacheTimestamp = Date.now()
        return productsCache
    } catch (error) {
        console.error('Error fetching products:', error)
        // Return empty array if all attempts fail
        return productsCache || []
    }
}

/**
 * Get product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Object|null>} Product object or null
 */
export async function getProductById(id) {
    try {
        if (!id) return null;

        // Try to fetch specific document directly (much more efficient)
        const productRef = doc(db, 'products', id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
            return {
                id: productSnap.id,
                ...productSnap.data()
            };
        }

        return null;
    } catch (error) {
        console.error('Error getting product by ID:', error);
        return null;
    }
}

/**
 * Get products by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} Filtered products
 */
export async function getProductsByCategory(category) {
    const products = await fetchProducts()
    return products.filter(p =>
        p.category.toLowerCase() === category.toLowerCase()
    )
}

/**
 * Get all unique categories
 * @returns {Promise<Array>} Array of category names
 */
export async function getCategories() {
    const products = await fetchProducts()
    const categories = [...new Set(products.map(p => p.category))]
    return categories.sort()
}

/**
 * Search products by name
 * @param {string} query - Search query
 * @returns {Promise<Array>} Matching products
 */
export async function searchProducts(query) {
    if (!query || query.trim().length === 0) {
        return []
    }

    const products = await fetchProducts()
    const searchTerm = query.toLowerCase().trim()

    return products.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
    )
}

/**
 * Clear products cache (useful for forcing refresh)
 */
export function clearProductsCache() {
    productsCache = null
    cacheTimestamp = null
}

// ============= ADMIN FUNCTIONS (Firestore CRUD) =============

/**
 * Listen to products in real-time
 * @param {Function} callback - Called with updated products array
 * @param {Function} errorCallback - Called on error
 * @returns {Function} Unsubscribe function
 */
export function listenProductsRealtime(callback, errorCallback) {
    if (!USE_FIRESTORE) {
        console.warn('Real-time listening requires Firestore')
        return () => { }
    }

    try {
        const productsRef = collection(db, 'products')

        // Order by updatedAtdescending so recently modified products show first
        // Note: This might require a composite index if mixed with 'where' clauses later
        const q = query(productsRef, orderBy('updatedAt', 'desc'))

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const products = []
                snapshot.forEach(doc => {
                    products.push({
                        id: doc.id,
                        ...doc.data()
                    })
                })
                callback(products)
            },
            (error) => {
                console.error('Error listening to products:', error)
                if (errorCallback) errorCallback(error)
            }
        )

        return unsubscribe
    } catch (error) {
        console.error('Error setting up listener:', error)
        if (errorCallback) errorCallback(error)
        return () => { }
    }
}

/**
 * Upload product image to Cloudinary
 * @param {File} file - Image file
 * @param {string} productId - Optional product ID for naming
 * @returns {Promise<string>} Cloudinary URL
 */
export async function uploadProductImage(file, productId = null) {
    if (!file) throw new Error('No file provided')

    try {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dqdbw0aab'
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'grocery_products'

        console.log('Uploading to Cloudinary...')

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', uploadPreset)

        // Optional: Add folder and public_id for organization
        if (productId) {
            formData.append('public_id', `product_${productId}`)
        }
        formData.append('folder', 'products')

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
        console.log('Upload successful:', data.secure_url)

        // Return the secure URL
        return data.secure_url
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error)
        throw error
    }
}

/**
 * Add a new product to Firestore
 * @param {Object} productData - Product data
 * @returns {Promise<string>} New product ID
 */
export async function addProduct(productData) {
    if (!USE_FIRESTORE) {
        throw new Error('Firestore is required for adding products')
    }

    try {
        console.log('Adding product to Firestore...', productData)
        const productsRef = collection(db, 'products')

        // Add timestamps and defaults
        const newProduct = {
            ...productData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            visible: productData.visible !== undefined ? productData.visible : true,
            stock: productData.stock || 0
        }

        console.log('Product data prepared, saving to Firestore...')
        const docRef = await addDoc(productsRef, newProduct)
        console.log('Product added successfully with ID:', docRef.id)

        // Clear cache to force refresh
        clearProductsCache()

        return docRef.id
    } catch (error) {
        console.error('Error adding product:', error)
        throw error
    }
}

/**
 * Update an existing product in Firestore
 * @param {string} productId - Product ID
 * @param {Object} productData - Updated product data
 * @returns {Promise<void>}
 */
export async function updateProduct(productId, productData) {
    if (!USE_FIRESTORE) {
        throw new Error('Firestore is required for updating products')
    }

    try {
        const productRef = doc(db, 'products', productId)

        // Add updated timestamp
        const updatedProduct = {
            ...productData,
            updatedAt: serverTimestamp()
        }

        await updateDoc(productRef, updatedProduct)

        // Clear cache to force refresh
        clearProductsCache()
    } catch (error) {
        console.error('Error updating product:', error)
        throw error
    }
}

/**
 * Delete a product from Firestore
 * @param {string} productId - Product ID
 * @param {string} imageUrl - Optional image URL to delete from storage
 * @returns {Promise<void>}
 */
export async function deleteProduct(productId, imageUrl = null) {
    if (!USE_FIRESTORE) {
        throw new Error('Firestore is required for deleting products')
    }

    try {
        // Delete the product document
        const productRef = doc(db, 'products', productId)
        await deleteDoc(productRef)

        // Note: Cloudinary images are not deleted automatically
        // You can implement Cloudinary deletion using their API if needed
        if (imageUrl && imageUrl.includes('cloudinary')) {
            console.log('Note: Cloudinary image not deleted. Implement deletion if needed.')
        }

        // Clear cache to force refresh
        clearProductsCache()
    } catch (error) {
        console.error('Error deleting product:', error)
        throw error
    }
}

/**
 * Batch update products category
 * @param {string} oldCategory 
 * @param {string} newCategory 
 */
export async function updateProductsCategory(oldCategory, newCategory) {
    if (!oldCategory || !newCategory || oldCategory === newCategory) return

    try {
        console.log(`Batch updating products from "${oldCategory}" to "${newCategory}"`)
        const productsRef = collection(db, 'products')
        const q = query(productsRef, where('category', '==', oldCategory))
        const snapshot = await getDocs(q)

        console.log(`Found ${snapshot.size} products to update`)

        if (snapshot.empty) return

        // Firestore batch limit is 500
        const batch = writeBatch(db)
        let count = 0

        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, {
                category: newCategory,
                updatedAt: serverTimestamp()
            })
            count++
        })

        await batch.commit()
        console.log(`Successfully updated ${count} products`)

        clearProductsCache()
    } catch (error) {
        console.error('Error batch updating products:', error)
        throw error
    }
}
