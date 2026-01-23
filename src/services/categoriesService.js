import { fetchProducts } from './productsService'

// Category definitions with metadata
const CATEGORY_DEFINITIONS = [
    {
        id: 'fruits',
        name: 'Fruits',
        slug: 'fruits',
        description: 'Fresh seasonal fruits',
        icon: '🍎',
        color: '#FF6B6B'
    },
    {
        id: 'vegetables',
        name: 'Vegetables',
        slug: 'vegetables',
        description: 'Farm-fresh vegetables',
        icon: '🥬',
        color: '#8BC34A'
    },
    {
        id: 'dairy',
        name: 'Dairy',
        slug: 'dairy',
        description: 'Milk, cheese & more',
        icon: '🥛',
        color: '#4CAF50'
    },
    {
        id: 'bakery',
        name: 'Bakery',
        slug: 'bakery',
        description: 'Fresh baked goods',
        icon: '🍞',
        color: '#FF9800'
    },
    {
        id: 'beverages',
        name: 'Beverages',
        slug: 'beverages',
        description: 'Drinks & refreshments',
        icon: '🥤',
        color: '#2196F3'
    },
    {
        id: 'snacks',
        name: 'Snacks',
        slug: 'snacks',
        description: 'Chips, cookies & treats',
        icon: '🍿',
        color: '#FFC107'
    }
]

/**
 * Get all categories with product counts
 * @returns {Promise<Array>} Array of categories with product counts
 */
export async function getAllCategories() {
    const products = await fetchProducts()

    // Count products per category
    const productCounts = products.reduce((acc, product) => {
        const categoryName = product.category
        acc[categoryName] = (acc[categoryName] || 0) + 1
        return acc
    }, {})

    // Merge definitions with product counts
    return CATEGORY_DEFINITIONS.map(cat => ({
        ...cat,
        productCount: productCounts[cat.name] || 0
    })).filter(cat => cat.productCount > 0) // Only show categories with products
}

/**
 * Get category by slug
 * @param {string} slug - Category slug
 * @returns {Promise<Object|null>} Category object or null
 */
export async function getCategoryBySlug(slug) {
    const categories = await getAllCategories()
    return categories.find(cat => cat.slug === slug) || null
}

/**
 * Get category definition (without product count)
 * @param {string} slug - Category slug
 * @returns {Object|null} Category definition or null
 */
export function getCategoryDefinition(slug) {
    return CATEGORY_DEFINITIONS.find(cat => cat.slug === slug) || null
}
