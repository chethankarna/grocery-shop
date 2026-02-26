import { useState, useEffect } from 'react'
import {
    listenCategoriesRealtime,
    addCategory,
    updateCategory,
    deleteCategory
} from '../../services/categoriesService'
import {
    listenProductsRealtime,
    addProduct,
    updateProduct,
    deleteProduct
} from '../../services/productsService'
import CategoryList from './CategoryList'
import CategoryDetail from './CategoryDetail'
import CategoryFormModal from './CategoryFormModal'
import ProductFormModal from '../ProductFormModal'

function CategoryManager() {
    // Data State
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    // View State
    const [view, setView] = useState('list') // 'list' | 'detail'
    const [selectedCategory, setSelectedCategory] = useState(null)

    // Modal State
    const [isCatModalOpen, setIsCatModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)

    const [isProductModalOpen, setIsProductModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)

    // Data Fetching
    useEffect(() => {
        const unsubscribeCats = listenCategoriesRealtime((fetchedCats) => {
            setCategories(fetchedCats)
        })

        const unsubscribeProds = listenProductsRealtime((fetchedProds) => {
            setProducts(fetchedProds)
            setLoading(false)
        })

        return () => {
            unsubscribeCats()
            unsubscribeProds()
        }
    }, [])

    // Derived State
    const categoryNames = categories.map(c => c.name) // For ProductFormModal dropdown

    // FORENSIC DEBUGGING: Calculate dynamic product counts
    const categoriesWithCounts = categories.map(category => {
        // Normalization helper
        const normalize = (str) => String(str || '').trim().toLowerCase()
        const catNameNormalized = normalize(category.name)

        const categoryProducts = products.filter(p => {
            const prodCatNormalized = normalize(p.category)
            const isMatch = prodCatNormalized === catNameNormalized

            // Log first 3 non-matching products to see what they hold
            // (Only log once per render cycle to avoid console spam, effectively)
            // But here we want to see why they FAIL.
            return isMatch
        })

        // Debug: Log specific details for every category to prove why it's 0 or not
        console.group(`Category Analysis: "${category.name}"`)
        console.log(`Raw Category Name: '${category.name}'`)
        console.log(`Normalized: '${catNameNormalized}'`)
        console.log(`Total Products Scanned: ${products.length}`)

        if (products.length > 0) {
            // Show a sample of what product categories look like
            const sampleProductCats = products.slice(0, 3).map(p => `"${p.category}"`)
            console.log(`Sample Product Categories: ${sampleProductCats.join(', ')}`)

            // Check for near-misses
            const nearMisses = products.filter(p =>
                p.category && p.category.toLowerCase().includes(category.name.toLowerCase())
            )
            if (nearMisses.length > 0) {
                console.warn(`⚠️ Potential Mismatches (Near Misses):`, nearMisses.map(p => ({
                    prodName: p.name,
                    prodCat: p.category,
                    targetCat: category.name
                })))
            }
        }

        console.log(`Match Count: ${categoryProducts.length}`)
        console.groupEnd()

        return {
            ...category,
            productCount: categoryProducts.length
        }
    })

    // --- Sync Handlers (Migration) ---

    const handleSyncCategories = async () => {
        if (!window.confirm('This will scan all products and create missing categories. Continue?')) return
        setLoading(true)
        try {
            const productCategories = [...new Set(products.map(p => p.category).filter(Boolean))]
            const existingNames = categories.map(c => c.name)
            const missing = productCategories.filter(name => !existingNames.includes(name))

            if (missing.length === 0) {
                alert('All categories are already synced!')
                setLoading(false)
                return
            }

            let addedCount = 0
            for (const name of missing) {
                await addCategory({
                    name,
                    icon: '📦',
                    color: '#f3f4f6',
                    description: 'Auto-generated from products',
                    slug: name.toLowerCase().replace(/\s+/g, '-')
                })
                addedCount++
            }
            alert(`Synced! Created ${addedCount} new categories.`)
        } catch (err) {
            console.error('Sync failed:', err)
            alert('Failed to sync categories')
        } finally {
            setLoading(false)
        }
    }

    // --- Category Handlers ---

    const handleAddCategory = () => {
        setEditingCategory(null)
        setIsCatModalOpen(true)
    }

    const handleEditCategory = (category) => {
        setEditingCategory(category)
        setIsCatModalOpen(true)
    }

    const handleDeleteCategory = async (category) => {
        if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) return

        try {
            // Check if category has products
            const hasProducts = products.some(p => p.category === category.name)
            if (hasProducts) {
                alert(`Cannot delete category "${category.name}" because it contains products. Please delete or move the products first.`)
                return
            }
            await deleteCategory(category.id)
        } catch (error) {
            console.error(error)
            alert('Failed to delete category')
        }
    }

    const handleSubmitCategory = async (data) => {
        if (editingCategory) {
            await updateCategory(editingCategory.id, data)
        } else {
            await addCategory(data)
        }
    }

    const handleSelectCategory = (category) => {
        setSelectedCategory(category)
        setView('detail')
    }

    const handleBackToCategories = () => {
        setSelectedCategory(null)
        setView('list')
    }

    // --- Product Handlers ---

    const handleAddProduct = () => {
        // If in detail view, pre-fill category
        const initialData = selectedCategory ? { category: selectedCategory.name } : null
        setEditingProduct(initialData)
        setIsProductModalOpen(true)
    }

    const handleEditProduct = (product) => {
        setEditingProduct(product)
        setIsProductModalOpen(true)
    }

    const handleDeleteProduct = async (productId, imageUrl) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return
        try {
            await deleteProduct(productId, imageUrl)
        } catch (error) {
            alert('Failed to delete product')
        }
    }

    const handleSubmitProduct = async (data) => {
        if (editingProduct && editingProduct.id) {
            await updateProduct(editingProduct.id, data)
        } else {
            await addProduct(data)
        }
    }

    if (loading) return <div className="loading-state">Loading inventory...</div>

    return (
        <div className="section-container">
            {view === 'list' && (
                <CategoryList
                    categories={categoriesWithCounts}
                    onAdd={handleAddCategory}
                    onSync={handleSyncCategories}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                    onSelect={handleSelectCategory}
                />
            )}

            {view === 'detail' && selectedCategory && (
                <CategoryDetail
                    category={selectedCategory}
                    products={products.filter(p =>
                        String(p.category || '').trim().toLowerCase() === String(selectedCategory.name || '').trim().toLowerCase()
                    )}
                    onBack={handleBackToCategories}
                    onEditCategory={() => handleEditCategory(selectedCategory)}
                    onAddProduct={handleAddProduct}
                    onEditProduct={handleEditProduct}
                    onDeleteProduct={handleDeleteProduct}
                />
            )}

            {/* Modals */}
            <CategoryFormModal
                isOpen={isCatModalOpen}
                onClose={() => setIsCatModalOpen(false)}
                onSubmit={handleSubmitCategory}
                editingCategory={editingCategory}
            />

            <ProductFormModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSubmit={handleSubmitProduct}
                product={editingProduct}
                categories={categoryNames}
            />
        </div>
    )
}

export default CategoryManager
