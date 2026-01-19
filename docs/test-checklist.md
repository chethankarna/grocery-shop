# ✅ FreshMart PWA - Test Checklist

Complete acceptance test checklist covering all functional and non-functional requirements.

---

## Pre-Test Setup

- [ ] React app running on local dev server (`npm run dev`)
- [ ] Browser: Chrome or Edge (latest version)
- [ ] DevTools open (F12) for debugging
- [ ] Mobile device or responsive mode enabled (Ctrl+Shift+M)
- [ ] `.env` file configured with test values

---

## Test 1: Routing and Deep Linking

**Requirement**: Product pages must be bookmarkable and shareable with product ID in URL.

### Steps:

1. [ ] Open app at `http://localhost:5173`
2. [ ] Click on any product card on home page
3. [ ] Verify URL changes to `/product/:id` (e.g., `/product/prod001`)
4. [ ] Copy the URL from address bar
5. [ ] Open a new browser tab/window
6. [ ] Paste the URL and press Enter
7. [ ] Verify the same product page loads correctly

### Expected Results:
- ✅ Clicking product card navigates to product detail page
- ✅ URL contains product ID in path (not query param)
- ✅ Product page can be loaded directly via URL
- ✅ Browser back button returns to previous page
- ✅ Browser forward button works after going back

### Test Status: ⬜ PASS / ⬜ FAIL

**Notes**:
_______________________________________________________

---

## Test 2: Cart Persistence

**Requirement**: Cart must persist to localStorage and survive page reloads.

### Steps:

1. [ ] Open app at `http://localhost:5173`
2. [ ] Add 3 different products to cart (click "Add" button on product cards)
3. [ ] Navigate to cart page (bottom nav)
4. [ ] Note the cart items and quantities
5. [ ] Hard refresh the page (Ctrl+R or F5)
6. [ ] Check cart page again

### Expected Results:
- ✅ After adding products, cart badge shows correct count (sum of quantities)
- ✅ Cart page displays all 3 products with images and names
- ✅ After hard refresh, all cart items are still present
- ✅ Quantities match what was added
- ✅ Total amount is calculated correctly

### Additional Test:
7. [ ] Update quantity of one item using +/- buttons
8. [ ] Refresh page
9. [ ] Verify updated quantity persists

### Test Status: ⬜ PASS / ⬜ FAIL

**Notes**:
_______________________________________________________

---

## Test 3: WhatsApp Integration

**Requirement**: "Order on WhatsApp" must open WhatsApp with pre-filled product details.

### Test 3A: Single Product Order

#### Steps:

1. [ ] Open any product detail page
2. [ ] Set quantity to 2
3. [ ] Click "Order on WhatsApp" button
4. [ ] Verify WhatsApp opens (web.whatsapp.com or native app)
5. [ ] Check the pre-filled message

#### Expected Results:
- ✅ WhatsApp opens in new tab/window
- ✅ Message contains:
  - Shop name (FreshMart)
  - Product name
  - Quantity (2)
  - Unit (kg/ltr/pc)
  - Price per unit
  - Product ID
  - Placeholder for delivery address
- ✅ Message is properly formatted and readable
- ✅ WhatsApp number matches the one in `.env`

### Test 3B: Cart Checkout

#### Steps:

1. [ ] Add 3 different products to cart with varying quantities
2. [ ] Go to cart page
3. [ ] Click "Checkout on WhatsApp" button
4. [ ] Verify WhatsApp opens
5. [ ] Check the pre-filled message

#### Expected Results:
- ✅ WhatsApp opens
- ✅ Message lists all cart items (numbered 1, 2, 3...)
- ✅ Each item shows: quantity x name (unit) - price
- ✅ Message shows total amount
- ✅ Message includes placeholder for delivery address

### Test Status: ⬜ PASS / ⬜ FAIL

**Notes**:
_______________________________________________________

---

## Test 4: Search Functionality

**Requirement**: Client-side search with debounce (300ms).

### Steps:

1. [ ] Go to home page
2. [ ] Click in search bar
3. [ ] Type "tom" (wait for results)
4. [ ] Verify search results appear
5. [ ] Type more letters: "tomato"
6. [ ] Clear search
7. [ ] Search for category name: "fruits"

