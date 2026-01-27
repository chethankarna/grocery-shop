import './ProductRow.css'

function ProductRow({ product, onEdit, onDelete }) {
    const isLowStock = product.stock < 10

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
            onDelete(product.id, product.image)
        }
    }

    return (
        <tr className="product-row">
            <td>
                <div className="product-cell">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="product-thumb"
                        onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3C/svg%3E'
                        }}
                    />
                    <div className="product-info">
                        <div className="product-name">{product.name}</div>
                        {product.description && (
                            <div className="product-desc">{product.description}</div>
                        )}
                    </div>
                </div>
            </td>
            <td>
                <span className="category-badge">{product.category}</span>
            </td>
            <td>
                <div className="price-cell">
                    <span className="current-price">₹{product.price?.toFixed(2)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span className="original-price">₹{product.originalPrice?.toFixed(2)}</span>
                    )}
                </div>
            </td>
            <td>
                <span className={`stock-badge ${isLowStock ? 'low-stock' : ''}`}>
                    {product.stock}
                </span>
            </td>
            <td>
                <span className={`visibility-badge ${product.visible ? 'visible' : 'hidden'}`}>
                    {product.visible ? '✓ Visible' : '✗ Hidden'}
                </span>
            </td>
            <td>
                <div className="action-buttons">
                    <button
                        className="btn-edit"
                        onClick={() => onEdit(product)}
                        title="Edit product"
                    >
                        ✏️ Edit
                    </button>
                    <button
                        className="btn-delete"
                        onClick={handleDelete}
                        title="Delete product"
                    >
                        🗑️ Delete
                    </button>
                </div>
            </td>
        </tr>
    )
}

export default ProductRow
