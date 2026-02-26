import { useState, useEffect } from 'react'
import CategoryCard from '../components/CategoryCard'
import { fetchProducts, getCategories } from '../services/productsService'
import './Categories.css'

function Categories() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadCategoriesWithCounts = async () => {
            try {
                setLoading(true)

                // Fetch both category names and products
                const [categoryNames, productsData] = await Promise.all([
                    getCategories(),
                    fetchProducts()
                ])

                // Create category objects with product counts and images
                const categoriesWithCounts = categoryNames.map(categoryName => {
                    const categoryProducts = productsData.filter(
                        product => product.category === categoryName
                    )

                    // Get image from first product with categoryImage
                    const productWithImage = categoryProducts.find(p => p.categoryImage)
                    const categoryImage = productWithImage?.categoryImage || null

                    // Generate slug from category name
                    const slug = categoryName.toLowerCase().replace(/\s+/g, '-')

                    return {
                        id: slug,
                        slug: slug,
                        name: categoryName,
                        image: categoryImage,
                        icon: categoryImage ? null : '📦', // Fallback icon if no image
                        color: '#16A34A', // Default green color
                        description: `${categoryProducts.length} ${categoryProducts.length === 1 ? 'product' : 'products'}`,
                        productCount: categoryProducts.length
                    }
                })

                setCategories(categoriesWithCounts)
            } catch (error) {
                console.error('Error loading categories:', error)
            } finally {
                setLoading(false)
            }
        }

        loadCategoriesWithCounts()
    }, [])

    return (
        <div className="categories-page">
            <div className="categories-container container">
                {/* Header Section */}
                <div className="categories-header animate-fade-in-up">
                    <h1 className="categories-title">Browse Categories</h1>
                    <p className="categories-subtitle">
                        Explore our curated range of fresh and quality products
                    </p>
                </div>

                {/* Grid Section */}
                {loading ? (
                    <div className="categories-grid">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="category-skeleton card skeleton-shimmer"></div>
                        ))}
                    </div>
                ) : categories.length > 0 ? (
                    <div className="categories-grid animate-fade-in-up">
                        {categories.map((category) => (
                            <CategoryCard key={category.id} category={category} />
                        ))}
                    </div>
                ) : (
                    <div className="categories-empty card text-center p-2xl">
                        <div className="empty-icon text-h1 mb-md">📦</div>
                        <h3 className="empty-title mb-xs">No Categories Available</h3>
                        <p className="empty-description text-secondary">
                            Categories will appear here once products are added to the store.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Categories
