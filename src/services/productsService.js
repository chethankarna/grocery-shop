import axios from 'axios'

// Apps Script URL from environment variable
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || ''
const FALLBACK_DATA_URL = '/data/products.json'

// Cache for products
let productsCache = null
let cacheTimestamp = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch all products from data source
 * @returns {Promise<Array>} Array of products
 */
export async function fetchProducts() {
    // Check cache first
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
    const products = await fetchProducts()
    return products.find(p => p.id === id) || null
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
