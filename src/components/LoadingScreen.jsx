import './LoadingScreen.css'

export default function LoadingScreen() {
    return (
        <div className="loading-screen">
            <div className="loading-content">
                <div className="loading-spinner"></div>
                <h1 className="loading-title">Much Shop</h1>
                <p className="loading-subtitle">Loading your fresh groceries...</p>
            </div>
        </div>
    )
}
