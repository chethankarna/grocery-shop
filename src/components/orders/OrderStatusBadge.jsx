import './OrderStatusBadge.css';

function OrderStatusBadge({ status }) {
    const getStatusColor = (status) => {
        const colors = {
            'NEW': 'var(--primary)',
            'PROCESSING': '#F59E0B',
            'COMPLETED': '#3B82F6',
            'CANCELLED': '#EF4444'
        };
        return colors[status] || '#6B7280';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'NEW': '🟢',
            'PROCESSING': '⏳',
            'COMPLETED': '✅',
            'CANCELLED': '❌'
        };
        return icons[status] || '📦';
    };

    return (
        <span
            className="order-status-badge"
            style={{ backgroundColor: getStatusColor(status) }}
        >
            {getStatusIcon(status)} {status}
        </span>
    );
}

export default OrderStatusBadge;
