/**
 * Google Apps Script to serve Google Sheets data as JSON API
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet with the Products data
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire script
 * 4. Click Deploy > New deployment
 * 5. Choose "Web app" as deployment type
 * 6. Set "Execute as" to "Me"
 * 7. Set "Who has access" to "Anyone" (for public access)
 * 8. Click Deploy and authorize the script
 * 9. Copy the web app URL and use it in your React app's .env file as VITE_APPS_SCRIPT_URL
 * 
 * GOOGLE SHEET FORMAT:
 * Sheet name: "Products"
 * Columns (exact headers): id, category, name, price, unit, image, description, stock, visible, createdAt
 */

function doGet(e) {
    try {
        // Get the active spreadsheet
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Products');

        if (!sheet) {
            return ContentService
                .createTextOutput(JSON.stringify({ error: 'Sheet "Products" not found' }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        // Get all data from the sheet
        const data = sheet.getDataRange().getValues();

        // First row contains headers
        const headers = data[0];

        // Convert to array of objects
        const products = [];

        for (let i = 1; i < data.length; i++) {
            const row = data[i];

            // Skip empty rows
            if (!row[0]) continue;

            const product = {};

            for (let j = 0; j < headers.length; j++) {
                const header = headers[j];
                let value = row[j];

                // Type conversions
                if (header === 'price' || header === 'stock') {
                    value = Number(value);
                } else if (header === 'visible') {
                    value = value === true || value === 'TRUE' || value === 'true';
                }

                product[header] = value;
            }

            // Only include visible products
            if (product.visible !== false) {
                products.push(product);
            }
        }

        // Return JSON with CORS headers
        return ContentService
            .createTextOutput(JSON.stringify(products))
            .setMimeType(ContentService.MimeType.JSON)
            .setHeader('Access-Control-Allow-Origin', '*')
            .setHeader('Access-Control-Allow-Methods', 'GET')
            .setHeader('Access-Control-Allow-Headers', 'Content-Type');

    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({ error: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// Handle OPTIONS requests for CORS preflight
function doOptions(e) {
    return ContentService
        .createTextOutput('')
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*')
        .setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
        .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
