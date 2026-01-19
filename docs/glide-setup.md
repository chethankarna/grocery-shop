# 📋 Glide + Google Sheets Setup Guide

Complete step-by-step guide to set up the no-code admin system for FreshMart using Glide and Google Sheets.

## Part 1: Google Sheets Setup

### Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **New** → **Blank spreadsheet**
3. Rename the sheet to **"FreshMart Products"**
4. Rename the first tab from "Sheet1" to **"Products"**

### Step 2: Create Column Headers

In the first row (Row 1), add these exact column headers:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| id | category | name | price | unit | image | description | stock | visible | createdAt |

> [!IMPORTANT]
> Column headers must match **exactly** (case-sensitive) for the Apps Script to work correctly.

### Step 3: Add Sample Data

Copy these 3 sample rows into your sheet (starting from Row 2):

**Row 2:**
- **id**: `prod001`
- **category**: `Vegetables`
- **name**: `Fresh Broccoli`
- **price**: `199`
- **unit**: `kg`
- **image**: `https://images.unsplash.com/photo-1459411621453-7b03977f4baa?w=800&q=80`
- **description**: `Crisp green broccoli, rich in vitamins`
- **stock**: `25`
- **visible**: `TRUE`
- **createdAt**: `2025-01-01T09:00:00+05:30`

**Row 3:**
- **id**: `prod002`
- **category**: `Fruits`
- **name**: `Ripe Bananas`
- **price**: `59`
- **unit**: `kg`
- **image**: `https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80`
- **description**: `Sweet yellow bananas, perfect for smoothies`
- **stock**: `40`
- **visible**: `TRUE`
- **createdAt**: `2025-01-01T09:00:00+05:30`

**Row 4:**
- **id**: `prod003`
- **category**: `Dairy`
- **name**: `Organic Milk`
- **price**: `229`
- **unit**: `ltr`
- **image**: `https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&q=80`
- **description**: `Full cream organic milk, farm fresh`
- **stock**: `15`
- **visible**: `TRUE`
- **createdAt**: `2025-01-01T09:00:00+05:30`

### Step 4: Format Columns

1. Select column **D** (price) → Format → Number → Custom number format → `0`
2. Select column **H** (stock) → Format → Number → Custom number format → `0`
3. Select column **I** (visible) → Insert → Checkbox

---

## Part 2: Google Apps Script Deployment

### Step 1: Open Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code in the editor

### Step 2: Paste Script Code

Copy the entire contents of `scripts/google-apps-script.js` from your project and paste it into the Apps Script editor.

### Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure settings:
   - **Description**: `FreshMart Products API`
   - **Execute as**: `Me ([your-email@gmail.com])`
   - **Who has access**: `Anyone`
   
5. Click **Deploy**

### Step 4: Authorize Script

1. Click **Authorize access**
2. Choose your Google account
3. Click **Advanced** → **Go to FreshMart Products API (unsafe)**
4. Click **Allow**

### Step 5: Copy Web App URL

1. After deployment, you'll see a **Web app URL**
2. Copy this URL (looks like: `https://script.google.com/macros/s/ABC123.../exec`)
3. Save this URL for later (you'll add it to your React app's `.env` file)

### Step 6: Test the API

1. Open the Web App URL in a new browser tab
2. You should see JSON data with your 3 sample products
3. If you see an error, check that:
   - Sheet name is exactly "Products"
   - Column headers match exactly
   - Script is deployed with "Anyone" access

---

## Part 3: Glide App Setup

### Step 1: Create Glide Account

