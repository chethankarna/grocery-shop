// WhatsApp integration utilities

const SHOP_NAME = import.meta.env.VITE_SHOP_NAME || 'FreshMart'
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210'

/**
 * Generate WhatsApp URL for single product order
 */
export function generateProductOrderUrl(product, quantity = 1) {
    const total = product.price * quantity

    const message = `Hi ${SHOP_NAME}, I want ${quantity} x ${product.name} (${product.id}).\n\n` +
        `Price: ₹${product.price}/${product.unit}\n` +
        `Total: ₹${total}\n\n` +
        `Please confirm availability.`

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

/**
 * Generate WhatsApp URL for cart checkout
 */
export function generateCartCheckoutUrl(cart, total) {
    let message = `Hi ${SHOP_NAME}, I'd like to order:\n\n`

    cart.forEach(item => {
        const lineTotal = item.price * item.quantity
        message += `• ${item.name} x${item.quantity} — ₹${lineTotal}\n`
    })

    message += `\nTotal: ₹${total}\n\n`
    message += `Please confirm my order.`

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

/**
 * Generate WhatsApp message for checkout order
 */
export function generateCheckoutMessage(order) {
    const { order_type, customer_name, customer_phone, items_list, total,
        pickup_datetime, delivery_address } = order

    let message = `🛒 *New Order from ${customer_name}*\n`
    message += `📞 Phone: ${customer_phone}\n\n`
    message += `${items_list}\n`
    message += `💰 *Total: ₹${total}*\n\n`

    if (order_type === 'PICKUP') {
        const pickupTime = new Date(pickup_datetime).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        })
        message += `📦 *PICKUP*\n`
        message += `Ready by: ${pickupTime}\n`
    } else {
        message += `🏠 *DELIVERY*\n`
        message += `Address: ${delivery_address}\n`
    }

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
