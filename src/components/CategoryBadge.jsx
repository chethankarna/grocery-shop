import { useNavigate } from 'react-router-dom'

// Category icon mapping
const categoryIcons = {
    'Vegetables': '🥬',
    'Fruits': '🍎',
    'Dairy': '🥛',
    'Bakery': '🍞',
    'Snacks': '🍿',
    'Beverages': '🥤',
    'Meat': '🍖',
    'Seafood': '🐟',
    'all': '📦'
}

function CategoryBadge({ category, isActive = false }) {
    const navigate = useNavigate()
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-')
    const icon = categoryIcons[category] || '📦'

    const handleClick = () => {
        navigate(`/category/${categorySlug}`)
    }

    return (
        <button
            onClick={handleClick}
            className={`flex flex-col items-center justify-center min-w-[88px] p-4 rounded-2xl transition-all duration-300 shadow-soft hover:shadow-card ${isActive
                    ? 'bg-primary text-white scale-105'
                    : 'bg-cream-100 text-text-primary hover:bg-cream-200'
                }`}
            aria-label={`View ${category} category`}
            aria-current={isActive ? 'page' : undefined}
            style={{ minHeight: '96px' }}
        >
            <span className="text-4xl mb-2 transform transition-transform duration-300 hover:scale-110" role="img" aria-hidden="true">
                {icon}
            </span>
            <span className="text-xs font-semibold text-center line-clamp-2">
                {category}
            </span>
        </button>
    )
}

export default CategoryBadge