1. Go to [Glide Apps](https://www.glideapps.com/)
2. Sign up / Log in with your Google account
3. Click **New App**

### Step 2: Connect Google Sheet

1. Choose **From Google Sheets**
2. Select your **FreshMart Products** spreadsheet
3. Click **Create app**

### Step 3: Configure Data Source

Glide will automatically detect your Products table. Verify the column types:

- **id**: Text
- **category**: Text
- **name**: Text
- **price**: Number
- **unit**: Text
- **image**: Image (Glide will auto-detect)
- **description**: Text
- **stock**: Number
- **visible**: Boolean
- **createdAt**: Date/Time

### Step 4: Set Up Products List Screen

1. Glide creates a default list view
2. Customize the list layout:
   - **Title**: `name`
   - **Details**: `price` and `unit`
   - **Image**: `image`
3. Click on the list component → **Options** → **Style**: `Cards`

### Step 5: Create "Add Product" Form

1. Click **Add Screen** → **Form**
2. Choose **Products** table
3. Configure form fields:
   - **id**: Auto-generate (use formula: `prod` + `increment number` or keep manual)
   - **category**: Choice component (set options: Vegetables, Fruits, Dairy, Bakery, Snacks)
   - **name**: Text input
   - **price**: Number input
   - **unit**: Choice component (options: kg, ltr, pc, dozen)
   - **image**: Image picker (allows camera/gallery upload)
   - **description**: Text area
   - **stock**: Number input
   - **visible**: Switch (default ON)
   - **createdAt**: Special Value → Current Date/Time

4. Click **Publish** to save changes

### Step 6: Configure Image Uploads

Glide automatically handles image storage:

1. When owner uploads image via form, Glide stores it in Glide CDN
2. Image URL is saved to Google Sheet `image` column
3. No additional configuration needed

### Step 7: Set Up Edit/Delete Actions

1. Go to product detail screen (click any product in list)
2. Add **Edit** action:
   - Click **+** → **Edit**
   - Choose **Products** table
   - Same form fields as Add Product
3. Add **Delete** action:
   - Click **+** → **Delete**
   - Choose **Products** table
   - Add confirmation dialog: "Delete this product?"

### Step 8: Publish Glide App

1. Click **Settings** (gear icon)
2. Go to **Privacy**
3. Choose access level:
   - **Public with email sign-in**: Anyone with email can access (recommended for owner)
   - **Public**: Anyone with link can access (less secure)
   - **Password**: Require password to access
4. Click **Publish** → **Done**

### Step 9: Share with Owner

1. Click **Share** button
2. Copy the app link
3. Send to shop owner with instructions to:
   - Open link on mobile phone
   - Bookmark or add to home screen
   - Sign in if required

---

## Part 4: Connect React App to Data

### Step 1: Update .env File

In your React project, create/edit `.env`:

```env
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
VITE_WHATSAPP_NUMBER=919876543210
VITE_SHOP_NAME=FreshMart
```

Replace:
- `YOUR_SCRIPT_ID` with your actual Apps Script URL from Part 2, Step 5
- `919876543210` with your actual WhatsApp business number
- `FreshMart` with your shop name if different

### Step 2: Test Data Sync

1. Start React dev server: `npm run dev`
2. Open app in browser
3. Check that sample products appear on home page
4. Open browser DevTools → Network tab
5. Refresh page and verify request to Apps Script URL succeeds

### Step 3: Test Admin-to-App Sync

1. Open Glide app on mobile
2. Add a new product with all details
3. Wait 30 seconds
4. Refresh React app in browser
5. New product should appear in the list

---

## 🎯 Quick Reference: Column Descriptions

| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| **id** | Text | ✅ | Unique product ID | `prod001` |
| **category** | Text | ✅ | Product category | `Vegetables` |
| **name** | Text | ✅ | Product display name | `Fresh Broccoli` |
| **price** | Number | ✅ | Price in Rupees | `199` |
| **unit** | Text | ✅ | Unit of measurement | `kg`, `ltr`, `pc` |
| **image** | URL | ✅ | Product image URL (Glide uploads) | `https://...` |
| **description** | Text | ❌ | Product description | `Crisp green...` |
| **stock** | Number | ✅ | Available quantity | `25` |
| **visible** | Boolean | ✅ | Show in customer app? | `TRUE` / `FALSE` |
| **createdAt** | DateTime | ❌ | Creation timestamp | `2025-01-01T09:00...` |

---

## 🔧 Troubleshooting

### Products not showing in React app

**Issue**: Apps Script returns empty array or error

**Fix**:
1. Check sheet name is exactly "Products"
2. Verify column headers match exactly (case-sensitive)
3. Ensure at least one product has `visible = TRUE`
4. Re-deploy Apps Script with "Anyone" access

### Glide not detecting image column

**Issue**: Image uploads not working in Glide

**Fix**:
1. In Glide, go to Products table → Data tab
2. Click on `image` column header → Change type → **Image**
3. In form, change component type to **Image Picker**

### Images not loading in React app

**Issue**: Image URLs from Glide not accessible

**Fix**:
- Glide-hosted images are public by default
- Verify image URL in Google Sheet is complete and valid
- Test URL directly in browser
- Check browser console for CORS errors

### Sync delay too long

**Issue**: Products take >60 seconds to appear in React app

**Fix**:
- React app caches data for 5 minutes by default
- Force refresh: Clear site data in DevTools → Application → Clear storage
- Or wait 5 minutes for cache to expire
- For instant updates, reduce `CACHE_DURATION` in `productsService.js`

---

## 📱 Mobile Testing

Test the complete workflow:

1. **Owner workflow** (Glide app):
   - Add product via mobile camera
   - Upload image from gallery
   - Edit existing product
   - Toggle product visibility
   
2. **Customer workflow** (React PWA):
   - Search for products
   - View product details
   - Add to cart
   - Order via WhatsApp

---

## 🎉 You're Done!

Your no-code grocery admin system is now live! Shop owners can manage products from their phone, and customers see updates in real-time.

**Next steps**: Share the Glide app with your shop owner and deploy the React app to production (see main README.md).
