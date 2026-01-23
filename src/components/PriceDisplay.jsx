import { formatCurrency } from '../utils/currency'
import { getProductPricing } from '../services/offersService'
import './PriceDisplay.css'

function PriceDisplay({ product, size = 'normal' }) {
    const pricing = getProductPricing(product)

    return (
        <div className={`price-display price-display--${size}`}>
            {pricing.hasDiscount ? (
                <>
                    {/* Discounted Price (Prominent) */}
                    <div className="price-current">
                        <span className="price-amount">
                            {formatCurrency(pricing.currentPrice)}
                        </span>
                        {size !== 'small' && (
                            <span className="price-unit">/{product.unit}</span>
                        )}
                    </div>

                    {/* Original Price (Strikethrough) */}
                    <div className="price-original">
                        <span className="price-strikethrough">
                            {formatCurrency(pricing.originalPrice)}
                        </span>
                        {pricing.discountPercent > 0 && (
                            <span className="price-discount-badge">
                                {pricing.discountPercent}% OFF
                            </span>
                        )}
                    </div>
                </>
            ) : (
                /* Regular Price */
                <div className="price-current">
                    <span className="price-amount">
                        {formatCurrency(pricing.currentPrice)}
                    </span>
                    <span className="price-unit">/{product.unit}</span>
                </div>
            )}
        </div>
    )
}

export default PriceDisplay
