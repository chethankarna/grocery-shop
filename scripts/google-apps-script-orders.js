/**
 * Google Apps Script for handling order submissions
 * Deploy this as a web app with:
 * - Execute as: Me
 * - Who has access: Anyone
 */

function doPost(e) {
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');

        if (!sheet) {
            return createErrorResponse('Orders sheet not found');
        }

        const data = JSON.parse(e.postData.contents);

        // Append row with all order data (15 columns)
        sheet.appendRow([
            data.order_id,           // A: order_id
            data.createdAt,          // B: createdAt
            data.customer_name,      // C: customer_name
            data.customer_phone,     // D: customer_phone
            data.order_type,         // E: order_type
            data.pickup_datetime,    // F: pickup_datetime
            data.delivery_address,   // G: delivery_address
            data.items_list,         // H: items_list
            data.items_json,         // I: items_json
            data.subtotal,           // J: subtotal
            data.delivery_fee,       // K: delivery_fee
            data.total,              // L: total
            data.status,             // M: status
            data.notes,              // N: notes
            data.notified            // O: notified
        ]);

        return createSuccessResponse(data.order_id);

    } catch (error) {
        return createErrorResponse(error.toString());
    }
}

function createSuccessResponse(orderId) {
    const response = {
        success: true,
        orderId: orderId,
        timestamp: new Date().toISOString()
    };

    return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
}

function createErrorResponse(errorMessage) {
    const response = {
        success: false,
        error: errorMessage
    };

    return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
}

// Optional: Function to get orders (for debugging)
function doGet(e) {
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const rows = data.slice(1);

        const orders = rows.map(row => {
            const order = {};
            headers.forEach((header, index) => {
                order[header] = row[index];
            });
            return order;
        });

        return ContentService
            .createTextOutput(JSON.stringify(orders))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return createErrorResponse(error.toString());
    }
}
