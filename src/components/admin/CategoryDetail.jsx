import { IoArrowBack, IoAdd, IoPencil } from 'react-icons/io5'
import ProductRow from '../ProductRow'
import './CategoryDetail.css'

function CategoryDetail({
    category,
    products,
    onBack,
    onEditCategory,
    onAddProduct,
    onEditProduct,
    onDeleteProduct
}) {
    return (
        <div className="category-detail-view">
            {/* Header */}
            <div className="detail-header">
                <button className="btn-back" onClick={onBack}>
                    <IoArrowBack size={20} />
                    <span>Back to Categories</span>
                </button>

                <div className="header-actions">
                    <button className="btn-secondary" onClick={onEditCategory}>
                        <IoPencil size={16} />
                        Edit Category
                    </button>
                    <button className="btn-primary" onClick={onAddProduct}>
                        <IoAdd size={18} />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Banner/Info */}
            <div
                className="category-banner"
                style={{
                    '--cat-color': category.color || '#f3f4f6',
                    backgroundColor: 'var(--cat-color)'
                }}
            >
                <span className="banner-icon">{category.icon || '📦'}</span>
                <div className="banner-info">
                    <h1>{category.name}</h1>
                    <p>{category.description || 'No description provided'}</p>
                    <span className="banner-count">
                        {products.length} {products.length === 1 ? 'product' : 'products'}
                    </span>
                </div>
            </div>

            {/* Products Table */}
            <div className="table-container">
                {products.length > 0 ? (
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <ProductRow
                                    key={product.id}
                                    product={product}
                                    onEdit={onEditProduct}
                                    onDelete={onDeleteProduct}
                                />
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <h3>No Products Yet</h3>
                        <p>Add the first product to this category.</p>
                        <button className="btn-primary" onClick={onAddProduct}>
                            Add Product
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CategoryDetail
