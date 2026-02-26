import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
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

// Lazy load admin pages to reduce initial bundle size
const AdminPanel = lazy(() => import('./pages/AdminPanel'))
const AdminOrdersList = lazy(() => import('./pages/admin/AdminOrdersList'))
const AdminOrderDetails = lazy(() => import('./pages/admin/AdminOrderDetails'))

function AppContent() {
    const location = useLocation()

    return (
        <WishlistProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
                <Header />

                <main style={{ flex: 1 }}>
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

                        {/* ADMIN ROUTES (PROTECTED) */}
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <Suspense fallback={<LoadingScreen />}>
                                        <AdminPanel />
                                    </Suspense>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/orders"
                            element={
                                <AdminRoute>
                                    <Suspense fallback={<LoadingScreen />}>
                                        <AdminOrdersList />
                                    </Suspense>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/orders/:id"
                            element={
                                <AdminRoute>
                                    <Suspense fallback={<LoadingScreen />}>
                                        <AdminOrderDetails />
                                    </Suspense>
                                </AdminRoute>
                            }
                        />
                    </Routes>
                </main>

                <BottomNav />
            </div>
        </WishlistProvider>
    )
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    )
}

export default App