import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { getProductsByCategory, fetchProducts, getCategories } from '../services/productsService'

function Category() {
    const { slug } = useParams()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [categoryName, setCategoryName] = useState('')

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true)

                if (slug === 'all') {
                    // Show all products
                    const allProducts = await fetchProducts()
                    setProducts(allProducts)
                    setCategoryName('All Products')
                } else {
                    // Convert slug back to category name
                    const categories = await getCategories()
                    const matchedCategory = categories.find(
                        cat => cat.toLowerCase().replace(/\s+/g, '-') === slug
                    )

                    if (matchedCategory) {
                        const categoryProducts = await getProductsByCategory(matchedCategory)
                        setProducts(categoryProducts)
                        setCategoryName(matchedCategory)
                    } else {
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
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Category Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-text-primary mb-2">
                        {categoryName}
                    </h1>
                    {!loading && (
                        <p className="text-text-secondary">
                            {products.length} {products.length === 1 ? 'product' : 'products'} available
                        </p>
                    )}
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-neutral-100 rounded-card h-72 skeleton"></div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold text-text-primary mb-2">
                            No products found
                        </h3>
                        <p className="text-text-secondary">
                            This category doesn't have any products yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Category
