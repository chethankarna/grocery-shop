/**
 * Format amount as Indian Rupee currency
 * @param {number} amount - Amount in rupees
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
    return `₹${parseFloat(amount).toFixed(0)}`
}

/**
 * Format amount with unit
 * @param {number} price - Price in rupees
 * @param {string} unit - Unit (kg, ltr, pc, etc.)
 * @returns {string} Formatted price with unit
 */
export function formatPriceWithUnit(price, unit) {
    return `${formatCurrency(price)}/${unit}`
}
