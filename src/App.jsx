import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Category from './pages/Category'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Account from './pages/Account'

function App() {
    return (
        <Router>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
                <Header />

                <main style={{ flex: 1, paddingBottom: '5rem' }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/category/:slug" element={<Category />} />
                        <Route path="/product/:id" element={<Product />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/account" element={<Account />} />
                    </Routes>
                </main>

                <BottomNav />
            </div>
        </Router>
    )
}

export default App
