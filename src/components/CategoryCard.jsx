import { useNavigate } from 'react-router-dom'
import './CategoryCard.css'

function CategoryCard({ category }) {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/category/${category.slug}`)
    }

    return (
        <div
            className="category-card"
            onClick={handleClick}
            style={{ '--accent-color': category.color }}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleClick()
                }
            }}
            aria-label={`Browse ${category.name} - ${category.productCount} products`}
        >
            <div className="category-icon">
                {category.image ? (
                    <img
                        src={category.image}
                        alt={category.name}
                        className="category-image"
                    />
                ) : (
                    <span className="category-emoji">{category.icon}</span>
                )}
            </div>
            <div className="category-info">
                <h3 className="category-name">{category.name}</h3>
                <p className="category-description">{category.description}</p>
                <span className="category-count">
                    {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                </span>
            </div>
            <div className="category-arrow">→</div>
        </div>
    )
}

export default CategoryCard
