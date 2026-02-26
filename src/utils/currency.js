/**
 * Format amount as Indian Rupee currency
 * @param {number} amount - Amount in rupees
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount = 0) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(amount);
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
