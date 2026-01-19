# 🛒 FreshMart Grocery PWA

A modern, mobile-first Progressive Web App for grocery shopping with WhatsApp integration and a no-code admin interface powered by Glide + Google Sheets.

## ✨ Features

- **Mobile-first Design**: Optimized for mobile with thumb-safe tap targets and single-column layout
- **PWA Installability**: Install on Android/iOS home screen, works offline
- **WhatsApp Integration**: Order directly via WhatsApp with pre-filled messages
- **Real-time Search**: Debounced product search with instant results
- **Cart Persistence**: Shopping cart survives page reloads via localStorage
- **Deep Linking**: Shareable product URLs with direct routing
- **No-code Admin**: Manage products via Glide mobile app (image upload, CRUD operations)
- **Offline Support**: Service worker caches shell and product data
- **Accessible**: Semantic HTML, ARIA labels, sufficient color contrast

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser
- (Optional) Google account for Glide/Sheets integration

### Installation

```bash
# Navigate to project directory
cd shop

# Install dependencies
npm install

# Copy environment template
copy .env.example .env

# Edit .env file with your configuration:
# - VITE_APPS_SCRIPT_URL: Your Google Apps Script web app URL
# - VITE_WHATSAPP_NUMBER: Your WhatsApp business number
```

### Development

```bash
# Start development server
npm run dev

# Open browser at http://localhost:5173
```

### Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## 📁 Project Structure

```
shop/
├── public/
│   ├── data/
│   │   └── products.json          # Fallback product data
│   ├── icon-192.svg               # PWA icon (192x192)  
│   └── icon-512.svg               # PWA icon (512x512)
├── src/
│   ├── components/
│   │   ├── Header.jsx             # Search + logo
│   │   ├── BottomNav.jsx          # Bottom navigation with cart badge
│   │   ├── ProductCard.jsx        # Product display card
│   │   ├── CategoryBadge.jsx      # Category selector
│   │   └── QuantitySelector.jsx   # +/- quantity control
│   ├── pages/
│   │   ├── Home.jsx               # Hero, categories, popular products
│   │   ├── Category.jsx           # Filtered product list
│   │   ├── Product.jsx            # Product detail + WhatsApp order
│   │   ├── Cart.jsx               # Cart view + checkout
│   │   └── Account.jsx            # Shop info + contact
│   ├── services/
│   │   ├── productsService.js     # Product fetching (Apps Script/local)
│   │   └── cartService.js         # Cart localStorage management
│   ├── utils/
│   │   ├── currency.js            # Rupee formatting
│   │   └── whatsapp.js            # WhatsApp URL generation
│   ├── App.jsx                    # Router setup
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Global styles + Tailwind
├── scripts/
│   └── google-apps-script.js      # Apps Script for Google Sheets API
├── docs/
│   ├── glide-setup.md             # Glide + Google Sheets setup guide
│   ├── admin-instructions.md      # Owner guide for managing products
│   └── test-checklist.md          # Acceptance test checklist
├── package.json
├── vite.config.js                 # Vite + PWA config
├── tailwind.config.js             # Tailwind theme (green accent)
└── README.md
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Google Apps Script URL (deploy script from scripts/google-apps-script.js)
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# WhatsApp Business Number (format: country code + number, no + or spaces)
VITE_WHATSAPP_NUMBER=919876543210

# Shop Name
VITE_SHOP_NAME=FreshMart
```

### Data Source Options

**Option 1: Google Apps Script (Recommended)**  
- Setup instructions in `docs/glide-setup.md`
- Real-time sync from Google Sheets
- Free, no infrastructure needed

**Option 2: Static JSON**  
- Edit `public/data/products.json` directly
- Rebuild app after changes
- Simpler but manual updates

## 🎨 Design System

- **Primary Color**: `#8BC34A` (Soft Green)
- **Background**: `#FFFFFF` (White - 90%)
- **Text**: `#333333` (Primary), `#666666` (Secondary)
- **Typography**: System fonts (-apple-system, Segoe UI, Roboto)
- **Spacing**: Min 44px tap targets for accessibility
- **Shadows**: Subtle `rgba(0,0,0,0.08)` for cards

## 📱 PWA Features

### Install Prompt

The app will prompt users to install on Android Chrome when:
- Served over HTTPS
- Manifest and service worker registered
- User has engaged with the site

iOS Safari users can manually "Add to Home Screen".

### Offline Caching

Service worker caches:
- App shell (HTML, CSS, JS)
- Product images (cache-first, 30 days)
- Product data (network-first, 5 min cache)

## 🚢 Deployment

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init hosting
# Build directory: dist
# Single-page app: Yes
# Overwrite index.html: No

# Build and deploy
npm run build
firebase deploy
```

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
npm run build
vercel --prod
```

All platforms automatically provide HTTPS required for PWA.

## 🧪 Testing

See `docs/test-checklist.md` for complete acceptance tests.

**Quick verification:**

1. **Routing**: Navigate to product → Check URL contains product ID
2. **Cart**: Add items → Refresh page → Cart persists
3. **WhatsApp**: Click order buttons → WhatsApp opens with message
4. **PWA**: Open on Android Chrome → Install prompt appears
5. **Offline**: Load page → Turn off network → Reload → Cached content shows

## 📚 Documentation

- **[Glide Setup Guide](docs/glide-setup.md)**: Complete Google Sheets + Glide configuration
- **[Admin Instructions](docs/admin-instructions.md)**: Plain-language guide for shop owners
- **[Test Checklist](docs/test-checklist.md)**: Step-by-step acceptance tests

## 🛠️ Admin (No-code)

Shop owners manage products via Glide mobile app:

1. Open Glide app on phone
2. Navigate to Products table
3. Add new product (upload image, fill details)
4. Changes reflect in customer app within 60 seconds

Full setup guide: `docs/glide-setup.md`

## 🐛 Troubleshooting

**Products not loading:**
- Check Apps Script URL in `.env`
- Verify Apps Script is deployed as public web app
- Check browser console for errors
- Fallback to local `products.json` if needed

**WhatsApp not opening:**
- Verify `VITE_WHATSAPP_NUMBER` format (no + or spaces)
- Example: `919876543210` for India +91 98765 43210

**PWA not installing:**
- Ensure site is served over HTTPS
- Check manifest.json is loading (DevTools > Application > Manifest)
- Service worker must be registered (DevTools > Application > Service Workers)

**Icons showing as SVG placeholders:**
- Replace `public/icon-192.svg` and `public/icon-512.svg` with PNG versions
- Use tools like [Real Favicon Generator](https://realfavicongenerator.net/)

## 📄 License

This project is created for FreshMart Grocery. Modify as needed for your business.

## 🙏 Credits

- Icons: SVG placeholders (replace with custom PNGs)
- Images: Unsplash (sample product photos)
- UI Framework: React + Tailwind CSS
- PWA: Vite Plugin PWA + Workbox

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Made with ❤️ for fresh food lovers**
