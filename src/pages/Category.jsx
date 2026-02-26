import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { getProductsByCategory, fetchProducts, getCategories } from '../services/productsService'
import './Category.css'

function Category() {
    const { slug } = useParams()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [categoryName, setCategoryName] = useState('')

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true)
                console.log('Category slug from URL:', slug)

                if (slug === 'all') {
                    // Show all products
                    const allProducts = await fetchProducts()
                    setProducts(allProducts)
                    setCategoryName('All Products')
                } else {
                    // Convert slug back to category name
                    const categories = await getCategories()
                    console.log('Available categories:', categories)
                    console.log('Looking for slug:', slug)

                    const matchedCategory = categories.find(
                        cat => cat.toLowerCase().replace(/\s+/g, '-') === slug
                    )

                    console.log('Matched category:', matchedCategory)

                    if (matchedCategory) {
                        const categoryProducts = await getProductsByCategory(matchedCategory)
                        console.log('Products found:', categoryProducts.length)
                        setProducts(categoryProducts)
                        setCategoryName(matchedCategory)
                    } else {
                        console.error('No matching category found for slug:', slug)
                        setProducts([])
                        setCategoryName('Unknown Category')
                    }
                }
            } catch (error) {
                console.error('Error loading category products:', error)
                setProducts([])
            } finally {
                setLoading(false)
            }
        }

        loadProducts()
    }, [slug])

    return (
        <div className="category-page">
            <div className="category-container">
                {/* Category Header */}
                <header className="category-header">
                    <h1 className="category-title">
                        {categoryName}
                    </h1>
                    {!loading && (
                        <p className="category-description">
                            {products.length} {products.length === 1 ? 'product' : 'products'} available
                        </p>
                    )}
                </header>

                {/* Products Grid */}
                {loading ? (
                    <div className="products-grid">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="loading-skeleton"></div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="products-grid">
                        {products.map((product, index) => (
                            <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <h3 className="empty-title">
                            No products found
                        </h3>
                        <p className="empty-description">
                            This category doesn't have any products yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Category
