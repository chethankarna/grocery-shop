// Order Service - handles order submission and formatting

const ORDERS_SCRIPT_URL = import.meta.env.VITE_ORDERS_SCRIPT_URL || ''
const DELIVERY_FEE = parseInt(import.meta.env.VITE_DELIVERY_FEE || '30')

/**
 * Submit order to Google Sheets via Apps Script
 */
export async function submitOrder(orderData) {
    try {
        const response = await fetch(ORDERS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Apps Script requires no-cors
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        })

        // Since we're using no-cors, we can't read the response
        // Assume success if no error was thrown
        return {
            success: true,
            orderId: orderData.order_id,
        }
    } catch (error) {
        console.error('Error submitting order:', error)
        return {
            success: false,
            error: error.message,
        }
    }
}

/**
 * Generate human-readable items list for order
 */
export function generateItemsList(cartItems, orderType, details) {
    let itemsList = ''

    // Add each cart item
    cartItems.forEach(item => {
        const lineTotal = item.price * item.quantity
        itemsList += `${item.name} ×${item.quantity} — ₹${lineTotal}\n`
    })

    itemsList += `\nSubtotal: ₹${details.subtotal}\n`
    itemsList += `Delivery fee: ₹${details.deliveryFee}\n`
    itemsList += `Total: ₹${details.total}\n\n`

    if (orderType === 'PICKUP') {
        itemsList += `[PICKUP] Ready by: ${details.pickupDatetime}\n`
    } else {
        itemsList += `[DELIVERY]\nAddress: ${details.deliveryAddress}\n`
    }

    return itemsList
}

/**
 * Generate JSON array of cart items for database
 */
export function generateItemsJson(cartItems) {
    return JSON.stringify(
        cartItems.map(item => ({
            id: item.id,
            name: item.name,
            qty: item.quantity,
            price: item.price,
            line_total: item.price * item.quantity,
        }))
    )
}

/**
 * Create order object from cart and customer details
 */
export function createOrderObject(cart, orderType, customerDetails) {
    const timestamp = new Date().toISOString()
    const orderId = `ORD-${Date.now()}`

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const deliveryFee = orderType === 'DELIVERY' ? DELIVERY_FEE : 0
    const total = subtotal + deliveryFee

    const details = {
        subtotal,
        deliveryFee,
        total,
        ...(orderType === 'PICKUP' ? {
            pickupDatetime: customerDetails.pickupDatetime,
        } : {
            deliveryAddress: customerDetails.deliveryAddress,
        }),
    }

    const itemsList = generateItemsList(cart, orderType, details)
    const itemsJson = generateItemsJson(cart)

    return {
        order_id: orderId,
        createdAt: timestamp,
        customer_name: customerDetails.name,
        customer_phone: customerDetails.phone,
        order_type: orderType,
        pickup_datetime: orderType === 'PICKUP' ? customerDetails.pickupDatetime : '',
        delivery_address: orderType === 'DELIVERY' ? customerDetails.deliveryAddress : '',
        items_list: itemsList,
        items_json: itemsJson,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total: total,
        status: 'PENDING',
        notes: customerDetails.notes || '',
        notified: false,
    }
}

/**
 * Calculate cart totals
 */
export function calculateTotals(cart, orderType) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const deliveryFee = orderType === 'DELIVERY' ? DELIVERY_FEE : 0
    const total = subtotal + deliveryFee

    return { subtotal, deliveryFee, total }
}

export { DELIVERY_FEE }
