import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { WishlistProvider } from './context/WishlistContext'
import LoadingScreen from './components/LoadingScreen'

import Header from './components/Header'
import BottomNav from './components/BottomNav'

import Home from './pages/Home'
import Categories from './pages/Categories'
import Category from './pages/Category'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Wishlist from './pages/Wishlist'
import Account from './pages/Account'

// NEW AUTH PAGES
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminRoute from './components/AdminRoute'

// Lazy load admin panel to reduce initial bundle size
const AdminPanel = lazy(() => import('./pages/AdminPanel'))

function App() {
    return (
        <Router>
            <WishlistProvider>
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
                    <Header />

                    <main style={{ flex: 1, paddingBottom: '5rem' }}>
                        <Routes>
                            {/* PUBLIC ROUTES */}
                            <Route path="/" element={<Home />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/category/:slug" element={<Category />} />
                            <Route path="/product/:id" element={<Product />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/wishlist" element={<Wishlist />} />
                            <Route path="/account" element={<Account />} />

                            {/* AUTH ROUTES */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />

                            {/* ADMIN ROUTE (PROTECTED) */}
                            <Route
                                path="/admin"
                                element={
                                    <Suspense fallback={<LoadingScreen />}>
                                        <AdminRoute>
                                            <AdminPanel />
                                        </AdminRoute>
                                    </Suspense>
                                }
                            />
                        </Routes>
                    </main>

                    <BottomNav />
                </div>
            </WishlistProvider>
        </Router>
    )
}

export default App