### Expected Results:
- ✅ Search debounces (results don't update on every keystroke)
- ✅ Search finds products matching "tom" (e.g., "Fresh Tomatoes")
- ✅ Results update as you type more
- ✅ Search works for product names, descriptions, and categories
- ✅ Clearing search returns to default view
- ✅ "No results" message shown if search finds nothing

### Test Status: ⬜ PASS / ⬜ FAIL

**Notes**:
_______________________________________________________

---

## Test 5: Category Filtering

**Requirement**: Category pages show filtered product lists.

### Steps:

1. [ ] Go to home page
2. [ ] Click on "Vegetables" category badge
3. [ ] Verify URL is `/category/vegetables`
4. [ ] Verify only vegetable products are shown
5. [ ] Click on "Fruits" category
6. [ ] Verify only fruit products are shown
7. [ ] Use bottom nav to go to "Categories"
8. [ ] Click "All Products" category

### Expected Results:
- ✅ Category badges are tappable and navigate correctly
- ✅ Category page shows only products from that category
- ✅ Product count is accurate
- ✅ "All Products" shows all visible products
- ✅ Empty categories show appropriate message

### Test Status: ⬜ PASS / ⬜ FAIL

**Notes**:
_______________________________________________________

---

## Test 6: PWA Install Prompt

**Requirement**: App prompts to install on Android and works offline.

### Test 6A: Install Prompt (Desktop Chrome)

#### Steps:

1. [ ] Open app in Chrome
2. [ ] Look for install icon in address bar (⊕ or install icon)
3. [ ] Click the install icon
4. [ ] Follow prompts to install

#### Expected Results:
- ✅ Install icon appears in address bar (may require HTTPS)
- ✅ Clicking shows "Install FreshMart" dialog
- ✅ After install, app opens in standalone window
- ✅ App has FreshMart icon and title

### Test 6B: Mobile Install (Android Chrome)

#### Steps:

1. [ ] Open app on Android phone in Chrome
2. [ ] Wait for install banner to appear (may require multiple visits)
3. [ ] Tap "Add to Home Screen" from browser menu
4. [ ] Install the app

#### Expected Results:
- ✅ Install banner appears (or menu option available)
- ✅ App icon appears on home screen
- ✅ Opening from home screen launches in standalone mode
- ✅ No browser UI (address bar, etc.) visible

### Test Status: ⬜ PASS / ⬜ FAIL / ⬜ SKIP (requires HTTPS)

**Notes**:
_______________________________________________________

---

## Test 7: Offline Functionality

**Requirement**: Basic offline support with cached shell and products.

### Steps:

1. [ ] Open app while online
2. [ ] Browse products (triggers cache)
3. [ ] Open DevTools → Application → Service Workers
4. [ ] Verify service worker is registered and active
5. [ ] Go to Network tab, check "Offline"
6. [ ] Navigate to home page
7. [ ] Try to view a product you visited earlier
8. [ ] Try to add product to cart

### Expected Results:
- ✅ Service worker registers successfully
- ✅ While offline, previously viewed pages load
- ✅ App shell (header, navigation) displays
- ✅ Cached product images show
- ✅ Cart functionality works offline (localStorage)
- ✅ Graceful error for unavailable data (new products)

### Test Status: ⬜ PASS / ⬜ FAIL

**Notes**:
_______________________________________________________

---

## Test 8: Admin-to-Customer Sync

**Requirement**: Products added via Glide appear in customer app within 60 seconds.

### Prerequisites:
- Glide app configured and connected to Google Sheet
- Apps Script deployed and URL in `.env`

### Steps:

1. [ ] Open Glide app on mobile
2. [ ] Add a new product:
   - ID: `test999`
   - Name: `Test Product`
   - Category: `Vegetables`
   - Price: `99`
   - Upload any photo
3. [ ] Note the time product was saved
4. [ ] Wait 30 seconds
5. [ ] Refresh customer app (React PWA)
6. [ ] Search for "Test Product"

### Expected Results:
- ✅ Product appears in customer app within 60 seconds
- ✅ Product image loads correctly
- ✅ All details (price, description, stock) match Glide
- ✅ Product is searchable
- ✅ Product appears in correct category

### Cleanup:
7. [ ] Delete test product from Glide

### Test Status: ⬜ PASS / ⬜ FAIL / ⬜ SKIP (Glide not configured)

**Notes**:
_______________________________________________________

---

## Test 9: Mobile Responsiveness

**Requirement**: Mobile-first, single-column layout, thumb-safe tap targets.

### Steps:

1. [ ] Open app in responsive mode (Ctrl+Shift+M)
2. [ ] Set viewport to iPhone SE (375x667)
3. [ ] Navigate through all pages
4. [ ] Try tapping buttons, cards, navigation
5. [ ] Test on actual mobile device if available

### Expected Results:
- ✅ All content fits in single column
- ✅ No horizontal scrolling
- ✅ Buttons are at least 44px tall
- ✅ Product cards are easily tappable
- ✅ Bottom navigation is thumb-accessible
- ✅ Text is readable without zooming
- ✅ Images scale properly

### Test on Different Sizes:
- [ ] 375px (iPhone SE)
- [ ] 414px (iPhone Pro Max)
- [ ] 360px (Android standard)

### Test Status: ⬜ PASS / ⬜ FAIL

**Notes**:
_______________________________________________________

---

## Test 10: Accessibility

**Requirement**: Semantic HTML, ARIA labels, sufficient contrast.

### Steps:

1. [ ] Open DevTools → Lighthouse
2. [ ] Run Accessibility audit
3. [ ] Test keyboard navigation (Tab key)
4. [ ] Check ARIA labels on buttons

### Expected Results:
- ✅ Lighthouse Accessibility score ≥90
- ✅ All interactive elements are keyboard-accessible
- ✅ Buttons have proper ARIA labels
- ✅ Images have alt text
- ✅ Color contrast meets WCAG AA standard
- ✅ Focus indicators visible on all interactive elements

### Test Status: ⬜ PASS / ⬜ FAIL

**Notes**:
_______________________________________________________

---

## Test 11: Performance

**Requirement**: Fast load times, lazy-loaded images.

### Steps:

1. [ ] Open DevTools → Lighthouse
2. [ ] Run Performance audit
3. [ ] Check Network tab for image loading
4. [ ] Test page load speed

### Expected Results:
- ✅ Lighthouse Performance score ≥80
- ✅ Images use lazy loading
- ✅ Initial page load <3 seconds
- ✅ Product images only load when scrolled into view
- ✅ No unnecessary re-renders

### Test Status: ⬜ PASS / ⬜ FAIL

**Notes**:
_______________________________________________________

---

## Test 12: Visual Design

**Requirement**: 90% white background, 10% soft green accent (#8BC34A).

### Visual Inspection:

1. [ ] Check color scheme matches specification
2. [ ] Verify green accent used for:
   - Primary buttons
   - Active navigation items
   - Category badges (when active)
3. [ ] Verify white background dominant
4. [ ] Check card shadows are subtle

### Expected Results:
- ✅ Primary color is #8BC34A (soft green)
- ✅ Background is predominantly white
- ✅ Text colors: #333 (primary), #666 (secondary)
- ✅ Shadows are subtle and professional
- ✅ Overall design feels clean and minimalist

### Test Status: ⬜ PASS / ⬜ FAIL

**Notes**:
_______________________________________________________

---

## Summary

| Test # | Test Name | Status | Priority |
|--------|-----------|--------|----------|
| 1 | Routing & Deep Linking | ⬜ | HIGH |
| 2 | Cart Persistence | ⬜ | HIGH |
| 3 | WhatsApp Integration | ⬜ | HIGH |
| 4 | Search Functionality | ⬜ | MEDIUM |
| 5 | Category Filtering | ⬜ | MEDIUM |
| 6 | PWA Install Prompt | ⬜ | MEDIUM |
| 7 | Offline Functionality | ⬜ | MEDIUM |
| 8 | Admin-to-Customer Sync | ⬜ | HIGH |
| 9 | Mobile Responsiveness | ⬜ | HIGH |
| 10 | Accessibility | ⬜ | LOW |
| 11 | Performance | ⬜ | LOW |
| 12 | Visual Design | ⬜ | LOW |

---

## Notes Section

**Environment**:
- Node version: _______________
- npm version: _______________
- Browser: _______________
- OS: _______________

**Known Issues**:
_______________________________________________________

**Overall Assessment**:
_______________________________________________________

**Tested by**: _______________  
**Date**: _______________  
**Signature**: _______________
