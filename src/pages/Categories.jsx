import { useState, useEffect } from 'react'
import CategoryCard from '../components/CategoryCard'
import { getAllCategories } from '../services/categoriesService'
import './Categories.css'

function Categories() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true)
                const data = await getAllCategories()
                setCategories(data)
            } catch (error) {
                console.error('Error loading categories:', error)
            } finally {
                setLoading(false)
            }
        }

        loadCategories()
    }, [])

    return (
        <div className="categories-page">
            <div className="categories-container">
                {/* Header */}
                <div className="categories-header">
                    <h1 className="categories-title">Browse Categories</h1>
                    <p className="categories-subtitle">
                        Explore our range of fresh products
                    </p>
                </div>

                {/* Categories Grid */}
                {loading ? (
                    <div className="categories-grid">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="category-skeleton"></div>
                        ))}
                    </div>
                ) : categories.length > 0 ? (
                    <div className="categories-grid">
                        {categories.map((category) => (
                            <CategoryCard key={category.id} category={category} />
                        ))}
                    </div>
                ) : (
                    <div className="categories-empty">
                        <div className="empty-icon">📦</div>
                        <h3>No Categories Available</h3>
                        <p>Categories will appear here once products are added.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Categories
