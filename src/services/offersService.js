/**
 * Offers Service - Business logic for pricing and promotional offers
 */

/**
 * Check if an offer is currently active
 * @param {Object} offer - Offer object with type, isActive, startTime, endTime
 * @returns {boolean} - Whether the offer is active
 */
export function isOfferActive(offer) {
    if (!offer || offer.isActive === false) return false

    const now = new Date()

    // Time-based offers (Today's Deal, Flash Sale)
    if (offer.startTime && offer.endTime) {
        const start = new Date(offer.startTime)
        const end = new Date(offer.endTime)
        return now >= start && now <= end
    }

    // Always-active offers (Best Seller, New Arrival)
    return true
}

/**
 * Get active offers for a product (max specified limit)
 * @param {Object} product - Product object
 * @param {number} maxOffers - Maximum number of offers to return (default: 2)
 * @returns {Array} - Array of active offers sorted by priority
 */
export function getActiveOffers(product, maxOffers = 2) {
    if (!product.offers || !Array.isArray(product.offers)) {
        return []
    }

    return product.offers
        .filter(isOfferActive)
        .sort((a, b) => (a.priority || 99) - (b.priority || 99))
        .slice(0, maxOffers)
}

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} - Discount percentage (0-100)
 */
export function calculateDiscountPercent(originalPrice, discountedPrice) {
    if (!discountedPrice || discountedPrice >= originalPrice) return 0
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
}

/**
 * Get effective pricing for a product
 * @param {Object} product - Product object
 * @returns {Object} - Pricing details
 */
export function getProductPricing(product) {
    const originalPrice = product.originalPrice || product.price
    const discountedPrice = product.discountedPrice
    const hasDiscount = discountedPrice && discountedPrice < originalPrice

    return {
        originalPrice,
        currentPrice: hasDiscount ? discountedPrice : originalPrice,
        discountedPrice: hasDiscount ? discountedPrice : null,
        discountPercent: hasDiscount
            ? calculateDiscountPercent(originalPrice, discountedPrice)
            : 0,
        hasDiscount
    }
}

/**
 * Auto-detect offers based on product data
 * @param {Object} product - Product object
 * @returns {Array} - Array of auto-detected offers
 */
export function autoDetectOffers(product) {
    const autoOffers = []

    // Best Seller (salesCount > threshold or manual flag)
    if (product.isBestSeller || (product.salesCount && product.salesCount > 100)) {
        autoOffers.push({
            type: 'BEST_SELLER',
            isActive: true,
            priority: 1
        })
    }

    // New Arrival (created in last 7 days)
    if (product.isNewArrival || isNewProduct(product.createdAt)) {
        autoOffers.push({
            type: 'NEW_ARRIVAL',
            isActive: true,
            priority: 3
        })
    }

    // Limited Stock (stock <= 10 and > 0)
    if (product.stock > 0 && product.stock <= 10) {
        autoOffers.push({
            type: 'LIMITED_STOCK',
            isActive: true,
            priority: 4
        })
    }

    return autoOffers
}

/**
 * Check if product is new (created in last 7 days)
 * @param {string} createdAt - ISO date string
 * @returns {boolean} - Whether product is new
 */
function isNewProduct(createdAt) {
    if (!createdAt) return false
    const created = new Date(createdAt)
    const now = new Date()
    const daysDiff = (now - created) / (1000 * 60 * 60 * 24)
    return daysDiff <= 7
}
