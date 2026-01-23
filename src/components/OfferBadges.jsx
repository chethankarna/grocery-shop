import { getActiveOffers } from '../services/offersService'
import OFFER_TYPES from '../config/offers'
import './OfferBadges.css'

function OfferBadges({ product, maxBadges = 2 }) {
    const activeOffers = getActiveOffers(product, maxBadges)

    if (activeOffers.length === 0) return null

    return (
        <div className="offer-badges">
            {activeOffers.map((offer, index) => {
                const offerConfig = OFFER_TYPES[offer.type]
                if (!offerConfig) return null

                return (
                    <span
                        key={`${offer.type}-${index}`}
                        className="offer-badge"
                        style={{
                            '--badge-color': offerConfig.color,
                            '--badge-bg': offerConfig.bgColor
                        }}
                    >
                        <span className="offer-icon">{offerConfig.icon}</span>
                        <span className="offer-label">{offerConfig.label}</span>
                    </span>
                )
            })}
        </div>
    )
}

export default OfferBadges
