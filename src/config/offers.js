export const OFFER_TYPES = {
    BEST_SELLER: {
        id: 'BEST_SELLER',
        label: 'Best Seller',
        icon: '🔥',
        color: '#FF6B35',
        bgColor: '#FFE5DC',
        priority: 1
    },
    TODAYS_DEAL: {
        id: 'TODAYS_DEAL',
        label: "Today's Deal",
        icon: '⚡',
        color: '#7C3AED',
        bgColor: '#EDE9FE',
        priority: 2
    },
    NEW_ARRIVAL: {
        id: 'NEW_ARRIVAL',
        label: 'New Arrival',
        icon: '🆕',
        color: '#059669',
        bgColor: '#D1FAE5',
        priority: 3
    },
    LIMITED_STOCK: {
        id: 'LIMITED_STOCK',
        label: 'Limited Stock',
        icon: '⏳',
        color: '#DC2626',
        bgColor: '#FEE2E2',
        priority: 4
    },
    FLASH_SALE: {
        id: 'FLASH_SALE',
        label: 'Flash Sale',
        icon: '💥',
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        priority: 1
    }
}

export default OFFER_TYPES
