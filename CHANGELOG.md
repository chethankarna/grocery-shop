# Changelog

All notable changes to FreshMart Grocery PWA will be documented in this file.

## [1.0.0] - 2026-01-18

### 🎉 Initial Release

Complete mobile-first grocery PWA with no-code admin system.

### ✨ Added

#### Customer App (React PWA)
- **Home Page**
  - Hero banner with FreshMart branding
  - Horizontal scrollable category badges
  - Popular products grid (2 columns, mobile-first)
  - Real-time search with debounce (300ms)
  - Quick info section (delivery, quality, ordering)

- **Product Features**
  - Product detail page with large images
  - Quantity selector (accessible, thumb-safe)
  - Add to Cart functionality
  - Order via WhatsApp (single product)
  - Stock status indicators
  - Out-of-stock handling

- **Shopping Cart**
  - localStorage persistence (survives reloads)
  - Editable quantities
  - Item removal
  - Cart total calculation
  - WhatsApp checkout (all items)
  - Cart badge on bottom navigation

- **Navigation & Routing**
  - React Router v6 with BrowserRouter
  - Deep linking support (bookmarkable product URLs)
  - Category filtering pages
  - Bottom navigation (Home, Categories, Cart, Account)
  - Back button support

- **Search & Discovery**
  - Client-side debounced search
  - Search by product name, description, category
  - Category-based filtering
  - Empty state handling

- **PWA Features**
  - Service worker with Workbox
  - Offline caching (app shell + products)
  - Install prompt (Android Chrome)
  - Standalone mode support
  - Web app manifest

- **Design System**
  - 90% white / 10% soft green (#8BC34A) color scheme
  - Tailwind CSS v3 custom theme
  - Mobile-first responsive design
  - 44px minimum tap targets
  - Subtle card shadows
  - Skeleton loading states

#### Admin System (Glide + Google Sheets)
- **Google Sheets Template**
  - 10-column schema (id, category, name, price, unit, image, description, stock, visible, createdAt)
  - Sample data (15 realistic products)
  - Data validation for critical fields

- **Google Apps Script**
  - JSON API endpoint for product data
  - CORS support for cross-origin requests
  - Filtering by visibility status
  - Type conversion (numbers, booleans)
  - Error handling

- **Glide Integration**
  - Mobile-first admin interface
  - Product CRUD operations
  - Image upload via camera/gallery
  - Glide-hosted image storage
  - Real-time sync to Google Sheets

#### Services & Utilities
- **productsService.js**
  - Dual data source (Apps Script + local JSON)
  - Automatic fallback on error
  - 5-minute caching strategy
  - Product search and filtering
  - Category extraction

- **cartService.js**
  - localStorage-based persistence
  - Custom event dispatching for cart updates
  - Cart total and item count calculations
  - CRUD operations

- **WhatsApp Integration**
  - Pre-filled message generation
  - Single product orders
  - Multi-item cart checkout
  - Configurable shop number

- **Currency Utilities**
  - Indian Rupee formatting (₹)
  - Price with unit display

#### Documentation
- **README.md**
  - Quick start guide
  - Project structure
  - Configuration instructions
  - Deployment guides (Firebase, Netlify, Vercel)
  - Troubleshooting section

- **glide-setup.md**
  - Step-by-step Google Sheets setup
  - Apps Script deployment guide
  - Glide app configuration
  - Data sync instructions
  - Column schema reference

- **admin-instructions.md**
  - Plain-language guide for shop owners
  - Adding/editing/deleting products
  - Photo guidelines
  - Stock management tips
  - Common questions and answers

- **test-checklist.md**
  - 12 comprehensive acceptance tests
  - Step-by-step test procedures
  - Expected results for each test
  - Summary scorecard

### 🎨 Design Highlights
- Minimalist white background (90%)
- Soft green accent (#8BC34A) for CTAs and active states
- Mobile-first single-column layout
- Accessible color contrast ratios
- Clean typography with system fonts
- Smooth transitions and micro-interactions

### 🔧 Technical Stack
- **Frontend**: React 18, Vite 5
- **Routing**: React Router v6
- **Styling**: Tailwind CSS v3
- **PWA**: vite-plugin-pwa, Workbox
- **HTTP Client**: Axios
- **Backend**: Google Apps Script (serverless)
- **Database**: Google Sheets
- **Admin**: Glide Apps (no-code)
- **Messaging**: WhatsApp Web API

### 📦 Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.21.1",
  "axios": "^1.6.5",
  "tailwindcss": "^3.4.1",
  "vite": "^5.0.11",
  "vite-plugin-pwa": "^0.17.4"
}
```

### 🚀 Deployment Support
- Firebase Hosting configuration
- Netlify deployment guide
- Vercel deployment instructions
- All platforms provide free HTTPS

### ♿ Accessibility
- Semantic HTML5 elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Color contrast compliance (WCAG AA)

### 📱 Browser Support
- Chrome 90+ (desktop & mobile)
- Edge 90+
- Safari 14+ (iOS)
- Firefox 88+

### 🔐 Security
- CORS-enabled Apps Script
- Public read-only API (no authentication for customer app)
- Glide admin access control options

### Known Limitations
- PWA icons are SVG placeholders (convert to PNG for production)
- Image generation temporarily unavailable (use online tools)
- iOS install requires manual "Add to Home Screen"
- Cart persistence limited to localStorage (browser-specific)

---

## Next Steps for Future Releases

### Planned Features (v1.1.0)
- [ ] User authentication (customer accounts)
- [ ] Order history tracking
- [ ] Push notifications for offers
- [ ] Payment gateway integration
- [ ] Favorites/wishlist functionality
- [ ] Product reviews and ratings

### Improvements
- [ ] Convert SVG icons to optimized PNGs
- [ ] Add unit testing (Vitest)
- [ ] Implement E2E tests (Playwright)
- [ ] Performance optimization (code splitting)
- [ ] Analytics integration (Google Analytics)
- [ ] SEO enhancements

---

**Legend**:
- ✨ Added: New features
- 🔧 Changed: Modifications to existing features
- 🐛 Fixed: Bug fixes
- 🗑️ Removed: Deprecated features
- 🔒 Security: Security improvements

---

**Version Format**: [Major].[Minor].[Patch]
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes and minor improvements
